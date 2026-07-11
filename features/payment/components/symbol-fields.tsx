"use client";

import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { PaymentFormData } from "../schema";

export function SymbolFields() {
  const { register } = useFormContext<PaymentFormData>();
  const t = useTranslations("PaymentForm");

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
        </FieldContent>
      </Field>
    </div>
  );
}
