import Papa from "papaparse";
import type z from "zod";
import type { PaymentFormat } from "@/features/payment/format";
import type { PaymentFormData } from "@/features/payment/schema";

export interface CsvRow {
  rowNumber: number;
  iban: string;
  amount: number;
  variableSymbol?: string;
  specificSymbol?: string;
  constantSymbol?: string;
  recipientName?: string;
  paymentNote?: string;
  bic?: string;
  format: PaymentFormat;
}

export interface ParsedRow {
  row: CsvRow;
  valid: boolean;
  errors: string[];
}

type CsvErrorVariant =
  | { code: "empty"; params?: undefined }
  | { code: "tooManyRows"; params: { max: number; count: number } }
  | { code: "readError"; params: { error: string } };

export type CsvErrorCode = CsvErrorVariant["code"];

export class CsvValidationError extends Error {
  code: CsvErrorCode;
  params?: Record<string, string | number>;

  constructor(variant: CsvErrorVariant) {
    super(variant.code);
    this.code = variant.code;
    this.params = variant.params;
  }
}

const MAX_ROWS = 100;

function detectFormat(headers: string[]): PaymentFormat {
  const lower = headers.map((h) => h.trim().toLowerCase());
  if (lower.includes("bic")) {
    return "epc";
  }
  return "bysquare";
}

export function getExpectedHeaders(format: PaymentFormat): string[] {
  return format === "epc"
    ? ["iban", "amount", "recipientName", "bic", "paymentNote"]
    : [
        "iban",
        "amount",
        "variableSymbol",
        "specificSymbol",
        "constantSymbol",
        "recipientName",
        "paymentNote",
      ];
}

export function parseCsv(
  file: File,
  schema: z.ZodType<PaymentFormData>
): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data.length) {
          reject(new CsvValidationError({ code: "empty" }));
          return;
        }

        if (results.data.length > MAX_ROWS) {
          reject(
            new CsvValidationError({
              code: "tooManyRows",
              params: { max: MAX_ROWS, count: results.data.length },
            })
          );
          return;
        }

        const headers = results.meta.fields ?? [];
        const format = detectFormat(headers);

        const parsed: ParsedRow[] = results.data.map((rawRow, index) => {
          const row: CsvRow = {
            rowNumber: index + 1,
            iban: (rawRow.iban ?? "").trim(),
            amount: Number.parseFloat(rawRow.amount ?? "0") || 0,
            variableSymbol: rawRow.variableSymbol?.trim() || undefined,
            specificSymbol: rawRow.specificSymbol?.trim() || undefined,
            constantSymbol: rawRow.constantSymbol?.trim() || undefined,
            recipientName: rawRow.recipientName?.trim() || undefined,
            paymentNote: rawRow.paymentNote?.trim() || undefined,
            bic: rawRow.bic?.trim() || undefined,
            format,
          };

          const result = schema.safeParse(row);
          const errors = result.success
            ? []
            : result.error.issues.map((i) => i.message);
          return { row, valid: errors.length === 0, errors };
        });

        resolve(parsed);
      },
      error: (error) =>
        reject(
          new CsvValidationError({
            code: "readError",
            params: { error: error.message },
          })
        ),
    });
  });
}
