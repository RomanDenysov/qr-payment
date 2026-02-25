import type { NextRequest } from "next/server";

interface RateLimitResult {
  success: boolean;
  remaining: number;
  limit: number;
  resetAt?: Date;
}

interface Limiter {
  limit: (
    id: string
  ) => Promise<{ success: boolean; remaining: number; reset: number }>;
}

const MINUTE_LIMIT = 10;
const DAILY_LIMIT = 100;

let minuteLimiter: Limiter | null = null;
let dailyLimiter: Limiter | null = null;
let initialized = false;

async function initLimiters() {
  if (initialized) {
    return;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!(url && token)) {
    initialized = true;
    console.warn(
      "[rate-limiter] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set — rate limiting disabled"
    );
    return;
  }

  try {
    const { Redis } = await import("@upstash/redis");
    const { Ratelimit } = await import("@upstash/ratelimit");

    const redis = new Redis({ url, token });

    minuteLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(MINUTE_LIMIT, "1 m"),
      prefix: "api:qr:min",
    });

    dailyLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(DAILY_LIMIT, "1 d"),
      prefix: "api:qr:day",
    });

    initialized = true;
  } catch (error) {
    console.error("[rate-limiter] Failed to initialize:", error);
  }
}

export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  await initLimiters();

  if (!(minuteLimiter && dailyLimiter)) {
    return { success: true, remaining: -1, limit: -1 };
  }

  try {
    const minuteResult = await minuteLimiter.limit(ip);
    if (!minuteResult.success) {
      return {
        success: false,
        remaining: 0,
        limit: MINUTE_LIMIT,
        resetAt: new Date(minuteResult.reset),
      };
    }

    const dailyResult = await dailyLimiter.limit(ip);
    if (!dailyResult.success) {
      return {
        success: false,
        remaining: 0,
        limit: DAILY_LIMIT,
        resetAt: new Date(dailyResult.reset),
      };
    }

    return {
      success: true,
      remaining: Math.min(minuteResult.remaining, dailyResult.remaining),
      limit: MINUTE_LIMIT,
    };
  } catch (error) {
    console.error("[rate-limiter] Check failed, falling back to allow:", error);
    return { success: true, remaining: -1, limit: -1 };
  }
}

export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}
