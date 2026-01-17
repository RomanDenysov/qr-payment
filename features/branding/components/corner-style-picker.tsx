"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type CornerStyle = "square" | "rounded" | "dots";

type CornerStylePickerProps = {
  value: CornerStyle;
  onChange: (value: CornerStyle) => void;
};

const styles: { value: CornerStyle; label: string }[] = [
  { value: "square", label: "Štvorec" },
  { value: "rounded", label: "Zaoblené" },
  { value: "dots", label: "Bodky" },
];

function CornerPreview({ style }: { style: CornerStyle }) {
  const base = "size-4 bg-foreground";
  switch (style) {
    case "square":
      return <div className={cn(base, "rounded-none")} />;
    case "rounded":
      return <div className={cn(base, "rounded-sm")} />;
    case "dots":
      return <div className={cn(base, "rounded-full")} />;
  }
}

export function CornerStylePicker({ value, onChange }: CornerStylePickerProps) {
  return (
    <div className="space-y-2">
      <Label>Štýl rohov</Label>
      <div className="flex gap-2">
        {styles.map((style) => (
          <button
            className={cn(
              "flex flex-col items-center gap-1 rounded-md border p-3 transition-colors",
              value === style.value
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            )}
            key={style.value}
            onClick={() => onChange(style.value)}
            type="button"
          >
            <CornerPreview style={style.value} />
            <span className="text-xs">{style.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
