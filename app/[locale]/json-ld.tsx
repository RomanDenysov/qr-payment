import { getLocale, getTranslations } from "next-intl/server";
import { localePath } from "@/lib/seo";

export async function JsonLd() {
  const locale = await getLocale();
  const t = await getTranslations("Metadata");

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "QR Platby",
        url: "https://qr-platby.com",
        description: t("description"),
        applicationCategory: "FinanceApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "EUR",
        },
        inLanguage: locale,
        availableLanguage: ["sk", "cs", "en"],
        isAccessibleForFree: true,
        author: {
          "@type": "Person",
          name: "Roman Denysov",
          url: "https://github.com/RomanDenysov",
        },
      },
      {
        "@type": "WebAPI",
        name: "QR Platby API",
        description: t("webApiDescription"),
        url: "https://qr-platby.com/api/v1/qr",
        documentation: localePath(locale, "/docs"),
        termsOfService: "https://qr-platby.com/podmienky",
        provider: {
          "@type": "Organization",
          name: "QR Platby",
          url: "https://qr-platby.com",
          areaServed: ["SK", "CZ"],
        },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "EUR",
          description: "Free tier: 10 requests/minute, 100 requests/day",
        },
      },
    ],
  };

  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data requires script injection
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      type="application/ld+json"
    />
  );
}
