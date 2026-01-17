"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type FramePosition = "top" | "bottom";

type FrameValue = {
  enabled: boolean;
  text: string;
  position: FramePosition;
};

type FrameEditorProps = {
  value?: FrameValue;
  onChange: (value: FrameValue | undefined) => void;
};

const positions: { value: FramePosition; label: string }[] = [
  { value: "top", label: "Hore" },
  { value: "bottom", label: "Dole" },
];

export function FrameEditor({ value, onChange }: FrameEditorProps) {
  const frameValue = value ?? {
    enabled: false,
    text: "",
    position: "bottom" as const,
  };
  const charCount = frameValue.text.length;
  const isOverLimit = charCount > 40;

  const handleToggle = (enabled: boolean) => {
    if (enabled) {
      onChange({
        enabled: true,
        text: frameValue.text,
        position: frameValue.position,
      });
    } else {
      onChange(undefined);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Rámček s textom</Label>
        <Switch checked={frameValue.enabled} onCheckedChange={handleToggle} />
      </div>

      {frameValue.enabled === true && (
        <>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Text</Label>
              <span
                className={cn(
                  "text-xs",
                  isOverLimit ? "text-destructive" : "text-muted-foreground"
                )}
              >
                {charCount}/40
              </span>
            </div>
            <Input
              onChange={(e) =>
                onChange({ ...frameValue, text: e.target.value })
              }
              placeholder="Naskenujte pre platbu"
              value={frameValue.text}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Pozícia</Label>
            <div className="flex gap-2">
              {positions.map((pos) => (
                <button
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-xs transition-colors",
                    frameValue.position === pos.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                  key={pos.value}
                  onClick={() =>
                    onChange({ ...frameValue, position: pos.value })
                  }
                  type="button"
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
