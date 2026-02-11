export type PaymentFormat = "bysquare" | "epc";

export const FORMAT_LABELS: Record<PaymentFormat, string> = {
  bysquare: "PAY by square",
  epc: "EPC QR",
};
