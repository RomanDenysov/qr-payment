import { CurrencyCode, encode, PaymentOptions } from "bysquare";
import { encodeEpcQr } from "./epc-encoder";

interface QrPayloadInput {
  format?: "bysquare" | "epc";
  iban: string;
  amount?: number;
  variableSymbol?: string;
  specificSymbol?: string;
  constantSymbol?: string;
  recipientName?: string;
  paymentNote?: string;
  bic?: string;
}

export function buildQrPayload(
  data: QrPayloadInput,
  cleanIban: string,
  currencyCode: CurrencyCode = CurrencyCode.EUR
): { payload: string; errorCorrectionLevel: "H" | "M" } {
  const format = data.format ?? "bysquare";

  if (format === "epc") {
    return {
      payload: encodeEpcQr({
        iban: cleanIban,
        amount: data.amount ?? 0,
        beneficiaryName: data.recipientName ?? "",
        bic: data.bic || undefined,
        remittanceText: data.paymentNote || undefined,
      }),
      errorCorrectionLevel: "M",
    };
  }

  const payment: Parameters<typeof encode>[0]["payments"][0] = {
    type: PaymentOptions.PaymentOrder,
    amount: data.amount ?? 0,
    currencyCode,
    bankAccounts: [{ iban: cleanIban }],
    ...(data.variableSymbol && { variableSymbol: data.variableSymbol }),
    ...(data.specificSymbol && { specificSymbol: data.specificSymbol }),
    ...(data.constantSymbol && { constantSymbol: data.constantSymbol }),
    ...(data.paymentNote && { paymentNote: data.paymentNote }),
    ...(data.recipientName && {
      beneficiary: { name: data.recipientName },
    }),
  };

  return {
    payload: encode({ payments: [payment] }),
    errorCorrectionLevel: "H",
  };
}
