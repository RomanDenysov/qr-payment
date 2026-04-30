import type { CurrencyCode } from "bysquare";
import { electronicFormatIBAN, isValidIBAN } from "ibantools";
import QRCode from "qrcode";
import { buildColorOption } from "./qr-color";
import { InvalidIBANError } from "./qr-generator";
import { buildQrPayload } from "./qr-payload";

interface ServerQrInput {
  format?: "bysquare" | "epc" | "spayd";
  iban: string;
  amount?: number;
  currency?: CurrencyCode;
  variableSymbol?: string;
  specificSymbol?: string;
  constantSymbol?: string;
  recipientName?: string;
  paymentNote?: string;
}

interface ServerQrOptions {
  format?: "png" | "svg";
  size?: number;
  darkColor?: string;
  lightColor?: string;
  margin?: number;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
}

export async function generatePaymentQRServer(
  data: ServerQrInput,
  opts: ServerQrOptions = {}
): Promise<string> {
  const cleanIban = electronicFormatIBAN(data.iban);
  if (!(cleanIban && isValidIBAN(cleanIban))) {
    throw new InvalidIBANError(data.iban);
  }

  const format = opts.format ?? "png";
  const size = opts.size ?? 300;
  const margin = opts.margin ?? 2;

  const { payload, errorCorrectionLevel: derivedEcc } = buildQrPayload(
    data,
    cleanIban,
    data.currency
  );
  const errorCorrectionLevel = opts.errorCorrectionLevel ?? derivedEcc;
  const color = buildColorOption(opts.darkColor, opts.lightColor);

  if (format === "svg") {
    return await QRCode.toString(payload, {
      type: "svg",
      width: size,
      margin,
      errorCorrectionLevel,
      ...(color && { color }),
    });
  }

  return await QRCode.toDataURL(payload, {
    width: size,
    margin,
    errorCorrectionLevel,
    ...(color && { color }),
  });
}
