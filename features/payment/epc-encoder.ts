import { electronicFormatIBAN } from "ibantools";
import { sanitizeForEpc } from "@/lib/sanitize";

export class EpcPayloadTooLargeError extends Error {
  constructor(byteLength: number) {
    super(`EPC QR payload príliš veľký: ${byteLength} bajtov (max 331)`);
    this.name = "EpcPayloadTooLargeError";
  }
}

const EPC_MAX_BYTES = 331;

interface EpcInput {
  iban: string;
  amount: number;
  beneficiaryName: string;
  bic?: string;
  remittanceText?: string;
}

/**
 * Encodes payment data into the EPC QR code payload (12 fixed lines).
 * See: https://www.europeanpaymentscouncil.eu/document-library/guidance-documents/quick-response-code-guidelines
 */
export function encodeEpcQr(input: EpcInput): string {
  const iban = electronicFormatIBAN(input.iban) ?? input.iban;
  const name = sanitizeForEpc(input.beneficiaryName).sanitized;
  const amount = `EUR${input.amount.toFixed(2)}`;
  const remittance = input.remittanceText
    ? sanitizeForEpc(input.remittanceText).sanitized
    : "";

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
    throw new EpcPayloadTooLargeError(byteLength);
  }

  return payload;
}
