import { track } from "@vercel/analytics/server";
import type { CurrencyCode } from "bysquare";
import { type NextRequest, NextResponse } from "next/server";
import { InvalidIBANError } from "@/features/payment/qr-generator";
import { generatePaymentQRServer } from "@/features/payment/qr-generator.server";
import { SpaydPayloadTooLargeError } from "@/features/payment/spayd-encoder";
import { CORS_HEADERS, corsOptions } from "@/lib/api/cors";
import { apiDocs } from "@/lib/api/qr-docs";
import {
  type QrErrorResponse,
  type QrGenerationResponse,
  qrRequestSchema,
} from "@/lib/api/qr-schema";
import {
  checkRateLimit,
  DAILY_LIMIT,
  getClientIp,
  MINUTE_LIMIT,
} from "@/lib/api/rate-limiter";

export const runtime = "nodejs";

export function GET() {
  return new Response(JSON.stringify(apiDocs, null, 2), {
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

export { corsOptions as OPTIONS };

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  const rateLimit = await checkRateLimit(ip);
  if (!rateLimit.success) {
    const retryAfter = rateLimit.resetAt
      ? Math.max(1, Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000))
      : 60;

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "RATE_LIMIT",
          message: `Rate limit exceeded. Limit is ${MINUTE_LIMIT} requests/minute and ${DAILY_LIMIT} requests/day. Retry after ${retryAfter} seconds.`,
          hint: "The GET endpoint (API docs) and OPTIONS (CORS preflight) are not rate-limited.",
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
          message: "Invalid JSON body. Request body must be valid JSON.",
          hint: "Send a POST request with Content-Type: application/json header and a valid JSON body.",
          example: {
            iban: "SK3112000000198742637541",
            amount: 25.5,
          },
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
          message: "Validation failed. Check the issues array for details.",
          issues: parsed.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
          hint: "Required: iban (string). Optional: amount (number), currency (EUR|CZK), variableSymbol, specificSymbol, constantSymbol, recipientName, paymentNote, paymentFormat (bysquare|spayd), format (png|svg), size (100-1000).",
          example: {
            iban: "SK3112000000198742637541",
            amount: 25.5,
            variableSymbol: "2024001",
          },
        },
      } satisfies QrErrorResponse,
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const { format, size, currency, paymentFormat, ...paymentData } = parsed.data;

  try {
    const data = await generatePaymentQRServer(
      {
        ...paymentData,
        format: paymentFormat,
        currency: currency as CurrencyCode,
      },
      { format, size }
    );

    track("api_qr_generated", {
      format,
      paymentFormat,
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
            field: "iban",
            hint: "IBAN must start with a 2-letter country code followed by 2 check digits and up to 30 alphanumeric characters.",
            example: { iban: "SK3112000000198742637541" },
          },
        } satisfies QrErrorResponse,
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (error instanceof SpaydPayloadTooLargeError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: error.message,
            hint: "Reduce the length of paymentNote or recipientName to fit within SPAYD limits.",
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
