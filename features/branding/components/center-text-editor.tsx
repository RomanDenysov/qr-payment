"use client";

import { IconBold } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import type {
  CenterTextFont,
  CenterTextSize,
} from "@/features/payment/qr-generator";
import { cn } from "@/lib/utils";

interface CenterTextEditorProps {
  value: string;
  onChange: (text: string) => void;
  textSize: CenterTextSize;
  onTextSizeChange: (size: CenterTextSize) => void;
  textBold: boolean;
  onTextBoldChange: (bold: boolean) => void;
  textFont: CenterTextFont;
  onTextFontChange: (font: CenterTextFont) => void;
}

const MAX_CHARS = 50;

const SIZES: CenterTextSize[] = ["small", "medium", "large"];
const SIZE_LABELS: Record<CenterTextSize, string> = {
  small: "S",
  medium: "M",
  large: "L",
};

const FONTS: CenterTextFont[] = ["mono", "sans", "serif"];
const FONT_CLASSES: Record<CenterTextFont, string> = {
  mono: "font-mono",
  sans: "font-sans",
  serif: "font-serif",
};

export function CenterTextEditor({
  value,
  onChange,
  textSize,
  onTextSizeChange,
  textBold,
  onTextBoldChange,
  textFont,
  onTextFontChange,
}: CenterTextEditorProps) {
  const charCount = value.length;
  const isNearLimit = charCount >= MAX_CHARS - 5;
  const t = useTranslations("Branding");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    if (next.length <= MAX_CHARS) {
      onChange(next);
    }
  };

  return (
    <Field>
      <FieldLabel className="flex items-center justify-between">
        <span>{t("centerText")}</span>
        <span
          className={cn(
            "font-normal text-muted-foreground text-xs",
            isNearLimit && "text-foreground"
          )}
        >
          {charCount}/{MAX_CHARS}
        </span>
      </FieldLabel>
      <Textarea
        maxLength={MAX_CHARS}
        onChange={handleChange}
        placeholder={t("centerTextPlaceholder")}
        rows={3}
        value={value}
      />
      <div className="flex items-center gap-2">
        <div className="flex border border-border">
          {SIZES.map((size) => (
            <button
              className={cn(
                "h-6 px-2 text-xs transition-colors",
                textSize === size
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
              key={size}
              onClick={() => onTextSizeChange(size)}
              title={size}
              type="button"
            >
              {SIZE_LABELS[size]}
            </button>
          ))}
        </div>
        <div className="flex border border-border">
          {FONTS.map((font) => (
            <button
              className={cn(
                "h-6 px-2 text-xs transition-colors",
                FONT_CLASSES[font],
                textFont === font
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
              key={font}
              onClick={() => onTextFontChange(font)}
              title={font}
              type="button"
            >
              Aa
            </button>
          ))}
        </div>
        <button
          className={cn(
            "flex h-6 w-6 items-center justify-center border border-border transition-colors",
            textBold ? "bg-primary text-primary-foreground" : "hover:bg-muted"
          )}
          onClick={() => onTextBoldChange(!textBold)}
          title="Bold"
          type="button"
        >
          <IconBold className="size-3" />
        </button>
      </div>
      <FieldDescription>{t("centerTextDescription")}</FieldDescription>
    </Field>
  );
}
