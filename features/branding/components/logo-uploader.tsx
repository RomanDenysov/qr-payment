"use client";

import { IconPhoto, IconX } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { compressLogo } from "../compress-logo";

const ACCEPT = "image/png,image/jpeg,image/webp,image/svg+xml";

interface LogoUploaderProps {
  value: string | null;
  onChange: (logo: string | null) => void;
}

export function LogoUploader({ value, onChange }: LogoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("Branding");

  const handleFile = async (file: File) => {
    const result = await compressLogo(file);
    if (!result) {
      toast.error(t("logoTooLarge"));
      return;
    }
    onChange(result.data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    e.target.value = "";
  };

  if (value) {
    const isSvg = value.startsWith("<");
    const src = isSvg
      ? `data:image/svg+xml;utf8,${encodeURIComponent(value)}`
      : value;

    return (
      <div className="flex items-center gap-2">
        {/* biome-ignore lint/performance/noImgElement: data URI from localStorage, not a remote image */}
        {/* biome-ignore lint/correctness/useImageSize: size set via className */}
        <img
          alt="Logo"
          className="size-10 rounded border border-border object-contain"
          src={src}
        />
        <Button
          onClick={() => onChange(null)}
          size="icon-xs"
          type="button"
          variant="ghost"
        >
          <IconX />
        </Button>
      </div>
    );
  }

  return (
    <>
      <input
        accept={ACCEPT}
        className="hidden"
        onChange={handleChange}
        ref={inputRef}
        type="file"
      />
      <Button
        onClick={() => inputRef.current?.click()}
        size="sm"
        type="button"
        variant="outline"
      >
        <IconPhoto />
        {t("addLogo")}
      </Button>
    </>
  );
}
