"use client";

import {
  IconCheck,
  IconCopy,
  IconInfoCircle,
  IconLink,
} from "@tabler/icons-react";
import { track } from "@vercel/analytics";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCustomizerConfig } from "@/features/customizer/store";
import { fillPrimaryColor } from "@/features/customizer/types";
import { useCopyState } from "@/lib/hooks/use-copy-state";
import { maskIban } from "@/lib/utils";
import type { PaymentRecord } from "../schema";
import { encodeShareData } from "../share-link";

interface Props {
  payment: PaymentRecord;
}

export function ShareLinkDialog({ payment }: Props) {
  const { copied, trigger } = useCopyState();
  const customizer = useCustomizerConfig();
  const locale = useLocale();
  const t = useTranslations("ShareLink");

  const fgColor = fillPrimaryColor(customizer.fgFill);
  const bgColor = fillPrimaryColor(customizer.bgFill);

  const encoded = useMemo(() => {
    return encodeShareData(payment, {
      fgColor,
      bgColor,
      centerText: customizer.centerText,
    });
  }, [payment, fgColor, bgColor, customizer.centerText]);

  const handleCopy = async () => {
    try {
      const prefix = locale === "sk" ? "" : `/${locale}`;
      const shareUrl = `${window.location.origin}${prefix}/p?d=${encoded}`;
      await navigator.clipboard.writeText(shareUrl);
      trigger();
      track("share_link_copied");
      toast.success(t("copied"));
    } catch (error) {
      console.error("[ShareLinkDialog] Failed to copy share link", error, {
        locale,
        encodedLength: encoded.length,
      });
      toast.error(t("copyFailed"));
    }
  };

  const format = payment.format ?? "bysquare";

  return (
    <Dialog>
      <DialogTrigger
        render={<Button className="col-span-2 sm:col-span-1 sm:flex-1" />}
      >
        <IconLink />
        {t("trigger")}
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{t("title")}</DialogTitle>
        <DialogDescription>{t("description")}</DialogDescription>

        <div className="flex flex-col items-center gap-4">
          {payment.qrDataUrl ? (
            <div className="w-full p-1.5" style={{ backgroundColor: bgColor }}>
              <Image
                alt="QR payment code"
                className="w-full rounded-none"
                height={384}
                src={payment.qrDataUrl}
                width={384}
              />
            </div>
          ) : null}

          <div className="flex flex-wrap justify-center gap-1">
            {format === "epc" ? <Badge variant="outline">EPC</Badge> : null}
            {payment.recipientName ? (
              <Badge variant="secondary">{payment.recipientName}</Badge>
            ) : null}
            <Badge variant="secondary">{maskIban(payment.iban)}</Badge>
            <Badge variant="secondary">
              {payment.amount.toFixed(2)} {payment.currency ?? "EUR"}
            </Badge>
            {payment.variableSymbol ? (
              <Badge variant="secondary">VS: {payment.variableSymbol}</Badge>
            ) : null}
            {payment.specificSymbol ? (
              <Badge variant="secondary">SS: {payment.specificSymbol}</Badge>
            ) : null}
            {payment.constantSymbol ? (
              <Badge variant="secondary">KS: {payment.constantSymbol}</Badge>
            ) : null}
            {payment.paymentNote ? (
              <Badge variant="secondary">{payment.paymentNote}</Badge>
            ) : null}
            {payment.bic ? (
              <Badge variant="secondary">BIC: {payment.bic}</Badge>
            ) : null}
          </div>

          <p className="text-center text-muted-foreground text-xs">
            {t("hint")}
          </p>
        </div>

        {customizer.logo ? (
          <Alert>
            <IconInfoCircle />
            <AlertDescription>{t("logoNotice")}</AlertDescription>
          </Alert>
        ) : null}

        <Button className="w-full" onClick={handleCopy}>
          {copied ? <IconCheck /> : <IconCopy />}
          {copied ? t("copied") : t("copyLink")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
