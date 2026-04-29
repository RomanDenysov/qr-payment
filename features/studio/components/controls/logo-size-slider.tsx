"use client";

import { useTranslations } from "next-intl";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";

interface LogoSizeSliderProps {
  value: number;
  onChange: (size: number) => void;
}

const MIN = 10;
const MAX = 50;

export function LogoSizeSlider({ value, onChange }: LogoSizeSliderProps) {
  const t = useTranslations("Studio");

  return (
    <Field>
      <FieldLabel className="flex items-center justify-between">
        <span>{t("logoSize")}</span>
        <span className="font-mono text-muted-foreground text-xs">
          {value}%
        </span>
      </FieldLabel>
      <input
        className="w-full accent-primary"
        max={MAX}
        min={MIN}
        onChange={(e) => onChange(Number(e.target.value))}
        step={1}
        type="range"
        value={value}
      />
      <FieldDescription>{t("logoSizeHelp")}</FieldDescription>
    </Field>
  );
}
