import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { FORMAT_LABELS, type PaymentFormat } from "../format";
import { createPaymentFormSchema, type PaymentFormData } from "../schema";
import { useCurrentPayment } from "../store";

const DEFAULT_VALUES: PaymentFormData = {
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
  paymentDueDate: "",
  invoiceId: "",
  spaydReference: "",
  purposeCode: "",
};

function parseFormatParam(value: string | null): PaymentFormat | null {
  if (value && value in FORMAT_LABELS) {
    return value as PaymentFormat;
  }
  return null;
}

// First-visit default per locale; the user's own last format always wins.
const LOCALE_DEFAULT_FORMAT: Record<string, PaymentFormat> = {
  sk: "bysquare",
  cs: "spayd",
  en: "epc",
};

export function usePaymentForm() {
  const tv = useTranslations("Validation");
  const schema = useMemo(() => createPaymentFormSchema(tv), [tv]);
  const lastPayment = useCurrentPayment();
  const searchParams = useSearchParams();
  const locale = useLocale();

  // Landing pages can preselect the format tab via /?format=epc
  const paramFormat = parseFormatParam(searchParams.get("format"));
  const format =
    paramFormat ??
    lastPayment?.format ??
    LOCALE_DEFAULT_FORMAT[locale] ??
    DEFAULT_VALUES.format;

  return useForm<PaymentFormData>({
    defaultValues: {
      ...DEFAULT_VALUES,
      format,
      currency:
        format === "epc"
          ? "EUR"
          : (lastPayment?.currency ?? DEFAULT_VALUES.currency),
    },
    resolver: zodResolver(schema),
    mode: "onBlur",
  });
}
