"use client";

import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";
import { electronicFormatIBAN, isValidIBAN } from "ibantools";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CenterTextEditor } from "@/features/branding/components/center-text-editor";
import { DotStyleSelector } from "@/features/branding/components/dot-style-selector";
import { LogoUploader } from "@/features/branding/components/logo-uploader";
import type { PaymentFormData } from "@/features/payment/schema";
import { useStudioActions, useStudioConfig } from "../store";
import { fillPrimaryColor } from "../types";
import { FrameEditor } from "./controls/frame-editor";
import { GradientEditor } from "./controls/gradient-editor";
import { LogoSizeSlider } from "./controls/logo-size-slider";
import { PositionPicker } from "./controls/position-picker";
import {
  StudioPaymentInput,
  type StudioPaymentState,
} from "./studio-payment-input";
import { StudioPreview } from "./studio-preview";
import { StudioTemplateSelector } from "./studio-template-selector";

const DEFAULT_PAYMENT: StudioPaymentState = {
  iban: "SK3112000000198742637541",
  amount: "25",
  currency: "EUR",
  format: "bysquare",
  recipientName: "",
};

function toPaymentData(p: StudioPaymentState): PaymentFormData | null {
  const cleanIban = electronicFormatIBAN(p.iban);
  if (!(cleanIban && isValidIBAN(cleanIban))) {
    return null;
  }
  const amountNum = Number(p.amount.replace(",", "."));
  if (Number.isNaN(amountNum) || amountNum < 0) {
    return null;
  }
  if (p.format === "epc" && !p.recipientName.trim()) {
    return null;
  }
  return {
    format: p.format,
    currency: p.currency,
    iban: p.iban,
    amount: amountNum,
    recipientName: p.recipientName || undefined,
  } as PaymentFormData;
}

export function StudioClient() {
  const config = useStudioConfig();
  const { update, reset } = useStudioActions();
  const [payment, setPayment] = useState<StudioPaymentState>(DEFAULT_PAYMENT);
  const t = useTranslations("Studio");

  const paymentData = useMemo(() => toPaymentData(payment), [payment]);
  const offCenter =
    config.logoPosition !== "center" || config.centerTextPosition !== "center";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
      <div className="flex flex-col gap-4">
        <StudioPaymentInput onChange={setPayment} value={payment} />

        <Section title={t("section.colors")}>
          <GradientEditor
            contrastWith={fillPrimaryColor(config.bgFill)}
            label={t("fgColor")}
            onChange={(fgFill) => update({ fgFill })}
            value={config.fgFill}
          />
          <GradientEditor
            contrastWith={fillPrimaryColor(config.fgFill)}
            label={t("bgColor")}
            onChange={(bgFill) => update({ bgFill })}
            value={config.bgFill}
          />
        </Section>

        <Section title={t("section.dots")}>
          <DotStyleSelector
            onChange={(dotStyle) => update({ dotStyle })}
            value={config.dotStyle}
          />
        </Section>

        <Section title={t("section.text")}>
          <CenterTextEditor
            onChange={(centerText) => update({ centerText })}
            onTextBoldChange={(centerTextBold) => update({ centerTextBold })}
            onTextFontChange={(centerTextFont) => update({ centerTextFont })}
            onTextSizeChange={(centerTextSize) => update({ centerTextSize })}
            textBold={config.centerTextBold}
            textFont={config.centerTextFont}
            textSize={config.centerTextSize}
            value={config.centerText}
          />
          <PositionPicker
            label={t("positionText")}
            onChange={(centerTextPosition) => update({ centerTextPosition })}
            value={config.centerTextPosition}
          />
        </Section>

        <Section title={t("section.logo")}>
          <LogoUploader
            onChange={(logo) => update({ logo })}
            value={config.logo}
          />
          {config.logo && (
            <>
              <LogoSizeSlider
                onChange={(logoSizePct) => update({ logoSizePct })}
                value={config.logoSizePct}
              />
              <PositionPicker
                label={t("positionLogo")}
                onChange={(logoPosition) => update({ logoPosition })}
                value={config.logoPosition}
              />
            </>
          )}
        </Section>

        <Section title={t("section.frame")}>
          <FrameEditor
            onChange={(frame) => update({ frame })}
            value={config.frame}
          />
        </Section>

        {offCenter && (
          <Alert>
            <IconAlertTriangle className="size-5" />
            <AlertDescription>{t("offCenterWarning")}</AlertDescription>
          </Alert>
        )}

        <StudioTemplateSelector />

        <div className="flex justify-end">
          <Button onClick={reset} size="sm" variant="outline">
            <IconRefresh />
            {t("reset")}
          </Button>
        </div>
      </div>

      <StudioPreview config={config} payment={paymentData} />
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 border border-border bg-card p-4">
      <h2 className="font-medium text-sm">{title}</h2>
      {children}
    </section>
  );
}
