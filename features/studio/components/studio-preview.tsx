"use client";

import {
  IconAlertTriangle,
  IconCircleCheck,
  IconDownload,
  IconLoader2,
} from "@tabler/icons-react";
import { track } from "@vercel/analytics";
import { CurrencyCode } from "bysquare";
import { electronicFormatIBAN, isValidIBAN } from "ibantools";
import { useTranslations } from "next-intl";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { PageSpinner } from "@/components/page-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { renderCustomizerQR } from "@/features/customizer/renderer";
import { validateScannability } from "@/features/customizer/scannability";
import {
  type CustomizerConfig,
  DOWNLOAD_SIZE_PX,
} from "@/features/customizer/types";
import { buildQrPayload } from "@/features/payment/qr-payload";
import { resizePngDataUrl } from "@/features/payment/resize-qr";
import type { PaymentFormData } from "@/features/payment/schema";

interface Props {
  config: CustomizerConfig;
  payment: PaymentFormData | null;
}

type ScanState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "ok" }
  | { status: "at-risk"; reason: "decode_failed" | "payload_mismatch" };

function buildExpectedPayload(data: PaymentFormData): string | null {
  const cleanIban = electronicFormatIBAN(data.iban);
  if (!(cleanIban && isValidIBAN(cleanIban))) {
    return null;
  }
  const currency =
    data.currency === "CZK" ? CurrencyCode.CZK : CurrencyCode.EUR;
  const { payload } = buildQrPayload(data, cleanIban, currency);
  return payload;
}

function scanStateKey(state: ScanState): string {
  return state.status === "at-risk" ? `at-risk:${state.reason}` : state.status;
}

function trackScanTransition(
  state: ScanState,
  lastKey: { current: string | null }
): void {
  if (state.status !== "ok" && state.status !== "at-risk") {
    return;
  }
  const key = scanStateKey(state);
  if (lastKey.current === key) {
    return;
  }
  lastKey.current = key;
  track("qr_scannability_checked", {
    ok: state.status === "ok",
    reason: state.status === "at-risk" ? state.reason : null,
  });
}

async function runRenderAndScan(
  payment: PaymentFormData,
  config: CustomizerConfig
): Promise<{ url: string; scan: ScanState }> {
  const url = await renderCustomizerQR(payment, config);
  const expected = buildExpectedPayload(payment);
  if (!expected) {
    return { url, scan: { status: "idle" } };
  }
  const result = await validateScannability(url, expected);
  const scan: ScanState = result.ok
    ? { status: "ok" }
    : { status: "at-risk", reason: result.reason };
  return { url, scan };
}

export function StudioPreview({ config, payment }: Props) {
  const deferredConfig = useDeferredValue(config);
  const deferredPayment = useDeferredValue(payment);
  const t = useTranslations("Studio");
  const tQr = useTranslations("QRPreview");
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scan, setScan] = useState<ScanState>({ status: "idle" });
  const lastTrackedKey = useRef<string | null>(null);

  useEffect(() => {
    if (!deferredPayment) {
      setDataUrl(null);
      setError(null);
      setScan({ status: "idle" });
      return;
    }

    let cancelled = false;
    setScan({ status: "checking" });

    runRenderAndScan(deferredPayment, deferredConfig)
      .then(({ url, scan: nextScan }) => {
        if (cancelled) {
          return;
        }
        setDataUrl(url);
        setError(null);
        setScan(nextScan);
        trackScanTransition(nextScan, lastTrackedKey);
      })
      .catch((err) => {
        if (cancelled) {
          return;
        }
        setDataUrl(null);
        setError(err instanceof Error ? err.message : "render error");
        setScan({ status: "idle" });
      });

    return () => {
      cancelled = true;
    };
  }, [deferredConfig, deferredPayment]);

  const handleDownload = async () => {
    if (!dataUrl) {
      return;
    }
    const size = config.downloadSize;
    const targetPx = DOWNLOAD_SIZE_PX[size];
    try {
      const resized = await resizePngDataUrl(dataUrl, targetPx);
      const link = document.createElement("a");
      link.href = resized;
      link.download = `qr-studio-${targetPx}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      track("qr_downloaded", { size, source: "studio" });
      toast.success(t("downloaded"));
    } catch (err) {
      console.error("[StudioPreview] Failed to download QR image:", err);
      toast.error(tQr("downloadFailed"));
    }
  };

  return (
    <div className="flex flex-col gap-3 border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="font-medium text-sm">{t("preview")}</h2>
          <ScanBadge state={scan} />
        </div>
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
        {dataUrl && (
          // biome-ignore lint/performance/noImgElement: data URI from in-memory canvas
          // biome-ignore lint/correctness/useImageSize: size set via className
          <img
            alt={t("preview")}
            className="h-full w-full object-contain"
            src={dataUrl}
          />
        )}
        {!dataUrl && payment && (
          <PageSpinner cellClassName="size-3" className="min-h-0" />
        )}
        {!(dataUrl || payment) && (
          <span className="text-muted-foreground text-xs">
            {t("previewEmpty")}
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

function ScanBadge({ state }: { state: ScanState }) {
  const t = useTranslations("Studio.scanBadge");

  if (state.status === "idle") {
    return null;
  }

  if (state.status === "checking") {
    return (
      <span
        className="inline-flex items-center gap-1 border border-border bg-muted px-1.5 py-0.5 text-muted-foreground text-xs"
        title={t("checking")}
      >
        <IconLoader2 className="size-3 animate-spin" />
        {t("checking")}
      </span>
    );
  }

  if (state.status === "ok") {
    return (
      <span
        className="inline-flex items-center gap-1 border border-emerald-600/30 bg-emerald-600/10 px-1.5 py-0.5 text-emerald-700 text-xs dark:text-emerald-400"
        title={t("tooltipOk")}
      >
        <IconCircleCheck className="size-3" />
        {t("ok")}
      </span>
    );
  }

  const tooltip =
    state.reason === "decode_failed"
      ? t("tooltipDecodeFailed")
      : t("tooltipMismatch");
  return (
    <span
      className="inline-flex items-center gap-1 border border-destructive/30 bg-destructive/10 px-1.5 py-0.5 text-destructive text-xs"
      title={tooltip}
    >
      <IconAlertTriangle className="size-3" />
      {t("atRisk")}
    </span>
  );
}
