import type { PaymentFormat, ValidationError } from "./types";

const IBAN_FORMAT_RE = /^[A-Z]{2}\d{2}[A-Z0-9]+$/;
const CURRENCY_RE = /^[A-Z]{3}$/;

/**
 * IBAN validation using ISO 13616 mod-97 checksum.
 */
export function validateIBAN(raw: string): {
  valid: boolean;
  clean: string;
  error?: string;
} {
  const clean = raw.replace(/\s+/g, "").toUpperCase();

  if (clean.length < 5 || clean.length > 34) {
    return { valid: false, clean, error: "Invalid IBAN length" };
  }

  if (!IBAN_FORMAT_RE.test(clean)) {
    return { valid: false, clean, error: "Invalid IBAN format" };
  }

  // Rearrange: move first 4 chars to end
  const rearranged = clean.slice(4) + clean.slice(0, 4);

  // Replace letters with digits (A=10, B=11, ..., Z=35)
  let digits = "";
  for (const ch of rearranged) {
    const code = ch.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      digits += (code - 55).toString();
    } else {
      digits += ch;
    }
  }

  // mod 97 on large number (process in chunks to avoid overflow)
  let remainder = 0;
  for (let i = 0; i < digits.length; i += 7) {
    const chunk = digits.slice(i, i + 7);
    remainder = Number(remainder + chunk) % 97;
  }

  if (remainder !== 1) {
    return { valid: false, clean, error: "Invalid IBAN checksum" };
  }

  return { valid: true, clean };
}

function validateAmount(
  format: PaymentFormat,
  amount?: number
): ValidationError[] {
  if (amount === undefined) {
    return [];
  }
  const errors: ValidationError[] = [];
  if (Number.isNaN(amount) || amount <= 0) {
    errors.push({
      field: "amount",
      message: "Amount must be a positive number",
    });
  }
  if (format === "epc" && amount > 999_999_999.99) {
    errors.push({
      field: "amount",
      message: "EPC QR max amount is 999,999,999.99",
    });
  }
  return errors;
}

function validateEpc(currency?: string, recipient?: string): ValidationError[] {
  const errors: ValidationError[] = [];
  if (currency && currency !== "EUR") {
    errors.push({ field: "currency", message: "EPC QR supports EUR only" });
  }
  if (!recipient) {
    errors.push({
      field: "recipient",
      message: "Recipient name is required for EPC QR",
    });
  }
  return errors;
}

/**
 * Validate all payment fields based on format.
 */
export function validatePayment(
  format: PaymentFormat,
  iban: string,
  amount?: number,
  currency?: string,
  recipient?: string
): ValidationError[] {
  const errors: ValidationError[] = [];

  const ibanResult = validateIBAN(iban);
  if (!ibanResult.valid) {
    errors.push({ field: "iban", message: ibanResult.error ?? "Invalid IBAN" });
  }

  errors.push(...validateAmount(format, amount));

  if (format === "epc") {
    errors.push(...validateEpc(currency, recipient));
  }

  if (currency && !CURRENCY_RE.test(currency)) {
    errors.push({ field: "currency", message: "Invalid currency code" });
  }

  return errors;
}
