import { Version } from "bysquare";
import { CurrencyCode, encode, PaymentOptions } from "bysquare/pay";
import { encodeEpcQr } from "./epc-encoder";
import type { PaymentFormat } from "./format";
import { encodeSpaydQr } from "./spayd-encoder";

interface QrPayloadInput {
  format?: PaymentFormat;
  iban: string;
  amount?: number;
  variableSymbol?: string;
  specificSymbol?: string;
  constantSymbol?: string;
  recipientName?: string;
  paymentNote?: string;
  bic?: string;
  paymentDueDate?: string;
  invoiceId?: string;
  spaydReference?: string;
  purposeCode?: string;
  instantPayment?: boolean;
}

function encodeBysquare(
  data: QrPayloadInput,
  cleanIban: string,
  currencyCode: CurrencyCode
): string {
  const payment: Parameters<typeof encode>[0]["payments"][0] = {
    type: PaymentOptions.PaymentOrder,
    ...(data.amount && { amount: data.amount }),
    currencyCode,
    bankAccounts: [{ iban: cleanIban, ...(data.bic && { bic: data.bic }) }],
    ...(data.variableSymbol && { variableSymbol: data.variableSymbol }),
    ...(data.specificSymbol && { specificSymbol: data.specificSymbol }),
    ...(data.constantSymbol && { constantSymbol: data.constantSymbol }),
    // bysquare expects YYYYMMDD; the form and API use YYYY-MM-DD.
    ...(data.paymentDueDate && {
      paymentDueDate: data.paymentDueDate.replaceAll("-", ""),
    }),
    ...(data.paymentNote && { paymentNote: data.paymentNote }),
    // An empty name encodes the same as no beneficiary at all.
    beneficiary: { name: data.recipientName ?? "" },
  };

  // Spec 1.0.0 on purpose: 1.1.0+ is not read by every banking app (bysquare
  // itself named Tatra banka), and 1.2.0 makes the beneficiary name mandatory.
  return encode(
    {
      ...(data.invoiceId && { invoiceId: data.invoiceId }),
      payments: [payment],
    },
    { deburr: true, validate: true, version: Version["1.0.0"] }
  );
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
        amount: data.amount ?? undefined,
        beneficiaryName: data.recipientName ?? "",
        bic: data.bic ?? undefined,
        remittanceText: data.paymentNote ?? undefined,
        purposeCode: data.purposeCode || undefined,
      }),
      errorCorrectionLevel: "M",
    };
  }

  if (format === "spayd") {
    const currency = currencyCode === CurrencyCode.CZK ? "CZK" : "EUR";
    return {
      payload: encodeSpaydQr({
        iban: cleanIban,
        amount: data.amount ?? undefined,
        currency,
        variableSymbol: data.variableSymbol || undefined,
        specificSymbol: data.specificSymbol || undefined,
        constantSymbol: data.constantSymbol || undefined,
        recipientName: data.recipientName || undefined,
        paymentNote: data.paymentNote || undefined,
        bic: data.bic ?? undefined,
        dueDate: data.paymentDueDate || undefined,
        reference: data.spaydReference || undefined,
        instantPayment: data.instantPayment,
      }),
      errorCorrectionLevel: "M",
    };
  }

  return {
    payload: encodeBysquare(data, cleanIban, currencyCode),
    errorCorrectionLevel: "H",
  };
}
