import type { NextRequest } from "next/server";
import { incrementQrStats } from "@/lib/api/stats";

export const runtime = "nodejs";

// Matches the bulk generator's MAX_ROWS — the largest legitimate batch.
const MAX_COUNT = 100;

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
  await incrementQrStats(parseCount(req.nextUrl.searchParams.get("count")));
  return new Response(null, { status: 204 });
}
