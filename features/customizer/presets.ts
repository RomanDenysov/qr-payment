import type { CustomizerConfig, Fill } from "./types";
import { DEFAULT_CUSTOMIZER_CONFIG } from "./types";

export type PresetId = "classic" | "bold" | "sunset" | "framed";

export const PRESET_IDS = ["classic", "bold", "sunset", "framed"] as const;

export const PRESET_SWATCH: Record<PresetId, Fill> = {
  classic: { kind: "solid", color: "#000000" },
  bold: { kind: "solid", color: "#0F172A" },
  sunset: { kind: "linear", rotation: 45, from: "#C2410C", to: "#9F1239" },
  framed: { kind: "solid", color: "#0F172A" },
};

interface FramedStrings {
  title: string;
  caption: string;
}

export function buildPresetConfig(
  id: PresetId,
  framed: FramedStrings
): CustomizerConfig {
  const base = structuredClone(DEFAULT_CUSTOMIZER_CONFIG);

  if (id === "classic") {
    return base;
  }

  if (id === "bold") {
    return {
      ...base,
      fgFill: { kind: "solid", color: "#0F172A" },
      dotStyle: "classy-rounded",
    };
  }

  if (id === "sunset") {
    return {
      ...base,
      fgFill: { kind: "linear", rotation: 45, from: "#C2410C", to: "#9F1239" },
      dotStyle: "classy-rounded",
    };
  }

  return {
    ...base,
    dotStyle: "square",
    frame: {
      ...base.frame,
      enabled: true,
      title: framed.title,
      caption: framed.caption,
      borderColor: "#0F172A",
      borderWidth: 6,
      textColor: "#0F172A",
    },
  };
}
