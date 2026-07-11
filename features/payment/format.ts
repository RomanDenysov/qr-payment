export type PaymentFormat = "bysquare" | "epc" | "spayd";

export const FORMAT_LABELS: Record<PaymentFormat, string> = {
  bysquare: "PAY bySquare",
  epc: "EPC",
  spayd: "QR SPAYD",
};

export const FORMAT_OPTIONS: { value: PaymentFormat; label: string }[] = (
  ["bysquare", "epc", "spayd"] as const
).map((f) => ({
  value: f,
  label: FORMAT_LABELS[f],
}));

/**
 * Soft format hint for an IBAN/format mismatch (never auto-switches).
 * Only the two clear cases are hinted: SK IBAN + spayd and CZ IBAN +
 * bysquare. EPC is a legitimate cross-border choice for both countries,
 * so it is never hinted against.
 */
export function suggestFormatForIban(
  iban: string,
  format: PaymentFormat
): PaymentFormat | null {
  const country = iban.trim().slice(0, 2).toUpperCase();
  if (country === "SK" && format === "spayd") {
    return "bysquare";
  }
  if (country === "CZ" && format === "bysquare") {
    return "spayd";
  }
  return null;
}
