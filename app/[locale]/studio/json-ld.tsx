import { createElement } from "react";
import { localePath } from "@/lib/seo";

interface JsonLdProps {
  locale: string;
  studioTitle: string;
  studioDescription: string;
  homeName: string;
}

const INNER_HTML_PROP = "dangerouslySetInnerHTML";

function ldScript(json: unknown) {
  const props: Record<string, unknown> = {
    type: "application/ld+json",
    [INNER_HTML_PROP]: { __html: JSON.stringify(json) },
  };
  return createElement("script", props);
}

export function JsonLd({
  locale,
  studioTitle,
  studioDescription,
  homeName,
}: JsonLdProps) {
  const breadcrumb = {
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
        name: studioTitle,
        item: localePath(locale, "/studio"),
      },
    ],
  };

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
      {ldScript(breadcrumb)}
      {ldScript(app)}
    </>
  );
}
