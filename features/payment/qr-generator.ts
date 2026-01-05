import { CurrencyCode, encode, PaymentOptions } from "bysquare";
import { electronicFormatIBAN, isValidIBAN } from "ibantools";
import QRCode from "qrcode";
import type { PaymentFormData } from "./schema";

export class InvalidIBANError extends Error {
  constructor(iban: string) {
    super(`Neplatný IBAN: ${iban}`);
    this.name = "InvalidIBANError";
  }
}

const QR_SIZE = 400;
const CENTER_TEXT = "Naskenujte\nbankovou\naplikáciou";
const FONT_STACK =
  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';

/** Draws centered text overlay on QR code canvas */
function drawCenterText(ctx: CanvasRenderingContext2D, size: number): void {
  const lines = CENTER_TEXT.split("\n");
  const fontSize = Math.round(size * 0.038);
  const lineHeight = fontSize * 1.15;
  const padding = fontSize * 0.4;
  const totalTextHeight = lines.length * lineHeight;

  ctx.font = `600 ${fontSize}px ${FONT_STACK}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const maxWidth = Math.max(
    ...lines.map((line) => ctx.measureText(line).width)
  );
  const boxWidth = maxWidth + padding * 2;
  const boxHeight = totalTextHeight + padding * 1.2;

  const centerX = size / 2;
  const centerY = size / 2;

  // White background with rounded corners
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(
    centerX - boxWidth / 2,
    centerY - boxHeight / 2,
    boxWidth,
    boxHeight,
    6
  );
  ctx.fill();

  // Text lines
  ctx.fillStyle = "#000000";
  const startY = centerY - (totalTextHeight - lineHeight) / 2;
  lines.forEach((line, i) => {
    ctx.fillText(line, centerX, startY + i * lineHeight);
  });
}

export async function generatePaymentQR(
  data: PaymentFormData
): Promise<string> {
  const cleanIban = electronicFormatIBAN(data.iban);
  if (!(cleanIban && isValidIBAN(cleanIban))) {
    throw new InvalidIBANError(data.iban);
  }

  const payment: Parameters<typeof encode>[0]["payments"][0] = {
    type: PaymentOptions.PaymentOrder,
    amount: data.amount,
    currencyCode: CurrencyCode.EUR,
    bankAccounts: [{ iban: cleanIban }],
    ...(data.variableSymbol && { variableSymbol: data.variableSymbol }),
    ...(data.specificSymbol && { specificSymbol: data.specificSymbol }),
    ...(data.constantSymbol && { constantSymbol: data.constantSymbol }),
    ...(data.paymentNote && { paymentNote: data.paymentNote }),
  };

  // High error correction allows center overlay (~30% coverage)
  const canvas = document.createElement("canvas");
  await QRCode.toCanvas(canvas, encode({ payments: [payment] }), {
    width: QR_SIZE,
    margin: 2,
    errorCorrectionLevel: "H",
  });

  const ctx = canvas.getContext("2d");
  if (ctx) {
    drawCenterText(ctx, QR_SIZE);
  }

  return canvas.toDataURL("image/png");
}
