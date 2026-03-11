import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { CORS_HEADERS, corsOptions } from "@/lib/api/cors";

const spec = readFileSync(join(process.cwd(), "public/openapi.json"), "utf-8");

export function GET() {
  return new NextResponse(spec, {
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

export { corsOptions as OPTIONS };
