"use client";

import { useCallback, useTransition } from "react";
import { toast } from "sonner";
import { AdPlaceholder } from "@/components/ad-placeholder";
import { PaymentFormCard } from "@/components/payment-form-card";
import { QRPreviewCard } from "@/components/qr-preview-card";
import { generatePaymentQR, InvalidIBANError } from "@/lib/generate-qr-image";
import {
  usePaymentHistory,
  usePaymentHistoryActions,
} from "@/store/payment-history-store";
import type { PaymentData } from "@/types/payment-data";
import { Grid } from "./views/grid";

export function PaymentQRPage() {
  const [isPending, startTransition] = useTransition();
  const history = usePaymentHistory();
  const { addPayment } = usePaymentHistoryActions();

  const handleGenerate = useCallback(
    (data: PaymentData) =>
      startTransition(async () => {
        try {
          const qrUrl = await generatePaymentQR(data);
          addPayment({
            ...data,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            qrDataUrl: qrUrl,
          });
          toast.success("QR kód vygenerovaný");
        } catch (error) {
          if (error instanceof InvalidIBANError) {
            toast.error(error.message);
          } else {
            toast.error("Nepodarilo sa vygenerovať QR kód");
          }
        }
      }),
    [addPayment]
  );

  return (
    <Grid>
      {/* Main Content */}

      <PaymentFormCard onSubmit={handleGenerate} />
      <QRPreviewCard isLoading={isPending} paymentData={history[0]} />

      {/* Mobile Ad */}
      <div className="block md:hidden">
        <AdPlaceholder />
      </div>

      {/* Desktop Ad */}
      <div className="hidden md:block">
        <AdPlaceholder />
      </div>
    </Grid>
  );
}
