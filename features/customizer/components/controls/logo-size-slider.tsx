"use client";

import { useTranslations } from "next-intl";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";

interface LogoSizeSliderProps {
  value: number;
  onChange: (size: number) => void;
  max?: number;
}

const MIN = 10;
const DEFAULT_MAX = 50;

export function LogoSizeSlider({
  value,
  onChange,
  max = DEFAULT_MAX,
}: LogoSizeSliderProps) {
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
        max={max}
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
