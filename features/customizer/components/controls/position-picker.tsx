"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  OVERLAY_POSITION_I18N_KEYS,
  OVERLAY_POSITIONS,
  type OverlayPosition,
} from "../../types";

interface PositionPickerProps {
  label: string;
  value: OverlayPosition;
  onChange: (pos: OverlayPosition) => void;
}

export function PositionPicker({
  label,
  value,
  onChange,
}: PositionPickerProps) {
  const t = useTranslations("Studio.position");
  return (
    <fieldset className="flex flex-col gap-1.5 border-0 p-0">
      <legend className="mb-1.5 font-medium text-sm">{label}</legend>
      <div className="grid w-fit grid-cols-3 gap-1 border border-border bg-muted p-1">
        {OVERLAY_POSITIONS.map((pos) => (
          <button
            aria-label={t(OVERLAY_POSITION_I18N_KEYS[pos])}
            aria-pressed={value === pos}
            className={cn(
              "size-7 border border-transparent transition-colors",
              value === pos
                ? "border-primary bg-primary"
                : "bg-background hover:border-primary/50"
            )}
            key={pos}
            onClick={() => onChange(pos)}
            title={t(OVERLAY_POSITION_I18N_KEYS[pos])}
            type="button"
          >
            <span aria-hidden="true" className="block size-full" />
          </button>
        ))}
      </div>
    </fieldset>
  );
}
