import { electronicFormatIBAN, isValidIBAN } from "ibantools";
import z from "zod";

export const paymentFormSchema = z.object({
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
});

export type PaymentFormData = z.infer<typeof paymentFormSchema>;

export type PaymentRecord = PaymentFormData & {
  id: string;
  createdAt: string;
  qrDataUrl?: string;
};
