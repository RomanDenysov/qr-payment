"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { Button } from "./ui/button";

const LOCALE_LABELS: Record<Locale, string> = {
  sk: "SK",
  cs: "CZ",
  en: "EN",
};

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const currentIndex = routing.locales.indexOf(locale);
  const nextLocale =
    routing.locales[(currentIndex + 1) % routing.locales.length];

  const handleSwitch = () => {
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <Button
      aria-label={`Switch to ${LOCALE_LABELS[nextLocale]}`}
      onClick={handleSwitch}
      size="sm"
      variant="ghost"
    >
      {LOCALE_LABELS[locale]}
    </Button>
  );
}
