import { electronicFormatIBAN, isValidIBAN } from "ibantools";
import z from "zod";

const BIC_RE = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/i;
const DIGITS_RE = /^\d*$/;

export function createPaymentFormSchema(t: (key: string) => string) {
  return z
    .object({
      format: z.enum(["bysquare", "epc"]),
      currency: z.enum(["EUR", "CZK"]),
      iban: z
        .string()
        .min(1, t("ibanRequired"))
        .refine(
          (val) => {
            const electronic = electronicFormatIBAN(val);
            return electronic && isValidIBAN(electronic);
          },
          { message: t("ibanInvalid") }
        ),
      amount: z
        .number({ message: t("amountRequired") })
        .min(0.01, t("amountMin")),
      variableSymbol: z
        .string()
        .max(10, t("max10chars"))
        .refine((val) => DIGITS_RE.test(val), t("digitsOnly"))
        .optional(),
      specificSymbol: z
        .string()
        .max(10, t("max10chars"))
        .refine((val) => DIGITS_RE.test(val), t("digitsOnly"))
        .optional(),
      constantSymbol: z
        .string()
        .max(4, t("max4chars"))
        .refine((val) => DIGITS_RE.test(val), t("digitsOnly"))
        .optional(),
      recipientName: z.string().max(70, t("max70chars")).optional(),
      paymentNote: z.string().max(140, t("max140chars")).optional(),
      bic: z.string().max(11, t("max11chars")).optional(),
    })
    .superRefine((data, ctx) => {
      if (data.format === "epc" && data.currency !== "EUR") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("epcEurOnly"),
          path: ["currency"],
        });
      }

      if (data.format === "epc" && !data.recipientName?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("recipientRequired"),
          path: ["recipientName"],
        });
      }

      if (data.format === "epc" && data.bic && !BIC_RE.test(data.bic)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("bicInvalid"),
          path: ["bic"],
        });
      }

      if (data.amount > 999_999_999.99) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            data.format === "epc" ? t("epcMaxAmount") : t("bysquareMaxAmount"),
          path: ["amount"],
        });
      }
    });
}

export type PaymentFormData = z.infer<
  ReturnType<typeof createPaymentFormSchema>
>;

export type PaymentRecord = PaymentFormData & {
  id: string;
  createdAt: string;
  qrDataUrl?: string;
  name?: string;
};
