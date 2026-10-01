"use client";

import { useTranslations } from "next-intl";
import { type Control, Controller, useFormState } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
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

interface OptionalFieldsProps {
  control: Control<PaymentFormData>;
  keys: OptionalFieldKey[];
}

/** Renders the opted-in optional fields of the current format. */
export function OptionalFields({ control, keys }: OptionalFieldsProps) {
  const t = useTranslations("PaymentForm");
  const { errors } = useFormState({ control });

  if (keys.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {keys.map((key) => {
        const config = OPTIONAL_FIELDS[key];
        const id = `opt-${key}`;

        if (config.inputType === "checkbox") {
          return (
            <Field className="sm:col-span-2" key={key} orientation="horizontal">
              <Controller
                control={control}
                name={key}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value === true}
                    id={id}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <FieldLabel htmlFor={id}>{t(config.labelKey)}</FieldLabel>
            </Field>
          );
        }

        const error = errors[key];
        return (
          <Field key={key}>
            <FieldLabel htmlFor={id}>{t(config.labelKey)}</FieldLabel>
            <FieldContent>
              <Input
                {...control.register(key)}
                id={id}
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
