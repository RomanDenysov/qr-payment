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

type CornerStyle = "square" | "rounded" | "dots";

type BrandingOptions = {
  colors?: { foreground: string; background: string };
  logo?: { data: string; size: number };
  cornerStyle?: CornerStyle;
  frame?: { text: string; position: "top" | "bottom" };
};

type FrameOptions = {
  sourceCanvas: HTMLCanvasElement;
  text: string;
  position: "top" | "bottom";
  bgColor: string;
  fgColor: string;
};

type CornerStyleOptions = {
  ctx: CanvasRenderingContext2D;
  size: number;
  style: CornerStyle;
  fgColor: string;
  bgColor: string;
};

const QR_SIZE = 400;
const FRAME_PADDING = 16;
const FRAME_HEIGHT = 32;
const CENTER_TEXT = "Naskenujte\nbankovou\naplikáciou";
const FONT_STACK =
  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';

/** Draws centered text overlay on QR code canvas */
function drawCenterText(
  ctx: CanvasRenderingContext2D,
  size: number,
  bgColor: string,
  fgColor: string
): void {
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
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], centerX, startY + i * lineHeight);
  }
}

/** Draws logo in center of QR code */
function drawLogo(
  ctx: CanvasRenderingContext2D,
  size: number,
  logoData: string,
  logoSizePercent: number
): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const logoSize = size * (logoSizePercent / 100);
      const x = (size - logoSize) / 2;
      const y = (size - logoSize) / 2;

      // White background behind logo
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(x - 4, y - 4, logoSize + 8, logoSize + 8, 6);
      ctx.fill();

      ctx.drawImage(img, x, y, logoSize, logoSize);
      resolve();
    };
    img.onerror = () => resolve(); // Skip logo on error
    img.src = logoData;
  });
}

/** Draws frame with text around QR code */
function drawFrame(options: FrameOptions): HTMLCanvasElement {
  const { sourceCanvas, text, position, bgColor, fgColor } = options;
  const frameCanvas = document.createElement("canvas");
  const totalHeight = sourceCanvas.height + FRAME_HEIGHT + FRAME_PADDING;
  frameCanvas.width = sourceCanvas.width;
  frameCanvas.height = totalHeight;

  const ctx = frameCanvas.getContext("2d");
  if (!ctx) {
    return sourceCanvas;
  }

  // Fill background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, frameCanvas.width, frameCanvas.height);

  // Draw QR code
  const qrY =
    position === "top" ? FRAME_HEIGHT + FRAME_PADDING / 2 : FRAME_PADDING / 2;
  ctx.drawImage(sourceCanvas, 0, qrY);

  // Draw text
  ctx.fillStyle = fgColor;
  ctx.font = `600 14px ${FONT_STACK}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const textY =
    position === "top" ? FRAME_HEIGHT / 2 : totalHeight - FRAME_HEIGHT / 2;
  ctx.fillText(text, frameCanvas.width / 2, textY);

  return frameCanvas;
}

/** Redraws corner eyes with custom style */
function drawCornerStyle(options: CornerStyleOptions): void {
  const { ctx, size, style, fgColor, bgColor } = options;

  if (style === "square") {
    return; // Default, no changes needed
  }

  const moduleSize = size / 25; // Approximate module size for version 3 QR
  const eyeSize = moduleSize * 7;
  const innerSize = moduleSize * 3;
  const margin = moduleSize * 2;

  const corners = [
    { x: margin, y: margin }, // Top-left
    { x: size - margin - eyeSize, y: margin }, // Top-right
    { x: margin, y: size - margin - eyeSize }, // Bottom-left
  ];

  for (const corner of corners) {
    // Clear existing eye
    ctx.fillStyle = bgColor;
    ctx.fillRect(corner.x, corner.y, eyeSize, eyeSize);

    // Draw new eye based on style
    ctx.fillStyle = fgColor;

    if (style === "rounded") {
      // Outer rounded square
      ctx.beginPath();
      ctx.roundRect(corner.x, corner.y, eyeSize, eyeSize, moduleSize);
      ctx.fill();

      // Inner white
      ctx.fillStyle = bgColor;
      ctx.beginPath();
      ctx.roundRect(
        corner.x + moduleSize * 1.5,
        corner.y + moduleSize * 1.5,
        eyeSize - moduleSize * 3,
        eyeSize - moduleSize * 3,
        moduleSize * 0.5
      );
      ctx.fill();

      // Inner dot
      ctx.fillStyle = fgColor;
      ctx.beginPath();
      ctx.roundRect(
        corner.x + moduleSize * 2,
        corner.y + moduleSize * 2,
        innerSize,
        innerSize,
        moduleSize * 0.25
      );
      ctx.fill();
    } else if (style === "dots") {
      // Outer circle
      const centerX = corner.x + eyeSize / 2;
      const centerY = corner.y + eyeSize / 2;

      ctx.beginPath();
      ctx.arc(centerX, centerY, eyeSize / 2, 0, Math.PI * 2);
      ctx.fill();

      // Inner white ring
      ctx.fillStyle = bgColor;
      ctx.beginPath();
      ctx.arc(centerX, centerY, eyeSize / 2 - moduleSize * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Inner dot
      ctx.fillStyle = fgColor;
      ctx.beginPath();
      ctx.arc(centerX, centerY, innerSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export async function generatePaymentQR(
  data: PaymentFormData,
  branding?: BrandingOptions
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

  const fgColor = branding?.colors?.foreground ?? "#000000";
  const bgColor = branding?.colors?.background ?? "#ffffff";

  // High error correction allows center overlay (~30% coverage)
  const canvas = document.createElement("canvas");
  await QRCode.toCanvas(canvas, encode({ payments: [payment] }), {
    width: QR_SIZE,
    margin: 2,
    errorCorrectionLevel: "H",
    color: {
      dark: fgColor,
      light: bgColor,
    },
  });

  const ctx = canvas.getContext("2d");
  if (ctx) {
    // Apply corner style
    if (branding?.cornerStyle) {
      drawCornerStyle({
        ctx,
        size: QR_SIZE,
        style: branding.cornerStyle,
        fgColor,
        bgColor,
      });
    }

    // Draw logo or default text overlay
    if (branding?.logo) {
      await drawLogo(ctx, QR_SIZE, branding.logo.data, branding.logo.size);
    } else {
      drawCenterText(ctx, QR_SIZE, bgColor, fgColor);
    }
  }

  // Apply frame if specified
  let finalCanvas = canvas;
  if (branding?.frame?.text) {
    finalCanvas = drawFrame({
      sourceCanvas: canvas,
      text: branding.frame.text,
      position: branding.frame.position,
      bgColor,
      fgColor,
    });
  }

  return finalCanvas.toDataURL("image/png");
}
