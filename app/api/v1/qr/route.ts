import { track } from "@vercel/analytics/server";
import type { CurrencyCode } from "bysquare";
import { type NextRequest, NextResponse } from "next/server";
import { InvalidIBANError } from "@/features/payment/qr-generator";
import { generatePaymentQRServer } from "@/features/payment/qr-generator.server";
import { apiDocs } from "@/lib/api/qr-docs";
import {
  type QrErrorResponse,
  type QrGenerationResponse,
  qrRequestSchema,
} from "@/lib/api/qr-schema";
import { checkRateLimit, getClientIp } from "@/lib/api/rate-limiter";

export const runtime = "nodejs";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function GET() {
  return NextResponse.json(apiDocs, {
    headers: {
      ...CORS_HEADERS,
      "Cache-Control": "public, max-age=3600",
    },
  });
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  const rateLimit = await checkRateLimit(ip);
  if (!rateLimit.success) {
    const retryAfter = rateLimit.resetAt
      ? Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000)
      : 60;

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "RATE_LIMIT",
          message: "Rate limit exceeded. Please try again later.",
        },
      } satisfies QrErrorResponse,
      {
        status: 429,
        headers: {
          ...CORS_HEADERS,
          "X-RateLimit-Limit": String(rateLimit.limit),
          "X-RateLimit-Remaining": "0",
          "Retry-After": String(retryAfter),
        },
      }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch (parseError) {
    console.warn("[api/v1/qr] JSON parse error:", parseError);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid JSON body",
        },
      } satisfies QrErrorResponse,
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const parsed = qrRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          issues: parsed.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
      } satisfies QrErrorResponse,
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const { format, size, currency, ...paymentData } = parsed.data;

  try {
    const data = await generatePaymentQRServer(
      { ...paymentData, currency: currency as CurrencyCode },
      { format, size }
    );

    track("api_qr_generated", {
      format,
      hasAmount: paymentData.amount != null,
    }).catch((err) => {
      console.warn("[api/v1/qr] Analytics tracking failed:", err);
    });

    return NextResponse.json(
      {
        success: true,
        data,
        format,
        iban: paymentData.iban,
        ...(paymentData.amount != null && { amount: paymentData.amount }),
        currency,
      } satisfies QrGenerationResponse,
      {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          ...(rateLimit.remaining >= 0 && {
            "X-RateLimit-Limit": String(rateLimit.limit),
            "X-RateLimit-Remaining": String(rateLimit.remaining),
          }),
        },
      }
    );
  } catch (error) {
    if (error instanceof InvalidIBANError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: error.message,
          },
        } satisfies QrErrorResponse,
        { status: 400, headers: CORS_HEADERS }
      );
    }

    console.error("[api/v1/qr] QR generation failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "QR code generation failed",
        },
      } satisfies QrErrorResponse,
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
