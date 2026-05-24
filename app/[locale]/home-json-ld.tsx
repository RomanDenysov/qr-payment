import { getTranslations } from "next-intl/server";

export async function HomeJsonLd() {
  const t = await getTranslations("JsonLd.howTo");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: t("name"),
    description: t("description"),
    totalTime: "PT1M",
    estimatedCost: {
      "@type": "MonetaryAmount",
      currency: "EUR",
      value: "0",
    },
    tool: [{ "@type": "HowToTool", name: t("tool") }],
    step: [
      {
        "@type": "HowToStep",
        name: t("step1Name"),
        text: t("step1Text"),
        position: 1,
      },
      {
        "@type": "HowToStep",
        name: t("step2Name"),
        text: t("step2Text"),
        position: 2,
      },
      {
        "@type": "HowToStep",
        name: t("step3Name"),
        text: t("step3Text"),
        position: 3,
      },
      {
        "@type": "HowToStep",
        name: t("step4Name"),
        text: t("step4Text"),
        position: 4,
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
