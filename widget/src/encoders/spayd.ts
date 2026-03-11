import type { EncoderResult } from "../types";

const SPAYD_MAX_BYTES = 360;

/**
 * Encode special characters per SPAYD spec.
 * -> %2A, + -> %2B, % -> %25
 */
function encodeSpaydChars(str: string): string {
  const normalized = str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .normalize("NFC");
  let result = "";
  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized.charAt(i);
    const code = normalized.charCodeAt(i);
    if (ch === "*") {
      result += "%2A";
    } else if (ch === "+") {
      result += "%2B";
    } else if (ch === "%") {
      result += "%25";
    } else if (code > 127) {
      result += encodeURIComponent(ch);
    } else {
      result += ch;
    }
  }
  return result;
}

interface SpaydInput {
  iban: string;
  amount: number;
  currency?: string;
  variableSymbol?: string;
  specificSymbol?: string;
  constantSymbol?: string;
  recipientName?: string;
  paymentNote?: string;
  bic?: string;
}

export function encodeSpaydQr(
  input: SpaydInput
): EncoderResult | { error: string } {
  const iban = input.iban.replace(/\s+/g, "").toUpperCase();
  const acc = input.bic ? `${iban}+${input.bic}` : iban;
  const parts: string[] = [`SPD*1.0*ACC:${acc}`];

  parts.push(`AM:${input.amount.toFixed(2)}`);
  parts.push(`CC:${input.currency ?? "CZK"}`);

  if (input.recipientName) {
    parts.push(`RN:${encodeSpaydChars(input.recipientName.slice(0, 35))}`);
  }
  if (input.paymentNote) {
    parts.push(`MSG:${encodeSpaydChars(input.paymentNote.slice(0, 60))}`);
  }
  if (input.variableSymbol) {
    parts.push(`X-VS:${input.variableSymbol}`);
  }
  if (input.specificSymbol) {
    parts.push(`X-SS:${input.specificSymbol}`);
  }
  if (input.constantSymbol) {
    parts.push(`X-KS:${input.constantSymbol}`);
  }

  const payload = parts.join("*");
  const byteLength = new TextEncoder().encode(payload).length;

  if (byteLength > SPAYD_MAX_BYTES) {
    return {
      error: `SPAYD payload too large: ${byteLength} bytes (max ${SPAYD_MAX_BYTES})`,
    };
  }

  return { payload, errorCorrectionLevel: "M" };
}
