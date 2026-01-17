import { track } from "@vercel/analytics";
import { useCallback, useTransition } from "react";
import { toast } from "sonner";
import { useActivePreset } from "@/features/branding/store";
import { generatePaymentQR, InvalidIBANError } from "./qr-generator";
import type { PaymentFormData, PaymentRecord } from "./schema";
import { usePaymentActions } from "./store";

export function usePaymentGenerator() {
  const [isPending, startTransition] = useTransition();
  const { setCurrent } = usePaymentActions();
  const activePreset = useActivePreset();

  const generate = useCallback(
    (formData: PaymentFormData) => {
      startTransition(async () => {
        try {
          const branding = activePreset
            ? {
                colors: activePreset.colors,
                logo: activePreset.logo,
                cornerStyle: activePreset.cornerStyle,
                frame: activePreset.frame?.enabled
                  ? {
                      text: activePreset.frame.text,
                      position: activePreset.frame.position,
                    }
                  : undefined,
              }
            : undefined;

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
    [activePreset, setCurrent]
  );

  return { generate, isPending };
}
