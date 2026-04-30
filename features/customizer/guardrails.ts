import { FONT_SIZE_MAP, FONT_STACKS } from "@/features/payment/qr-shared";
import { getContrastRatio } from "./contrast";
import {
  ECC_CONTRAST_THRESHOLD,
  getMaxLogoSizePct,
  resolveErrorCorrectionLevel,
} from "./ecc";
import { type CustomizerConfig, type Fill, fillPrimaryColor } from "./types";

export type GuardrailKey =
  | "logo_oversized"
  | "text_oversized"
  | "low_contrast"
  | "very_low_contrast"
  | "weak_gradient_fg"
  | "weak_gradient_bg";

export type GuardrailSeverity = "info" | "warning";

export interface Guardrail {
  key: GuardrailKey;
  severity: GuardrailSeverity;
  i18nKey: string;
  values?: Record<string, string | number>;
}

const VERY_LOW_CONTRAST_THRESHOLD = 3;
const WEAK_GRADIENT_THRESHOLD = 1.2;
const GUARDRAIL_QR_SIZE = 480;

function measureCenterTextCoveragePct(cfg: CustomizerConfig): number | null {
  if (typeof document === "undefined") {
    return null;
  }
  if (!(cfg.centerTextEnabled && cfg.centerText.trim())) {
    return null;
  }
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) {
    return null;
  }
  const lines = cfg.centerText.split("\n");
  const fontSize = FONT_SIZE_MAP[cfg.centerTextSize];
  const weight = cfg.centerTextBold ? 600 : 400;
  const stack = FONT_STACKS[cfg.centerTextFont];
  ctx.font = `${weight} ${fontSize}px ${stack}`;
  const maxWidth = Math.max(...lines.map((l) => ctx.measureText(l).width));
  const lineHeight = fontSize * 1.15;
  const padding = fontSize * 0.5;
  const w = maxWidth + padding * 2;
  const h = lines.length * lineHeight + padding * 1.5;
  return (Math.max(w, h) / GUARDRAIL_QR_SIZE) * 100;
}

function isGradient(fill: Fill): boolean {
  return fill.kind !== "solid";
}

function gradientStopRatio(fill: Fill): number | null {
  if (fill.kind === "solid") {
    return null;
  }
  return getContrastRatio(fill.from, fill.to);
}

export function checkGuardrails(cfg: CustomizerConfig): Guardrail[] {
  const out: Guardrail[] = [];

  const ecc = resolveErrorCorrectionLevel("M", cfg);
  const maxLogo = getMaxLogoSizePct(ecc);

  if (cfg.logo && cfg.logoSizePct > maxLogo) {
    out.push({
      key: "logo_oversized",
      severity: "warning",
      i18nKey: "Branding.guardrail.logoOversized",
      values: { size: cfg.logoSizePct, max: maxLogo, ecc },
    });
  }

  const textCoverage = measureCenterTextCoveragePct(cfg);
  if (textCoverage !== null && textCoverage > maxLogo) {
    out.push({
      key: "text_oversized",
      severity: "warning",
      i18nKey: "Branding.guardrail.textOversized",
      values: { max: maxLogo, ecc },
    });
  }

  const fg = fillPrimaryColor(cfg.fgFill);
  const bg = fillPrimaryColor(cfg.bgFill);
  const contrast = getContrastRatio(fg, bg);

  if (contrast < VERY_LOW_CONTRAST_THRESHOLD) {
    out.push({
      key: "very_low_contrast",
      severity: "warning",
      i18nKey: "Branding.guardrail.veryLowContrast",
    });
  } else if (contrast < ECC_CONTRAST_THRESHOLD) {
    out.push({
      key: "low_contrast",
      severity: "info",
      i18nKey: "Branding.guardrail.lowContrast",
    });
  }

  if (isGradient(cfg.fgFill)) {
    const stopRatio = gradientStopRatio(cfg.fgFill);
    if (stopRatio !== null && stopRatio < WEAK_GRADIENT_THRESHOLD) {
      out.push({
        key: "weak_gradient_fg",
        severity: "warning",
        i18nKey: "Branding.guardrail.weakGradientFg",
      });
    }
  }

  if (isGradient(cfg.bgFill)) {
    const stopRatio = gradientStopRatio(cfg.bgFill);
    if (stopRatio !== null && stopRatio < WEAK_GRADIENT_THRESHOLD) {
      out.push({
        key: "weak_gradient_bg",
        severity: "warning",
        i18nKey: "Branding.guardrail.weakGradientBg",
      });
    }
  }

  return out;
}

export function getResolvedMaxLogoSizePct(cfg: CustomizerConfig): number {
  const ecc = resolveErrorCorrectionLevel("M", cfg);
  return getMaxLogoSizePct(ecc);
}
