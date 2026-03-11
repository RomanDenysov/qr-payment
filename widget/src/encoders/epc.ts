import type { EncoderResult } from "../types";

const EPC_MAX_BYTES = 331;

const GERMAN_MAP: Record<string, string> = {
  "\u00E4": "ae",
  "\u00F6": "oe",
  "\u00FC": "ue",
  "\u00C4": "Ae",
  "\u00D6": "Oe",
  "\u00DC": "Ue",
  "\u00DF": "ss",
};
const GERMAN_RE = /[\u00E4\u00F6\u00FC\u00C4\u00D6\u00DC\u00DF]/g;
const DIACRITICS_RE = /[\u0300-\u036f]/g;
const NON_ASCII_PRINTABLE_RE = /[^\x20-\x7E]/g;
const WHITESPACE_RE = /\s+/g;

function sanitize(input: string): string {
  let result = input.replace(GERMAN_RE, (ch) => GERMAN_MAP[ch] ?? ch);
  result = result.normalize("NFD").replace(DIACRITICS_RE, "").normalize("NFC");
  return result.replace(NON_ASCII_PRINTABLE_RE, "");
}

function stripSpaces(iban: string): string {
  return iban.replace(WHITESPACE_RE, "").toUpperCase();
}

interface EpcInput {
  iban: string;
  amount: number;
  beneficiaryName: string;
  bic?: string;
  remittanceText?: string;
}

export function encodeEpcQr(
  input: EpcInput
): EncoderResult | { error: string } {
  const iban = stripSpaces(input.iban);
  const name = sanitize(input.beneficiaryName);
  const amount = `EUR${input.amount.toFixed(2)}`;
  const remittance = input.remittanceText ? sanitize(input.remittanceText) : "";

  const lines = [
    "BCD", // 1. Service Tag
    "002", // 2. Version
    "1", // 3. Character set (UTF-8)
    "SCT", // 4. Identification
    input.bic ?? "", // 5. BIC (optional)
    name, // 6. Beneficiary name
    iban, // 7. IBAN
    amount, // 8. Amount
    "", // 9. Purpose code (unused)
    "", // 10. Structured reference (unused)
    remittance, // 11. Remittance text (unstructured)
    "", // 12. Beneficiary to originator info (unused)
  ];

  const payload = lines.join("\n");
  const byteLength = new TextEncoder().encode(payload).length;

  if (byteLength > EPC_MAX_BYTES) {
    return {
      error: `EPC QR payload too large: ${byteLength} bytes (max ${EPC_MAX_BYTES})`,
    };
  }

  return { payload, errorCorrectionLevel: "M" };
}
