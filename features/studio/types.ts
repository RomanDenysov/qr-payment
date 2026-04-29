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

export interface StudioConfig {
  fgFill: Fill;
  bgFill: Fill;
  dotStyle: DotStyle;

  centerText: string;
  centerTextSize: CenterTextSize;
  centerTextFont: CenterTextFont;
  centerTextBold: boolean;
  centerTextPosition: OverlayPosition;

  logo: string | null;
  logoSizePct: number;
  logoPosition: OverlayPosition;

  frame: FrameConfig;
}

export interface StudioTemplate {
  id: string;
  name: string;
  config: StudioConfig;
}

export const DEFAULT_STUDIO_CONFIG: StudioConfig = {
  fgFill: { kind: "solid", color: "#000000" },
  bgFill: { kind: "solid", color: "#ffffff" },
  dotStyle: "square",
  centerText: "",
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
};

export type ContrastFn = (a: string, b: string) => number;

export function fillPrimaryColor(fill: Fill): string {
  return fill.kind === "solid" ? fill.color : fill.from;
}
