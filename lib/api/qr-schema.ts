// OpenAPI spec: public/openapi.json — keep schemas in sync
import { electronicFormatIBAN, isValidIBAN } from "ibantools";
import z from "zod";

const DIGITS_RE = /^\d*$/;
const HEX_COLOR_RE = /^#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

export const qrRequestSchema = z
  .object({
    iban: z
      .string({ error: "IBAN is required" })
      .min(1, "IBAN is required")
      .refine(
        (val) => {
          const electronic = electronicFormatIBAN(val);
          return electronic && isValidIBAN(electronic);
        },
        { message: "Invalid IBAN" }
      ),
    amount: z
      .number()
      .min(0.01, "Amount must be at least 0.01")
      .max(999_999_999.99, "Amount exceeds maximum")
      .optional(),
    currency: z.enum(["EUR", "CZK"]).default("EUR"),
    variableSymbol: z
      .string()
      .max(10, "Variable symbol must be at most 10 characters")
      .refine(
        (val) => DIGITS_RE.test(val),
        "Variable symbol must be digits only"
      )
      .optional(),
    specificSymbol: z
      .string()
      .max(10, "Specific symbol must be at most 10 characters")
      .refine(
        (val) => DIGITS_RE.test(val),
        "Specific symbol must be digits only"
      )
      .optional(),
    constantSymbol: z
      .string()
      .max(4, "Constant symbol must be at most 4 characters")
      .refine(
        (val) => DIGITS_RE.test(val),
        "Constant symbol must be digits only"
      )
      .optional(),
    recipientName: z
      .string()
      .max(70, "Recipient name must be at most 70 characters")
      .optional(),
    paymentNote: z
      .string()
      .max(140, "Payment note must be at most 140 characters")
      .optional(),
    format: z.enum(["png", "svg"]).default("png"),
    size: z
      .number()
      .int("Size must be an integer")
      .min(100, "Size must be at least 100px")
      .max(1000, "Size must be at most 1000px")
      .default(300),
    paymentFormat: z.enum(["bysquare", "spayd", "epc"]).default("bysquare"),
    darkColor: z
      .string()
      .regex(HEX_COLOR_RE, "Must be a hex color (#RRGGBB or #RRGGBBAA)")
      .optional(),
    lightColor: z
      .string()
      .regex(HEX_COLOR_RE, "Must be a hex color (#RRGGBB or #RRGGBBAA)")
      .optional(),
    margin: z
      .number()
      .int("Margin must be an integer")
      .min(0, "Margin must be at least 0")
      .max(10, "Margin must be at most 10")
      .optional(),
    errorCorrectionLevel: z.enum(["L", "M", "Q", "H"]).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentFormat !== "epc") {
      return;
    }
    if (data.currency !== "EUR") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "EPC format only supports EUR currency",
        path: ["currency"],
      });
    }
    if (!data.recipientName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "EPC format requires recipient name",
        path: ["recipientName"],
      });
    }
    for (const field of [
      "variableSymbol",
      "specificSymbol",
      "constantSymbol",
    ] as const) {
      if (data[field]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `EPC format does not support ${field}`,
          path: [field],
        });
      }
    }
  });

export type QrRequest = z.infer<typeof qrRequestSchema>;

export interface QrGenerationResponse {
  success: true;
  data: string;
  format: "png" | "svg";
  iban: string;
  amount?: number;
  currency: "EUR" | "CZK";
}

export type QrErrorCode = "VALIDATION_ERROR" | "RATE_LIMIT" | "INTERNAL_ERROR";

export interface QrErrorResponse {
  success: false;
  error: {
    code: QrErrorCode;
    message: string;
    issues?: Array<{ path: string; message: string }>;
    field?: string;
    hint?: string;
    docs?: string;
    example?: Record<string, unknown>;
  };
}
