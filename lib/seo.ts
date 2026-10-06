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

export interface FaqItem {
  question: string;
  answer: string;
}

/** schema.org FAQPage for a page's question list. */
export function faqPageJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/** schema.org BreadcrumbList for a page one level below home. */
export function breadcrumbJsonLd(
  locale: string,
  homeName: string,
  page: { name: string; path: string }
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: homeName,
        item: localePath(locale, "/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: page.name,
        item: localePath(locale, page.path),
      },
    ],
  };
}
