"use client";

import { useTranslations } from "next-intl";
import { Field, FieldLabel } from "@/components/ui/field";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ColorPicker } from "@/features/customizer/components/color-picker";
import type { Fill } from "../../types";

interface GradientEditorProps {
  label: string;
  value: Fill;
  onChange: (fill: Fill) => void;
  contrastWith?: string;
}

type Kind = "solid" | "linear" | "radial";

export function GradientEditor({
  label,
  value,
  onChange,
  contrastWith,
}: GradientEditorProps) {
  const t = useTranslations("Studio");

  const kind: Kind = value.kind;

  const handleKindChange = (k: Kind) => {
    if (k === "solid") {
      onChange({
        kind: "solid",
        color: value.kind === "solid" ? value.color : value.from,
      });
      return;
    }
    const from = value.kind === "solid" ? value.color : value.from;
    const to = value.kind === "solid" ? "#ffffff" : value.to;
    const rotation = value.kind === "solid" ? 0 : value.rotation;
    onChange({ kind: k, from, to, rotation });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-sm">{label}</span>
        <SegmentedControl<Kind>
          onChange={handleKindChange}
          options={[
            { value: "solid", label: t("fillSolid") },
            { value: "linear", label: t("fillLinear") },
            { value: "radial", label: t("fillRadial") },
          ]}
          value={kind}
        />
      </div>

      {value.kind === "solid" && (
        <ColorPicker
          contrastWith={contrastWith}
          label={t("gradientFrom")}
          onChange={(color) => onChange({ kind: "solid", color })}
          value={value.color}
        />
      )}

      {value.kind !== "solid" && (
        <>
          <ColorPicker
            label={t("gradientFrom")}
            onChange={(from) => onChange({ ...value, from })}
            value={value.from}
          />
          <ColorPicker
            label={t("gradientTo")}
            onChange={(to) => onChange({ ...value, to })}
            value={value.to}
          />
          {value.kind === "linear" && (
            <Field>
              <FieldLabel className="flex items-center justify-between">
                <span>{t("gradientRotation")}</span>
                <span className="font-mono text-muted-foreground text-xs">
                  {value.rotation}°
                </span>
              </FieldLabel>
              <input
                className="w-full accent-primary"
                max={360}
                min={0}
                onChange={(e) =>
                  onChange({ ...value, rotation: Number(e.target.value) })
                }
                step={5}
                type="range"
                value={value.rotation}
              />
            </Field>
          )}
        </>
      )}
    </div>
  );
}
