import { decode, PaymentOptions } from "bysquare/pay";
import { electronicFormatIBAN, isValidIBAN } from "ibantools";
import type { Currency, PaymentFormData } from "@/features/payment/schema";

/** Something in the code that the payment form cannot carry over as is. */
export type DecodeWarning =
  | "invalidIban"
  | "multiplePayments"
  | "notPaymentOrder"
  | "structuredReference"
  | "unsupportedCurrency";

export type DecodeResult =
  | { ok: true; payment: PaymentFormData; warnings: DecodeWarning[] }
  | { ok: false };

/** What a format decoder reads, before the currency is fitted to the form. */
interface Decoded {
  payment: Omit<PaymentFormData, "currency">;
  currency: string;
  warnings: DecodeWarning[];
}

const COMPACT_DATE_RE = /^(\d{4})(\d{2})(\d{2})$/;
const EPC_AMOUNT_RE = /^([A-Z]{3})(\d+(?:\.\d{1,2})?)$/;
const LINE_BREAK_RE = /\r?\n/;
const SPAYD_PREFIX_RE = /^SPD\*/i;
const FORM_CURRENCIES: readonly string[] = ["EUR", "CZK"] satisfies Currency[];

function isFormCurrency(code: string): code is Currency {
  return FORM_CURRENCIES.includes(code);
}

/** `YYYYMMDD` (bysquare, SPAYD) to the form's `YYYY-MM-DD`. */
function toIsoDate(compact: string | undefined): string | undefined {
  const match = compact?.match(COMPACT_DATE_RE);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : undefined;
}

function decodeBysquare(text: string): Decoded | null {
  const model = decode(text);
  const [first] = model.payments;
  if (!first) {
    return null;
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
    currency: first.currencyCode,
    warnings,
    payment: {
      format: "bysquare",
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

/**
 * Short Payment Descriptor: `SPD*1.0*ACC:CZ...+BIC*AM:100.00*CC:CZK*...`.
 * Keys are matched in any case and a decimal comma is accepted, as some
 * generators write them.
 */
function decodeSpayd(text: string): Decoded | null {
  const fields = new Map<string, string>();
  for (const part of text.split("*").slice(2)) {
    const colon = part.indexOf(":");
    if (colon > 0) {
      fields.set(part.slice(0, colon).toUpperCase(), part.slice(colon + 1));
    }
  }
  const get = (key: string) => {
    const value = fields.get(key);
    return value ? unescapeSpayd(value) : undefined;
  };

  const acc = fields.get("ACC");
  const amount = Number(get("AM")?.replace(",", ".") ?? 0);
  if (!acc || Number.isNaN(amount)) {
    return null;
  }
  const [iban, bic] = acc.split("+").map(unescapeSpayd);
  return {
    currency: get("CC")?.toUpperCase() ?? "CZK",
    warnings: [],
    payment: {
      format: "spayd",
      iban,
      bic,
      amount,
      variableSymbol: get("X-VS"),
      specificSymbol: get("X-SS"),
      constantSymbol: get("X-KS"),
      recipientName: get("RN"),
      paymentNote: get("MSG"),
      paymentDueDate: toIsoDate(get("DT")),
      spaydReference: get("RF"),
      instantPayment: get("PT")?.toUpperCase() === "IP" || undefined,
    },
  };
}

/** EPC QR: 12 fixed lines starting with `BCD`, trailing empty lines may be cut. */
function decodeEpc(text: string): Decoded | null {
  const lines = text.split(LINE_BREAK_RE).map((line) => line.trim());
  const [, , , , bic, name, iban, amountLine, purpose, reference, remittance] =
    lines;
  const amountMatch = amountLine?.match(EPC_AMOUNT_RE);
  if (!iban || (amountLine && !amountMatch)) {
    return null;
  }
  return {
    currency: amountMatch?.[1] ?? "EUR",
    // The form has one free-text reference field and the encoder writes it
    // unstructured, so a creditor reference (RF...) loses its type.
    warnings: reference ? ["structuredReference"] : [],
    payment: {
      format: "epc",
      iban,
      bic: bic || undefined,
      amount: amountMatch ? Number(amountMatch[2]) : 0,
      recipientName: name || undefined,
      paymentNote: remittance || reference || undefined,
      purposeCode: purpose || undefined,
    },
  };
}

function decodeByFormat(text: string): Decoded | null {
  if (SPAYD_PREFIX_RE.test(text)) {
    return decodeSpayd(text);
  }
  if (LINE_BREAK_RE.test(text) && text.startsWith("BCD")) {
    return decodeEpc(text);
  }
  try {
    return decodeBysquare(text);
  } catch {
    // Untrusted input: not base32hex, a bad checksum or no LZMA body all mean
    // it is not a PAY by square code. bysquare does not export its error types.
    return null;
  }
}

/**
 * Turns the text inside a payment QR code (PAY by square, SPAYD or EPC) back
 * into payment form data. Runs in the browser only: the payment never reaches
 * the server.
 */
export function decodePayload(raw: string): DecodeResult {
  const decoded = decodeByFormat(raw.trim());
  if (!decoded) {
    return { ok: false };
  }
  const warnings = [...decoded.warnings];
  const electronic = electronicFormatIBAN(decoded.payment.iban);
  if (!(electronic && isValidIBAN(electronic))) {
    warnings.unshift("invalidIban");
  }
  // The form only knows EUR and CZK.
  let currency: Currency = "EUR";
  if (isFormCurrency(decoded.currency)) {
    currency = decoded.currency;
  } else {
    warnings.push("unsupportedCurrency");
  }
  // The form resets from this object, and an explicit undefined would replace
  // its "" defaults.
  const payment = Object.fromEntries(
    Object.entries({ ...decoded.payment, currency }).filter(
      ([, value]) => value !== undefined
    )
  ) as PaymentFormData;
  return { ok: true, payment, warnings };
}
