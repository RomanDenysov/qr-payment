import { NextResponse } from "next/server";
import { CORS_HEADERS, corsOptions } from "@/lib/api/cors";
import { readStats } from "@/lib/api/stats";

export const runtime = "nodejs";

export const OPTIONS = corsOptions;

/** Public anonymous usage counters — no auth, no PII. */
export async function GET() {
  const stats = await readStats();

  if (!stats) {
    return NextResponse.json(
      { error: "Stats are not available" },
      { status: 503, headers: CORS_HEADERS }
    );
  }

  return NextResponse.json(
    { total: stats.total, month: stats.month, api: stats.api },
    {
      headers: {
        ...CORS_HEADERS,
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600",
      },
    }
  );
}
