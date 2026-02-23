"use client";

import { IconTrash } from "@tabler/icons-react";
import { track } from "@vercel/analytics";
import { useTranslations } from "next-intl";
import { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { useBrandingConfig } from "@/features/branding/store";
import { FORMAT_LABELS } from "@/features/payment/format";
import { Link } from "@/i18n/navigation";
import { generateBulkQR } from "../bulk-generator";
import {
  useBulkActions,
  useBulkDetectedFormat,
  useBulkError,
  useBulkGenerating,
  useBulkProgress,
  useBulkResults,
  useBulkRows,
} from "../store";
import { BulkResultsSection } from "./bulk-results-section";
import { BulkUploadSection } from "./bulk-upload-section";
import { PreviewTable } from "./preview-table";

export function BulkPage() {
  const branding = useBrandingConfig();
  const rows = useBulkRows();
  const detectedFormat = useBulkDetectedFormat();
  const generating = useBulkGenerating();
  const progress = useBulkProgress();
  const results = useBulkResults();
  const error = useBulkError();
  const t = useTranslations("Bulk");
  const tMeta = useTranslations("Metadata");
  const {
    setResults,
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
      const qrs = await generateBulkQR(
        validRows.map((r) => r.row),
        branding,
        (p) => updateProgress(p.current)
      );
      setResults(qrs);
      track("bulk_qr_generated", { count: qrs.length, format: detectedFormat });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chyba pri generovani");
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
    setError,
    finishGenerating,
  ]);

  const progressPercent =
    progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  return (
    <div className="flex-1 pt-5 sm:pt-8 md:pt-16">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="font-bold font-pixel text-foreground text-lg tracking-wide sm:text-xl">
          {t("title")}
        </h1>
        <Card>
          <CardHeader>
            <CardDescription>{t("description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!rows && <BulkUploadSection />}

            {error && (
              <div className="border border-destructive/50 bg-destructive/10 p-3 text-destructive text-sm">
                {error}
              </div>
            )}

            {rows && (
              <>
                <div className="flex items-center justify-between">
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
                    disabled={validRows.length === 0}
                    onClick={handleGenerate}
                  >
                    {t("generate", { count: validRows.length })}
                  </Button>
                )}

                <BulkResultsSection />
              </>
            )}
          </CardContent>
        </Card>
        <div className="pt-4 text-center">
          <Link
            className="text-foreground text-xs underline underline-offset-4 hover:text-primary"
            href="/"
          >
            ← {tMeta("backToHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
