"use client";

import { IconCopy, IconDownload, IconShare } from "@tabler/icons-react";
import { track } from "@vercel/analytics";
import Image from "next/image";
import { useTranslations } from "next-intl";
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
import { BrandingDialog } from "@/features/branding/components/branding-dialog";
import { useBrandingConfig } from "@/features/branding/store";
import { maskIban } from "@/lib/utils";
import { generatePaymentQR, InvalidIBANError } from "../qr-generator";
import type { PaymentRecord } from "../schema";
import { useCurrentPayment, usePaymentActions } from "../store";
import { ShareLinkDialog } from "./share-link-dialog";

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
      <Badge variant="secondary">{paymentDetails.amount.toFixed(2)} EUR</Badge>
      <FormatBadges payment={paymentDetails} />
    </div>
  );
}

export function QRPreviewCard() {
  const current = useCurrentPayment();
  const { setCurrent } = usePaymentActions();
  const branding = useBrandingConfig();
  const t = useTranslations("QRPreview");

  const handleApplyBranding = async () => {
    if (!current) {
      return;
    }
    try {
      const qrDataUrl = await generatePaymentQR(current, branding);
      setCurrent({ ...current, qrDataUrl });
      track("qr_branding_applied");
    } catch (error) {
      const message =
        error instanceof InvalidIBANError
          ? error.message
          : t("regenerateFailed");
      toast.error(message);
    }
  };

  const handleDownload = () => {
    if (!current?.qrDataUrl) {
      return;
    }

    const link = document.createElement("a");
    link.href = current.qrDataUrl;
    link.download = `qr-payment-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    track("qr_downloaded");
    toast.success(t("downloaded"));
  };

  const handleCopy = async () => {
    if (!current?.qrDataUrl) {
      return;
    }

    try {
      const response = await fetch(current.qrDataUrl);
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
  };

  const handleShare = async () => {
    if (!(current?.qrDataUrl && navigator.share)) {
      handleCopy();
      return;
    }

    try {
      const response = await fetch(current.qrDataUrl);
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
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t("title")}</CardTitle>
          {current?.qrDataUrl ? (
            <BrandingDialog onApply={handleApplyBranding} />
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="flex h-full grow flex-col items-center justify-center">
        {current?.qrDataUrl ? (
          <>
            <Image
              alt="QR payment code"
              className="mb-4 w-full max-w-96 rounded-none"
              height={384}
              src={current.qrDataUrl}
              width={384}
            />
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
            onClick={handleDownload}
            variant="outline"
          >
            <IconDownload />
            {t("download")}
          </Button>
          <Button className="sm:flex-1" onClick={handleShare} variant="outline">
            <IconShare />
            {t("share")}
          </Button>
          <Button className="sm:flex-1" onClick={handleCopy} variant="outline">
            <IconCopy />
            {t("copy")}
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
}
