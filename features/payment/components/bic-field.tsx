"use client";

import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { PaymentFormData } from "../schema";

export function BicField() {
  const t = useTranslations("PaymentForm");
  const { register } = useFormContext<PaymentFormData>();

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
      </FieldContent>
    </Field>
  );
}
