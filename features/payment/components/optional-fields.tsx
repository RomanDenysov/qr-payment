"use client";

import { useTranslations } from "next-intl";
import {
  type Control,
  Controller,
  type FieldErrors,
  useController,
  useFormState,
} from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input, inputVariants } from "@/components/ui/input";
import {
  OPTIONAL_FIELDS,
  type OptionalFieldKey,
} from "@/features/payment/optional-fields";
import type { PaymentFormData } from "../schema";
import {
  hasPaymentDay,
  isWeekdayPeriodicity,
  PERIODICITIES,
  type Periodicity,
} from "../standing-order";

const WEEKDAYS = [1, 2, 3, 4, 5, 6, 7] as const;

/** Periodicity, payment day and end date of a PAY by square standing order.
 * The first payment date is the due date field, relabelled by the form. */
function StandingOrderFields({
  control,
  errors,
}: {
  control: Control<PaymentFormData>;
  errors: FieldErrors<PaymentFormData>;
}) {
  const t = useTranslations("PaymentForm");
  const { field: periodicityField } = useController({
    control,
    name: "periodicity",
  });
  const { field: dayField } = useController({
    control,
    name: "standingOrderDay",
  });
  const periodicity = periodicityField.value || "monthly";

  // A day of month means nothing as a weekday and the other way round.
  const handlePeriodicityChange = (next: Periodicity) => {
    if (isWeekdayPeriodicity(next) !== isWeekdayPeriodicity(periodicity)) {
      dayField.onChange("");
    }
    periodicityField.onChange(next);
  };

  return (
    <>
      <Field>
        <FieldLabel htmlFor="opt-periodicity">{t("periodicity")}</FieldLabel>
        <FieldContent>
          <select
            className={inputVariants()}
            id="opt-periodicity"
            name={periodicityField.name}
            onBlur={periodicityField.onBlur}
            onChange={(event) =>
              handlePeriodicityChange(event.target.value as Periodicity)
            }
            ref={periodicityField.ref}
            value={periodicity}
          >
            {PERIODICITIES.map((p) => (
              <option key={p} value={p}>
                {t(`periodicityOption.${p}`)}
              </option>
            ))}
          </select>
        </FieldContent>
      </Field>

      {hasPaymentDay(periodicity) ? (
        <Field>
          <FieldLabel htmlFor="opt-standingOrderDay">
            {isWeekdayPeriodicity(periodicity)
              ? t("standingOrderWeekday")
              : t("standingOrderDay")}
          </FieldLabel>
          <FieldContent>
            {isWeekdayPeriodicity(periodicity) ? (
              <select
                className={inputVariants()}
                id="opt-standingOrderDay"
                name={dayField.name}
                onBlur={dayField.onBlur}
                onChange={(event) => dayField.onChange(event.target.value)}
                ref={dayField.ref}
                value={dayField.value ?? ""}
              >
                <option value="">{t("standingOrderDayAny")}</option>
                {WEEKDAYS.map((d) => (
                  <option key={d} value={String(d)}>
                    {t(`weekday.${d}`)}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                id="opt-standingOrderDay"
                inputMode="numeric"
                maxLength={2}
                name={dayField.name}
                onBlur={dayField.onBlur}
                onChange={(event) => dayField.onChange(event.target.value)}
                placeholder={t("standingOrderDayPlaceholder")}
                ref={dayField.ref}
                value={dayField.value ?? ""}
              />
            )}
            <FieldError
              errors={
                errors.standingOrderDay ? [errors.standingOrderDay] : undefined
              }
            />
          </FieldContent>
        </Field>
      ) : null}

      <Field>
        <FieldLabel htmlFor="opt-standingOrderLastDate">
          {t("standingOrderLastDate")}
        </FieldLabel>
        <FieldContent>
          <Input
            {...control.register("standingOrderLastDate")}
            id="opt-standingOrderLastDate"
            type="date"
          />
          <FieldError
            errors={
              errors.standingOrderLastDate
                ? [errors.standingOrderLastDate]
                : undefined
            }
          />
        </FieldContent>
      </Field>
    </>
  );
}

interface OptionalFieldsProps {
  control: Control<PaymentFormData>;
  keys: OptionalFieldKey[];
  /** The due date doubles as the first payment date of a standing order. */
  isStandingOrder?: boolean;
}

/** Renders the opted-in optional fields of the current format. */
export function OptionalFields({
  control,
  keys,
  isStandingOrder = false,
}: OptionalFieldsProps) {
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

        if (config.inputType === "standingOrder") {
          return (
            <StandingOrderFields control={control} errors={errors} key={key} />
          );
        }

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
        const labelKey =
          key === "paymentDueDate" && isStandingOrder
            ? "firstPaymentDate"
            : config.labelKey;
        return (
          <Field key={key}>
            <FieldLabel htmlFor={id}>{t(labelKey)}</FieldLabel>
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
