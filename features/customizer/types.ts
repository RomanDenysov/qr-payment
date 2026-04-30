import type {
  CenterTextFont,
  CenterTextSize,
  DotStyle,
} from "@/features/payment/qr-generator";

export type {
  CenterTextFont,
  CenterTextSize,
  DotStyle,
} from "@/features/payment/qr-generator";

export type OverlayPosition =
  | "top-left"
  | "top"
  | "top-right"
  | "left"
  | "center"
  | "right"
  | "bottom-left"
  | "bottom"
  | "bottom-right";

export const OVERLAY_POSITIONS: OverlayPosition[] = [
  "top-left",
  "top",
  "top-right",
  "left",
  "center",
  "right",
  "bottom-left",
  "bottom",
  "bottom-right",
];

export const OVERLAY_POSITION_I18N_KEYS: Record<OverlayPosition, string> = {
  "top-left": "topLeft",
  top: "top",
  "top-right": "topRight",
  left: "left",
  center: "center",
  right: "right",
  "bottom-left": "bottomLeft",
  bottom: "bottom",
  "bottom-right": "bottomRight",
};

export const OVERLAY_POSITION_SHORT: Record<OverlayPosition, string> = {
  "top-left": "TL",
  top: "T",
  "top-right": "TR",
  left: "L",
  center: "·",
  right: "R",
  "bottom-left": "BL",
  bottom: "B",
  "bottom-right": "BR",
};

export interface SolidFill {
  kind: "solid";
  color: string;
}

export interface GradientFill {
  kind: "linear" | "radial";
  rotation: number;
  from: string;
  to: string;
}

export type Fill = SolidFill | GradientFill;

export type FrameTextFont = "sans" | "serif" | "mono";

export type DownloadSize = "small" | "standard" | "document" | "print";

export const DOWNLOAD_SIZE_PX: Record<DownloadSize, number> = {
  small: 128,
  standard: 256,
  document: 512,
  print: 1024,
};

export const DOWNLOAD_SIZES: DownloadSize[] = [
  "small",
  "standard",
  "document",
  "print",
];

export interface FrameConfig {
  enabled: boolean;
  borderColor: string;
  borderWidth: number;
  title: string;
  caption: string;
  textColor: string;
  titleSize: number;
  captionSize: number;
  titleBold: boolean;
  captionBold: boolean;
  font: FrameTextFont;
}

export interface CustomizerConfig {
  fgFill: Fill;
  bgFill: Fill;
  dotStyle: DotStyle;

  centerText: string;
  centerTextEnabled: boolean;
  centerTextSize: CenterTextSize;
  centerTextFont: CenterTextFont;
  centerTextBold: boolean;
  centerTextPosition: OverlayPosition;

  logo: string | null;
  logoSizePct: number;
  logoPosition: OverlayPosition;

  frame: FrameConfig;

  downloadSize: DownloadSize;
}

export interface CustomizerTemplate {
  id: string;
  name: string;
  config: CustomizerConfig;
}

export const DEFAULT_CUSTOMIZER_CONFIG: Readonly<CustomizerConfig> = {
  fgFill: { kind: "solid", color: "#000000" },
  bgFill: { kind: "solid", color: "#ffffff" },
  dotStyle: "square",
  centerText: "",
  centerTextEnabled: true,
  centerTextSize: "medium",
  centerTextFont: "mono",
  centerTextBold: true,
  centerTextPosition: "center",
  logo: null,
  logoSizePct: 22,
  logoPosition: "center",
  frame: {
    enabled: false,
    borderColor: "#000000",
    borderWidth: 4,
    title: "",
    caption: "",
    textColor: "#000000",
    titleSize: 22,
    captionSize: 22,
    titleBold: true,
    captionBold: false,
    font: "sans",
  },
  downloadSize: "standard",
};

export type ContrastFn = (a: string, b: string) => number;

export function fillPrimaryColor(fill: Fill): string {
  return fill.kind === "solid" ? fill.color : fill.from;
}
