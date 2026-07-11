import { type NextRequest, NextResponse } from "next/server";
import { SHARE_ID_RE } from "@/features/payment/tracking";
import { getRedis } from "@/lib/api/stats";

export const runtime = "nodejs";

const TTL_SECONDS = 90 * 24 * 60 * 60;

interface Props {
  params: Promise<{ id: string }>;
}

function countKey(id: string): string {
  return `track:${id}:count`;
}

function lastKey(id: string): string {
  return `track:${id}:last`;
}

/**
 * Share-link open ping. Called only from client JS on the opened /p page —
 * never on GET/SSR — so link-unfurl bots don't inflate counts. Stores an
 * anonymous count + last-opened timestamp, both refreshed to a 90-day TTL.
 */
export async function POST(_req: NextRequest, { params }: Props) {
  const { id } = await params;
  if (!SHARE_ID_RE.test(id)) {
    return new Response(null, { status: 400 });
  }

  const redis = getRedis();
  if (redis) {
    try {
      await redis
        .pipeline()
        .incr(countKey(id))
        .expire(countKey(id), TTL_SECONDS)
        .set(lastKey(id), new Date().toISOString(), { ex: TTL_SECONDS })
        .exec();
    } catch (error) {
      console.error("[track] Open ping failed:", error);
    }
  }
  return new Response(null, { status: 204 });
}

/** Owner stats: open count + last-opened timestamp. No PII. */
export async function GET(_req: NextRequest, { params }: Props) {
  const { id } = await params;
  if (!SHARE_ID_RE.test(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json(
      { error: "Tracking is not available" },
      { status: 503 }
    );
  }

  const [count, last] = await redis.mget<[number | null, string | null]>(
    countKey(id),
    lastKey(id)
  );

  return NextResponse.json(
    { count: count ?? 0, last: last ?? null },
    { headers: { "Cache-Control": "no-store" } }
  );
}
