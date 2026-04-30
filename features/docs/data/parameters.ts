export interface Parameter {
  name: string;
  type: string;
  required: boolean;
  default?: string;
  validation: string;
  description: string;
}

export const parameters: Parameter[] = [
  {
    name: "iban",
    type: "string",
    required: true,
    validation: "Valid IBAN format",
    description: "Recipient IBAN (e.g. SK3112000000198742637541)",
  },
  {
    name: "amount",
    type: "number",
    required: false,
    validation: "0.01 - 999,999,999.99",
    description: "Payment amount",
  },
  {
    name: "currency",
    type: "string",
    required: false,
    default: "EUR",
    validation: "EUR | CZK",
    description: "Payment currency",
  },
  {
    name: "variableSymbol",
    type: "string",
    required: false,
    validation: "Up to 10 digits",
    description: "Variable symbol (digits only)",
  },
  {
    name: "specificSymbol",
    type: "string",
    required: false,
    validation: "Up to 10 digits",
    description: "Specific symbol (digits only)",
  },
  {
    name: "constantSymbol",
    type: "string",
    required: false,
    validation: "Up to 4 digits",
    description: "Constant symbol (digits only)",
  },
  {
    name: "recipientName",
    type: "string",
    required: false,
    validation: "Up to 70 characters",
    description: "Recipient name",
  },
  {
    name: "paymentNote",
    type: "string",
    required: false,
    validation: "Up to 140 characters",
    description: "Payment note / message",
  },
  {
    name: "paymentFormat",
    type: "string",
    required: false,
    default: "bysquare",
    validation: "bysquare | spayd | epc",
    description:
      "QR standard. bysquare for Slovak banks (PAY by square), spayd for Czech banks (QR Platba), epc for EU SEPA (requires recipientName, EUR only)",
  },
  {
    name: "format",
    type: "string",
    required: false,
    default: "png",
    validation: "png | svg",
    description:
      "Output format. png returns base64 data URI, svg returns SVG markup",
  },
  {
    name: "size",
    type: "integer",
    required: false,
    default: "300",
    validation: "100 - 1000",
    description: "QR code size in pixels (applies to png and svg)",
  },
  {
    name: "darkColor",
    type: "string",
    required: false,
    default: "#000000",
    validation: "#RRGGBB or #RRGGBBAA",
    description: "Foreground (module) color as hex",
  },
  {
    name: "lightColor",
    type: "string",
    required: false,
    default: "#ffffff",
    validation: "#RRGGBB or #RRGGBBAA",
    description:
      "Background color as hex. Use #FFFFFF00 for a transparent background",
  },
  {
    name: "margin",
    type: "integer",
    required: false,
    default: "2",
    validation: "0 - 10",
    description:
      "Quiet zone width in QR modules. Lowering may hurt scanner reliability",
  },
  {
    name: "errorCorrectionLevel",
    type: "string",
    required: false,
    validation: "L | M | Q | H",
    description:
      "Override auto-derived recovery level (L=7%, M=15%, Q=25%, H=30%)",
  },
];
