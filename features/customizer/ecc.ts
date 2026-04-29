import { getContrastRatio } from "./contrast";
import { type CustomizerConfig, fillPrimaryColor } from "./types";

export const ECC_CONTRAST_THRESHOLD = 4.5;

export const SAFE_LOGO_PCT_BY_ECC = {
  H: 25,
  M: 18,
} as const;

export function getMaxLogoSizePct(ecc: "H" | "M"): number {
  return SAFE_LOGO_PCT_BY_ECC[ecc];
}

export function resolveErrorCorrectionLevel(
  baseEcc: "H" | "M",
  cfg: CustomizerConfig
): "H" | "M" {
  if (baseEcc === "H") {
    return "H";
  }

  if (cfg.logo !== null) {
    return "H";
  }

  if (cfg.logoPosition !== "center" || cfg.centerTextPosition !== "center") {
    return "H";
  }

  const fg = fillPrimaryColor(cfg.fgFill);
  const bg = fillPrimaryColor(cfg.bgFill);
  if (getContrastRatio(fg, bg) < ECC_CONTRAST_THRESHOLD) {
    return "H";
  }

  return baseEcc;
}
