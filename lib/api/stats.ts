import { Redis } from "@upstash/redis";

export interface UsageStats {
  total: number;
  last30Days: number;
  api: number;
}

const TOTAL_KEY = "stats:qr:total";
const API_KEY = "stats:api:total";
const DAY_KEY_PREFIX = "stats:qr:day:";
const WINDOW_DAYS = 30;
// Daily keys only feed the 30-day window, so they expire shortly after it.
const DAY_KEY_TTL_SECONDS = 40 * 24 * 60 * 60;

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

/** Key of the UTC day `daysAgo` days back (0 = today). */
function dayKey(daysAgo = 0): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return `${DAY_KEY_PREFIX}${date.toISOString().slice(0, 10)}`;
}

/** Fire-and-forget: counters must never break QR generation. */
export async function incrementQrStats(count = 1): Promise<void> {
  const client = getRedis();
  if (!client) {
    return;
  }
  const today = dayKey();
  try {
    await client
      .pipeline()
      .incrby(TOTAL_KEY, count)
      .incrby(today, count)
      .expire(today, DAY_KEY_TTL_SECONDS)
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
  const dayKeys = Array.from({ length: WINDOW_DAYS }, (_, i) => dayKey(i));
  const [total, api, ...days] = await client.mget<(number | null)[]>(
    TOTAL_KEY,
    API_KEY,
    ...dayKeys
  );
  return {
    total: total ?? 0,
    last30Days: days.reduce<number>((sum, day) => sum + (day ?? 0), 0),
    api: api ?? 0,
  };
}
