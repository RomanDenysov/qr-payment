"use client";

import { IconFileTypeCsv, IconUpload } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 1024 * 1024; // 1 MB

interface CsvDropzoneProps {
  onFile: (file: File) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
}

export function CsvDropzone({ onFile, onError, disabled }: CsvDropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("Bulk");

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file) {
        return;
      }
      if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
        onError?.(t("csvOnly"));
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        onError?.(t("fileTooLarge"));
        return;
      }
      onFile(file);
    },
    [onFile, onError, t]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      handleFile(e.dataTransfer.files[0]);
    },
    [handleFile]
  );

  return (
    <button
      className={cn(
        "flex w-full cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed p-8 transition-colors",
        dragging
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-muted-foreground/50",
        disabled && "pointer-events-none opacity-50"
      )}
      onClick={() => inputRef.current?.click()}
      onDragLeave={() => setDragging(false)}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDrop={handleDrop}
      type="button"
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <IconFileTypeCsv className="size-8" />
        <IconUpload className="size-5" />
      </div>
      <div className="text-center text-sm">
        <p className="font-medium">{t("uploadTitle")}</p>
        <p className="text-muted-foreground text-xs">
          {t("uploadDescription")}
        </p>
      </div>
      <input
        accept=".csv,text/csv"
        className="hidden"
        disabled={disabled}
        onChange={(e) => handleFile(e.target.files?.[0])}
        ref={inputRef}
        type="file"
      />
    </button>
  );
}
