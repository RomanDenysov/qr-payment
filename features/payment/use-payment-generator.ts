import { track } from "@vercel/analytics";
import { useTranslations } from "next-intl";
import { useCallback, useTransition } from "react";
import { toast } from "sonner";
import { renderCustomizerQR } from "@/features/customizer/renderer";
import { useCustomizerConfig } from "@/features/customizer/store";
import type { CustomizerConfig } from "@/features/customizer/types";
import {
  DEFAULT_CUSTOMIZER_CONFIG,
  fillPrimaryColor,
} from "@/features/customizer/types";
import { EpcPayloadTooLargeError } from "./epc-encoder";
import { InvalidIBANError } from "./qr-generator";
import type { PaymentFormData, PaymentRecord } from "./schema";
import { SpaydPayloadTooLargeError } from "./spayd-encoder";
import { usePaymentActions } from "./store";

function trackQrGenerated(
  formData: PaymentFormData,
  cfg: CustomizerConfig
): void {
  const defaults = DEFAULT_CUSTOMIZER_CONFIG;
  const hasBranding =
    fillPrimaryColor(cfg.fgFill) !== fillPrimaryColor(defaults.fgFill) ||
    fillPrimaryColor(cfg.bgFill) !== fillPrimaryColor(defaults.bgFill) ||
    cfg.fgFill.kind !== "solid" ||
    cfg.bgFill.kind !== "solid" ||
    cfg.centerText !== defaults.centerText ||
    cfg.frame.enabled;

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
    currency: formData.currency ?? "EUR",
    has_branding: hasBranding,
    has_logo: cfg.logo !== null,
    fields_filled: fieldsFilled,
  });
}

export function usePaymentGenerator() {
  const [isPending, startTransition] = useTransition();
  const { setCurrent } = usePaymentActions();
  const customizer = useCustomizerConfig();
  const t = useTranslations("QRPreview");

  const generate = useCallback(
    (formData: PaymentFormData) => {
      startTransition(async () => {
        try {
          const qrDataUrl = await renderCustomizerQR(formData, customizer);

          const record: PaymentRecord = {
            ...formData,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            qrDataUrl,
          };

          setCurrent(record);
          trackQrGenerated(formData, customizer);
          toast.success(t("generated"));
        } catch (error) {
          if (
            error instanceof InvalidIBANError ||
            error instanceof EpcPayloadTooLargeError ||
            error instanceof SpaydPayloadTooLargeError
          ) {
            toast.error(error.message);
          } else {
            const detail = error instanceof Error ? `: ${error.message}` : "";
            toast.error(`${t("generateFailed")}${detail}`);
          }
        }
      });
    },
    [setCurrent, customizer, t]
  );

  return { generate, isPending };
}
