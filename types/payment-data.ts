export type PaymentData = {
  id: string;
  createdAt: string;
  iban: string;
  amount: number;
  variableSymbol?: string;
  specificSymbol?: string;
  constantSymbol?: string;
  recipientName?: string;
  paymentNote?: string;
  qrDataUrl?: string;
};
