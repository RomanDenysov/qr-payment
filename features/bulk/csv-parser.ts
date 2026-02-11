import Papa from "papaparse";
import type { PaymentFormat } from "@/features/payment/format";
import { paymentFormSchema } from "@/features/payment/schema";

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

const MAX_ROWS = 100;

function detectFormat(headers: string[]): PaymentFormat {
  const lower = headers.map((h) => h.trim().toLowerCase());
  if (lower.includes("bic") || lower.includes("recipientname")) {
    return "epc";
  }
  return "bysquare";
}

function validateRow(row: CsvRow): string[] {
  const result = paymentFormSchema.safeParse(row);
  if (result.success) {
    return [];
  }
  return result.error.issues.map((i) => i.message);
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
        "paymentNote",
      ];
}

export async function parseCsv(file: File): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data.length) {
          reject(new Error("CSV súbor je prázdny"));
          return;
        }

        if (results.data.length > MAX_ROWS) {
          reject(
            new Error(
              `Maximálny počet riadkov je ${MAX_ROWS} (nahraných: ${results.data.length})`
            )
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

          const errors = validateRow(row);
          return { row, valid: errors.length === 0, errors };
        });

        resolve(parsed);
      },
      error: (error) =>
        reject(new Error(`Chyba pri čítaní CSV: ${error.message}`)),
    });
  });
}
