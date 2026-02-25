"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconLoader3, IconQrcode, IconTrash } from "@tabler/icons-react";
import { track } from "@vercel/analytics";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { CurrencyInput } from "@/components/currency-input";
import { inputVariants } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamic import to prevent hydration mismatch from Base UI's auto-generated IDs
const IBANAutocomplete = dynamic(
  () =>
    import("@/components/iban-autocomplete").then(
      (mod) => mod.IBANAutocomplete
    ),
  {
    ssr: false,
    loading: () => <Skeleton className={inputVariants({ className: "h-9" })} />,
  }
);

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { PaymentFormat } from "../format";
import { FORMAT_LABELS } from "../format";
import {
  createPaymentFormSchema,
  type PaymentFormData,
  type PaymentRecord,
} from "../schema";
import {
  useCurrentPayment,
  usePaymentActions,
  usePreferredCurrency,
  usePreferredFormat,
} from "../store";
import { usePaymentGenerator } from "../use-payment-generator";

function BicField({
  register,
  errors,
  t,
}: {
  register: ReturnType<typeof useForm<PaymentFormData>>["register"];
  errors: ReturnType<typeof useForm<PaymentFormData>>["formState"]["errors"];
  t: ReturnType<typeof useTranslations<"PaymentForm">>;
}) {
  return (
    <Field>
      <FieldLabel htmlFor="bic">{t("bic")}</FieldLabel>
      <FieldContent>
        <Input
          {...register("bic")}
          id="bic"
          maxLength={11}
          placeholder={t("bicPlaceholder")}
        />
        <FieldError errors={errors.bic ? [errors.bic] : undefined} />
      </FieldContent>
    </Field>
  );
}

function SymbolFields({
  register,
  errors,
  t,
}: {
  register: ReturnType<typeof useForm<PaymentFormData>>["register"];
  errors: ReturnType<typeof useForm<PaymentFormData>>["formState"]["errors"];
  t: ReturnType<typeof useTranslations<"PaymentForm">>;
}) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Field>
        <FieldLabel htmlFor="vs">{t("vs")}</FieldLabel>
        <FieldContent>
          <Input
            {...register("variableSymbol")}
            id="vs"
            inputMode="numeric"
            maxLength={10}
            placeholder="1234567890"
          />
          <FieldError
            errors={errors.variableSymbol ? [errors.variableSymbol] : undefined}
          />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="ss">{t("ss")}</FieldLabel>
        <FieldContent>
          <Input
            {...register("specificSymbol")}
            id="ss"
            inputMode="numeric"
            maxLength={10}
            placeholder="1234567890"
          />
          <FieldError
            errors={errors.specificSymbol ? [errors.specificSymbol] : undefined}
          />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="ks">{t("ks")}</FieldLabel>
        <FieldContent>
          <Input
            {...register("constantSymbol")}
            id="ks"
            inputMode="numeric"
            maxLength={4}
            placeholder="0308"
          />
          <FieldError
            errors={errors.constantSymbol ? [errors.constantSymbol] : undefined}
          />
        </FieldContent>
      </Field>
    </div>
  );
}

const FORMAT_OPTIONS: { value: PaymentFormat; label: string }[] = [
  { value: "bysquare", label: FORMAT_LABELS.bysquare },
  { value: "epc", label: FORMAT_LABELS.epc },
];

const CURRENCY_OPTIONS: { value: "EUR" | "CZK"; label: string }[] = [
  { value: "EUR", label: "EUR" },
  { value: "CZK", label: "CZK" },
];

const defaultValues: PaymentFormData = {
  format: "bysquare",
  currency: "EUR",
  iban: "",
  amount: 0,
  variableSymbol: "",
  specificSymbol: "",
  constantSymbol: "",
  recipientName: "",
  paymentNote: "",
  bic: "",
};

export function PaymentFormCard() {
  const { generate, isPending } = usePaymentGenerator();
  const currentPayment = useCurrentPayment();
  const storedFormat = usePreferredFormat();
  const storedCurrency = usePreferredCurrency();
  const { setPreferredFormat, setPreferredCurrency } = usePaymentActions();
  const t = useTranslations("PaymentForm");
  const tv = useTranslations("Validation");
  const schema = useMemo(() => createPaymentFormSchema(tv), [tv]);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    defaultValues: {
      ...defaultValues,
      format: storedFormat,
      currency: storedCurrency ?? "EUR",
    },
    resolver: zodResolver(schema),
    mode: "onBlur",
  });

  const format = watch("format");
  const currency = watch("currency");

  const handleFormatChange = (newFormat: PaymentFormat) => {
    setValue("format", newFormat);
    setPreferredFormat(newFormat);
    if (newFormat === "epc") {
      setValue("currency", "EUR");
    }
    track("format_selected", { format: newFormat });
  };

  useEffect(() => {
    if (!currentPayment) {
      return;
    }
    reset({
      format: currentPayment.format ?? "bysquare",
      currency: currentPayment.currency ?? "EUR",
      iban: currentPayment.iban,
      amount: currentPayment.amount,
      recipientName: currentPayment.recipientName || "",
      variableSymbol: currentPayment.variableSymbol || "",
      specificSymbol: currentPayment.specificSymbol || "",
      constantSymbol: currentPayment.constantSymbol || "",
      paymentNote: currentPayment.paymentNote || "",
      bic: currentPayment.bic || "",
    });
    setPreferredFormat(currentPayment.format ?? "bysquare");
    setPreferredCurrency(currentPayment.currency ?? "EUR");
  }, [currentPayment, reset, setPreferredFormat, setPreferredCurrency]);

  const handleClear = () => {
    reset({ ...defaultValues, format });
  };

  const handleSelectFromHistory = (payment: PaymentRecord) => {
    setValue("format", payment.format ?? "bysquare");
    setValue("currency", payment.currency ?? "EUR");
    setValue("recipientName", payment.recipientName || "");
    setValue("variableSymbol", payment.variableSymbol || "");
    setValue("specificSymbol", payment.specificSymbol || "");
    setValue("constantSymbol", payment.constantSymbol || "");
    setValue("paymentNote", payment.paymentNote || "");
    setValue("bic", payment.bic || "");
    setPreferredFormat(payment.format ?? "bysquare");
    setPreferredCurrency(payment.currency ?? "EUR");
    // amount is not filled — usually the amount is different
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>{t("title")}</CardTitle>
          <div className="flex gap-2">
            {format === "bysquare" ? (
              <SegmentedControl
                onChange={(val) => {
                  setValue("currency", val as "EUR" | "CZK");
                  setPreferredCurrency(val as "EUR" | "CZK");
                }}
                options={CURRENCY_OPTIONS}
                value={currency ?? "EUR"}
              />
            ) : null}
            <SegmentedControl
              onChange={handleFormatChange}
              options={FORMAT_OPTIONS}
              value={format ?? "bysquare"}
            />
          </div>
        </div>
      </CardHeader>
      <form className="flex h-full flex-col" onSubmit={handleSubmit(generate)}>
        <CardContent className="flex-1 grow">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="iban">{t("ibanRequired")}</FieldLabel>

              <Controller
                control={control}
                name="iban"
                render={({ field, fieldState }) => (
                  <IBANAutocomplete
                    hasError={!!fieldState.error}
                    id="iban"
                    onChange={field.onChange}
                    onSelectPayment={handleSelectFromHistory}
                    value={field.value}
                  />
                )}
              />
              <FieldError errors={errors.iban ? [errors.iban] : undefined} />
            </Field>

            <Field>
              <FieldLabel htmlFor="amount">{t("amount")}</FieldLabel>
              <FieldContent>
                <Controller
                  control={control}
                  name="amount"
                  render={({ field }) => (
                    <CurrencyInput
                      currency={currency ?? "EUR"}
                      id="amount"
                      onChange={field.onChange}
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

            {format === "epc" ? (
              <BicField errors={errors} register={register} t={t} />
            ) : (
              <SymbolFields errors={errors} register={register} t={t} />
            )}

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
                  errors={errors.paymentNote ? [errors.paymentNote] : undefined}
                />
              </FieldContent>
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="mt-auto shrink-0 gap-2 sm:justify-end">
          <Button
            className="flex-1 sm:flex-initial"
            onClick={handleClear}
            type="button"
            variant="outline"
          >
            <IconTrash />
            {t("clear")}
          </Button>
          <Button
            className="flex-1 sm:flex-initial"
            disabled={isPending}
            type="submit"
          >
            {isPending ? (
              <IconLoader3 className="animate-spin" />
            ) : (
              <IconQrcode />
            )}
            {t("generate")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
