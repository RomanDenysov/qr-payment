import type { PaymentFormat } from "@/features/payment/format";

const BYSQUARE_SAMPLE = `iban,amount,variableSymbol,specificSymbol,constantSymbol,recipientName,paymentNote
SK31 1200 0000 1987 4263 7541,25.50,1234567890,,,Ján Novák,Platba za faktúru
SK89 7500 0000 0000 1234 5671,100.00,9876543210,1234,0308,Eva Horváthová,Nájomné január`;

const EPC_SAMPLE = `iban,amount,recipientName,bic,paymentNote
SK31 1200 0000 1987 4263 7541,25.50,Ján Novák,TATRSKBX,Platba za faktúru
SK89 7500 0000 0000 1234 5671,100.00,Eva Horváthová,,Nájomné január`;

export function downloadSampleCsv(format: PaymentFormat): void {
  const content = format === "epc" ? EPC_SAMPLE : BYSQUARE_SAMPLE;
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `vzor-${format}.csv`;
  a.click();

  URL.revokeObjectURL(url);
}
