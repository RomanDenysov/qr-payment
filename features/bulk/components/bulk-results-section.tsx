"use client";

import { IconFileTypePdf, IconFileZip } from "@tabler/icons-react";
import { track } from "@vercel/analytics";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { exportPdf } from "../export-pdf";
import { exportZip } from "../export-zip";
import { useBulkActions, useBulkResults } from "../store";

export function BulkResultsSection() {
  const results = useBulkResults();
  const { setError } = useBulkActions();

  const handleExportZip = useCallback(async () => {
    if (!results) {
      return;
    }
    try {
      await exportZip(results);
      track("bulk_exported_zip", { count: results.length });
    } catch {
      setError("Chyba pri exporte ZIP");
    }
  }, [results, setError]);

  const handleExportPdf = useCallback(() => {
    if (!results) {
      return;
    }
    try {
      exportPdf(results);
      track("bulk_exported_pdf", { count: results.length });
    } catch {
      setError("Chyba pri exporte PDF");
    }
  }, [results, setError]);

  if (!results) {
    return null;
  }

  return (
    <div className="space-y-3">
      <p className="text-green-600 text-sm dark:text-green-400">
        Vygenerovaných {results.length} QR kódov
      </p>
      <div className="flex gap-2">
        <Button onClick={handleExportZip} variant="outline">
          <IconFileZip className="size-4" />
          Stiahnuť ZIP
        </Button>
        <Button onClick={handleExportPdf} variant="outline">
          <IconFileTypePdf className="size-4" />
          Stiahnuť PDF
        </Button>
      </div>
    </div>
  );
}
