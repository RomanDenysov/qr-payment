export type PaymentFormat = "bysquare" | "epc" | "spayd";

/**
 * Window event that asks the payment form to switch format. Lets content
 * outside the form (homepage format tiles) drive it without shared state.
 */
export const SELECT_FORMAT_EVENT = "qr:select-format";

export const FORMAT_LABELS: Record<PaymentFormat, string> = {
  bysquare: "PAY bySquare",
  epc: "EPC",
  spayd: "QR SPAYD",
};
