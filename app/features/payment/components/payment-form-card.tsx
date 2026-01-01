"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconLoader3, IconQrcode, IconTrash } from "@tabler/icons-react";
import { Controller, useForm } from "react-hook-form";
import { CurrencyInput } from "@/components/currency-input";
import { IBANAutocomplete } from "@/components/iban-autocomplete";
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
import {
  type PaymentFormData,
  type PaymentRecord,
  paymentFormSchema,
} from "../schema";
import { usePaymentGenerator } from "../use-payment-generator";

const defaultValues: PaymentFormData = {
  iban: "",
  amount: 0,
  variableSymbol: "",
  specificSymbol: "",
  constantSymbol: "",
  recipientName: "",
  paymentNote: "",
};

export function PaymentFormCard() {
  const { generate, isPending } = usePaymentGenerator();
  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    defaultValues,
    resolver: zodResolver(paymentFormSchema),
  });

  const handleClear = () => {
    reset();
  };
  const handleSelectFromHistory = (payment: PaymentRecord) => {
    setValue("recipientName", payment.recipientName || "");
    setValue("variableSymbol", payment.variableSymbol || "");
    setValue("specificSymbol", payment.specificSymbol || "");
    setValue("constantSymbol", payment.constantSymbol || "");
    setValue("paymentNote", payment.paymentNote || "");
    // amount is not filled — usually the amount is different
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platobné údaje</CardTitle>
      </CardHeader>
      <form className="flex h-full flex-col" onSubmit={handleSubmit(generate)}>
        <CardContent className="flex-1 grow">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="iban">IBAN *</FieldLabel>
              <FieldContent>
                <Controller
                  control={control}
                  name="iban"
                  render={({ field }) => (
                    <IBANAutocomplete
                      id="iban"
                      onChange={field.onChange}
                      onSelectPayment={handleSelectFromHistory}
                      value={field.value}
                    />
                  )}
                />
                <FieldError errors={errors.iban ? [errors.iban] : undefined} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="amount">Suma (EUR) *</FieldLabel>
              <FieldContent>
                <Controller
                  control={control}
                  name="amount"
                  render={({ field }) => (
                    <CurrencyInput
                      id="amount"
                      onChange={field.onChange}
                      placeholder="0,00"
                      value={field.value}
                    />
                  )}
                />
                <FieldError
                  errors={errors.amount ? [errors.amount] : undefined}
                />
              </FieldContent>
            </Field>

            <div className="grid grid-cols-3 gap-4">
              <Field>
                <FieldLabel htmlFor="vs">VS</FieldLabel>
                <FieldContent>
                  <Input
                    {...register("variableSymbol")}
                    id="vs"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="1234567890"
                  />
                  <FieldError
                    errors={
                      errors.variableSymbol
                        ? [errors.variableSymbol]
                        : undefined
                    }
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="ss">SS</FieldLabel>
                <FieldContent>
                  <Input
                    {...register("specificSymbol")}
                    id="ss"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="1234567890"
                  />
                  <FieldError
                    errors={
                      errors.specificSymbol
                        ? [errors.specificSymbol]
                        : undefined
                    }
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="ks">KS</FieldLabel>
                <FieldContent>
                  <Input
                    {...register("constantSymbol")}
                    id="ks"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="0308"
                  />
                  <FieldError
                    errors={
                      errors.constantSymbol
                        ? [errors.constantSymbol]
                        : undefined
                    }
                  />
                </FieldContent>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="recipient">Meno príjemcu</FieldLabel>
              <FieldContent>
                <Input
                  {...register("recipientName")}
                  id="recipient"
                  maxLength={70}
                  placeholder="Meno príjemcu"
                />
                <FieldError
                  errors={
                    errors.recipientName ? [errors.recipientName] : undefined
                  }
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="note">Poznámka</FieldLabel>
              <FieldContent>
                <Textarea
                  {...register("paymentNote")}
                  id="note"
                  maxLength={140}
                  placeholder="Poznámka k platbe"
                  rows={3}
                />
                <FieldError
                  errors={errors.paymentNote ? [errors.paymentNote] : undefined}
                />
              </FieldContent>
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="mt-auto shrink-0 justify-end gap-2">
          <Button onClick={handleClear} type="button" variant="outline">
            <IconTrash />
            Vymazať
          </Button>
          <Button disabled={isPending} type="submit">
            {isPending ? (
              <IconLoader3 className="animate-spin" />
            ) : (
              <IconQrcode />
            )}
            Vygenerovať QR
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
