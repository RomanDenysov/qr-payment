export type PaymentFormat = "bysquare" | "epc" | "spayd";

export const FORMAT_LABELS: Record<PaymentFormat, string> = {
  bysquare: "PAY by square",
  epc: "EPC QR",
  spayd: "QR Platba",
};

export const FORMAT_HINTS: Record<PaymentFormat, string> = {
  bysquare: "SK",
  epc: "EU",
  spayd: "CZ",
};
