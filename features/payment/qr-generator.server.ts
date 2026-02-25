import type { CurrencyCode } from "bysquare";
import { electronicFormatIBAN, isValidIBAN } from "ibantools";
import QRCode from "qrcode";
import { InvalidIBANError } from "./qr-generator";
import { buildQrPayload } from "./qr-payload";

interface ServerQrInput {
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

  const { payload, errorCorrectionLevel } = buildQrPayload(
    data,
    cleanIban,
    data.currency
  );

  if (format === "svg") {
    return await QRCode.toString(payload, {
      type: "svg",
      width: size,
      margin: 2,
      errorCorrectionLevel,
    });
  }

  return await QRCode.toDataURL(payload, {
    width: size,
    margin: 2,
    errorCorrectionLevel,
  });
}
