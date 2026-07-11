import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/container";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { getAlternates, getOgLocale, localePath } from "@/lib/seo";

const GUIDE_PATH = "/ako-vytvorit-qr-kod-na-platbu";

const SECTION_HEADING_CLASS =
  "font-bold font-pixel-grid text-foreground text-lg tracking-wide sm:text-xl";

interface GuideStep {
  name: string;
  text: string;
}

interface GuideFormat {
  name: string;
  region: string;
  description: string;
}

interface GuideFaqItem {
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
    title: t("guideTitle"),
    description: t("guideDescription"),
    alternates: getAlternates(locale, GUIDE_PATH),
    openGraph: {
      title: t("guideTitle"),
      description: t("guideDescription"),
      url: localePath(locale, GUIDE_PATH),
      locale: getOgLocale(locale),
    },
  };
}

export default async function GuidePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Guide" });
  const tMeta = await getTranslations({ locale, namespace: "Metadata" });
  const tNav = await getTranslations({ locale, namespace: "Nav" });

  const steps = t.raw("steps") as GuideStep[];
  const formats = t.raw("formats") as GuideFormat[];
  const faqItems = t.raw("faq") as GuideFaqItem[];

  const howToLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: t("h1"),
    description: tMeta("guideDescription"),
    totalTime: "PT1M",
    estimatedCost: { "@type": "MonetaryAmount", currency: "EUR", value: "0" },
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      name: step.name,
      text: step.text,
      position: index + 1,
    })),
  };

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
        item: localePath(locale, GUIDE_PATH),
      },
    ],
  };

  return (
    <div className="flex-1 bg-drafting-grid">
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data requires script injection
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }}
        type="application/ld+json"
      />
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
      <Container className="max-w-4xl py-5 sm:py-8 md:py-16">
        <h1 className={SECTION_HEADING_CLASS}>{t("h1")}</h1>
        <p className="mt-6 text-muted-foreground">{t("intro1")}</p>
        <p className="mt-4 text-muted-foreground">{t("intro2")}</p>

        <section className="mt-16 space-y-6">
          <h2 className={SECTION_HEADING_CLASS}>{t("stepsTitle")}</h2>
          <ol className="grid gap-4 sm:grid-cols-2">
            {steps.map((step, index) => (
              <li
                className="flex gap-3 bg-card p-4 ring-1 ring-foreground/10"
                key={step.name}
              >
                <span className="font-bold font-pixel-grid text-base text-muted-foreground/50 tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-sm/relaxed">
                  <span className="block font-semibold text-foreground">
                    {step.name}
                  </span>
                  <span className="text-muted-foreground">{step.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-16 space-y-6">
          <h2 className={SECTION_HEADING_CLASS}>{t("formatsTitle")}</h2>
          <p className="text-muted-foreground">{t("formatsIntro")}</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {formats.map((format) => (
              <Card key={format.name} size="sm">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="secondary">{format.name}</Badge>
                    <span className="font-mono text-[0.7rem] text-muted-foreground uppercase tracking-wide">
                      {format.region}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="text-muted-foreground text-sm/relaxed">
                  {format.description}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-16 border border-foreground/10 border-dashed px-4 py-5">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="font-semibold text-foreground">{t("ctaTitle")}</p>
              <p className="mt-0.5 text-muted-foreground text-sm">
                {t("ctaText")}
              </p>
            </div>
            <Link className={buttonVariants({ size: "lg" })} href="/">
              {t("ctaButton")}
            </Link>
          </div>
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
      </Container>
    </div>
  );
}
