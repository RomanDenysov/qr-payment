"use client";

import { IconTrash } from "@tabler/icons-react";
import { track } from "@vercel/analytics";
import { useTranslations } from "next-intl";
import { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useBrandingConfig } from "@/features/branding/store";
import { FORMAT_LABELS } from "@/features/payment/format";
import { generateBulkQR } from "../bulk-generator";
import {
  useBulkActions,
  useBulkDetectedFormat,
  useBulkError,
  useBulkErrors,
  useBulkGenerating,
  useBulkProgress,
  useBulkResults,
  useBulkRows,
} from "../store";
import { BulkResultsSection } from "./bulk-results-section";
import { BulkUploadSection } from "./bulk-upload-section";
import { PreviewTable } from "./preview-table";

export function BulkContent() {
  const branding = useBrandingConfig();
  const rows = useBulkRows();
  const detectedFormat = useBulkDetectedFormat();
  const generating = useBulkGenerating();
  const progress = useBulkProgress();
  const results = useBulkResults();
  const rowErrors = useBulkErrors();
  const error = useBulkError();
  const t = useTranslations("Bulk");
  const {
    setResults,
    setErrors,
    setError,
    startGenerating,
    updateProgress,
    finishGenerating,
    reset,
  } = useBulkActions();

  const validRows = useMemo(() => rows?.filter((r) => r.valid) ?? [], [rows]);

  const handleGenerate = useCallback(async () => {
    if (!validRows.length) {
      return;
    }

    startGenerating(validRows.length);

    try {
      const { results: qrs, errors: qrErrors } = await generateBulkQR(
        validRows.map((r) => r.row),
        branding,
        (p) => updateProgress(p.current)
      );
      setResults(qrs);
      if (qrErrors.length > 0) {
        setErrors(qrErrors);
      }
      track("bulk_qr_generated", {
        count: qrs.length,
        errors: qrErrors.length,
        format: detectedFormat,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("generateError"));
    } finally {
      finishGenerating();
    }
  }, [
    validRows,
    branding,
    detectedFormat,
    startGenerating,
    updateProgress,
    setResults,
    setErrors,
    setError,
    finishGenerating,
    t,
  ]);

  const progressPercent =
    progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  return (
    <>
      {!rows && <BulkUploadSection />}

      {error && (
        <div className="border border-destructive/50 bg-destructive/10 p-3 text-destructive text-sm">
          {error}
        </div>
      )}

      {rows && (
        <>
          <div className="flex items-center justify-between print:hidden">
            <span className="text-muted-foreground text-xs">
              {t("format")}{" "}
              <span className="font-medium text-foreground">
                {FORMAT_LABELS[detectedFormat]}
              </span>
            </span>
            <Button onClick={reset} size="sm" variant="ghost">
              <IconTrash className="size-3.5" />
              {t("clear")}
            </Button>
          </div>

          <PreviewTable rows={rows} />

          {generating && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-muted-foreground text-xs">
                <span>{t("generating")}</span>
                <span>
                  {progress.current}/{progress.total} ({progressPercent}%)
                </span>
              </div>
              <div className="h-2 overflow-hidden bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-200"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {!(results || generating) && (
            <Button
              className="w-full sm:w-auto"
              disabled={validRows.length === 0}
              onClick={handleGenerate}
            >
              {t("generate", { count: validRows.length })}
            </Button>
          )}

          <BulkResultsSection />

          {rowErrors && rowErrors.length > 0 && (
            <div className="border border-amber-500/50 bg-amber-500/10 p-3 text-amber-700 text-sm dark:text-amber-400">
              <p className="mb-2 font-medium">
                {t("generationErrors", { count: rowErrors.length })}
              </p>
              <ul className="space-y-1 text-xs">
                {rowErrors.slice(0, 5).map((err) => (
                  <li key={err.rowNumber}>
                    {t("rowError", {
                      row: err.rowNumber,
                      iban: err.iban,
                      error: err.error,
                    })}
                  </li>
                ))}
                {rowErrors.length > 5 && (
                  <li>
                    {t("moreErrors", {
                      count: rowErrors.length - 5,
                    })}
                  </li>
                )}
              </ul>
            </div>
          )}
        </>
      )}
    </>
  );
}
