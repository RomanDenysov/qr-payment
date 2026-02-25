import { electronicFormatIBAN, isValidIBAN } from "ibantools";
import QRCode from "qrcode";
import { buildQrPayload } from "./qr-payload";
import type { PaymentFormData } from "./schema";

export class InvalidIBANError extends Error {
  constructor(iban: string) {
    super(`Neplatný IBAN: ${iban}`);
    this.name = "InvalidIBANError";
  }
}

export interface QRBranding {
  fgColor: string;
  bgColor: string;
  centerText: string;
  logo: string | null;
}

const QR_SIZE = 400;
const MAX_LOGO_RATIO = 0.15;
const FONT_STACK =
  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';

function drawCenterText(
  ctx: CanvasRenderingContext2D,
  size: number,
  bgColor: string,
  fgColor: string,
  text: string
): void {
  const lines = text.split("\n");
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

  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.roundRect(
    centerX - boxWidth / 2,
    centerY - boxHeight / 2,
    boxWidth,
    boxHeight,
    6
  );
  ctx.fill();

  ctx.fillStyle = fgColor;
  const startY = centerY - (totalTextHeight - lineHeight) / 2;
  for (const [i, line] of lines.entries()) {
    ctx.fillText(line, centerX, startY + i * lineHeight);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timer = setTimeout(() => {
      reject(new Error("Logo loading timed out"));
    }, 5000);
    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timer);
      reject(new Error("Failed to load logo"));
    };
    img.src = src;
  });
}

async function drawLogo(
  ctx: CanvasRenderingContext2D,
  size: number,
  logoData: string,
  bgColor: string
): Promise<void> {
  const maxArea = size * size * MAX_LOGO_RATIO;
  const logoSize = Math.floor(Math.sqrt(maxArea));

  const isSvg = logoData.startsWith("<");
  const src = isSvg
    ? `data:image/svg+xml;utf8,${encodeURIComponent(logoData)}`
    : logoData;

  const img = await loadImage(src);

  const x = (size - logoSize) / 2;
  const y = (size - logoSize) / 2;
  const pad = 4;

  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.roundRect(x - pad, y - pad, logoSize + pad * 2, logoSize + pad * 2, 6);
  ctx.fill();

  ctx.drawImage(img, x, y, logoSize, logoSize);
}

export async function generatePaymentQR(
  data: PaymentFormData,
  branding?: QRBranding
): Promise<string> {
  const cleanIban = electronicFormatIBAN(data.iban);
  if (!(cleanIban && isValidIBAN(cleanIban))) {
    throw new InvalidIBANError(data.iban);
  }

  const fgColor = branding?.fgColor ?? "#000000";
  const bgColor = branding?.bgColor ?? "#ffffff";
  const centerText = branding?.centerText ?? "Naskenujte\nbankovou\naplikáciou";

  const { payload, errorCorrectionLevel } = buildQrPayload(data, cleanIban);

  const canvas = document.createElement("canvas");
  await QRCode.toCanvas(canvas, payload, {
    width: QR_SIZE,
    margin: 2,
    errorCorrectionLevel,
    color: { dark: fgColor, light: bgColor },
  });

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Nepodarilo sa vytvoriť canvas kontext");
  }

  if (branding?.logo) {
    await drawLogo(ctx, QR_SIZE, branding.logo, bgColor);
  } else {
    drawCenterText(ctx, QR_SIZE, bgColor, fgColor, centerText);
  }

  return canvas.toDataURL("image/png");
}
