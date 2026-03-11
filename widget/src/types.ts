export type PaymentFormat = "paybysquare" | "spayd" | "epc";

export interface WidgetConfig {
  format: PaymentFormat;
  iban: string;
  amount?: number;
  currency?: string;
  recipient?: string;
  message?: string;
  variableSymbol?: string;
  constantSymbol?: string;
  specificSymbol?: string;
  bic?: string;
  reference?: string;

  // Display options
  size?: number;
  theme?: "light" | "dark";
  color?: string;
  bgColor?: string;
  lang?: "sk" | "cs" | "en";
  showDownload?: boolean;
  showAmountInput?: boolean;
  showMessageInput?: boolean;
  branding?: boolean;
  errorCorrection?: "L" | "M" | "Q" | "H";
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface EncoderResult {
  payload: string;
  errorCorrectionLevel: "L" | "M" | "Q" | "H";
}

export interface QRPlatbyAPI {
  create(config: WidgetConfig & { element: HTMLElement | string }): QRWidget;
  version: string;
}

export interface QRWidget {
  update(data: Partial<WidgetConfig>): void;
  destroy(): void;
  toDataURL(): string;
  toSVG(): string;
}
