"use client";

import { useTranslations } from "next-intl";
import { type ReactNode, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  decodeShareData,
  type SharePayload,
} from "@/features/payment/share-link";
import { Link } from "@/i18n/navigation";
import { PaymentDetails } from "./payment-details";
import { ShareQRSection } from "./share-qr-section";

/**
 * Reads the encoded payment from the URL fragment (`/p#d=...`). Browsers do
 * not send the fragment to the server, and `components/analytics.tsx` strips
 * it from analytics events. Links made before the switch carry
 * it in the query (`/p?d=...`) and are still read here.
 */
function readShareData(): SharePayload | null {
  const fromHash = new URLSearchParams(window.location.hash.slice(1)).get("d");
  const encoded =
    fromHash ?? new URLSearchParams(window.location.search).get("d");
  return encoded ? decodeShareData(encoded) : null;
}

/** Shared payment card. `children` (the call to action) shows under a valid payment. */
export function SharedPayment({ children }: { children: ReactNode }) {
  const t = useTranslations("SharePage");
  // undefined = not read yet, null = missing or invalid link
  const [data, setData] = useState<SharePayload | null | undefined>(undefined);

  useEffect(() => {
    // A second share link opened in the same tab only changes the fragment.
    const read = () => setData(readShareData());
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  if (data === undefined) {
    // Same wrapper as the loaded state, so the footer does not jump.
    return <div className="mx-auto flex max-w-md flex-1 flex-col pt-5" />;
  }

  if (!data) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 pt-16">
        <p className="text-muted-foreground">{t("invalidLink")}</p>
        <Link href="/">
          <Button>{t("backHome")}</Button>
        </Link>
      </div>
    );
  }

  const { payment, branding } = data;

  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col items-center pt-5 sm:pt-8 md:pt-16">
      <Card className="w-full py-0">
        <CardHeader className="h-10 gap-0 border-b px-0">
          <CardTitle className="h-full grow px-4 py-2">{t("title")}</CardTitle>
        </CardHeader>
        <ShareQRSection branding={branding} payment={payment}>
          <PaymentDetails
            format={payment.format ?? "bysquare"}
            payment={payment}
          />
        </ShareQRSection>
      </Card>
      {children}
    </div>
  );
}
