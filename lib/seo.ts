import { routing } from "@/i18n/routing";

const BASE_URL = "https://qr-platby.com";

const OG_LOCALES: Record<string, string> = {
  sk: "sk_SK",
  cs: "cs_CZ",
  en: "en_US",
};

export function getOgLocale(locale: string) {
  return OG_LOCALES[locale] ?? "sk_SK";
}

export function getAlternateOgLocales(locale: string) {
  return Object.entries(OG_LOCALES)
    .filter(([key]) => key !== locale)
    .map(([_, value]) => value);
}

export function localePath(locale: string, path: string) {
  if (locale === routing.defaultLocale) {
    return `${BASE_URL}${path}`;
  }
  return `${BASE_URL}/${locale}${path}`;
}

export function getAlternates(locale: string, path = "") {
  return {
    canonical: localePath(locale, path),
    languages: {
      ...Object.fromEntries(
        routing.locales.map((l) => [l, localePath(l, path)])
      ),
      "x-default": localePath(routing.defaultLocale, path),
    },
  };
}
