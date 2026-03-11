import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";

const spec = readFileSync(join(process.cwd(), "public/openapi.json"), "utf-8");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function GET() {
  return new NextResponse(spec, {
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
