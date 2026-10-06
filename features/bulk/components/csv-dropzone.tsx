"use client";

import { IconFileTypeCsv } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { FileDropzone } from "@/components/file-dropzone";

const MAX_FILE_SIZE = 1024 * 1024; // 1 MB

interface CsvDropzoneProps {
  onFile: (file: File) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
}

export function CsvDropzone({ onFile, onError, disabled }: CsvDropzoneProps) {
  const t = useTranslations("Bulk");

  const handleFile = (file: File | undefined) => {
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
  };

  return (
    <FileDropzone
      accept=".csv,text/csv"
      description={t("uploadDescription")}
      disabled={disabled}
      icon={<IconFileTypeCsv className="size-8" />}
      onFile={handleFile}
      title={t("uploadTitle")}
    />
  );
}
