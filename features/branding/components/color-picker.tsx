"use client";

import { useTranslations } from "next-intl";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  contrastWith?: string;
}

const HEX_COLOR_REGEX = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
const HEX_VALIDATION_REGEX = /^#[0-9A-Fa-f]{6}$/;

// Calculate relative luminance according to WCAG 2.0
function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return 0;
  }

  const [r, g, b] = rgb.map((channel) => {
    const sRGB = channel / 255;
    return sRGB <= 0.039_28 ? sRGB / 12.92 : ((sRGB + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hexToRgb(hex: string): [number, number, number] | null {
  const result = HEX_COLOR_REGEX.exec(hex);
  return result
    ? [
        Number.parseInt(result[1], 16),
        Number.parseInt(result[2], 16),
        Number.parseInt(result[3], 16),
      ]
    : null;
}

function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function ColorPicker({
  label,
  value,
  onChange,
  contrastWith,
}: ColorPickerProps) {
  const t = useTranslations("Branding");
  const contrastRatio = contrastWith
    ? getContrastRatio(value, contrastWith)
    : null;
  const hasLowContrast = contrastRatio !== null && contrastRatio < 3;

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (HEX_VALIDATION_REGEX.test(newValue)) {
      onChange(newValue);
    }
  };

  return (
    <Field>
      <FieldLabel className="flex items-center gap-2">
        <span>{label}</span>
        {hasLowContrast && (
          <span className="rounded bg-destructive/10 px-1.5 py-0.5 font-normal text-destructive text-xs">
            {t("lowContrast")}
          </span>
        )}
      </FieldLabel>
      <div className="flex gap-2">
        <input
          className="h-8 w-12 cursor-pointer rounded border border-input bg-transparent"
          onChange={handleColorChange}
          type="color"
          value={value}
        />
        <Input
          className={cn(
            "flex-1 font-mono uppercase",
            hasLowContrast && "border-destructive ring-1 ring-destructive/20"
          )}
          maxLength={7}
          onChange={handleTextChange}
          placeholder="#000000"
          type="text"
          value={value}
        />
      </div>
    </Field>
  );
}
