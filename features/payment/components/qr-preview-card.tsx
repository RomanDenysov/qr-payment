"use client";

import { IconCopy, IconDownload, IconShare } from "@tabler/icons-react";
import { track } from "@vercel/analytics";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { renderCustomizerQR } from "@/features/customizer/renderer";
import { useCustomizerConfig } from "@/features/customizer/store";
import { formatAmount, maskIban } from "@/lib/utils";
import { InvalidIBANError } from "../qr-generator";
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

export function QRPreviewCard() {
  const current = useCurrentPayment();
  const { setCurrent } = usePaymentActions();
  const customizer = useCustomizerConfig();
  const t = useTranslations("QRPreview");
  const cardRef = useRef<HTMLDivElement>(null);
  const prevQrRef = useRef<string | undefined>(undefined);
  const [downloadPending, startDownload] = useTransition();
  const [copyPending, startCopy] = useTransition();
  const [sharePending, startShare] = useTransition();

  useEffect(() => {
    if (current?.qrDataUrl && current.qrDataUrl !== prevQrRef.current) {
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    prevQrRef.current = current?.qrDataUrl;
  }, [current?.qrDataUrl]);

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
    startDownload(() => {
      try {
        const link = document.createElement("a");
        link.href = qrDataUrl;
        link.download = `qr-payment-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        track("qr_downloaded");
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
    startCopy(async () => {
      try {
        const response = await fetch(qrDataUrl);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        track("qr_copied");
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
    startShare(async () => {
      try {
        const response = await fetch(qrDataUrl);
        const blob = await response.blob();
        const file = new File([blob], "qr-payment.png", {
          type: "image/png",
        });
        await navigator.share({
          files: [file],
          title: t("shareTitle"),
        });
        track("qr_shared");
        toast.success(t("shared"));
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          handleCopy();
        }
      }
    });
  };

  return (
    <Card ref={cardRef}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t("title")}</CardTitle>
          {current?.qrDataUrl ? (
            <CustomizerSheet onApply={handleApplyBranding} />
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="flex h-full grow flex-col items-center justify-center">
        {current?.qrDataUrl ? (
          <>
            <div
              className="mb-4 w-full max-w-96 motion-safe:animate-qr-reveal"
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
        <CardFooter className="mt-auto grid grid-cols-2 gap-2 sm:flex">
          <ShareLinkDialog payment={current} />
          <Button
            className="col-span-2 sm:col-span-1 sm:flex-1"
            isPending={downloadPending}
            onClick={handleDownload}
            variant="outline"
          >
            {downloadPending ? null : <IconDownload />}
            {t("download")}
          </Button>
          <Button
            className="sm:flex-1"
            isPending={sharePending}
            onClick={handleShare}
            variant="outline"
          >
            {sharePending ? null : <IconShare />}
            {t("share")}
          </Button>
          <Button
            className="sm:flex-1"
            isPending={copyPending}
            onClick={handleCopy}
            variant="outline"
          >
            {copyPending ? null : <IconCopy />}
            {t("copy")}
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
}
