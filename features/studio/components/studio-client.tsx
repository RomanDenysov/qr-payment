"use client";

import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";
import { electronicFormatIBAN, isValidIBAN } from "ibantools";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CenterTextEditor } from "@/features/branding/components/center-text-editor";
import { DotStyleSelector } from "@/features/branding/components/dot-style-selector";
import { LogoUploader } from "@/features/branding/components/logo-uploader";
import type { PaymentFormData } from "@/features/payment/schema";
import { cn } from "@/lib/utils";
import { useStudioActions, useStudioConfig } from "../store";
import {
  type DotStyle,
  fillPrimaryColor,
  type OverlayPosition,
  type StudioConfig,
} from "../types";
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

const DEFAULT_OPEN: string[] = ["payment", "colors"];

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
  const tBranding = useTranslations("Branding");

  const paymentData = useMemo(() => toPaymentData(payment), [payment]);
  const offCenter =
    config.logoPosition !== "center" || config.centerTextPosition !== "center";

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_360px]">
      <div className="flex flex-col gap-3">
        <Accordion
          className="flex flex-col gap-3"
          defaultValue={DEFAULT_OPEN}
          multiple
        >
          <CardItem
            chip={paymentChip(payment, paymentData !== null)}
            title={t("section.payment")}
            value="payment"
          >
            <StudioPaymentInput onChange={setPayment} value={payment} />
          </CardItem>

          <CardItem
            chip={
              <ColorChips
                bg={fillPrimaryColor(config.bgFill)}
                fg={fillPrimaryColor(config.fgFill)}
                fgKind={config.fgFill.kind}
              />
            }
            title={t("section.colors")}
            value="colors"
          >
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
          </CardItem>

          <CardItem
            chip={<span>{tBranding(dotStyleKey(config.dotStyle))}</span>}
            title={t("section.dots")}
            value="dots"
          >
            <DotStyleSelector
              onChange={(dotStyle) => update({ dotStyle })}
              value={config.dotStyle}
            />
          </CardItem>

          <CardItem
            chip={textChip(config, t)}
            title={t("section.text")}
            value="text"
          >
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
          </CardItem>

          <CardItem
            chip={logoChip(config, t)}
            title={t("section.logo")}
            value="logo"
          >
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
          </CardItem>

          <CardItem
            chip={frameChip(config, t)}
            title={t("section.frame")}
            value="frame"
          >
            <FrameEditor
              onChange={(frame) => update({ frame })}
              value={config.frame}
            />
          </CardItem>
        </Accordion>

        {offCenter && (
          <Alert>
            <IconAlertTriangle className="size-5" />
            <AlertDescription>{t("offCenterWarning")}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end">
          <Button onClick={reset} size="sm" variant="outline">
            <IconRefresh />
            {t("reset")}
          </Button>
        </div>
      </div>

      <div className="sticky top-20 flex flex-col gap-3">
        <StudioPreview config={config} payment={paymentData} />
        <div className="border border-border bg-card p-4">
          <StudioTemplateSelector />
        </div>
      </div>
    </div>
  );
}

interface CardItemProps {
  value: string;
  title: string;
  chip: React.ReactNode;
  children: React.ReactNode;
}

function CardItem({ value, title, chip, children }: CardItemProps) {
  return (
    <AccordionItem
      className="border border-border not-last:border-b bg-card"
      value={value}
    >
      <AccordionTrigger className="px-4">
        <span className="flex flex-1 items-center justify-between gap-3">
          <span className="font-medium text-sm">{title}</span>
          <span className="flex items-center gap-2 text-muted-foreground text-xs">
            {chip}
          </span>
        </span>
      </AccordionTrigger>
      <AccordionContent className="flex flex-col gap-3 px-4 text-foreground">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
}

function ColorChips({
  fg,
  bg,
  fgKind,
}: {
  fg: string;
  bg: string;
  fgKind: "solid" | "linear" | "radial";
}) {
  return (
    <span className="flex items-center gap-1">
      <Swatch color={fg} />
      <Swatch color={bg} />
      {fgKind !== "solid" && (
        <span className="font-mono text-[10px] uppercase">{fgKind}</span>
      )}
    </span>
  );
}

function Swatch({ color }: { color: string }) {
  return (
    <span
      className="inline-block size-3 ring-1 ring-foreground/20"
      style={{ backgroundColor: color }}
    />
  );
}

function paymentChip(p: StudioPaymentState, valid: boolean): React.ReactNode {
  const last = p.iban.replace(/\s/g, "").slice(-4);
  return (
    <span className={cn("font-mono", !valid && "text-destructive")}>
      {p.format.toUpperCase()} · ...{last} · {p.amount || "0"} {p.currency}
    </span>
  );
}

function textChip(
  config: StudioConfig,
  t: (key: string) => string
): React.ReactNode {
  const text = config.centerText.split("\n").join(" ");
  if (!text.trim()) {
    return <span>{t("empty")}</span>;
  }
  const trimmed = text.length > 14 ? `${text.slice(0, 14)}…` : text;
  return (
    <span>
      "{trimmed}" · {posLabel(config.centerTextPosition, t)}
    </span>
  );
}

function logoChip(
  config: StudioConfig,
  t: (key: string) => string
): React.ReactNode {
  if (!config.logo) {
    return <span>{t("empty")}</span>;
  }
  return (
    <span>
      {config.logoSizePct}% · {posLabel(config.logoPosition, t)}
    </span>
  );
}

function frameChip(
  config: StudioConfig,
  t: (key: string) => string
): React.ReactNode {
  if (!config.frame.enabled) {
    return <span>{t("off")}</span>;
  }
  const parts: string[] = [];
  if (config.frame.title) {
    parts.push("T");
  }
  if (config.frame.caption) {
    parts.push("C");
  }
  parts.push(`${config.frame.borderWidth}px`);
  return <span>{parts.join(" · ")}</span>;
}

function dotStyleKey(s: DotStyle): string {
  switch (s) {
    case "rounded":
      return "dotStyleRounded";
    case "dots":
      return "dotStyleDots";
    case "classy-rounded":
      return "dotStyleClassyRounded";
    default:
      return "dotStyleSquare";
  }
}

function posLabel(p: OverlayPosition, t: (key: string) => string): string {
  const map: Record<OverlayPosition, string> = {
    "top-left": "TL",
    top: "T",
    "top-right": "TR",
    left: "L",
    center: t("centerShort"),
    right: "R",
    "bottom-left": "BL",
    bottom: "B",
    "bottom-right": "BR",
  };
  return map[p];
}
