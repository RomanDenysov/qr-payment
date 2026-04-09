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
}

export function encodeSpaydQr(input: SpaydInput): string {
  const iban = electronicFormatIBAN(input.iban) ?? input.iban;
  const acc = input.bic ? `${iban}+${input.bic}` : iban;

  const payload = createShortPaymentDescriptor({
    acc,
    ...(input.amount != null && { am: input.amount.toFixed(2) }),
    cc: input.currency ?? "CZK",
    ...(input.recipientName && { rn: input.recipientName.slice(0, 35) }),
    ...(input.paymentNote && { msg: input.paymentNote.slice(0, 60) }),
    ...((input.variableSymbol ||
      input.specificSymbol ||
      input.constantSymbol) && {
      x: {
        ...(input.variableSymbol && { vs: input.variableSymbol }),
        ...(input.specificSymbol && { ss: input.specificSymbol }),
        ...(input.constantSymbol && { ks: input.constantSymbol }),
      },
    }),
  });

  const byteLength = new TextEncoder().encode(payload).length;
  if (byteLength > 360) {
    throw new SpaydPayloadTooLargeError(byteLength);
  }

  return payload;
}
