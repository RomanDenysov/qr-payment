"use client";

import { IconFileTypePdf, IconFileZip, IconPrinter } from "@tabler/icons-react";
import { track } from "@vercel/analytics";
import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { maskIban } from "@/lib/utils";
import { exportPdf } from "../export-pdf";
import { exportZip } from "../export-zip";
import { useBulkActions, useBulkResults } from "../store";

export function BulkResultsSection() {
  const results = useBulkResults();
  const { setError } = useBulkActions();
  const t = useTranslations("Bulk");

  const handleExportZip = useCallback(() => {
    if (!results) {
      return;
    }
    try {
      exportZip(results);
      track("bulk_exported_zip", { count: results.length });
    } catch (err) {
      console.error("[BulkExport] ZIP failed:", err);
      setError(t("zipError"));
    }
  }, [results, setError, t]);

  const handleExportPdf = useCallback(async () => {
    if (!results) {
      return;
    }
    try {
      await exportPdf(results);
      track("bulk_exported_pdf", { count: results.length });
    } catch {
      setError(t("pdfError"));
    }
  }, [results, setError, t]);

  const handlePrint = useCallback(() => {
    if (!results) {
      return;
    }
    track("bulk_printed", { count: results.length });
    window.print();
  }, [results]);

  if (!results) {
    return null;
  }

  return (
    <div className="space-y-3">
      <p className="text-green-600 text-sm dark:text-green-400">
        {t("generated", { count: results.length })}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row print:hidden">
        <Button
          className="w-full sm:w-auto"
          onClick={handleExportZip}
          variant="outline"
        >
          <IconFileZip className="size-4" />
          {t("downloadZip")}
        </Button>
        <Button
          className="w-full sm:w-auto"
          onClick={handleExportPdf}
          variant="outline"
        >
          <IconFileTypePdf className="size-4" />
          {t("downloadPdf")}
        </Button>
        <Button
          className="w-full sm:w-auto"
          onClick={handlePrint}
          variant="outline"
        >
          <IconPrinter className="size-4" />
          {t("print")}
        </Button>
      </div>

      {/* Print-only grid of QR codes */}
      <div className="hidden print:block">
        <div className="print-qr-grid">
          {results.map((qr) => (
            <div className="print-qr-item" key={qr.rowNumber}>
              {/* biome-ignore lint/performance/noImgElement: data URLs don't benefit from next/image */}
              <img
                alt={`QR ${qr.rowNumber}`}
                height={160}
                src={qr.dataUrl}
                width={160}
              />
              <div className="print-qr-details">
                <span className="print-qr-iban">{maskIban(qr.iban)}</span>
                <span className="print-qr-amount">
                  {qr.amount.toFixed(2)} EUR
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
