export type PaymentFormat = "bysquare" | "epc" | "spayd";

export const FORMAT_LABELS: Record<PaymentFormat, string> = {
  bysquare: "PAY bySquare",
  epc: "EPC",
  spayd: "QR SPAYD",
};
