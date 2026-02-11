"use client";

import {
  IconDownload,
  IconFileTypePdf,
  IconFileZip,
  IconTrash,
} from "@tabler/icons-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useBrandingConfig } from "@/features/branding/store";
import type { PaymentFormat } from "@/features/payment/format";
import { FORMAT_LABELS } from "@/features/payment/format";
import type { GeneratedQR } from "../bulk-generator";
import { generateBulkQR } from "../bulk-generator";
import type { ParsedRow } from "../csv-parser";
import { parseCsv } from "../csv-parser";
import { exportPdf } from "../export-pdf";
import { exportZip } from "../export-zip";
import { CsvDropzone } from "./csv-dropzone";
import { PreviewTable } from "./preview-table";
import { downloadSampleCsv } from "./sample-csv";

export function BulkPage() {
  const branding = useBrandingConfig();

  const [rows, setRows] = useState<ParsedRow[] | null>(null);
  const [detectedFormat, setDetectedFormat] =
    useState<PaymentFormat>("bysquare");
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<GeneratedQR[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validRows = rows?.filter((r) => r.valid) ?? [];

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setResults(null);
    try {
      const parsed = await parseCsv(file);
      setRows(parsed);
      if (parsed.length > 0) {
        setDetectedFormat(parsed[0].row.format);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chyba pri čítaní súboru");
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!validRows.length) {
      return;
    }

    setGenerating(true);
    setProgress({ current: 0, total: validRows.length });

    try {
      const qrs = await generateBulkQR(
        validRows.map((r) => r.row),
        branding,
        (p) => setProgress(p)
      );
      setResults(qrs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chyba pri generovaní");
    } finally {
      setGenerating(false);
    }
  }, [validRows, branding]);

  const handleReset = useCallback(() => {
    setRows(null);
    setResults(null);
    setError(null);
    setProgress({ current: 0, total: 0 });
  }, []);

  const progressPercent =
    progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  return (
    <main className="flex-1 pt-5 sm:pt-8 md:pt-16">
      <div className="mx-auto max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Hromadné generovanie QR kódov</CardTitle>
            <CardDescription>
              Nahrajte CSV súbor s platobnými údajmi a vygenerujte QR kódy
              naraz.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!rows && (
              <>
                <CsvDropzone onError={setError} onFile={handleFile} />
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <IconDownload className="size-3.5" />
                  <span>Stiahnuť vzorový CSV:</span>
                  <button
                    className="underline underline-offset-2 hover:text-foreground"
                    onClick={() => downloadSampleCsv("bysquare")}
                    type="button"
                  >
                    PAY by square
                  </button>
                  <span>/</span>
                  <button
                    className="underline underline-offset-2 hover:text-foreground"
                    onClick={() => downloadSampleCsv("epc")}
                    type="button"
                  >
                    EPC QR
                  </button>
                </div>
              </>
            )}

            {error && (
              <div className="border border-destructive/50 bg-destructive/10 p-3 text-destructive text-sm">
                {error}
              </div>
            )}

            {rows && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">
                    Formát:{" "}
                    <span className="font-medium text-foreground">
                      {FORMAT_LABELS[detectedFormat]}
                    </span>
                  </span>
                  <Button onClick={handleReset} size="sm" variant="ghost">
                    <IconTrash className="size-3.5" />
                    Vymazať
                  </Button>
                </div>

                <PreviewTable rows={rows} />

                {generating && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-muted-foreground text-xs">
                      <span>Generujem QR kódy...</span>
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
                    Generovať {validRows.length} QR{" "}
                    {validRows.length === 1 ? "kód" : "kódov"}
                  </Button>
                )}

                {results && (
                  <div className="space-y-3">
                    <p className="text-green-600 text-sm dark:text-green-400">
                      Vygenerovaných {results.length} QR kódov
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={async () => {
                          try {
                            await exportZip(results);
                          } catch {
                            setError("Chyba pri exporte ZIP");
                          }
                        }}
                        variant="outline"
                      >
                        <IconFileZip className="size-4" />
                        Stiahnuť ZIP
                      </Button>
                      <Button
                        onClick={() => {
                          try {
                            exportPdf(results);
                          } catch {
                            setError("Chyba pri exporte PDF");
                          }
                        }}
                        variant="outline"
                      >
                        <IconFileTypePdf className="size-4" />
                        Stiahnuť PDF
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
