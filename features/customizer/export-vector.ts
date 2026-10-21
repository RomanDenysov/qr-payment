import {
  FONT_SIZE_MAP,
  FONT_STACKS,
  getEyeStyles,
  getLogoSrc,
  loadImage,
  measureTextOverlayBounds,
} from "@/features/payment/qr-shared";
import type { PaymentFormData } from "@/features/payment/schema";
import {
  FRAME_SIDE_PADDING,
  FRAME_TEXT_GAP,
  placeOverlay,
  QR_SIZE,
  renderLogo,
  resolveCustomizerPayload,
  toGradient,
} from "./renderer";
import { type CustomizerConfig, fillPrimaryColor } from "./types";

const XML_DECLARATION = /^<\?xml[^>]*\?>\s*/;
const CLIP_REF = /#([^'")]+)/;
const DOT_CLIP_PREFIX = "clip-path-dot-color";
const SEAM_STROKE = "0.5";
const SVG_NS = "http://www.w3.org/2000/svg";
const XML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};
const XML_SPECIAL = /[&<>"']/g;
const WHITESPACE = /\s+/g;
const IBAN_GROUP = /(.{4})(?=.)/g;

const PDF_PAGE_W = 210;
const PDF_MARGIN_TOP = 30;
const PDF_QR_WIDTH_MM = 90;
const PDF_RASTER_PX = 2000;
const PDF_FONT_SIZE = 11;
const PDF_LINE_GAP = 6;

function escapeXml(value: string): string {
  return value.replace(XML_SPECIAL, (ch) => XML_ESCAPES[ch] ?? ch);
}

function textAttrs(size: number, bold: boolean, stack: string): string {
  return `font-family="${escapeXml(stack)}" font-size="${size}" font-weight="${bold ? 600 : 400}" text-anchor="middle" dominant-baseline="central"`;
}

async function renderBaseSvg(
  payload: string,
  ecc: "H" | "M",
  cfg: CustomizerConfig
): Promise<string> {
  const fgColor = fillPrimaryColor(cfg.fgFill);
  const bgColor = fillPrimaryColor(cfg.bgFill);
  const fgGradient = toGradient(cfg.fgFill);
  const bgGradient = toGradient(cfg.bgFill);
  const eyes = getEyeStyles(cfg.dotStyle);

  const { default: QRCodeStyling } = await import("qr-code-styling");

  const qr = new QRCodeStyling({
    width: QR_SIZE,
    height: QR_SIZE,
    type: "svg",
    data: payload,
    margin: 8,
    qrOptions: { errorCorrectionLevel: ecc },
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

  const blob = await qr.getRawData("svg");
  if (!blob) {
    throw new Error("Failed to generate QR code");
  }
  const markup = await (blob as Blob).text();
  return fillDotShapes(markup.replace(XML_DECLARATION, ""));
}

/**
 * qr-code-styling draws the modules as a clipPath over a filled rect. Viewers
 * antialias every clip shape on its own, so neighbouring modules show
 * hairline seams once the SVG is scaled. Turning the clip into a filled group
 * with a thin stroke of the same paint overlaps the edges and closes them.
 */
function fillDotShapes(markup: string): string {
  const doc = new DOMParser().parseFromString(markup, "image/svg+xml");
  for (const target of doc.querySelectorAll("[clip-path]")) {
    const id = target.getAttribute("clip-path")?.match(CLIP_REF)?.[1];
    if (!id?.startsWith(DOT_CLIP_PREFIX)) {
      continue;
    }
    const clip = doc.getElementById(id);
    if (!clip) {
      continue;
    }
    const paint = target.getAttribute("fill") ?? "#000000";
    const group = doc.createElementNS(SVG_NS, "g");
    group.setAttribute("fill", paint);
    group.setAttribute("stroke", paint);
    group.setAttribute("stroke-width", SEAM_STROKE);
    group.append(...clip.childNodes);
    target.replaceWith(group);
    clip.remove();
  }
  return new XMLSerializer().serializeToString(doc.documentElement);
}

async function renderOverlaySvg(cfg: CustomizerConfig): Promise<string> {
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
    return [
      `<rect x="${x - pad}" y="${y - pad}" width="${logo.drawWidth + pad * 2}" height="${logo.drawHeight + pad * 2}" fill="${bgColor}"/>`,
      `<image x="${x}" y="${y}" width="${logo.drawWidth}" height="${logo.drawHeight}" preserveAspectRatio="none" href="${escapeXml(getLogoSrc(cfg.logo))}"/>`,
    ].join("");
  }

  if (!(cfg.centerTextEnabled && cfg.centerText)) {
    return "";
  }

  const bounds = measureTextOverlayBounds(
    cfg.centerText,
    cfg.centerTextSize,
    cfg.centerTextBold,
    cfg.centerTextFont
  );
  if (!bounds) {
    return "";
  }
  const w = Math.ceil(bounds.w);
  const h = Math.ceil(bounds.h);
  const { x, y } = placeOverlay(QR_SIZE, w, h, cfg.centerTextPosition);
  const lines = cfg.centerText.split("\n");
  const fontSize = FONT_SIZE_MAP[cfg.centerTextSize];
  const lineHeight = fontSize * 1.15;
  const startY = y + (h - (lines.length - 1) * lineHeight) / 2;
  const attrs = textAttrs(
    fontSize,
    cfg.centerTextBold,
    FONT_STACKS[cfg.centerTextFont]
  );
  const fgColor = fillPrimaryColor(cfg.fgFill);

  const textLines = lines
    .map(
      (line, i) =>
        `<text x="${x + w / 2}" y="${startY + i * lineHeight}" fill="${fgColor}" ${attrs}>${escapeXml(line)}</text>`
    )
    .join("");
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${bgColor}"/>${textLines}`;
}

function wrapSvg(width: number, height: number, body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`;
}

function frameSvg(qrSvg: string, cfg: CustomizerConfig): string {
  const { frame } = cfg;
  const bgColor = fillPrimaryColor(cfg.bgFill);
  const stack = FONT_STACKS[frame.font];
  const titleH = frame.title ? frame.titleSize + FRAME_TEXT_GAP : 0;
  const captionH = frame.caption ? frame.captionSize + FRAME_TEXT_GAP : 0;
  const border = Math.max(0, frame.borderWidth);
  const inset = border + FRAME_SIDE_PADDING;

  const w = QR_SIZE + inset * 2;
  const h = QR_SIZE + inset * 2 + titleH + captionH;

  const parts = [`<rect width="${w}" height="${h}" fill="${bgColor}"/>`];

  if (border > 0) {
    parts.push(
      `<rect x="${border / 2}" y="${border / 2}" width="${w - border}" height="${h - border}" fill="none" stroke="${frame.borderColor}" stroke-width="${border}"/>`
    );
  }

  if (frame.title) {
    parts.push(
      `<text x="${w / 2}" y="${inset + frame.titleSize / 2}" fill="${frame.textColor}" ${textAttrs(frame.titleSize, frame.titleBold, stack)}>${escapeXml(frame.title)}</text>`
    );
  }

  parts.push(
    `<g transform="translate(${inset} ${inset + titleH})">${qrSvg}</g>`
  );

  if (frame.caption) {
    parts.push(
      `<text x="${w / 2}" y="${h - inset - frame.captionSize / 2}" fill="${frame.textColor}" ${textAttrs(frame.captionSize, frame.captionBold, stack)}>${escapeXml(frame.caption)}</text>`
    );
  }

  return wrapSvg(w, h, parts.join(""));
}

/**
 * Vector counterpart of `renderCustomizerQR`: same payload, colors, dot
 * style, overlay and frame, but returned as standalone SVG markup.
 */
export async function renderCustomizerSVG(
  data: PaymentFormData,
  cfg: CustomizerConfig
): Promise<string> {
  const { payload, ecc } = resolveCustomizerPayload(data, cfg);
  const [base, overlay] = await Promise.all([
    renderBaseSvg(payload, ecc, cfg),
    renderOverlaySvg(cfg),
  ]);
  const qrSvg = `${base}${overlay}`;

  if (cfg.frame.enabled) {
    return frameSvg(qrSvg, cfg);
  }
  return wrapSvg(QR_SIZE, QR_SIZE, qrSvg);
}

function triggerDownload(href: string, filename: string) {
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export async function downloadQrSvg(
  data: PaymentFormData,
  cfg: CustomizerConfig,
  filePrefix: string
): Promise<void> {
  const svg = await renderCustomizerSVG(data, cfg);
  const url = URL.createObjectURL(
    new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
  );
  try {
    triggerDownload(url, `${filePrefix}-${Date.now()}.svg`);
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

async function rasterizeSvg(
  svg: string,
  targetWidth: number
): Promise<{ dataUrl: string; ratio: number }> {
  const img = await loadImage(
    `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  );
  const ratio = img.height / img.width;
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = Math.round(targetWidth * ratio);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas not supported");
  }
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return { dataUrl: canvas.toDataURL("image/png"), ratio };
}

function paymentLines(data: PaymentFormData): string[] {
  const iban = data.iban.replace(WHITESPACE, "").replace(IBAN_GROUP, "$1 ");
  const lines = [`IBAN: ${iban}`];
  if (data.amount) {
    lines.push(`${data.amount.toFixed(2)} ${data.currency ?? "EUR"}`);
  }
  if (data.format !== "epc") {
    const symbols = [
      data.variableSymbol && `VS: ${data.variableSymbol}`,
      data.specificSymbol && `SS: ${data.specificSymbol}`,
      data.constantSymbol && `KS: ${data.constantSymbol}`,
    ].filter(Boolean);
    if (symbols.length > 0) {
      lines.push(symbols.join("   "));
    }
  }
  return lines;
}

/**
 * A4 page with the QR printed at a fixed physical width, rendered from the
 * SVG at high resolution so it stays sharp on paper.
 */
export async function downloadQrPdf(
  data: PaymentFormData,
  cfg: CustomizerConfig,
  filePrefix: string
): Promise<void> {
  const svg = await renderCustomizerSVG(data, cfg);
  const [{ dataUrl, ratio }, { jsPDF }] = await Promise.all([
    rasterizeSvg(svg, PDF_RASTER_PX),
    import("jspdf"),
  ]);

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const qrHeight = PDF_QR_WIDTH_MM * ratio;
  const x = (PDF_PAGE_W - PDF_QR_WIDTH_MM) / 2;
  doc.addImage(
    dataUrl,
    "PNG",
    x,
    PDF_MARGIN_TOP,
    PDF_QR_WIDTH_MM,
    qrHeight,
    undefined,
    "FAST"
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(PDF_FONT_SIZE);
  let textY = PDF_MARGIN_TOP + qrHeight + 10;
  for (const line of paymentLines(data)) {
    doc.text(line, PDF_PAGE_W / 2, textY, { align: "center" });
    textY += PDF_LINE_GAP;
  }

  doc.save(`${filePrefix}-${Date.now()}.pdf`);
}
