export type PaymentFormat = "bysquare" | "epc" | "spayd";

export const FORMAT_LABELS: Record<PaymentFormat, string> = {
  bysquare: "PAY by square",
  epc: "EPC QR",
  spayd: "QR Platba",
};

