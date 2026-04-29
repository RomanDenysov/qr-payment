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
import { CustomizerControls } from "@/features/customizer/components/customizer-controls";
import { TemplateSelector } from "@/features/customizer/components/template-selector";
import {
  useCustomizerActions,
  useCustomizerConfig,
} from "@/features/customizer/store";
import type { PaymentFormData } from "@/features/payment/schema";
import { cn } from "@/lib/utils";
import {
  StudioPaymentInput,
  type StudioPaymentState,
} from "./studio-payment-input";
import { StudioPreview } from "./studio-preview";

const DEFAULT_PAYMENT: StudioPaymentState = {
  iban: "SK3112000000198742637541",
  amount: 25,
  currency: "EUR",
  format: "bysquare",
  recipientName: "",
};

const AMOUNT_FMT = new Intl.NumberFormat("sk-SK", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function toPaymentData(p: StudioPaymentState): PaymentFormData | null {
  const cleanIban = electronicFormatIBAN(p.iban);
  if (!(cleanIban && isValidIBAN(cleanIban))) {
    return null;
  }
  if (p.amount < 0 || p.amount > 999_999_999.99) {
    return null;
  }
  if (p.format === "epc" && !p.recipientName.trim()) {
    return null;
  }
  return {
    format: p.format,
    currency: p.currency,
    iban: p.iban,
    amount: p.amount,
    recipientName: p.recipientName || undefined,
  } as PaymentFormData;
}

export function StudioClient() {
  const config = useCustomizerConfig();
  const { reset } = useCustomizerActions();
  const [payment, setPayment] = useState<StudioPaymentState>(DEFAULT_PAYMENT);
  const t = useTranslations("Studio");

  const paymentData = useMemo(() => toPaymentData(payment), [payment]);
  const offCenter =
    config.logoPosition !== "center" || config.centerTextPosition !== "center";

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_360px]">
      <div className="flex flex-col gap-3">
        <Accordion
          className="flex flex-col gap-3"
          defaultValue={["payment"]}
          multiple
        >
          <AccordionItem
            className="border border-border not-last:border-b bg-card"
            value="payment"
          >
            <AccordionTrigger className="px-4">
              <span className="flex flex-1 items-center justify-between gap-3">
                <span className="font-medium text-sm">
                  {t("section.payment")}
                </span>
                <span
                  className={cn(
                    "font-mono text-muted-foreground text-xs",
                    !paymentData && "text-destructive"
                  )}
                >
                  {payment.format.toUpperCase()} · ...
                  {payment.iban.replace(/\s/g, "").slice(-4)} ·{" "}
                  {AMOUNT_FMT.format(payment.amount)} {payment.currency}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-3 px-4 text-foreground">
              <StudioPaymentInput onChange={setPayment} value={payment} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <CustomizerControls />

        <div className="flex justify-end">
          <Button onClick={reset} size="sm" variant="outline">
            <IconRefresh />
            {t("reset")}
          </Button>
        </div>
      </div>

      <div className="sticky top-20 flex flex-col gap-3">
        {offCenter && (
          <Alert>
            <IconAlertTriangle className="size-5" />
            <AlertDescription>{t("offCenterWarning")}</AlertDescription>
          </Alert>
        )}
        <StudioPreview config={config} payment={paymentData} />
        <div className="border border-border bg-card p-4">
          <TemplateSelector />
        </div>
      </div>
    </div>
  );
}
