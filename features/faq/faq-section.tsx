import { getTranslations } from "next-intl/server";
import { JsonLdScript } from "@/components/json-ld";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { linkVariants } from "@/components/ui/link";
import { Link } from "@/i18n/navigation";
import { faqPageJsonLd } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { getFaqData } from "./data";

interface FaqSectionProps {
  className?: string;
  locale: string;
}

/**
 * FAQ accordion with FAQPage JSON-LD. Lives on the homepage under `#faq`;
 * the old /faq URLs redirect here (see `redirects` in next.config.ts).
 */
export async function FaqSection({ className, locale }: FaqSectionProps) {
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const faqItems = getFaqData(locale);

  return (
    <section className={cn("scroll-mt-20 space-y-6", className)} id="faq">
      <h2 className="font-bold font-pixel text-foreground text-lg tracking-wide sm:text-xl">
        {t("faqTitle")}
      </h2>
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
                      key={link.label}
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
      <JsonLdScript data={faqPageJsonLd(faqItems)} />
    </section>
  );
}
