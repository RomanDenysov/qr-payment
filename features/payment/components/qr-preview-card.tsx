"use client";

import {
  IconArrowRight,
  IconCopy,
  IconDownload,
  IconShare,
} from "@tabler/icons-react";
import { track } from "@vercel/analytics";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { renderCustomizerQR } from "@/features/customizer/renderer";
import { useCustomizerConfig } from "@/features/customizer/store";
import { DOWNLOAD_SIZE_PX } from "@/features/customizer/types";
import { formatAmount, maskIban } from "@/lib/utils";
import { InvalidIBANError } from "../qr-generator";
import { resizePngDataUrl, resizePngToBlob } from "../resize-qr";
import type { PaymentRecord } from "../schema";
import { useCurrentPayment, usePaymentActions } from "../store";

const ShareLinkDialog = dynamic(
  () => import("./share-link-dialog").then((m) => m.ShareLinkDialog),
  { loading: () => null }
);

const CustomizerSheet = dynamic(
  () =>
    import("@/features/customizer/components/customizer-sheet").then(
      (m) => m.CustomizerSheet
    ),
  { loading: () => null }
);

function FormatBadges({ payment }: { payment: PaymentRecord }) {
  const format = payment.format ?? "bysquare";

  if (format === "epc") {
    return payment.bic ? (
      <Badge variant="secondary">BIC: {payment.bic}</Badge>
    ) : null;
  }

  return (
    <>
      {payment.variableSymbol ? (
        <Badge variant="secondary">VS: {payment.variableSymbol}</Badge>
      ) : null}
      {payment.specificSymbol ? (
        <Badge variant="secondary">SS: {payment.specificSymbol}</Badge>
      ) : null}
      {payment.constantSymbol ? (
        <Badge variant="secondary">KS: {payment.constantSymbol}</Badge>
      ) : null}
    </>
  );
}

function PaymentDetails({ paymentDetails }: { paymentDetails: PaymentRecord }) {
  const format = paymentDetails.format ?? "bysquare";

  return (
    <div className="flex flex-wrap justify-center gap-1">
      {format === "epc" && <Badge variant="outline">EPC</Badge>}
      <Badge variant="secondary">{maskIban(paymentDetails.iban)}</Badge>
      {paymentDetails.amount ? (
        <Badge variant="secondary">
          {formatAmount(
            paymentDetails.amount,
            paymentDetails.currency ?? "EUR"
          )}
        </Badge>
      ) : null}
      <FormatBadges payment={paymentDetails} />
    </div>
  );
}

const NUDGE_STORAGE_KEY = "qrCustomizer.nudge.v1";

export function QRPreviewCard() {
  const current = useCurrentPayment();
  const { setCurrent } = usePaymentActions();
  const customizer = useCustomizerConfig();
  const t = useTranslations("QRPreview");
  const tBranding = useTranslations("Branding");
  const cardRef = useRef<HTMLDivElement>(null);
  const prevQrRef = useRef<string | undefined>(undefined);
  const [downloadPending, startDownload] = useTransition();
  const [copyPending, startCopy] = useTransition();
  const [sharePending, startShare] = useTransition();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [nudgeDismissed, setNudgeDismissed] = useState(true);
  const trackedNudgeRef = useRef(false);

  useEffect(() => {
    if (current?.qrDataUrl && current.qrDataUrl !== prevQrRef.current) {
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    prevQrRef.current = current?.qrDataUrl;
  }, [current?.qrDataUrl]);

  useEffect(() => {
    const stored = window.localStorage.getItem(NUDGE_STORAGE_KEY);
    setNudgeDismissed(stored === "dismissed");
  }, []);

  const nudgeVisible =
    Boolean(current?.qrDataUrl) && !customizer.logo && !nudgeDismissed;

  useEffect(() => {
    if (nudgeVisible && !trackedNudgeRef.current) {
      trackedNudgeRef.current = true;
      track("customizer_nudge_shown");
    }
  }, [nudgeVisible]);

  const dismissNudge = () => {
    window.localStorage.setItem(NUDGE_STORAGE_KEY, "dismissed");
    setNudgeDismissed(true);
  };

  const handleNudgeOpen = () => {
    dismissNudge();
    setSheetOpen(true);
    track("customizer_nudge_clicked");
  };

  const handleApplyBranding = async () => {
    if (!current) {
      return;
    }
    try {
      const qrDataUrl = await renderCustomizerQR(current, customizer);
      setCurrent({ ...current, qrDataUrl });
      track("qr_customizer_applied");
    } catch (error) {
      const message =
        error instanceof InvalidIBANError
          ? error.message
          : t("regenerateFailed");
      toast.error(message);
    }
  };

  const handleDownload = () => {
    const qrDataUrl = current?.qrDataUrl;
    if (!qrDataUrl) {
      return;
    }
    const size = customizer.downloadSize;
    const targetPx = DOWNLOAD_SIZE_PX[size];
    startDownload(async () => {
      try {
        const resized = await resizePngDataUrl(qrDataUrl, targetPx);
        const link = document.createElement("a");
        link.href = resized;
        link.download = `qr-payment-${targetPx}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        track("qr_downloaded", { size });
        toast.success(t("downloaded"));
      } catch (error) {
        console.error("[QRPreviewCard] Failed to download QR image:", error);
        toast.error(t("downloadFailed"));
      }
    });
  };

  const handleCopy = () => {
    const qrDataUrl = current?.qrDataUrl;
    if (!qrDataUrl) {
      return;
    }
    const size = customizer.downloadSize;
    const targetPx = DOWNLOAD_SIZE_PX[size];
    startCopy(async () => {
      try {
        const blob = await resizePngToBlob(qrDataUrl, targetPx);
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        track("qr_copied", { size });
        toast.success(t("copied"));
      } catch (error) {
        console.error("[QRPreviewCard] Failed to copy QR image:", error);
        toast.error(t("copyFailed"));
      }
    });
  };

  const handleShare = () => {
    const qrDataUrl = current?.qrDataUrl;
    if (!(qrDataUrl && navigator.share)) {
      handleCopy();
      return;
    }
    const size = customizer.downloadSize;
    const targetPx = DOWNLOAD_SIZE_PX[size];
    startShare(async () => {
      try {
        const blob = await resizePngToBlob(qrDataUrl, targetPx);
        const file = new File([blob], `qr-payment-${targetPx}.png`, {
          type: "image/png",
        });
        await navigator.share({
          files: [file],
          title: t("shareTitle"),
        });
        track("qr_shared", { size });
        toast.success(t("shared"));
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }
        console.error("[QRPreviewCard] Failed to share QR image:", error);
        toast.error(t("shareFailed"));
      }
    });
  };

  return (
    <Card className="py-0" ref={cardRef}>
      <CardHeader className="h-10 gap-0 border-b px-0">
        <CardTitle className="flex h-full grow items-center gap-2 border-r px-4 py-2">
          <span>{t("title")}</span>
          {nudgeVisible ? (
            <button
              className="motion-safe:fade-in-0 motion-safe:slide-in-from-right-1 ml-auto flex h-6 items-center gap-1 border border-border bg-background px-2 font-normal text-foreground text-xs hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-safe:animate-in"
              onClick={handleNudgeOpen}
              type="button"
            >
              {tBranding("nudgeAddLogo")}
              <IconArrowRight className="size-3.5" />
            </button>
          ) : null}
        </CardTitle>
        <CardAction>
          {current?.qrDataUrl ? (
            <CustomizerSheet
              onApply={handleApplyBranding}
              onOpenChange={setSheetOpen}
              open={sheetOpen}
            />
          ) : null}
        </CardAction>
      </CardHeader>
      <CardContent className="flex h-full grow flex-col items-center justify-center py-0 pb-0">
        {current?.qrDataUrl ? (
          <>
            <div
              className="mb-4 w-full grow motion-safe:animate-qr-reveal"
              key={current.qrDataUrl}
            >
              <Image
                alt="QR payment code"
                className="w-full rounded-none"
                height={384}
                src={current.qrDataUrl}
                width={384}
              />
            </div>
            <PaymentDetails paymentDetails={current} />
          </>
        ) : (
          <p className="m-auto w-full text-center text-muted-foreground text-xs">
            {t("placeholder")}
          </p>
        )}
      </CardContent>
      {current?.qrDataUrl ? (
        <CardFooter className="mt-auto grid grid-cols-2 divide-x divide-border p-0 sm:flex">
          <Button
            className="col-span-2 h-12 sm:col-span-1 sm:flex-1"
            isPending={downloadPending}
            onClick={handleDownload}
            variant="ghost"
          >
            {downloadPending ? null : <IconDownload />}
            {t("download")}
          </Button>
          <ShareLinkDialog payment={current} />
          <Button
            className="h-12 sm:flex-1"
            isPending={sharePending}
            onClick={handleShare}
            variant="ghost"
          >
            {sharePending ? null : <IconShare />}
            {t("share")}
          </Button>
          <Button
            className="h-12 sm:flex-1"
            isPending={copyPending}
            onClick={handleCopy}
            variant="ghost"
          >
            {copyPending ? null : <IconCopy />}
            {t("copy")}
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
}
