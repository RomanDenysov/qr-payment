import { track } from "@vercel/analytics";
import { useTranslations } from "next-intl";
import { useCallback, useTransition } from "react";
import { toast } from "sonner";
import type { BrandingConfig } from "../branding/store";
import { DEFAULT_CONFIG, useBrandingConfig } from "../branding/store";
import { EpcPayloadTooLargeError } from "./epc-encoder";
import { generatePaymentQR, InvalidIBANError } from "./qr-generator";
import type { PaymentFormData, PaymentRecord } from "./schema";
import { usePaymentActions } from "./store";

function trackQrGenerated(formData: PaymentFormData, branding: BrandingConfig) {
  const hasBranding =
    branding.fgColor !== DEFAULT_CONFIG.fgColor ||
    branding.bgColor !== DEFAULT_CONFIG.bgColor ||
    branding.centerText !== DEFAULT_CONFIG.centerText;

  const fieldsFilled = [
    formData.variableSymbol,
    formData.specificSymbol,
    formData.constantSymbol,
    formData.recipientName,
    formData.paymentNote,
    formData.bic,
  ].filter(Boolean).length;

  track("qr_generated", {
    format: formData.format ?? "bysquare",
    has_branding: hasBranding,
    has_logo: branding.logo !== null,
    fields_filled: fieldsFilled,
  });
}

export function usePaymentGenerator() {
  const [isPending, startTransition] = useTransition();
  const { setCurrent } = usePaymentActions();
  const branding = useBrandingConfig();
  const t = useTranslations("QRPreview");

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
          trackQrGenerated(formData, branding);
          toast.success(t("generated"));
        } catch (error) {
          if (
            error instanceof InvalidIBANError ||
            error instanceof EpcPayloadTooLargeError
          ) {
            toast.error(error.message);
          } else {
            const detail = error instanceof Error ? `: ${error.message}` : "";
            toast.error(`${t("generateFailed")}${detail}`);
          }
        }
      });
    },
    [setCurrent, branding, t]
  );

  return { generate, isPending };
}
