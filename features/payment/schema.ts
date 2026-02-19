import { electronicFormatIBAN, isValidIBAN } from "ibantools";
import z from "zod";

const BIC_RE = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/i;

export const paymentFormSchema = z
  .object({
    format: z.enum(["bysquare", "epc"]),
    iban: z
      .string()
      .min(1, "IBAN je povinný")
      .refine(
        (val) => {
          const electronic = electronicFormatIBAN(val);
          return electronic && isValidIBAN(electronic);
        },
        { message: "Neplatný formát IBAN" }
      ),
    amount: z
      .number({ message: "Suma je povinná" })
      .min(0.01, "Suma musí byť väčšia ako 0"),
    variableSymbol: z.string().max(10, "Max 10 znakov").optional(),
    specificSymbol: z.string().max(10, "Max 10 znakov").optional(),
    constantSymbol: z.string().max(4, "Max 4 znaky").optional(),
    recipientName: z.string().max(70, "Max 70 znakov").optional(),
    paymentNote: z.string().max(140, "Max 140 znakov").optional(),
    bic: z.string().max(11, "Max 11 znakov").optional(),
  })
  .superRefine((data, ctx) => {
    if (data.format === "epc") {
      if (!data.recipientName?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Meno príjemcu je povinné pre EPC QR",
          path: ["recipientName"],
        });
      }

      if (data.bic && !BIC_RE.test(data.bic)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "BIC musí mať 8 alebo 11 znakov",
          path: ["bic"],
        });
      }

      if (data.amount > 999_999_999.99) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Max suma pre EPC QR je 999 999 999,99 €",
          path: ["amount"],
        });
      }
    }
  });

export type PaymentFormData = z.infer<typeof paymentFormSchema>;

export type PaymentRecord = PaymentFormData & {
  id: string;
  createdAt: string;
  qrDataUrl?: string;
  name?: string;
};
