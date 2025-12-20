"use client";

import { IconHistory } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";
import { AdPlaceholder } from "@/components/ad-placeholder";
import { Footer } from "@/components/footer";
import { HistorySheet } from "@/components/history-sheet";
import { PaymentFormCard } from "@/components/payment-form-card";
import { QRPreviewCard } from "@/components/qr-preview-card";
import { Button } from "@/components/ui/button";
import type { PaymentData } from "@/lib/generate-qr-image";
import { generatePaymentQR, InvalidIBANError } from "@/lib/generate-qr-image";
import { savePaymentToHistory } from "@/lib/payment-history";

export function PaymentQRPage() {
  const [qrDataUrl, setQrDataUrl] = useState<string | undefined>();
  const [paymentData, setPaymentData] = useState<PaymentData | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const handleGenerate = async (data: PaymentData) => {
    setIsLoading(true);
    setQrDataUrl(undefined);

    try {
      const qrUrl = await generatePaymentQR(data);
      setQrDataUrl(qrUrl);
      setPaymentData(data);
      savePaymentToHistory(data, qrUrl);
      toast.success("QR kód vygenerovaný");
    } catch (error) {
      if (error instanceof InvalidIBANError) {
        toast.error(error.message);
      } else {
        toast.error("Nepodarilo sa vygenerovať QR kód");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setQrDataUrl(undefined);
    setPaymentData(undefined);
  };

  const handleSelectPayment = (payment: PaymentData) => {
    setPaymentData(payment);
    // Optionally auto-generate QR for selected payment
    handleGenerate(payment);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="container mx-auto max-w-6xl flex-1 px-4 py-8">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-2xl">QR Platby</h1>
            <p className="text-muted-foreground text-xs">
              Generátor QR kódov pre platby v BySquare formáte
            </p>
          </div>
          <Button onClick={() => setHistoryOpen(true)} variant="outline">
            <IconHistory />
            História
          </Button>
        </header>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-2">
          <PaymentFormCard
            initialData={paymentData}
            onClear={handleClear}
            onSubmit={handleGenerate}
          />
          <QRPreviewCard
            isLoading={isLoading}
            paymentData={paymentData}
            qrDataUrl={qrDataUrl}
          />
        </div>

        {/* Mobile Ad */}
        <div className="mt-6 flex justify-center md:hidden">
          <AdPlaceholder size="mobile" />
        </div>

        {/* Desktop Ad */}
        <div className="mt-6 hidden justify-center md:flex">
          <AdPlaceholder size="desktop" />
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* History Sheet */}
      <HistorySheet
        onOpenChange={setHistoryOpen}
        onSelectPayment={handleSelectPayment}
        open={historyOpen}
      />
    </div>
  );
}
