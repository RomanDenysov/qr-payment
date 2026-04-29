"use client";

import { useTranslations } from "next-intl";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ColorPicker } from "@/features/branding/components/color-picker";
import type { FrameConfig } from "../../types";

interface FrameEditorProps {
  value: FrameConfig;
  onChange: (frame: FrameConfig) => void;
}

const MIN_BORDER = 0;
const MAX_BORDER = 12;
const TITLE_MAX = 60;
const CAPTION_MAX = 80;

export function FrameEditor({ value, onChange }: FrameEditorProps) {
  const t = useTranslations("Studio");

  const update = <K extends keyof FrameConfig>(key: K, v: FrameConfig[K]) =>
    onChange({ ...value, [key]: v });

  return (
    <div className="flex flex-col gap-3 border border-border bg-card/40 p-3">
      <label className="flex items-center gap-2 text-sm">
        <input
          checked={value.enabled}
          className="size-4 accent-primary"
          onChange={(e) => update("enabled", e.target.checked)}
          type="checkbox"
        />
        <span className="font-medium">{t("frameEnabled")}</span>
      </label>

      {value.enabled && (
        <>
          <ColorPicker
            label={t("frameBorderColor")}
            onChange={(borderColor) => update("borderColor", borderColor)}
            value={value.borderColor}
          />
          <Field>
            <FieldLabel className="flex items-center justify-between">
              <span>{t("frameBorderWidth")}</span>
              <span className="font-mono text-muted-foreground text-xs">
                {value.borderWidth}px
              </span>
            </FieldLabel>
            <input
              className="w-full accent-primary"
              max={MAX_BORDER}
              min={MIN_BORDER}
              onChange={(e) => update("borderWidth", Number(e.target.value))}
              step={1}
              type="range"
              value={value.borderWidth}
            />
          </Field>
          <Field>
            <FieldLabel>{t("frameTitle")}</FieldLabel>
            <Input
              maxLength={TITLE_MAX}
              onChange={(e) => update("title", e.target.value)}
              value={value.title}
            />
          </Field>
          <Field>
            <FieldLabel>{t("frameCaption")}</FieldLabel>
            <Input
              maxLength={CAPTION_MAX}
              onChange={(e) => update("caption", e.target.value)}
              value={value.caption}
            />
          </Field>
          <ColorPicker
            label={t("frameTextColor")}
            onChange={(textColor) => update("textColor", textColor)}
            value={value.textColor}
          />
        </>
      )}
    </div>
  );
}
