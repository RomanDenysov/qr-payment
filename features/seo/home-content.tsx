import { getTranslations } from "next-intl/server";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { linkVariants } from "@/components/ui/link";
import { Link } from "@/i18n/navigation";

interface FaqItem {
  q: string;
  a: string;
}

const SECTION_HEADING_CLASS =
  "font-bold font-pixel text-foreground text-lg tracking-wide sm:text-xl";

interface BankColumnProps {
  title: string;
  banks: string[];
}

function BankColumn({ title, banks }: BankColumnProps): React.ReactNode {
  return (
    <div>
      <h3 className="mb-3 font-semibold text-foreground text-sm">{title}</h3>
      <ul className="list-inside list-disc space-y-2 text-muted-foreground text-sm">
        {banks.map((bank) => (
          <li key={bank}>{bank}</li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Compact FAQ block for the homepage: collapsed shadcn Accordion with
 * a handful of teaser questions + a small link out to the full /faq page.
 */
export async function HomeFaq() {
  const t = await getTranslations("HomeContent");
  const faqItems = t.raw("section4Items") as FaqItem[];

  return (
    <section className="mt-12 space-y-4">
      <h2 className={SECTION_HEADING_CLASS}>{t("section4Title")}</h2>
      <Accordion>
        {faqItems.map((item) => (
          <AccordionItem key={item.q} value={item.q}>
            <AccordionTrigger>{item.q}</AccordionTrigger>
            <AccordionContent>
              <p>{item.a}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <div className="pt-2 text-center">
        <Link className={linkVariants({ size: "sm" })} href="/faq">
          {t("section4ViewAllLink")} →
        </Link>
      </div>
    </section>
  );
}

/**
 * Long-form SEO content (explainer, how-to steps, supported banks). Lives at
 * the bottom of the homepage so users hit the form first; Google still crawls
 * the text for head-term ranking.
 */
export async function HomeContentSections() {
  const t = await getTranslations("HomeContent");
  const steps = t.raw("section2Steps") as string[];
  const banksSlovak = t.raw("section3Banks1") as string[];
  const banksCzech = t.raw("section3Banks2") as string[];

  return (
    <>
      <section className="mt-16 space-y-4">
        <h2 className={SECTION_HEADING_CLASS}>{t("section1Title")}</h2>
        <p className="text-muted-foreground">{t("section1Para1")}</p>
        <p className="text-muted-foreground">{t("section1Para2")}</p>
      </section>

      <section className="mt-16 space-y-4">
        <h2 className={SECTION_HEADING_CLASS}>{t("section2Title")}</h2>
        <ol className="list-inside list-decimal space-y-2 text-muted-foreground">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="mt-16 space-y-4">
        <h2 className={SECTION_HEADING_CLASS}>{t("section3Title")}</h2>
        <div className="grid gap-8 sm:grid-cols-2">
          <BankColumn banks={banksSlovak} title={t("section3Col1")} />
          <BankColumn banks={banksCzech} title={t("section3Col2")} />
        </div>
      </section>

      <section className="mt-16 space-y-4">
        <h3 className="font-semibold text-foreground text-sm">
          {t("section4MoreLinksTitle")}
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            className={linkVariants({ size: "sm", variant: "muted" })}
            href="/docs"
          >
            {t("section4ApiLink")}
          </Link>
          <span className="text-muted-foreground text-xs">•</span>
          <Link
            className={linkVariants({ size: "sm", variant: "muted" })}
            href="/studio"
          >
            {t("section4StudioLink")}
          </Link>
          <span className="text-muted-foreground text-xs">•</span>
          <Link
            className={linkVariants({ size: "sm", variant: "muted" })}
            href="/bulk"
          >
            {t("section4BulkLink")}
          </Link>
        </div>
      </section>
    </>
  );
}
