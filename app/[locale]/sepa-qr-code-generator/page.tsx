import { getTranslations } from "next-intl/server";
import { JsonLdScript } from "@/components/json-ld";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button";
import { linkVariants } from "@/components/ui/link";
import { Link } from "@/i18n/navigation";
import {
  breadcrumbJsonLd,
  type FaqItem,
  faqPageJsonLd,
  getAlternates,
  getOgLocale,
  localePath,
} from "@/lib/seo";

const SEPA_PATH = "/sepa-qr-code-generator";

const EPC_GENERATOR_HREF = {
  pathname: "/",
  query: { format: "epc" },
} as const;

const SECTION_HEADING_CLASS =
  "font-bold font-pixel text-foreground text-lg tracking-wide sm:text-xl";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("sepaTitle"),
    description: t("sepaDescription"),
    alternates: getAlternates(locale, SEPA_PATH),
    openGraph: {
      title: t("sepaTitle"),
      description: t("sepaDescription"),
      url: localePath(locale, SEPA_PATH),
      locale: getOgLocale(locale),
    },
  };
}

export default async function SepaPage({ params }: Props) {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: "Sepa" });
  const tNav = await getTranslations({ locale, namespace: "Nav" });

  const faqItems = t.raw("faq") as FaqItem[];

  return (
    <div className="flex-1 pt-5 sm:pt-8 md:pt-16">
      <JsonLdScript data={faqPageJsonLd(faqItems)} />
      <JsonLdScript
        data={breadcrumbJsonLd(locale, tNav("home"), {
          name: t("h1"),
          path: SEPA_PATH,
        })}
      />
      <div className="mx-auto max-w-4xl">
        <h1 className={SECTION_HEADING_CLASS}>{t("h1")}</h1>
        <p className="mt-6 text-muted-foreground">{t("intro1")}</p>
        <p className="mt-4 text-muted-foreground">{t("intro2")}</p>
        <Link
          className={`${buttonVariants({ size: "lg" })} mt-6`}
          href={EPC_GENERATOR_HREF}
        >
          {t("heroButton")}
        </Link>

        <section className="mt-16 space-y-6">
          <h2 className={SECTION_HEADING_CLASS}>{t("whatTitle")}</h2>
          <p className="text-muted-foreground">{t("whatText1")}</p>
          <p className="text-muted-foreground">{t("whatText2")}</p>
        </section>

        <section className="mt-16 space-y-6">
          <h2 className={SECTION_HEADING_CLASS}>{t("banksTitle")}</h2>
          <p className="text-muted-foreground">{t("banksText")}</p>
          <Link
            className={linkVariants({ size: "sm" })}
            href="/ako-vytvorit-qr-kod-na-platbu"
          >
            {t("guideLinkLabel")} →
          </Link>
        </section>

        <section className="mt-16 border border-foreground/10 border-dashed px-4 py-5">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="font-semibold text-foreground">{t("ctaTitle")}</p>
              <p className="mt-0.5 text-muted-foreground text-sm">
                {t("ctaText")}
              </p>
            </div>
            <Link
              className={buttonVariants({ size: "lg" })}
              href={EPC_GENERATOR_HREF}
            >
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
      </div>
    </div>
  );
}
