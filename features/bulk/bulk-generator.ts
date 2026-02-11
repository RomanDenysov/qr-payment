import type { QRBranding } from "@/features/payment/qr-generator";
import { generatePaymentQR } from "@/features/payment/qr-generator";
import type { PaymentFormData } from "@/features/payment/schema";
import type { CsvRow } from "./csv-parser";

export interface GeneratedQR {
  rowNumber: number;
  iban: string;
  amount: number;
  dataUrl: string;
  filename: string;
}

export interface GenerationProgress {
  current: number;
  total: number;
}

const CHUNK_SIZE = 2;

function toPaymentData(row: CsvRow): PaymentFormData {
  return {
    format: row.format,
    iban: row.iban,
    amount: row.amount,
    variableSymbol: row.variableSymbol,
    specificSymbol: row.specificSymbol,
    constantSymbol: row.constantSymbol,
    recipientName: row.recipientName,
    paymentNote: row.paymentNote,
    bic: row.bic,
  };
}

function buildFilename(row: CsvRow): string {
  const ibanLast4 = row.iban.replace(/\s/g, "").slice(-4);
  const amount = row.amount.toFixed(2).replace(".", "_");
  return `qr_${row.rowNumber}_${ibanLast4}_${amount}.png`;
}

function yieldToMain(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export async function generateBulkQR(
  rows: CsvRow[],
  branding: QRBranding | undefined,
  onProgress?: (progress: GenerationProgress) => void
): Promise<GeneratedQR[]> {
  const results: GeneratedQR[] = [];

  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const chunk = rows.slice(i, i + CHUNK_SIZE);

    for (const row of chunk) {
      const data = toPaymentData(row);
      const dataUrl = await generatePaymentQR(data, branding);

      results.push({
        rowNumber: row.rowNumber,
        iban: row.iban,
        amount: row.amount,
        dataUrl,
        filename: buildFilename(row),
      });

      onProgress?.({ current: results.length, total: rows.length });
    }

    if (i + CHUNK_SIZE < rows.length) {
      await yieldToMain();
    }
  }

  return results;
}
