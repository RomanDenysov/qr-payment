import { getLocale, getTranslations } from "next-intl/server";
import { localePath } from "@/lib/seo";
import { getFaqData } from "@/features/faq/data";

export async function JsonLd() {
  const locale = await getLocale();
  const t = await getTranslations("Metadata");
  const tHowTo = await getTranslations("JsonLd.howTo");
  const faqData = getFaqData(locale);

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
          description: "Free tier: 20 requests/minute, 100 requests/day",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqData.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
      {
        "@type": "HowTo",
        name: tHowTo("name"),
        description: tHowTo("description"),
        totalTime: "PT1M",
        estimatedCost: {
          "@type": "MonetaryAmount",
          currency: "EUR",
          value: "0",
        },
        supply: [],
        tool: [{ "@type": "HowToTool", name: tHowTo("tool") }],
        step: [
          {
            "@type": "HowToStep",
            name: tHowTo("step1Name"),
            text: tHowTo("step1Text"),
            position: 1,
          },
          {
            "@type": "HowToStep",
            name: tHowTo("step2Name"),
            text: tHowTo("step2Text"),
            position: 2,
          },
          {
            "@type": "HowToStep",
            name: tHowTo("step3Name"),
            text: tHowTo("step3Text"),
            position: 3,
          },
          {
            "@type": "HowToStep",
            name: tHowTo("step4Name"),
            text: tHowTo("step4Text"),
            position: 4,
          },
        ],
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
