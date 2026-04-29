"use client";

import { useTranslations } from "next-intl";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import type { PaymentFormat } from "@/features/payment/format";

export interface StudioPaymentState {
  iban: string;
  amount: string;
  currency: "EUR" | "CZK";
  format: PaymentFormat;
  recipientName: string;
}

interface Props {
  value: StudioPaymentState;
  onChange: (next: StudioPaymentState) => void;
}

export function StudioPaymentInput({ value, onChange }: Props) {
  const t = useTranslations("PaymentForm");
  const tStudio = useTranslations("Studio");

  const update = <K extends keyof StudioPaymentState>(
    key: K,
    v: StudioPaymentState[K]
  ) => onChange({ ...value, [key]: v });

  return (
    <div className="grid grid-cols-1 gap-3 border border-border bg-card/40 p-3 sm:grid-cols-2">
      <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
        <span className="font-medium text-sm">
          {tStudio("section.payment")}
        </span>
        <SegmentedControl<PaymentFormat>
          onChange={(format) => update("format", format)}
          options={[
            { value: "bysquare", label: "BySquare" },
            { value: "epc", label: "EPC" },
            { value: "spayd", label: "SPAYD" },
          ]}
          value={value.format}
        />
        <SegmentedControl<"EUR" | "CZK">
          onChange={(currency) => update("currency", currency)}
          options={[
            { value: "EUR", label: "EUR" },
            { value: "CZK", label: "CZK" },
          ]}
          value={value.currency}
        />
      </div>
      <Field>
        <FieldLabel>{t("iban")}</FieldLabel>
        <Input
          onChange={(e) => update("iban", e.target.value.toUpperCase())}
          placeholder="SK..."
          value={value.iban}
        />
      </Field>
      <Field>
        <FieldLabel>{t("amount")}</FieldLabel>
        <Input
          inputMode="decimal"
          onChange={(e) => update("amount", e.target.value)}
          placeholder={t("amountPlaceholder")}
          value={value.amount}
        />
      </Field>
      {value.format === "epc" && (
        <Field className="sm:col-span-2">
          <FieldLabel>{t("recipientNameRequired")}</FieldLabel>
          <Input
            maxLength={70}
            onChange={(e) => update("recipientName", e.target.value)}
            placeholder={t("recipientNamePlaceholder")}
            value={value.recipientName}
          />
        </Field>
      )}
    </div>
  );
}
