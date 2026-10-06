import { JsonLdScript } from "@/components/json-ld";
import { breadcrumbJsonLd, localePath } from "@/lib/seo";

interface JsonLdProps {
  locale: string;
  studioTitle: string;
  studioDescription: string;
  homeName: string;
}

export function JsonLd({
  locale,
  studioTitle,
  studioDescription,
  homeName,
}: JsonLdProps) {
  const breadcrumb = breadcrumbJsonLd(locale, homeName, {
    name: studioTitle,
    path: "/studio",
  });

  const app = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: studioTitle,
    description: studioDescription,
    url: localePath(locale, "/studio"),
    applicationCategory: "DesignApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    inLanguage: locale,
  };

  return (
    <>
      <JsonLdScript data={breadcrumb} />
      <JsonLdScript data={app} />
    </>
  );
}
