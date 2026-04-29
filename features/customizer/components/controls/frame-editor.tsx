"use client";

import { IconBold } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ColorPicker } from "@/features/customizer/components/color-picker";
import { cn } from "@/lib/utils";
import type { FrameConfig, FrameTextFont } from "../../types";

interface FrameEditorProps {
  value: FrameConfig;
  onChange: (frame: FrameConfig) => void;
}

const MIN_BORDER = 0;
const MAX_BORDER = 12;
const MIN_TEXT = 12;
const MAX_TEXT = 48;
const TITLE_MAX = 60;
const CAPTION_MAX = 80;

const FONTS: FrameTextFont[] = ["sans", "serif", "mono"];
const FONT_CLASSES: Record<FrameTextFont, string> = {
  sans: "font-sans",
  serif: "font-serif",
  mono: "font-mono",
};

export function FrameEditor({ value, onChange }: FrameEditorProps) {
  const t = useTranslations("Studio");

  const update = <K extends keyof FrameConfig>(key: K, v: FrameConfig[K]) =>
    onChange({ ...value, [key]: v });

  return (
    <div className="flex flex-col gap-3">
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

          <FontPicker
            onChange={(font) => update("font", font)}
            value={value.font}
          />

          <FrameTextRow
            bold={value.titleBold}
            label={t("frameTitle")}
            maxChars={TITLE_MAX}
            onBoldChange={(b) => update("titleBold", b)}
            onSizeChange={(s) => update("titleSize", s)}
            onTextChange={(s) => update("title", s)}
            size={value.titleSize}
            sizeLabel={t("frameTitleSize")}
            text={value.title}
          />

          <FrameTextRow
            bold={value.captionBold}
            label={t("frameCaption")}
            maxChars={CAPTION_MAX}
            onBoldChange={(b) => update("captionBold", b)}
            onSizeChange={(s) => update("captionSize", s)}
            onTextChange={(s) => update("caption", s)}
            size={value.captionSize}
            sizeLabel={t("frameCaptionSize")}
            text={value.caption}
          />

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

function FontPicker({
  value,
  onChange,
}: {
  value: FrameTextFont;
  onChange: (font: FrameTextFont) => void;
}) {
  const t = useTranslations("Studio");
  return (
    <div className="flex items-center gap-2">
      <span className="font-medium text-sm">{t("frameFont")}</span>
      <div className="flex border border-border">
        {FONTS.map((font) => (
          <button
            className={cn(
              "h-7 px-2.5 text-xs transition-colors",
              FONT_CLASSES[font],
              value === font
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
            key={font}
            onClick={() => onChange(font)}
            title={font}
            type="button"
          >
            Aa
          </button>
        ))}
      </div>
    </div>
  );
}

interface FrameTextRowProps {
  label: string;
  sizeLabel: string;
  text: string;
  maxChars: number;
  size: number;
  bold: boolean;
  onTextChange: (s: string) => void;
  onSizeChange: (s: number) => void;
  onBoldChange: (b: boolean) => void;
}

function FrameTextRow({
  label,
  sizeLabel,
  text,
  maxChars,
  size,
  bold,
  onTextChange,
  onSizeChange,
  onBoldChange,
}: FrameTextRowProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Field>
        <FieldLabel>{label}</FieldLabel>
        <Input
          maxLength={maxChars}
          onChange={(e) => onTextChange(e.target.value)}
          value={text}
        />
      </Field>
      <div className="flex items-center gap-2">
        <Field className="flex-1">
          <FieldLabel className="flex items-center justify-between">
            <span className="text-xs">{sizeLabel}</span>
            <span className="font-mono text-muted-foreground text-xs">
              {size}px
            </span>
          </FieldLabel>
          <input
            className="w-full accent-primary"
            max={MAX_TEXT}
            min={MIN_TEXT}
            onChange={(e) => onSizeChange(Number(e.target.value))}
            step={1}
            type="range"
            value={size}
          />
        </Field>
        <button
          aria-pressed={bold}
          className={cn(
            "flex size-7 shrink-0 items-center justify-center self-end border border-border transition-colors",
            bold ? "bg-primary text-primary-foreground" : "hover:bg-muted"
          )}
          onClick={() => onBoldChange(!bold)}
          title="Bold"
          type="button"
        >
          <IconBold className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
