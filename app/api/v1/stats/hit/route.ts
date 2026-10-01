import { Ratelimit } from "@upstash/ratelimit";
import type { NextRequest } from "next/server";
import { getClientIp } from "@/lib/api/rate-limiter";
import { getRedis, incrementQrStats } from "@/lib/api/stats";

export const runtime = "nodejs";

// Matches the bulk generator's MAX_ROWS — the largest legitimate batch.
const MAX_COUNT = 100;
// QR codes one IP may add to the public counters per minute (two full bulk
// batches). Keeps a script from inflating the homepage numbers.
const MAX_PER_MINUTE = 200;

let limiter: Ratelimit | null | undefined;

function getLimiter(): Ratelimit | null {
  if (limiter !== undefined) {
    return limiter;
  }
  const redis = getRedis();
  limiter = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(MAX_PER_MINUTE, "1 m"),
        prefix: "stats:hit",
      })
    : null;
  return limiter;
}

function parseCount(value: string | null): number {
  const count = Number(value);
  if (!Number.isInteger(count) || count < 1) {
    return 1;
  }
  return Math.min(count, MAX_COUNT);
}

/**
 * Anonymous usage counter ping. Body-less by design — payment data must
 * never be sent here. Called via sendBeacon/keepalive after successful
 * client-side generation; ad blockers cutting some pings is accepted.
 */
export async function POST(req: NextRequest) {
  const count = parseCount(req.nextUrl.searchParams.get("count"));
  const rateLimiter = getLimiter();
  if (!rateLimiter) {
    return new Response(null, { status: 204 });
  }

  try {
    const { success } = await rateLimiter.limit(getClientIp(req), {
      rate: count,
    });
    if (!success) {
      return new Response(null, { status: 429 });
    }
  } catch (error) {
    // Counters are best-effort: skip the hit instead of counting unchecked.
    console.error("[stats] Rate limit check failed:", error);
    return new Response(null, { status: 204 });
  }

  await incrementQrStats(count);
  return new Response(null, { status: 204 });
}
