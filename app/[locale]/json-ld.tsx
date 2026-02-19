import { getLocale, getTranslations } from "next-intl/server";

export async function JsonLd() {
  const locale = await getLocale();
  const t = await getTranslations("Metadata");

  const jsonLd = {
    "@context": "https://schema.org",
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
  };

  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data requires script injection
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      type="application/ld+json"
    />
  );
}
