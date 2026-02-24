"use client";

import { IconCopy, IconDownload } from "@tabler/icons-react";
import { track } from "@vercel/analytics";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
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
import { generatePaymentQR } from "@/features/payment/qr-generator";
import type { SharePayload } from "@/features/payment/share-link";
import { Link } from "@/i18n/navigation";
import { maskIban } from "@/lib/utils";

interface Props {
  data: SharePayload | null;
}

function PaymentField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="font-medium text-sm">{value}</span>
    </div>
  );
}

export function SharePaymentView({ data }: Props) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const t = useTranslations("SharePage");
  const tForm = useTranslations("PaymentForm");

  useEffect(() => {
    if (!data) {
      return;
    }

    generatePaymentQR(data.payment, {
      ...data.branding,
      logo: null,
    })
      .then(setQrDataUrl)
      .catch(() => {
        toast.error(t("generateFailed"));
      });
  }, [data, t]);

  if (!data) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 pt-16">
        <p className="text-muted-foreground">{t("invalidLink")}</p>
        <Link href="/">
          <Button variant="outline">{t("backHome")}</Button>
        </Link>
      </div>
    );
  }

  const { payment, branding } = data;
  const format = payment.format ?? "bysquare";

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
    } catch {
      toast.error(t("copyFailed"));
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col items-center pt-5 sm:pt-8 md:pt-16">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
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

          <div className="w-full space-y-2 pt-2">
            {format === "epc" ? (
              <Badge variant="outline">EPC / SEPA</Badge>
            ) : null}
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground text-xs">IBAN</span>
              <span className="flex items-center gap-1 font-medium text-sm">
                {maskIban(payment.iban)}
                <button
                  className="inline-flex size-6 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(payment.iban);
                      toast.success(t("copied"));
                    } catch {
                      toast.error(t("copyFailed"));
                    }
                  }}
                  type="button"
                >
                  <IconCopy className="size-3.5" />
                </button>
              </span>
            </div>
            <PaymentField
              label={tForm("amount")}
              value={`${payment.amount.toFixed(2)} EUR`}
            />
            {payment.recipientName ? (
              <PaymentField
                label={tForm("recipientName")}
                value={payment.recipientName}
              />
            ) : null}
            {payment.variableSymbol ? (
              <PaymentField label="VS" value={payment.variableSymbol} />
            ) : null}
            {payment.specificSymbol ? (
              <PaymentField label="SS" value={payment.specificSymbol} />
            ) : null}
            {payment.constantSymbol ? (
              <PaymentField label="KS" value={payment.constantSymbol} />
            ) : null}
            {payment.bic ? (
              <PaymentField label="BIC" value={payment.bic} />
            ) : null}
            {payment.paymentNote ? (
              <PaymentField
                label={
                  format === "epc"
                    ? tForm("paymentReference")
                    : tForm("note")
                }
                value={payment.paymentNote}
              />
            ) : null}
          </div>
        </CardContent>
        {qrDataUrl ? (
          <CardFooter className="gap-2">
            <Button
              className="flex-1"
              onClick={handleDownload}
              variant="outline"
            >
              <IconDownload />
              {t("download")}
            </Button>
            <Button className="flex-1" onClick={handleCopy} variant="outline">
              <IconCopy />
              {t("copy")}
            </Button>
          </CardFooter>
        ) : null}
      </Card>
    </div>
  );
}
