import { routing } from "@/i18n/routing";

const BASE_URL = "https://qr-platby.com";

function localePath(locale: string, path: string) {
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
