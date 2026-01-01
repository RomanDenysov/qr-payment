"use client";

import { IconCopy, IconDownload, IconShare } from "@tabler/icons-react";
import Image from "next/image";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { maskIban } from "@/lib/utils";
import type { PaymentRecord } from "../schema";
import { useCurrentPayment } from "../store";

function PaymentDetails({ paymentDetails }: { paymentDetails: PaymentRecord }) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Badge variant="secondary">{maskIban(paymentDetails.iban)}</Badge>
      <Badge variant="secondary">{paymentDetails.amount.toFixed(2)} EUR</Badge>
      <Badge variant="secondary">VS: {paymentDetails.variableSymbol}</Badge>
      <Badge variant="secondary">SS: {paymentDetails.specificSymbol}</Badge>
      <Badge variant="secondary">KS: {paymentDetails.constantSymbol}</Badge>
    </div>
  );
}

export function QRPreviewCard() {
  const current = useCurrentPayment();

  const handleDownload = () => {
    if (!current?.qrDataUrl) {
      return;
    }

    const link = document.createElement("a");
    link.href = current.qrDataUrl;
    link.download = `qr-payment-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("QR kód stiahnutý");
  };

  const handleCopy = async () => {
    if (!current?.qrDataUrl) {
      return;
    }

    try {
      const response = await fetch(current.qrDataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      toast.success("QR kód skopírovaný");
    } catch {
      toast.error("Nepodarilo sa skopírovať QR kód");
    }
  };

  const handleShare = async () => {
    if (!(current?.qrDataUrl && navigator.share)) {
      handleCopy();
      return;
    }

    try {
      const response = await fetch(current.qrDataUrl);
      const blob = await response.blob();
      const file = new File([blob], "qr-payment.png", { type: "image/png" });
      await navigator.share({
        files: [file],
        title: "QR platba",
      });
      toast.success("QR kód zdieľaný");
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        handleCopy();
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>QR kód</CardTitle>
      </CardHeader>
      <CardContent className="flex h-full grow flex-col items-center justify-center">
        {current?.qrDataUrl ? (
          <>
            <Image
              alt="QR payment code"
              className="mb-4 size-64 rounded-none md:size-96"
              height={384}
              src={current.qrDataUrl}
              width={384}
            />
            <PaymentDetails paymentDetails={current} />
          </>
        ) : (
          <p className="m-auto w-full text-center text-muted-foreground text-xs">
            Zadajte údaje a kliknite Vygenerovať
          </p>
        )}
      </CardContent>
      {current?.qrDataUrl ? (
        <CardFooter className="mt-auto gap-2">
          <Button className="flex-1" onClick={handleDownload} variant="outline">
            <IconDownload />
            Stiahnuť
          </Button>
          <Button className="flex-1" onClick={handleShare} variant="outline">
            <IconShare />
            Zdieľať
          </Button>
          <Button className="flex-1" onClick={handleCopy} variant="outline">
            <IconCopy />
            Kopírovať
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
}
