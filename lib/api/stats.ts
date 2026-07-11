import { Redis } from "@upstash/redis";

export interface UsageStats {
  total: number;
  month: number;
  prevMonth: number;
  api: number;
}

const TOTAL_KEY = "stats:qr:total";
const API_KEY = "stats:api:total";
const CACHE_TTL_MS = 600_000;

let redis: Redis | null | undefined;

export function getRedis(): Redis | null {
  if (redis !== undefined) {
    return redis;
  }
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  redis = url && token ? new Redis({ url, token }) : null;
  return redis;
}

function monthKey(offset = 0): string {
  const date = new Date();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + offset);
  return `stats:qr:${date.toISOString().slice(0, 7)}`;
}

/** Fire-and-forget: counters must never break QR generation. */
export async function incrementQrStats(count = 1): Promise<void> {
  const client = getRedis();
  if (!client) {
    return;
  }
  try {
    await client
      .pipeline()
      .incrby(TOTAL_KEY, count)
      .incrby(monthKey(), count)
      .exec();
  } catch (error) {
    console.error("[stats] QR counter increment failed:", error);
  }
}

/** Fire-and-forget: counters must never break the API response. */
export async function incrementApiStats(): Promise<void> {
  const client = getRedis();
  if (!client) {
    return;
  }
  try {
    await client.incr(API_KEY);
  } catch (error) {
    console.error("[stats] API counter increment failed:", error);
  }
}

export async function readStats(): Promise<UsageStats | null> {
  const client = getRedis();
  if (!client) {
    return null;
  }
  const [total, month, prevMonth, api] = await client.mget<(number | null)[]>(
    TOTAL_KEY,
    monthKey(),
    monthKey(-1),
    API_KEY
  );
  return {
    total: total ?? 0,
    month: month ?? 0,
    prevMonth: prevMonth ?? 0,
    api: api ?? 0,
  };
}

// ponytail: per-instance in-memory cache; swap for "use cache" if instances
// ever diverge visibly
let cached: { data: UsageStats | null; expires: number } | null = null;

export async function readStatsCached(): Promise<UsageStats | null> {
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }
  try {
    const data = await readStats();
    cached = { data, expires: Date.now() + CACHE_TTL_MS };
    return data;
  } catch (error) {
    // Next's build-time static-render probe throws DynamicServerError from
    // the Upstash fetch — it must propagate so the route is marked dynamic.
    if (
      error instanceof Error &&
      "digest" in error &&
      error.digest === "DYNAMIC_SERVER_USAGE"
    ) {
      throw error;
    }
    console.error("[stats] Read failed:", error);
    return null;
  }
}
