import { getContrastRatio, isValidHex } from "./contrast";
import { type CustomizerConfig, fillPrimaryColor } from "./types";

export const ECC_CONTRAST_THRESHOLD = 4.5;

export const SAFE_LOGO_PCT_BY_ECC = {
  H: 25,
  M: 18,
} as const;

export function getMaxLogoSizePct(ecc: "H" | "M"): number {
  return SAFE_LOGO_PCT_BY_ECC[ecc];
}

export interface EccContext {
  logo: CustomizerConfig["logo"];
  logoPosition: CustomizerConfig["logoPosition"];
  centerTextPosition: CustomizerConfig["centerTextPosition"];
  fgFill: CustomizerConfig["fgFill"];
  bgFill: CustomizerConfig["bgFill"];
}

// QR codes support L/M/Q/H. We emit only M (default for our payment formats)
// and H (forced when a logo, off-center overlay, low contrast, or invalid
// color demands extra resilience). L and Q are intentionally unused.
export function resolveErrorCorrectionLevel(
  baseEcc: "H" | "M",
  ctx: EccContext
): "H" | "M" {
  if (baseEcc === "H") {
    return "H";
  }

  if (ctx.logo !== null) {
    return "H";
  }

  if (ctx.logoPosition !== "center" || ctx.centerTextPosition !== "center") {
    return "H";
  }

  const fg = fillPrimaryColor(ctx.fgFill);
  const bg = fillPrimaryColor(ctx.bgFill);
  if (!(isValidHex(fg) && isValidHex(bg))) {
    return "H";
  }
  if (getContrastRatio(fg, bg) < ECC_CONTRAST_THRESHOLD) {
    return "H";
  }

  return baseEcc;
}
