"use client";

import { useCallback, useTransition } from "react";
import { toast } from "sonner";
import { AdPlaceholder } from "@/components/ad-placeholder";
import { PaymentFormCard } from "@/components/payment-form-card";
import { QRPreviewCard } from "@/components/qr-preview-card";
import { generatePaymentQR, InvalidIBANError } from "@/lib/generate-qr-image";
import {
  usePaymentActions,
  usePaymentHistory,
} from "@/store/payment-history-store";
import type { PaymentData } from "@/types/payment-data";

export function PaymentQRPage() {
  const [isPending, startTransition] = useTransition();
  const history = usePaymentHistory();
  const { setCurrent } = usePaymentActions();

  const handleGenerate = useCallback(
    (data: PaymentData) =>
      startTransition(async () => {
        try {
          const qrUrl = await generatePaymentQR(data);
          setCurrent({ ...data, qrDataUrl: qrUrl });
          toast.success("QR kód vygenerovaný");
        } catch (error) {
          if (error instanceof InvalidIBANError) {
            toast.error(error.message);
          } else {
            toast.error("Nepodarilo sa vygenerovať QR kód");
          }
        }
      }),
    [setCurrent]
  );

  return (
    <section className="grid gap-8 *:rounded-none sm:grid-cols-2" role="feed">
      <PaymentFormCard onSubmit={handleGenerate} />
      <QRPreviewCard isLoading={isPending} paymentData={history[0]} />

      <AdPlaceholder className="col-span-full" />
    </section>
  );
}
