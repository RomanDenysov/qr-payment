import { Redis } from "@upstash/redis";

export interface UsageStats {
  total: number;
  month: number;
  api: number;
}

const TOTAL_KEY = "stats:qr:total";
const API_KEY = "stats:api:total";

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

function monthKey(): string {
  return `stats:qr:${new Date().toISOString().slice(0, 7)}`;
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
  const [total, month, api] = await client.mget<(number | null)[]>(
    TOTAL_KEY,
    monthKey(),
    API_KEY
  );
  return {
    total: total ?? 0,
    month: month ?? 0,
    api: api ?? 0,
  };
}
