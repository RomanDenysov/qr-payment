import { getContrastRatio } from "./contrast";
import { getMaxLogoSizePct, resolveErrorCorrectionLevel } from "./ecc";
import { type CustomizerConfig, type Fill, fillPrimaryColor } from "./types";

export type GuardrailKey =
  | "logo_oversized"
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

const LOW_CONTRAST_THRESHOLD = 4.5;
const VERY_LOW_CONTRAST_THRESHOLD = 3;
const WEAK_GRADIENT_THRESHOLD = 1.2;

function isGradient(fill: Fill): boolean {
  return fill.kind !== "solid";
}

function gradientStopRatio(fill: Fill): number | null {
  if (fill.kind === "solid") {
    return null;
  }
  return getContrastRatio(fill.from, fill.to);
}

function roundRatio(ratio: number): string {
  return ratio.toFixed(1);
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

  const fg = fillPrimaryColor(cfg.fgFill);
  const bg = fillPrimaryColor(cfg.bgFill);
  const contrast = getContrastRatio(fg, bg);

  if (contrast < VERY_LOW_CONTRAST_THRESHOLD) {
    out.push({
      key: "very_low_contrast",
      severity: "warning",
      i18nKey: "Branding.guardrail.veryLowContrast",
      values: { ratio: roundRatio(contrast) },
    });
  } else if (contrast < LOW_CONTRAST_THRESHOLD) {
    out.push({
      key: "low_contrast",
      severity: "info",
      i18nKey: "Branding.guardrail.lowContrast",
      values: { ratio: roundRatio(contrast) },
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
