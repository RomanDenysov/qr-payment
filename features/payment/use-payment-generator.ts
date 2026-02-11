import { track } from "@vercel/analytics";
import { useCallback, useTransition } from "react";
import { toast } from "sonner";
import { useBrandingConfig } from "../branding/store";
import { generatePaymentQR, InvalidIBANError } from "./qr-generator";
import type { PaymentFormData, PaymentRecord } from "./schema";
import { usePaymentActions } from "./store";

export function usePaymentGenerator() {
  const [isPending, startTransition] = useTransition();
  const { setCurrent } = usePaymentActions();
  const branding = useBrandingConfig();

  const generate = useCallback(
    (formData: PaymentFormData) => {
      startTransition(async () => {
        try {
          const qrDataUrl = await generatePaymentQR(formData, branding);

          const record: PaymentRecord = {
            ...formData,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            qrDataUrl,
          };

          setCurrent(record);
          track("qr_generated");
          toast.success("QR kód vygenerovaný");
        } catch (error) {
          if (error instanceof InvalidIBANError) {
            toast.error(error.message);
          } else {
            toast.error("Nepodarilo sa vygenerovať QR kód");
          }
        }
      });
    },
    [setCurrent, branding]
  );

  return { generate, isPending };
}
