export function JsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "QR Platby",
    url: "https://qr-platby.com",
    description:
      "Bezplatný online generátor QR kódov v BySquare formáte pre platby na Slovensku. Vytvorte QR kód pre platbu bez registrácie. Funguje so všetkými slovenskými bankami.",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
    },
    featureList: [
      "Generovanie QR kódov vo formáte BySquare",
      "Podpora všetkých slovenských bánk",
      "Lokálne uloženie histórie",
      "Bez registrácie",
    ],
    inLanguage: "sk",
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
