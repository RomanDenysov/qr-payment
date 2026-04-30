import { CurrencyCode } from "bysquare";
import { electronicFormatIBAN, isValidIBAN } from "ibantools";
import { InvalidIBANError } from "@/features/payment/qr-generator";
import { buildQrPayload } from "@/features/payment/qr-payload";
import {
  FONT_SIZE_MAP,
  FONT_STACKS,
  getEyeStyles,
  getLogoSrc,
  loadImage,
  measureTextOverlayBounds,
} from "@/features/payment/qr-shared";
import type { PaymentFormData } from "@/features/payment/schema";
import { resolveErrorCorrectionLevel } from "./ecc";
import {
  type CenterTextFont,
  type CenterTextSize,
  type CustomizerConfig,
  type Fill,
  type FrameConfig,
  fillPrimaryColor,
  type OverlayPosition,
} from "./types";

export const QR_SIZE = 480;
const FRAME_SIDE_PADDING = 24;
const FRAME_TEXT_GAP = 14;
const MAX_OUTPUT_WIDTH = 1024;

function toGradient(fill: Fill) {
  if (fill.kind === "solid") {
    return;
  }
  return {
    type: fill.kind,
    rotation: (fill.rotation * Math.PI) / 180,
    colorStops: [
      { offset: 0, color: fill.from },
      { offset: 1, color: fill.to },
    ],
  };
}

const logoCache = new Map<string, Promise<HTMLImageElement>>();

function loadLogoCached(src: string): Promise<HTMLImageElement> {
  const cached = logoCache.get(src);
  if (cached) {
    return cached;
  }
  const pending = loadImage(src).catch((err) => {
    logoCache.delete(src);
    throw err;
  });
  logoCache.set(src, pending);
  return pending;
}

function blobToImage(blob: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(blob);
  return loadImage(url).finally(() => URL.revokeObjectURL(url));
}

function gridFraction(token: "start" | "mid" | "end"): number {
  if (token === "start") {
    return 0;
  }
  if (token === "end") {
    return 1;
  }
  return 0.5;
}

function positionToFraction(pos: OverlayPosition): { fx: number; fy: number } {
  const [vert, horiz] = pos.includes("-")
    ? (pos.split("-") as ["top" | "bottom", "left" | "right"])
    : positionAxes(pos);

  const fyMap = { top: "start", center: "mid", bottom: "end" } as const;
  const fxMap = { left: "start", center: "mid", right: "end" } as const;

  return {
    fx: gridFraction(fxMap[horiz]),
    fy: gridFraction(fyMap[vert]),
  };
}

function positionAxes(
  pos: OverlayPosition
): ["top" | "center" | "bottom", "left" | "center" | "right"] {
  switch (pos) {
    case "top":
      return ["top", "center"];
    case "bottom":
      return ["bottom", "center"];
    case "left":
      return ["center", "left"];
    case "right":
      return ["center", "right"];
    case "center":
      return ["center", "center"];
    default:
      return ["center", "center"];
  }
}

function placeOverlay(
  qrSize: number,
  overlayWidth: number,
  overlayHeight: number,
  pos: OverlayPosition
): { x: number; y: number } {
  const { fx, fy } = positionToFraction(pos);
  const margin = 12;
  const xRange = qrSize - overlayWidth - margin * 2;
  const yRange = qrSize - overlayHeight - margin * 2;
  return {
    x: margin + xRange * fx,
    y: margin + yRange * fy,
  };
}

function renderTextOverlay(
  text: string,
  fgColor: string,
  bgColor: string,
  size: CenterTextSize,
  bold: boolean,
  font: CenterTextFont
): HTMLCanvasElement {
  const bounds = measureTextOverlayBounds(text, size, bold, font);
  if (!bounds) {
    throw new Error("Canvas not supported");
  }
  const w = Math.ceil(bounds.w);
  const h = Math.ceil(bounds.h);

  const lines = text.split("\n");
  const fontSize = FONT_SIZE_MAP[size];
  const weight = bold ? 600 : 400;
  const stack = FONT_STACKS[font];
  const lineHeight = fontSize * 1.15;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas not supported");
  }
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, w, h);
  ctx.font = `${weight} ${fontSize}px ${stack}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = fgColor;
  const startY = (h - (lines.length - 1) * lineHeight) / 2;
  for (const [i, line] of lines.entries()) {
    ctx.fillText(line, w / 2, startY + i * lineHeight);
  }
  return canvas;
}

async function renderBaseQR(
  payload: string,
  errorCorrectionLevel: "H" | "M",
  cfg: CustomizerConfig
): Promise<HTMLImageElement> {
  const fgColor = fillPrimaryColor(cfg.fgFill);
  const bgColor = fillPrimaryColor(cfg.bgFill);
  const fgGradient = toGradient(cfg.fgFill);
  const bgGradient = toGradient(cfg.bgFill);
  const eyes = getEyeStyles(cfg.dotStyle);

  const { default: QRCodeStyling } = await import("qr-code-styling");

  const qr = new QRCodeStyling({
    width: QR_SIZE,
    height: QR_SIZE,
    type: "canvas",
    data: payload,
    margin: 8,
    qrOptions: { errorCorrectionLevel },
    dotsOptions: {
      color: fgColor,
      type: cfg.dotStyle,
      ...(fgGradient && { gradient: fgGradient }),
    },
    cornersSquareOptions: { color: fgColor, type: eyes.square },
    cornersDotOptions: { color: fgColor, type: eyes.dot },
    backgroundOptions: {
      color: bgColor,
      ...(bgGradient && { gradient: bgGradient }),
    },
  });

  const blob = await qr.getRawData("png");
  if (!blob) {
    throw new Error("Failed to generate QR code");
  }
  return blobToImage(blob as Blob);
}

async function renderLogo(
  data: string,
  sizePct: number
): Promise<HTMLImageElement & { drawWidth: number; drawHeight: number }> {
  const img = await loadLogoCached(getLogoSrc(data));
  const target = (QR_SIZE * sizePct) / 100;
  const ratio = img.width / img.height;
  const drawWidth = ratio >= 1 ? target : target * ratio;
  const drawHeight = ratio >= 1 ? target / ratio : target;
  return Object.assign(img, { drawWidth, drawHeight });
}

function drawFrame(
  qrCanvas: HTMLCanvasElement,
  cfg: CustomizerConfig,
  bgColor: string
): HTMLCanvasElement {
  const frame: FrameConfig = cfg.frame;
  const stack = FONT_STACKS[frame.font];
  const titleH = frame.title ? frame.titleSize + FRAME_TEXT_GAP : 0;
  const captionH = frame.caption ? frame.captionSize + FRAME_TEXT_GAP : 0;
  const border = Math.max(0, frame.borderWidth);
  const padding = FRAME_SIDE_PADDING;

  const w = qrCanvas.width + (border + padding) * 2;
  const h = qrCanvas.height + (border + padding) * 2 + titleH + captionH;

  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const ctx = out.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas not supported");
  }

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, w, h);

  if (border > 0) {
    ctx.strokeStyle = frame.borderColor;
    ctx.lineWidth = border;
    ctx.strokeRect(border / 2, border / 2, w - border, h - border);
  }

  ctx.fillStyle = frame.textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (frame.title) {
    const weight = frame.titleBold ? 600 : 400;
    ctx.font = `${weight} ${frame.titleSize}px ${stack}`;
    ctx.fillText(frame.title, w / 2, border + padding + frame.titleSize / 2);
  }

  ctx.drawImage(qrCanvas, border + padding, border + padding + titleH);

  if (frame.caption) {
    const weight = frame.captionBold ? 600 : 400;
    ctx.font = `${weight} ${frame.captionSize}px ${stack}`;
    ctx.fillText(
      frame.caption,
      w / 2,
      h - border - padding - frame.captionSize / 2
    );
  }

  return out;
}

function clampOutput(canvas: HTMLCanvasElement): HTMLCanvasElement {
  if (canvas.width <= MAX_OUTPUT_WIDTH) {
    return canvas;
  }
  const scale = MAX_OUTPUT_WIDTH / canvas.width;
  const out = document.createElement("canvas");
  out.width = MAX_OUTPUT_WIDTH;
  out.height = Math.round(canvas.height * scale);
  const ctx = out.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas not supported");
  }
  ctx.drawImage(canvas, 0, 0, out.width, out.height);
  return out;
}

export async function renderCustomizerQR(
  data: PaymentFormData,
  cfg: CustomizerConfig
): Promise<string> {
  const cleanIban = electronicFormatIBAN(data.iban);
  if (!(cleanIban && isValidIBAN(cleanIban))) {
    throw new InvalidIBANError(data.iban);
  }

  const currency =
    data.currency === "CZK" ? CurrencyCode.CZK : CurrencyCode.EUR;
  const { payload, errorCorrectionLevel } = buildQrPayload(
    data,
    cleanIban,
    currency
  );

  const ecc = resolveErrorCorrectionLevel(errorCorrectionLevel, cfg);

  const baseImg = await renderBaseQR(payload, ecc, cfg);

  const composite = document.createElement("canvas");
  composite.width = QR_SIZE;
  composite.height = QR_SIZE;
  const ctx = composite.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas not supported");
  }
  ctx.drawImage(baseImg, 0, 0, QR_SIZE, QR_SIZE);

  const fgColor = fillPrimaryColor(cfg.fgFill);
  const bgColor = fillPrimaryColor(cfg.bgFill);

  if (cfg.logo) {
    const logo = await renderLogo(cfg.logo, cfg.logoSizePct);
    const { x, y } = placeOverlay(
      QR_SIZE,
      logo.drawWidth,
      logo.drawHeight,
      cfg.logoPosition
    );
    const pad = 6;
    ctx.fillStyle = bgColor;
    ctx.fillRect(
      x - pad,
      y - pad,
      logo.drawWidth + pad * 2,
      logo.drawHeight + pad * 2
    );
    ctx.drawImage(logo, x, y, logo.drawWidth, logo.drawHeight);
  } else if (cfg.centerTextEnabled && cfg.centerText) {
    const text = renderTextOverlay(
      cfg.centerText,
      fgColor,
      bgColor,
      cfg.centerTextSize,
      cfg.centerTextBold,
      cfg.centerTextFont
    );
    const { x, y } = placeOverlay(
      QR_SIZE,
      text.width,
      text.height,
      cfg.centerTextPosition
    );
    ctx.drawImage(text, x, y);
  }

  const finalCanvas = cfg.frame.enabled
    ? drawFrame(composite, cfg, bgColor)
    : composite;

  return clampOutput(finalCanvas).toDataURL("image/png");
}
