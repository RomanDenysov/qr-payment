"use client";

import { IconQrcode, IconTrash } from "@tabler/icons-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import type { PaymentData } from "@/lib/generate-qr-image";

type PaymentFormCardProps = {
  onSubmit: (data: PaymentData) => void;
  onClear: () => void;
  initialData?: Partial<PaymentData>;
};

const defaultValues: PaymentData = {
  iban: "",
  amount: 0,
  variableSymbol: "",
  specificSymbol: "",
  constantSymbol: "",
  recipientName: "",
  paymentNote: "",
};

export function PaymentFormCard({
  onSubmit,
  onClear,
  initialData,
}: PaymentFormCardProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentData>({
    defaultValues: initialData
      ? { ...defaultValues, ...initialData }
      : defaultValues,
  });

  useEffect(() => {
    if (initialData) {
      reset({ ...defaultValues, ...initialData });
    }
  }, [initialData, reset]);

  const onFormSubmit = (data: PaymentData) => {
    onSubmit(data);
  };

  const handleClear = () => {
    reset(defaultValues);
    onClear();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platobné údaje</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="iban">IBAN *</FieldLabel>
              <FieldContent>
                <Input
                  {...register("iban", {
                    required: "IBAN je povinný",
                  })}
                  id="iban"
                  placeholder="SK1234567890123456789012"
                  type="text"
                />
                <FieldError errors={errors.iban ? [errors.iban] : undefined} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="amount">Suma (EUR) *</FieldLabel>
              <FieldContent>
                <Input
                  {...register("amount", {
                    required: "Suma je povinná",
                    min: {
                      value: 0.01,
                      message: "Suma musí byť väčšia ako 0",
                    },
                    valueAsNumber: true,
                  })}
                  id="amount"
                  min="0.01"
                  placeholder="0.00"
                  step="0.01"
                  type="number"
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
                    placeholder="Variabilný symbol"
                    type="text"
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="ss">SS</FieldLabel>
                <FieldContent>
                  <Input
                    {...register("specificSymbol")}
                    id="ss"
                    placeholder="Špecifický symbol"
                    type="text"
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="ks">KS</FieldLabel>
                <FieldContent>
                  <Input
                    {...register("constantSymbol")}
                    id="ks"
                    placeholder="Konštantný symbol"
                    type="text"
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
                  placeholder="Meno príjemcu"
                  type="text"
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="note">Poznámka</FieldLabel>
              <FieldContent>
                <Textarea
                  {...register("paymentNote")}
                  id="note"
                  placeholder="Poznámka k platbe"
                  rows={3}
                />
              </FieldContent>
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button onClick={handleClear} type="button" variant="outline">
            <IconTrash />
            Vymazať
          </Button>
          <Button type="submit">
            <IconQrcode />
            Vygenerovať QR
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
