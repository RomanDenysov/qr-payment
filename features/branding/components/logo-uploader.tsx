"use client";

import { IconPhoto, IconTrash } from "@tabler/icons-react";
import { useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { resizeImage } from "../utils";

type LogoUploaderProps = {
  value?: { data: string; size: number };
  onChange: (value: { data: string; size: number } | undefined) => void;
};

export function LogoUploader({ value, onChange }: LogoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const result = await resizeImage(file);
    if (result.success) {
      onChange({ data: result.data, size: 15 });
    } else {
      toast.error(result.error);
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <Label>Logo (voliteľné)</Label>
      <input
        accept="image/png,image/jpeg,image/svg+xml"
        className="hidden"
        onChange={handleFileChange}
        ref={inputRef}
        type="file"
      />

      {value ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex size-16 items-center justify-center rounded-md border bg-muted">
              {/* biome-ignore lint/performance/noImgElement: base64 data URL not compatible with Next Image */}
              {/* biome-ignore lint/correctness/useImageSize: dimensions controlled by container */}
              <img
                alt="Logo"
                className="max-h-14 max-w-14 object-contain"
                src={value.data}
              />
            </div>
            <Button
              onClick={() => onChange(undefined)}
              size="sm"
              type="button"
              variant="destructive"
            >
              <IconTrash className="size-4" />
              Odstrániť
            </Button>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Veľkosť: {value.size}%</Label>
            <Slider
              max={20}
              min={10}
              onValueChange={([size]) => onChange({ ...value, size })}
              step={1}
              value={[value.size]}
            />
          </div>
        </div>
      ) : (
        <Button
          className="w-full"
          onClick={() => inputRef.current?.click()}
          type="button"
          variant="outline"
        >
          <IconPhoto className="size-4" />
          Nahrať logo
        </Button>
      )}
    </div>
  );
}
