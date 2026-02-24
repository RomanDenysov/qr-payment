"use client";

import { IconCopy, IconDownload } from "@tabler/icons-react";
import { track } from "@vercel/analytics";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import {
  generatePaymentQR,
  InvalidIBANError,
} from "@/features/payment/qr-generator";
import type { PaymentFormData } from "@/features/payment/schema";

interface ShareBranding {
  fgColor: string;
  bgColor: string;
  centerText: string;
}

interface Props {
  payment: PaymentFormData;
  branding: ShareBranding;
  children: ReactNode;
}

export function ShareQRSection({ payment, branding, children }: Props) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const t = useTranslations("QRPreview");

  useEffect(() => {
    track("share_page_viewed", {
      format: payment.format ?? "bysquare",
      has_amount: payment.amount > 0,
    });
  }, [payment.format, payment.amount]);

  useEffect(() => {
    generatePaymentQR(payment, {
      ...branding,
      logo: null,
    })
      .then(setQrDataUrl)
      .catch((error) => {
        const message =
          error instanceof InvalidIBANError
            ? error.message
            : t("generateFailed");
        console.error("[ShareQRSection] Failed to generate QR code", error, {
          format: payment.format ?? "bysquare",
        });
        toast.error(message);
      });
  }, [payment, branding, t]);

  const handleDownload = () => {
    if (!qrDataUrl) {
      return;
    }
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `qr-payment-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    track("shared_qr_downloaded");
  };

  const handleCopy = async () => {
    if (!qrDataUrl) {
      return;
    }
    try {
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      track("shared_qr_copied");
      toast.success(t("copied"));
    } catch (error) {
      console.error("[ShareQRSection] Failed to copy QR image", error);
      toast.error(t("copyFailed"));
    }
  };

  return (
    <>
      <CardContent className="flex flex-col items-center gap-4">
        {qrDataUrl ? (
          <div
            className="w-full p-2"
            style={{ backgroundColor: branding.bgColor }}
          >
            <Image
              alt="QR payment code"
              className="w-full rounded-none"
              height={384}
              src={qrDataUrl}
              width={384}
            />
          </div>
        ) : (
          <div className="flex aspect-square w-full items-center justify-center">
            <div className="size-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          </div>
        )}
        {children}
      </CardContent>
      {qrDataUrl ? (
        <CardFooter className="gap-2">
          <Button className="flex-1" onClick={handleDownload} variant="outline">
            <IconDownload />
            {t("download")}
          </Button>
          <Button className="flex-1" onClick={handleCopy} variant="outline">
            <IconCopy />
            {t("copy")}
          </Button>
        </CardFooter>
      ) : null}
    </>
  );
}
