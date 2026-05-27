"use client";

import { track } from "@vercel/analytics";
import { useTranslations } from "next-intl";
import type { CSSProperties } from "react";
import {
  buildPresetConfig,
  PRESET_IDS,
  PRESET_SWATCH,
  type PresetId,
} from "../presets";
import { useCustomizerActions } from "../store";
import type { Fill } from "../types";

function swatchStyle(fill: Fill): CSSProperties {
  if (fill.kind === "solid") {
    return { backgroundColor: fill.color };
  }
  return {
    background: `linear-gradient(${fill.rotation}deg, ${fill.from}, ${fill.to})`,
  };
}

export function PresetButtons() {
  const { replace } = useCustomizerActions();
  const t = useTranslations("Branding.presets");

  const handleApply = (id: PresetId) => {
    const config = buildPresetConfig(id, {
      title: t("framedTitle"),
      caption: t("framedCaption"),
    });
    replace(config);
    track("customizer_preset_applied", { preset: id });
  };

  return (
    <div className="flex flex-col gap-2">
      <h2 className="font-medium text-foreground text-sm">{t("title")}</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {PRESET_IDS.map((id) => (
          <button
            className="flex items-center gap-2 border border-border bg-card px-3 py-2 text-left text-foreground text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            key={id}
            onClick={() => handleApply(id)}
            type="button"
          >
            <span
              aria-hidden="true"
              className="inline-block size-5 shrink-0 ring-1 ring-foreground/20"
              style={swatchStyle(PRESET_SWATCH[id])}
            />
            <span className="truncate">{t(`names.${id}`)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
