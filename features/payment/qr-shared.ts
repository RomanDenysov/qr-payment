import type { CenterTextFont, CenterTextSize, DotStyle } from "./qr-generator";

export const FONT_STACKS: Record<CenterTextFont, string> = {
  mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
  sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
};

export const FONT_SIZE_MAP: Record<CenterTextSize, number> = {
  small: 22,
  medium: 30,
  large: 38,
};

type CornerStyle = "square" | "extra-rounded" | "dot";
type CornerDot = "square" | "dot";

export function getEyeStyles(dotStyle: DotStyle): {
  square: CornerStyle;
  dot: CornerDot;
} {
  switch (dotStyle) {
    case "rounded":
    case "classy-rounded":
      return { square: "extra-rounded", dot: "dot" };
    case "dots":
      return { square: "dot", dot: "dot" };
    default:
      return { square: "square", dot: "square" };
  }
}

export function getLogoSrc(logoData: string): string {
  if (logoData.startsWith("<")) {
    return `data:image/svg+xml;utf8,${encodeURIComponent(logoData)}`;
  }
  return logoData;
}
