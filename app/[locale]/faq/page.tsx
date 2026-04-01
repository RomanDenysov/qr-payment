import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { linkVariants } from "@/components/ui/link";
import { getFaqData } from "@/features/faq/data";
import { Link } from "@/i18n/navigation";
import { getAlternates, getOgLocale, localePath } from "@/lib/seo";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("faqTitle"),
    description: t("faqDescription"),
    alternates: getAlternates(locale, "/faq"),
    openGraph: {
      title: t("faqTitle"),
      description: t("faqDescription"),
      url: localePath(locale, "/faq"),
      locale: getOgLocale(locale),
    },
  };
}

export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Metadata" });
  const t_nav = await getTranslations({ locale, namespace: "Nav" });
  const faqItems = getFaqData(locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: t_nav("home"),
        item: localePath(locale, "/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: t("faqTitle"),
        item: localePath(locale, "/faq"),
      },
    ],
  };

  return (
    <div className="flex-1 pt-5 sm:pt-8 md:pt-16">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="font-bold font-pixel text-foreground text-lg tracking-wide sm:text-xl">
          {t("faqTitle")}
        </h1>
        <Accordion>
          {faqItems.map((item) => (
            <AccordionItem key={item.question} value={item.question}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>
                <p>{item.answer}</p>
                {item.links && item.links.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {item.links.map((link) => (
                      <Link
                        className={linkVariants()}
                        href={link.href}
                        key={link.href}
                      >
                        {link.label} →
                      </Link>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data from hardcoded content
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          type="application/ld+json"
        />
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data from hardcoded content
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
          type="application/ld+json"
        />
        <div className="pt-4 text-center">
          <Link className={linkVariants({ size: "sm" })} href="/">
            ← {t("backToHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
