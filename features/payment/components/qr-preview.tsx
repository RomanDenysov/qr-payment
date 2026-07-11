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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { renderCustomizerQR } from "@/features/customizer/renderer";
import { useCustomizerConfig } from "@/features/customizer/store";
import { formatAmount, maskIban } from "@/lib/utils";
import { useQrPreviewActions } from "../hooks/use-qr-preview-actions";
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

const NUDGE_STORAGE_KEY = "qrCustomizer.nudge.v1";

function FormatBadges({ payment }: { payment: PaymentRecord }) {
  if (payment.format === "epc") {
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

export function QrPreview() {
  const t = useTranslations("QRPreview");
  const tBranding = useTranslations("Branding");
  const current = useCurrentPayment();
  const { setCurrent } = usePaymentActions();
  const customizer = useCustomizerConfig();
  const { download, copy, share, isLoading } = useQrPreviewActions();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [nudgeDismissed, setNudgeDismissed] = useState(true);

  useEffect(() => {
    setNudgeDismissed(
      window.localStorage.getItem(NUDGE_STORAGE_KEY) === "dismissed"
    );
  }, []);

  if (!current?.qrDataUrl) {
    return (
      <p className="m-auto p-4 text-center text-muted-foreground text-xs">
        {t("placeholder")}
      </p>
    );
  }

  const nudgeVisible = !(customizer.logo || nudgeDismissed);

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

  return (
    <>
      <div className="flex h-10 items-center gap-2 border-b px-2">
        {nudgeVisible ? (
          <button
            className="motion-safe:fade-in-0 motion-safe:slide-in-from-left-1 flex h-7 items-center gap-1 border border-border bg-background px-2 font-normal text-foreground text-xs hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-safe:animate-in"
            onClick={handleNudgeOpen}
            type="button"
          >
            {tBranding("nudgeAddLogo")}
            <IconArrowRight className="size-3.5" />
          </button>
        ) : null}
        <div className="ml-auto">
          <CustomizerSheet
            onApply={handleApplyBranding}
            onOpenChange={setSheetOpen}
            open={sheetOpen}
          />
        </div>
      </div>

      <div className="flex grow flex-col items-center justify-center gap-4 p-4">
        <div
          className="w-full max-w-[320px] motion-safe:animate-qr-reveal"
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
        <div className="flex flex-wrap justify-center gap-1">
          {current.format === "epc" && <Badge variant="outline">EPC</Badge>}
          <Badge variant="secondary">{maskIban(current.iban)}</Badge>
          {current.amount ? (
            <Badge variant="secondary">
              {formatAmount(current.amount, current.currency ?? "EUR")}
            </Badge>
          ) : null}
          <FormatBadges payment={current} />
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-border border-t p-0 sm:flex">
        <Button
          className="col-span-2 h-12 sm:col-span-1 sm:flex-1"
          isPending={isLoading}
          onClick={download}
          variant="ghost"
        >
          {isLoading ? null : <IconDownload />}
          {t("download")}
        </Button>
        <ShareLinkDialog payment={current} />
        <Button className="h-12 sm:flex-1" onClick={share} variant="ghost">
          <IconShare />
          {t("share")}
        </Button>
        <Button className="h-12 sm:flex-1" onClick={copy} variant="ghost">
          <IconCopy />
          {t("copy")}
        </Button>
      </div>
    </>
  );
}
