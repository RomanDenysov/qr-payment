"use client";

import { track } from "@vercel/analytics";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

const CONSENT_KEY = "consent-dismissed";
const PAYMENT_STORE_KEY = "qrPayments.v1";

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(CONSENT_KEY)) {
      return;
    }

    // Existing users with payment data have implied consent
    if (localStorage.getItem(PAYMENT_STORE_KEY)) {
      localStorage.setItem(CONSENT_KEY, "1");
      return;
    }

    setVisible(true);
  }, []);

  if (!visible) {
    return null;
  }

  const handleDismiss = () => {
    localStorage.setItem(CONSENT_KEY, "1");
    track("consent_banner_dismissed");
    setVisible(false);
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-border border-t bg-background/95 px-4 py-3 backdrop-blur-sm"
      role="alert"
    >
      <div className="container mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 sm:flex-row">
        <p className="text-center text-muted-foreground text-xs sm:text-left">
          Táto stránka používa localStorage na uloženie vašich nastavení. Žiadne
          cookies ani osobné údaje nezbierame.
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            className="text-muted-foreground text-xs underline underline-offset-4 hover:text-foreground"
            href="/ochrana-udajov"
          >
            Viac info
          </Link>
          <Button onClick={handleDismiss} size="sm" variant="outline">
            Rozumiem
          </Button>
        </div>
      </div>
    </div>
  );
}
