import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const BASE_URL = "https://qr-platby.com";

type RouteHref = Parameters<typeof getPathname>[0]["href"];

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
  const href = path === "" ? "/" : path;
  if (!(href in routing.pathnames)) {
    // Non-route static files (openapi.json, llms.txt) — never locale-prefixed
    return `${BASE_URL}${path}`;
  }
  const pathname = getPathname({ locale, href: href as RouteHref });
  return pathname === "/" ? BASE_URL : `${BASE_URL}${pathname}`;
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
