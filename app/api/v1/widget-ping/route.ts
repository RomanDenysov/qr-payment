import { CORS_HEADERS, corsOptions } from "@/lib/api/cors";

export function OPTIONS() {
  return corsOptions();
}

export function GET() {
  // Fire-and-forget analytics ping from embedded widgets.
  // No cookies, no tracking, no PII - just counts installations.
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
