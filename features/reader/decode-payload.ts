import { decode, PaymentOptions } from "bysquare/pay";
import { electronicFormatIBAN, isValidIBAN } from "ibantools";
import type { PaymentFormat } from "@/features/payment/format";
import type { PaymentFormData } from "@/features/payment/schema";

/** Something in the code that the payment form cannot carry over as is. */
export type DecodeWarning =
  | "invalidIban"
  | "multiplePayments"
  | "notPaymentOrder"
  | "unsupportedCurrency";

export type DecodeResult =
  | { ok: true; payment: PaymentFormData; warnings: DecodeWarning[] }
  | { ok: false };

const COMPACT_DATE_RE = /^(\d{4})(\d{2})(\d{2})$/;
const EPC_AMOUNT_RE = /^([A-Z]{3})(\d+(?:\.\d{1,2})?)$/;
const LINE_BREAK_RE = /\r?\n/;

type Currency = NonNullable<PaymentFormData["currency"]>;

/** The form only knows EUR and CZK; anything else falls back to EUR with a warning. */
function toCurrency(code: string | undefined, warnings: DecodeWarning[]) {
  if (code === "EUR" || code === "CZK") {
    return code satisfies Currency;
  }
  warnings.push("unsupportedCurrency");
  return "EUR" satisfies Currency;
}

/** `YYYYMMDD` (bysquare, SPAYD) to the form's `YYYY-MM-DD`. */
function toIsoDate(compact: string | undefined): string | undefined {
  const match = compact?.match(COMPACT_DATE_RE);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : undefined;
}

function decodeBysquare(text: string): DecodeResult {
  const model = decode(text);
  const [first] = model.payments;
  if (!first) {
    return { ok: false };
  }
  const warnings: DecodeWarning[] = [];
  if (model.payments.length > 1) {
    warnings.push("multiplePayments");
  }
  if (first.type !== PaymentOptions.PaymentOrder) {
    warnings.push("notPaymentOrder");
  }
  const account = first.bankAccounts[0];
  return {
    ok: true,
    warnings,
    payment: {
      format: "bysquare",
      currency: toCurrency(first.currencyCode, warnings),
      iban: account?.iban ?? "",
      bic: account?.bic,
      amount: first.amount ?? 0,
      variableSymbol: first.variableSymbol,
      specificSymbol: first.specificSymbol,
      constantSymbol: first.constantSymbol,
      // Spec 1.0.0 codes carry no beneficiary block at all.
      recipientName: first.beneficiary?.name,
      paymentNote: first.paymentNote,
      paymentDueDate: toIsoDate(first.paymentDueDate),
      invoiceId: model.invoiceId,
    },
  };
}

/** SPAYD escapes `*`, `+`, `%` and non-ASCII as percent sequences. */
function unescapeSpayd(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    // A lone `%` from a sloppy encoder: keep the text as written.
    return value;
  }
}

/** Short Payment Descriptor: `SPD*1.0*ACC:CZ...+BIC*AM:100.00*CC:CZK*...`. */
function decodeSpayd(text: string): DecodeResult {
  const fields = new Map<string, string>();
  for (const part of text.split("*").slice(2)) {
    const colon = part.indexOf(":");
    if (colon > 0) {
      fields.set(part.slice(0, colon), part.slice(colon + 1));
    }
  }
  const get = (key: string) => {
    const value = fields.get(key);
    return value ? unescapeSpayd(value) : undefined;
  };

  const acc = fields.get("ACC");
  if (!acc) {
    return { ok: false };
  }
  const [iban, bic] = acc.split("+").map(unescapeSpayd);
  const warnings: DecodeWarning[] = [];
  return {
    ok: true,
    warnings,
    payment: {
      format: "spayd",
      currency: toCurrency(get("CC") ?? "CZK", warnings),
      iban,
      bic,
      amount: Number(get("AM") ?? 0),
      variableSymbol: get("X-VS"),
      specificSymbol: get("X-SS"),
      constantSymbol: get("X-KS"),
      recipientName: get("RN"),
      paymentNote: get("MSG"),
      paymentDueDate: toIsoDate(get("DT")),
      spaydReference: get("RF"),
      instantPayment: get("PT") === "IP" || undefined,
    },
  };
}

/** EPC QR: 12 fixed lines starting with `BCD`, trailing empty lines may be cut. */
function decodeEpc(text: string): DecodeResult {
  const lines = text.split(LINE_BREAK_RE);
  const [, , , , bic, name, iban, amountLine, purpose, reference, remittance] =
    lines;
  if (!iban) {
    return { ok: false };
  }
  const amountMatch = amountLine?.match(EPC_AMOUNT_RE);
  const warnings: DecodeWarning[] = [];
  return {
    ok: true,
    warnings,
    payment: {
      format: "epc",
      currency: toCurrency(amountMatch?.[1] ?? "EUR", warnings),
      iban,
      bic: bic || undefined,
      amount: amountMatch ? Number(amountMatch[2]) : 0,
      recipientName: name || undefined,
      // The form has one reference field; a structured creditor reference
      // (RF...) takes it when the free-text one is empty.
      paymentNote: remittance || reference || undefined,
      purposeCode: purpose || undefined,
    },
  };
}

export function detectFormat(text: string): PaymentFormat {
  if (text.startsWith("SPD*")) {
    return "spayd";
  }
  if (LINE_BREAK_RE.test(text) && text.startsWith("BCD")) {
    return "epc";
  }
  return "bysquare";
}

/**
 * Turns the text inside a payment QR code (PAY by square, SPAYD or EPC) back
 * into payment form data. Runs in the browser only: the payment never reaches
 * the server.
 */
export function decodePayload(raw: string): DecodeResult {
  const text = raw.trim();
  if (!text) {
    return { ok: false };
  }
  const result = decodeByFormat(text);
  if (!result.ok) {
    return result;
  }
  // The form resets from this object, and an explicit undefined would replace
  // its "" defaults.
  const payment = Object.fromEntries(
    Object.entries(result.payment).filter(([, value]) => value !== undefined)
  ) as PaymentFormData;
  const electronic = electronicFormatIBAN(payment.iban);
  const warnings: DecodeWarning[] =
    electronic && isValidIBAN(electronic)
      ? result.warnings
      : ["invalidIban", ...result.warnings];
  return { ok: true, payment, warnings };
}

function decodeByFormat(text: string): DecodeResult {
  const format = detectFormat(text);
  if (format === "spayd") {
    return decodeSpayd(text);
  }
  if (format === "epc") {
    return decodeEpc(text);
  }
  try {
    return decodeBysquare(text);
  } catch {
    // Not base32hex, bad checksum or not LZMA: not a PAY by square code.
    return { ok: false };
  }
}
