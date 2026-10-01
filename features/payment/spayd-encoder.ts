import { createShortPaymentDescriptor } from "@spayd/core";
import { electronicFormatIBAN } from "ibantools";

export class SpaydPayloadTooLargeError extends Error {
  constructor(byteLength: number) {
    super(`SPAYD payload too large: ${byteLength} bytes`);
    this.name = "SpaydPayloadTooLargeError";
  }
}

interface SpaydInput {
  iban: string;
  amount?: number;
  currency?: string;
  variableSymbol?: string;
  specificSymbol?: string;
  constantSymbol?: string;
  recipientName?: string;
  paymentNote?: string;
  bic?: string;
  dueDate?: string;
  reference?: string;
  /** Requests an instant payment (SPAYD `PT:IP`) where the bank supports it. */
  instantPayment?: boolean;
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Parses an ISO `YYYY-MM-DD` string into a local-midnight Date. Using
 * `new Date(iso)` would parse as UTC and shift the day in negative timezones
 * when @spayd/core reads the local Y/M/D for the `dt` field.
 */
function parseLocalDate(iso: string): Date | undefined {
  if (!ISO_DATE_RE.test(iso)) {
    return;
  }
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Czech payment symbols go into SPAYD's extended `X-` attributes. */
function buildSymbols(input: SpaydInput) {
  if (!(input.variableSymbol || input.specificSymbol || input.constantSymbol)) {
    return;
  }
  return {
    ...(input.variableSymbol && { vs: input.variableSymbol }),
    ...(input.specificSymbol && { ss: input.specificSymbol }),
    ...(input.constantSymbol && { ks: input.constantSymbol }),
  };
}

export function encodeSpaydQr(input: SpaydInput): string {
  const iban = electronicFormatIBAN(input.iban) ?? input.iban;
  const acc = input.bic ? `${iban}+${input.bic}` : iban;
  const dueDate = input.dueDate ? parseLocalDate(input.dueDate) : undefined;
  const symbols = buildSymbols(input);

  const payload = createShortPaymentDescriptor({
    acc,
    ...(input.amount != null && { am: input.amount.toFixed(2) }),
    cc: input.currency ?? "CZK",
    ...(input.recipientName && { rn: input.recipientName.slice(0, 35) }),
    ...(input.paymentNote && { msg: input.paymentNote.slice(0, 60) }),
    ...(dueDate && { dt: dueDate }),
    ...(input.reference && { rf: input.reference.slice(0, 16) }),
    ...(input.instantPayment && { pt: "IP" }),
    ...(symbols && { x: symbols }),
  });

  const byteLength = new TextEncoder().encode(payload).length;
  if (byteLength > 360) {
    throw new SpaydPayloadTooLargeError(byteLength);
  }

  return payload;
}
