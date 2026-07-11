"use client";

import { useTranslations } from "next-intl";
import { useFormContext, useFormState } from "react-hook-form";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  OPTIONAL_FIELDS,
  type OptionalFieldKey,
} from "@/features/payment/optional-fields";
import type { PaymentFormData } from "../schema";

export function OptionalFields({ keys }: { keys: OptionalFieldKey[] }) {
  const t = useTranslations("PaymentForm");
  const { register, control } = useFormContext<PaymentFormData>();
  const { errors } = useFormState({ control });

  if (keys.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {keys.map((key) => {
        const config = OPTIONAL_FIELDS[key];
        const error = errors[key];
        return (
          <Field key={key}>
            <FieldLabel htmlFor={`opt-${key}`}>{t(config.labelKey)}</FieldLabel>
            <FieldContent>
              <Input
                {...register(key)}
                id={`opt-${key}`}
                inputMode={config.inputMode}
                maxLength={config.maxLength}
                placeholder={
                  config.placeholderKey ? t(config.placeholderKey) : undefined
                }
                type={config.inputType}
              />
              <FieldError errors={error ? [error] : undefined} />
            </FieldContent>
          </Field>
        );
      })}
    </div>
  );
}
