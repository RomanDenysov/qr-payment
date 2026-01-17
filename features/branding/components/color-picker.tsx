"use client";

import { IconAlertTriangle } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getContrastRatio, hasValidContrast } from "../utils";

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{0,6}$/;

type ColorPickerProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  contrastWith?: string;
};

export function ColorPicker({
  label,
  value,
  onChange,
  contrastWith,
}: ColorPickerProps) {
  const isValid = !contrastWith || hasValidContrast(value, contrastWith);
  const ratio = contrastWith ? getContrastRatio(value, contrastWith) : null;

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          className="h-10 w-14 cursor-pointer p-1"
          onChange={(e) => onChange(e.target.value)}
          type="color"
          value={value}
        />
        <Input
          className="w-24 font-mono text-xs uppercase"
          maxLength={7}
          onChange={(e) => {
            const val = e.target.value;
            if (HEX_COLOR_REGEX.test(val)) {
              onChange(val);
            }
          }}
          value={value}
        />
        {ratio !== null && (
          <span
            className={`text-xs ${isValid ? "text-muted-foreground" : "text-destructive"}`}
          >
            {ratio.toFixed(1)}:1
          </span>
        )}
      </div>
      {!isValid && (
        <p className="flex items-center gap-1 text-destructive text-xs">
          <IconAlertTriangle className="size-3" />
          Nízky kontrast - QR kód nemusí byť čitateľný
        </p>
      )}
    </div>
  );
}
