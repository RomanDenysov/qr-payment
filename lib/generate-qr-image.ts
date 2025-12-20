import { CurrencyCode, encode, PaymentOptions } from "bysquare";
import { electronicFormatIBAN, isValidIBAN } from "ibantools";
import QRCode from "qrcode";

export type PaymentData = {
  iban: string;
  amount: number;
  variableSymbol?: string;
  specificSymbol?: string;
  constantSymbol?: string;
  recipientName?: string;
  paymentNote?: string;
};

export class InvalidIBANError extends Error {
  constructor(iban: string) {
    super(`Neplatný IBAN: ${iban}`);
    this.name = "InvalidIBANError";
  }
}

export async function generatePaymentQR(data: PaymentData): Promise<string> {
  const cleanIban = electronicFormatIBAN(data.iban);
  if (!(cleanIban && isValidIBAN(cleanIban))) {
    throw new InvalidIBANError(data.iban);
  }

  const paymentPayload: Parameters<typeof encode>[0]["payments"][0] = {
    type: PaymentOptions.PaymentOrder,
    amount: data.amount,
    variableSymbol: data.variableSymbol || "",
    currencyCode: CurrencyCode.EUR,
    bankAccounts: [{ iban: cleanIban }],
  };

  if (data.specificSymbol) {
    paymentPayload.specificSymbol = data.specificSymbol;
  }
  if (data.constantSymbol) {
    paymentPayload.constantSymbol = data.constantSymbol;
  }
  if (data.paymentNote) {
    paymentPayload.paymentNote = data.paymentNote;
  }
  // Note: recipientName is stored in PaymentData for history/display but
  // is not supported by bysquare PaymentOrder encoding

  const bysquareString = encode({
    payments: [paymentPayload],
  });

  const qrDataUrl = await QRCode.toDataURL(bysquareString, {
    width: 400,
    margin: 2,
    errorCorrectionLevel: "M",
  });

  return qrDataUrl;
}
