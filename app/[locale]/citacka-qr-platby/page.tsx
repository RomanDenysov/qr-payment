import { getTranslations } from "next-intl/server";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { QrReader } from "@/features/reader/components/qr-reader";
import { getAlternates, getOgLocale, localePath } from "@/lib/seo";

const READER_PATH = "/citacka-qr-platby";

const SECTION_HEADING_CLASS =
  "font-bold font-pixel text-foreground text-lg tracking-wide sm:text-xl";

interface ReaderFaqItem {
  question: string;
  answer: string;
}

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("readerTitle"),
    description: t("readerDescription"),
    alternates: getAlternates(locale, READER_PATH),
    openGraph: {
      title: t("readerTitle"),
      description: t("readerDescription"),
      url: localePath(locale, READER_PATH),
      locale: getOgLocale(locale),
    },
  };
}

/** Payment QR reader: decodes a QR image or its text in the browser. */
export default async function ReaderPage({ params }: Props) {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: "Reader" });
  const tNav = await getTranslations({ locale, namespace: "Nav" });

  const faqItems = t.raw("faq") as ReaderFaqItem[];

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: tNav("home"),
        item: localePath(locale, "/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: t("h1"),
        item: localePath(locale, READER_PATH),
      },
    ],
  };

  return (
    <div className="flex-1 pt-5 sm:pt-8 md:pt-16">
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data requires script injection
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        type="application/ld+json"
      />
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data requires script injection
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        type="application/ld+json"
      />
      <div className="mx-auto max-w-4xl">
        <h1 className={SECTION_HEADING_CLASS}>{t("h1")}</h1>
        <p className="mt-6 mb-8 text-muted-foreground">{t("intro")}</p>

        <QrReader />

        <section className="mt-16 space-y-6">
          <h2 className={SECTION_HEADING_CLASS}>{t("useTitle")}</h2>
          <p className="text-muted-foreground">{t("useCheck")}</p>
          <p className="text-muted-foreground">{t("useConvert")}</p>
        </section>

        <section className="mt-16 space-y-6">
          <h2 className={SECTION_HEADING_CLASS}>{t("faqTitle")}</h2>
          <Accordion>
            {faqItems.map((item) => (
              <AccordionItem key={item.question} value={item.question}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>
                  <p>{item.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
    </div>
  );
}
