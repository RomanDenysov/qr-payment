import { getLocale, getTranslations } from "next-intl/server";

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
        description:
          "REST API for generating PAY by square QR codes for Slovak bank payments. Free, no authentication required.",
        url: "https://qr-platby.com/api/v1/qr",
        documentation: "https://qr-platby.com/api/v1/qr",
        termsOfService: "https://qr-platby.com/podmienky",
        provider: {
          "@type": "Organization",
          name: "QR Platby",
          url: "https://qr-platby.com",
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
