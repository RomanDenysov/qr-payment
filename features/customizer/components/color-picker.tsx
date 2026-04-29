"use client";

import { useTranslations } from "next-intl";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getContrastRatio } from "../contrast";

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  contrastWith?: string;
}

const HEX_VALIDATION_REGEX = /^#[0-9A-Fa-f]{6}$/;

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
