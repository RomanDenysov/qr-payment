"use client";

import { IconDownload } from "@tabler/icons-react";
import { track } from "@vercel/analytics";
import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { parseCsv } from "../csv-parser";
import { useBulkActions } from "../store";
import { CsvDropzone } from "./csv-dropzone";
import { downloadSampleCsv } from "./sample-csv";

export function BulkUploadSection() {
  const { setRows, setDetectedFormat, setError, setResults } = useBulkActions();
  const t = useTranslations("Bulk");

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setResults(null);
      try {
        const parsed = await parseCsv(file);
        setRows(parsed);
        if (parsed.length > 0) {
          setDetectedFormat(parsed[0].row.format);
          track("bulk_csv_uploaded", {
            count: parsed.length,
            format: parsed[0].row.format,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t("fileReadError"));
      }
    },
    [setRows, setDetectedFormat, setError, setResults, t]
  );

  return (
    <>
      <CsvDropzone onError={setError} onFile={handleFile} />
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        <IconDownload className="size-3.5" />
        <span>{t("downloadSample")}</span>
        <button
          className="underline underline-offset-2 hover:text-foreground"
          onClick={() => {
            downloadSampleCsv("bysquare");
            track("bulk_sample_csv_downloaded", { format: "bysquare" });
          }}
          type="button"
        >
          PAY by square
        </button>
        <span>/</span>
        <button
          className="underline underline-offset-2 hover:text-foreground"
          onClick={() => {
            downloadSampleCsv("epc");
            track("bulk_sample_csv_downloaded", { format: "epc" });
          }}
          type="button"
        >
          EPC QR
        </button>
      </div>
    </>
  );
}
