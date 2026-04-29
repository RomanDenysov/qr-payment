"use client";

import { electronicFormatIBAN, isValidIBAN } from "ibantools";
import { useTranslations } from "next-intl";
import { CurrencyInput } from "@/components/currency-input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import type { PaymentFormat } from "@/features/payment/format";

export interface StudioPaymentState {
  iban: string;
  amount: number;
  currency: "EUR" | "CZK";
  format: PaymentFormat;
  recipientName: string;
}

const CURRENCY_OPTIONS: { value: "EUR" | "CZK"; label: string }[] = [
  { value: "EUR", label: "EUR" },
  { value: "CZK", label: "CZK" },
];

interface Props {
  value: StudioPaymentState;
  onChange: (next: StudioPaymentState) => void;
}

export function StudioPaymentInput({ value, onChange }: Props) {
  const t = useTranslations("PaymentForm");
  const tValidation = useTranslations("Validation");

  const update = <K extends keyof StudioPaymentState>(
    key: K,
    v: StudioPaymentState[K]
  ) => onChange({ ...value, [key]: v });

  const ibanError = getIbanError(value.iban, tValidation);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-start">
        <SegmentedControl<PaymentFormat>
          onChange={(format) =>
            onChange({
              ...value,
              format,
              currency: format === "epc" ? "EUR" : value.currency,
            })
          }
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
            aria-invalid={ibanError ? true : undefined}
            onChange={(e) => update("iban", e.target.value.toUpperCase())}
            placeholder="SK..."
            value={value.iban}
          />
          {ibanError && <FieldError>{ibanError}</FieldError>}
        </Field>

        <Field>
          <FieldLabel>{t("amount")}</FieldLabel>
          <div className="flex items-stretch gap-2">
            <div className="flex-1">
              <CurrencyInput
                currency={value.currency}
                onChange={(amount) => update("amount", amount)}
                placeholder={t("amountPlaceholder")}
                value={value.amount}
              />
            </div>
            {value.format !== "epc" && (
              <SegmentedControl<"EUR" | "CZK">
                className="h-auto"
                onChange={(currency) => update("currency", currency)}
                options={CURRENCY_OPTIONS}
                value={value.currency}
              />
            )}
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

function getIbanError(raw: string, t: (key: string) => string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return t("ibanRequired");
  }
  const clean = electronicFormatIBAN(trimmed);
  if (!(clean && isValidIBAN(clean))) {
    return t("ibanInvalid");
  }
  return null;
}
