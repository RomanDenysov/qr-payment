"use client";

import {
  IconCheck,
  IconLoader3,
  IconQrcode,
  IconRefresh,
} from "@tabler/icons-react";
import { track } from "@vercel/analytics";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import {
  Controller,
  type FieldErrors,
  FormProvider,
  useFormState,
  useWatch,
} from "react-hook-form";
import { BicField } from "@/features/payment/components/bic-field";
import { FormatExtrasMenu } from "@/features/payment/components/format-extras-menu";
import { OptionalFields } from "@/features/payment/components/optional-fields";
import { QrPreview } from "@/features/payment/components/qr-preview";
import { SymbolFields } from "@/features/payment/components/symbol-fields";
import {
  FORMAT_LABELS,
  FORMAT_OPTIONS,
  type PaymentFormat,
  suggestFormatForIban,
} from "@/features/payment/format";
import { usePaymentForm } from "@/features/payment/hooks/use-payment-form";
import { usePaymentGenerator } from "@/features/payment/hooks/use-payment-generator";
import {
  OPTIONAL_FIELDS_BY_FORMAT,
  type OptionalFieldKey,
} from "@/features/payment/optional-fields";
import {
  useEnabledOptionalFields,
  useOptionalFieldsActions,
} from "@/features/payment/optional-fields-store";
import type { PaymentFormData, PaymentRecord } from "@/features/payment/schema";
import { detectBank } from "@/lib/iban-bank";
import { CurrencyInput } from "./currency-input";
import { IBANAutocomplete } from "./iban-autocomplete";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "./ui/field";
import { Input } from "./ui/input";
import { SegmentedControl } from "./ui/segmented-control";
import { Textarea } from "./ui/textarea";

export function QrGeneratorSection() {
  const t = useTranslations("PaymentForm");
  const form = usePaymentForm();
  const { generate, isPending } = usePaymentGenerator();
  const { register, reset, control, setValue, handleSubmit } = form;

  // useWatch/useFormState (hooks), not watch()/formState — the React Compiler
  // memoizes the latter into stale values, freezing the UI and validation.
  const { errors } = useFormState({ control });
  const format = useWatch({ control, name: "format" }) ?? "bysquare";
  const currency = useWatch({ control, name: "currency" }) ?? "EUR";
  const iban = useWatch({ control, name: "iban" }) ?? "";
  const detectedBank = useMemo(() => detectBank(iban), [iban]);

  // Optional fields: visible when opted in (persisted preference) or when they
  // already hold a value (e.g. filled from history/share link).
  const enabledExtras = useEnabledOptionalFields(format);
  const { enable, disable } = useOptionalFieldsActions();
  const extraKeys = OPTIONAL_FIELDS_BY_FORMAT[format];
  const extraValues = useWatch({ control, name: extraKeys });
  const isExtraVisible = (key: OptionalFieldKey) =>
    enabledExtras.includes(key) || Boolean(extraValues[extraKeys.indexOf(key)]);
  const visibleExtras = extraKeys.filter(isExtraVisible);

  const toggleExtra = (key: OptionalFieldKey) => {
    const visible = isExtraVisible(key);
    if (visible) {
      disable(format, key);
      setValue(key, "");
    } else {
      enable(format, key);
    }
    track("optional_field_toggled", { format, field: key, enabled: !visible });
  };

  const handleFormatChange = (newFormat: PaymentFormat) => {
    setValue("format", newFormat);
    if (newFormat === "epc") {
      setValue("currency", "EUR");
    }
    track("format_selected", { format: newFormat });
  };

  // Soft IBAN/format mismatch hint — suggestion only, never auto-switches.
  const suggestedFormat = suggestFormatForIban(iban, format);
  const acceptSuggestion = () => {
    if (!suggestedFormat) {
      return;
    }
    setValue("format", suggestedFormat);
    track("format_hint_accepted", { from: format, to: suggestedFormat });
  };

  // EPC funnel investigation: which formats/fields block generation.
  const onInvalid = (validationErrors: FieldErrors<PaymentFormData>) => {
    track("form_validation_failed", {
      format,
      fields: Object.keys(validationErrors).sort().join(","),
    });
  };

  // Drop history metadata (id/name/etc.) so it can't leak into the next record.
  const fillFromHistory = ({
    id,
    createdAt,
    qrDataUrl,
    name,
    shareSecret,
    ...formData
  }: PaymentRecord) => reset(formData);

  return (
    <FormProvider {...form}>
      <Card className="py-0">
        <div className="flex border-b">
          <SegmentedControl
            className="h-10 flex-1 border-b-0"
            onChange={handleFormatChange}
            options={FORMAT_OPTIONS}
            value={format}
          />
        </div>
        <CardHeader>
          <CardTitle>
            {t(`formatDescription.${format}`)}
            {suggestedFormat ? (
              <span className="fade-in-0 block animate-in font-normal text-muted-foreground text-xs duration-200 ease-out-quad">
                {t("formatHint", { format: FORMAT_LABELS[suggestedFormat] })}{" "}
                <button
                  className="underline underline-offset-2 hover:text-foreground"
                  onClick={acceptSuggestion}
                  type="button"
                >
                  {t("formatHintSwitch", {
                    format: FORMAT_LABELS[suggestedFormat],
                  })}
                </button>
              </span>
            ) : null}
          </CardTitle>
          <CardAction>
            <FormatExtrasMenu
              format={format}
              isVisible={isExtraVisible}
              onToggle={toggleExtra}
            />
          </CardAction>
        </CardHeader>

        <form onSubmit={handleSubmit(generate, onInvalid)}>
          <CardContent className="grid flex-1 gap-6 border-t pt-4 pb-12 md:grid-cols-2">
            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field className="col-span-2">
                  <FieldLabel htmlFor="iban">
                    <span>{t("ibanRequired")}</span>
                    {detectedBank ? (
                      <Badge
                        aria-label={t("bankDetected", {
                          name: detectedBank.name,
                        })}
                        className="fade-in-0 slide-in-from-left-1 ml-auto animate-in text-success duration-200 ease-out-quad"
                        size="sm"
                        variant="secondary"
                      >
                        <IconCheck aria-hidden className="size-3 shrink-0" />
                        {detectedBank.name}
                      </Badge>
                    ) : null}
                  </FieldLabel>
                  <Controller
                    control={control}
                    name="iban"
                    render={({ field, fieldState }) => (
                      <IBANAutocomplete
                        hasError={!!fieldState.error}
                        id="iban"
                        isValid={!!detectedBank}
                        onChange={field.onChange}
                        onSelectPayment={fillFromHistory}
                        value={field.value}
                      />
                    )}
                  />
                  <FieldError
                    errors={errors.iban ? [errors.iban] : undefined}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="amount">{t("amount")}</FieldLabel>
                  <FieldContent>
                    <Controller
                      control={control}
                      name="amount"
                      render={({ field }) => (
                        <CurrencyInput
                          currencies={
                            format === "epc" ? ["EUR"] : ["EUR", "CZK"]
                          }
                          currency={currency}
                          id="amount"
                          onChange={field.onChange}
                          onCurrencyChange={(next) =>
                            setValue("currency", next as "EUR" | "CZK")
                          }
                          placeholder={t("amountPlaceholder")}
                          value={field.value}
                        />
                      )}
                    />
                    <FieldError
                      errors={errors.amount ? [errors.amount] : undefined}
                    />
                  </FieldContent>
                </Field>
              </div>

              {format === "epc" ? <BicField /> : <SymbolFields />}

              <Field>
                <FieldLabel htmlFor="recipient">
                  {format === "epc"
                    ? t("recipientNameRequired")
                    : t("recipientName")}
                </FieldLabel>
                <FieldContent>
                  <Input
                    {...register("recipientName")}
                    id="recipient"
                    maxLength={70}
                    placeholder={t("recipientNamePlaceholder")}
                  />
                  <FieldError
                    errors={
                      errors.recipientName ? [errors.recipientName] : undefined
                    }
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="note">
                  {format === "epc" ? t("paymentReference") : t("note")}
                </FieldLabel>
                <FieldContent>
                  <Textarea
                    {...register("paymentNote")}
                    id="note"
                    maxLength={140}
                    placeholder={
                      format === "epc"
                        ? t("paymentReferencePlaceholder")
                        : t("notePlaceholder")
                    }
                    rows={3}
                  />
                  <FieldError
                    errors={
                      errors.paymentNote ? [errors.paymentNote] : undefined
                    }
                  />
                </FieldContent>
              </Field>

              <OptionalFields keys={visibleExtras} />
            </FieldGroup>

            <div className="flex min-h-64 flex-col border">
              <QrPreview />
            </div>
          </CardContent>

          <CardFooter className="mt-auto p-0">
            <Button
              aria-label={t("clear")}
              className="group/refresh size-12 sm:size-14 md:size-16"
              onClick={() => reset()}
              type="button"
              variant="ghost"
            >
              <IconRefresh className="size-6 group-hover/refresh:animate-spin-reverse" />
              <span className="sr-only">{t("clear")}</span>
            </Button>
            <Button
              className="btn-stripes h-12 w-full flex-1 gap-2.5 bg-brand text-base text-brand-foreground hover:bg-brand-hover active:bg-brand-active sm:h-14 sm:text-lg md:h-16 md:text-xl"
              disabled={isPending}
              type="submit"
            >
              {isPending ? (
                <IconLoader3 className="size-4 animate-spin sm:size-5" />
              ) : (
                <IconQrcode className="size-4 sm:size-5" />
              )}
              {t("generate")}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </FormProvider>
  );
}
