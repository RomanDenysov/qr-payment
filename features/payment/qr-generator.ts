import { CurrencyCode } from "bysquare";
import { electronicFormatIBAN, isValidIBAN } from "ibantools";
import { buildQrPayload } from "./qr-payload";
import type { PaymentFormData } from "./schema";

export class InvalidIBANError extends Error {
  constructor(iban: string) {
    super(`Neplatný IBAN: ${iban}`);
    this.name = "InvalidIBANError";
  }
}

export type DotStyle = "square" | "rounded" | "dots" | "classy-rounded";
export type CenterTextSize = "small" | "medium" | "large";
export type CenterTextFont = "mono" | "sans" | "serif";

export interface QRBranding {
  fgColor: string;
  bgColor: string;
  centerText: string;
  logo: string | null;
  dotStyle?: DotStyle;
  centerTextSize?: CenterTextSize;
  centerTextBold?: boolean;
  centerTextFont?: CenterTextFont;
}

const QR_SIZE = 400;

const FONT_STACKS: Record<CenterTextFont, string> = {
  mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
  sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
};

const FONT_SIZE_MAP: Record<CenterTextSize, number> = {
  small: 22,
  medium: 30,
  large: 38,
};

const IMAGE_SIZE_MAP: Record<CenterTextSize, number> = {
  small: 0.32,
  medium: 0.4,
  large: 0.5,
};

interface TextRenderOptions {
  size: CenterTextSize;
  bold: boolean;
  font: CenterTextFont;
}

function renderCenterTextImage(
  text: string,
  bgColor: string,
  fgColor: string,
  options: TextRenderOptions
): string {
  const lines = text.split("\n");
  const fontSize = FONT_SIZE_MAP[options.size];
  const fontWeight = options.bold ? 600 : 400;
  const fontStack = FONT_STACKS[options.font];
  const lineHeight = fontSize * 1.15;
  const padding = fontSize * 0.5;

  const measure = document.createElement("canvas").getContext("2d");
  if (!measure) {
    throw new Error("Canvas not supported");
  }
  measure.font = `${fontWeight} ${fontSize}px ${fontStack}`;
  const maxWidth = Math.max(...lines.map((l) => measure.measureText(l).width));

  const w = Math.ceil(maxWidth + padding * 2);
  const h = Math.ceil(lines.length * lineHeight + padding * 1.5);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas not supported");
  }

  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, 6);
  ctx.fill();

  ctx.font = `${fontWeight} ${fontSize}px ${fontStack}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = fgColor;

  const startY = (h - (lines.length - 1) * lineHeight) / 2;
  for (const [i, line] of lines.entries()) {
    ctx.fillText(line, w / 2, startY + i * lineHeight);
  }

  return canvas.toDataURL("image/png");
}

function getLogoSrc(logoData: string): string {
  if (logoData.startsWith("<")) {
    return `data:image/svg+xml;utf8,${encodeURIComponent(logoData)}`;
  }
  return logoData;
}

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function getEyeStyles(dotStyle: DotStyle) {
  switch (dotStyle) {
    case "square":
      return { square: "square" as const, dot: "square" as const };
    case "rounded":
      return { square: "extra-rounded" as const, dot: "dot" as const };
    case "dots":
      return { square: "dot" as const, dot: "dot" as const };
    case "classy-rounded":
      return { square: "extra-rounded" as const, dot: "dot" as const };
    default:
      return { square: "square" as const, dot: "square" as const };
  }
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
  const dotStyle: DotStyle = branding?.dotStyle ?? "square";
  const textSize: CenterTextSize = branding?.centerTextSize ?? "medium";
  const textBold = branding?.centerTextBold ?? true;
  const textFont: CenterTextFont = branding?.centerTextFont ?? "mono";

  const currency =
    data.currency === "CZK" ? CurrencyCode.CZK : CurrencyCode.EUR;
  const { payload, errorCorrectionLevel } = buildQrPayload(
    data,
    cleanIban,
    currency
  );

  let imageSrc: string | undefined;
  let imageSize = 0.15;

  if (branding?.logo) {
    imageSrc = getLogoSrc(branding.logo);
  } else if (centerText) {
    imageSrc = renderCenterTextImage(centerText, bgColor, fgColor, {
      size: textSize,
      bold: textBold,
      font: textFont,
    });
    imageSize = IMAGE_SIZE_MAP[textSize];
  }

  const eyes = getEyeStyles(dotStyle);

  const { default: QRCodeStyling } = await import("qr-code-styling");

  const qr = new QRCodeStyling({
    width: QR_SIZE,
    height: QR_SIZE,
    type: "canvas",
    data: payload,
    margin: 8,
    qrOptions: { errorCorrectionLevel },
    dotsOptions: { color: fgColor, type: dotStyle },
    cornersSquareOptions: { color: fgColor, type: eyes.square },
    cornersDotOptions: { color: fgColor, type: eyes.dot },
    backgroundOptions: { color: bgColor },
    ...(imageSrc
      ? {
          image: imageSrc,
          imageOptions: {
            hideBackgroundDots: true,
            imageSize,
            margin: 4,
          },
        }
      : {}),
  });

  const blob = await qr.getRawData("png");
  if (!blob) {
    throw new Error("Failed to generate QR code");
  }

  return blobToDataURL(blob as Blob);
}
