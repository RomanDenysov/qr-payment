"use client";

import { IconAlertTriangle, IconDownload } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useDeferredValue, useEffect, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { PaymentFormData } from "@/features/payment/schema";
import { renderStudioQR } from "../qr-renderer";
import type { StudioConfig } from "../types";

interface Props {
  config: StudioConfig;
  payment: PaymentFormData | null;
}

export function StudioPreview({ config, payment }: Props) {
  const deferredConfig = useDeferredValue(config);
  const deferredPayment = useDeferredValue(payment);
  const t = useTranslations("Studio");
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!deferredPayment) {
      setDataUrl(null);
      setError(null);
      return;
    }

    let cancelled = false;
    renderStudioQR(deferredPayment, deferredConfig)
      .then((url) => {
        if (!cancelled) {
          setDataUrl(url);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setDataUrl(null);
          setError(err instanceof Error ? err.message : "render error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [deferredConfig, deferredPayment]);

  const handleDownload = () => {
    if (!dataUrl) {
      return;
    }
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `qr-studio-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success(t("downloaded"));
  };

  return (
    <div className="sticky top-20 flex flex-col gap-3 border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-sm">{t("preview")}</h2>
        <Button
          disabled={!dataUrl}
          onClick={handleDownload}
          size="sm"
          variant="outline"
        >
          <IconDownload />
          {t("downloadPng")}
        </Button>
      </div>

      <div className="flex aspect-square w-full items-center justify-center border border-border bg-muted">
        {dataUrl ? (
          // biome-ignore lint/performance/noImgElement: data URI from in-memory canvas
          // biome-ignore lint/correctness/useImageSize: size set via className
          <img
            alt={t("preview")}
            className="h-full w-full object-contain"
            src={dataUrl}
          />
        ) : (
          <span className="text-muted-foreground text-xs">
            {payment ? "..." : t("previewEmpty")}
          </span>
        )}
      </div>

      {error && (
        <Alert>
          <IconAlertTriangle className="size-5" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
