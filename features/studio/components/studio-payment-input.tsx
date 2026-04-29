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

  const update = <K extends keyof StudioPaymentState>(
    key: K,
    v: StudioPaymentState[K]
  ) => onChange({ ...value, [key]: v });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-start">
        <SegmentedControl<PaymentFormat>
          onChange={(format) => update("format", format)}
          options={[
            { value: "bysquare", label: "BySquare" },
            { value: "epc", label: "EPC" },
            { value: "spayd", label: "SPAYD" },
          ]}
          value={value.format}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
          <div className="grid grid-cols-2 gap-2">
            <Input
              inputMode="decimal"
              onChange={(e) => update("amount", e.target.value)}
              placeholder={t("amountPlaceholder")}
              value={value.amount}
            />
            <SegmentedControl<"EUR" | "CZK">
              className="flex h-9 w-full [&>button]:flex-1"
              onChange={(currency) => update("currency", currency)}
              options={[
                { value: "EUR", label: "EUR" },
                { value: "CZK", label: "CZK" },
              ]}
              value={value.currency}
            />
          </div>
        </Field>
      </div>

      {value.format === "epc" && (
        <Field>
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
