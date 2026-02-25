import { DAILY_LIMIT, MINUTE_LIMIT } from "@/lib/api/rate-limiter";

export const apiDocs = {
  name: "QR Platby API",
  description:
    "Generate PAY by square QR codes for Slovak bank payments. Returns base64 PNG or SVG string.",
  endpoint: "https://qr-platby.com/api/v1/qr",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  request: {
    required: {
      iban: {
        type: "string",
        description: "IBAN of the recipient (e.g. SK3112000000198742637541)",
      },
    },
    optional: {
      amount: {
        type: "number",
        description: "Payment amount (0.01 – 999999999.99)",
      },
      currency: {
        type: "string",
        enum: ["EUR", "CZK"],
        default: "EUR",
      },
      variableSymbol: {
        type: "string",
        description: "Up to 10 digits",
      },
      specificSymbol: {
        type: "string",
        description: "Up to 10 digits",
      },
      constantSymbol: {
        type: "string",
        description: "Up to 4 digits",
      },
      recipientName: {
        type: "string",
        description: "Up to 70 characters",
      },
      paymentNote: {
        type: "string",
        description: "Up to 140 characters",
      },
      format: {
        type: "string",
        enum: ["png", "svg"],
        default: "png",
        description: "png returns base64 data URI, svg returns SVG markup",
      },
      size: {
        type: "number",
        default: 300,
        description: "QR code size in pixels (100–1000, png only)",
      },
    },
  },
  response: {
    success: {
      success: true,
      data: "base64 data URI (png) or SVG string (svg)",
      format: "png | svg",
      iban: "normalized IBAN",
      amount: "echoed back if provided",
      currency: "EUR",
    },
    error: {
      success: false,
      error: {
        code: "VALIDATION_ERROR | RATE_LIMIT | INTERNAL_ERROR",
        message: "Human-readable error description",
        issues: "Array of { path, message } for validation errors",
      },
    },
  },
  rateLimits: {
    perMinute: MINUTE_LIMIT,
    perDay: DAILY_LIMIT,
  },
  example: {
    curl: `curl -X POST https://qr-platby.com/api/v1/qr \\
  -H "Content-Type: application/json" \\
  -d '{"iban":"SK3112000000198742637541","amount":25.50,"variableSymbol":"2024001"}'`,
  },
};
