import { getTranslations } from "next-intl/server";
import { JsonLdScript } from "@/components/json-ld";

export async function HomeJsonLd() {
  const t = await getTranslations("JsonLd.howTo");

  const steps = [1, 2, 3, 4].map((position) => ({
    "@type": "HowToStep",
    name: t(`step${position}Name`),
    text: t(`step${position}Text`),
    position,
  }));

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
    step: steps,
  };

  return <JsonLdScript data={jsonLd} />;
}
