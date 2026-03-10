import type { PaymentFormat } from "@/features/payment/format";

const BYSQUARE_SAMPLE = `iban,amount,variableSymbol,specificSymbol,constantSymbol,recipientName,paymentNote
SK31 1200 0000 1987 4263 7541,25.50,1234567890,,,Ján Novák,Platba za faktúru
SK89 7500 0000 0000 1234 5671,100.00,9876543210,1234,0308,Eva Horváthová,Nájomné január`;

const EPC_SAMPLE = `iban,amount,recipientName,bic,paymentNote
SK31 1200 0000 1987 4263 7541,25.50,Ján Novák,TATRSKBX,Platba za faktúru
SK89 7500 0000 0000 1234 5671,100.00,Eva Horváthová,,Nájomné január`;

const SPAYD_SAMPLE = `iban,amount,currency,variableSymbol,specificSymbol,constantSymbol,recipientName,paymentNote
CZ65 0800 0000 1920 0014 5399,480.50,CZK,1234567890,,,Jan Novak,Platba za fakturu
CZ55 0800 0000 0012 3456 7899,1500.00,CZK,9876543210,1234,0308,Eva Svobodova,Najemne unor`;

export function downloadSampleCsv(format: PaymentFormat): void {
  let content: string;
  if (format === "epc") {
    content = EPC_SAMPLE;
  } else if (format === "spayd") {
    content = SPAYD_SAMPLE;
  } else {
    content = BYSQUARE_SAMPLE;
  }
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `vzor-${format}.csv`;
  a.click();

  URL.revokeObjectURL(url);
}
