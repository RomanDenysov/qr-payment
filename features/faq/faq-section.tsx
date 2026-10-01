import { getTranslations } from "next-intl/server";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { linkVariants } from "@/components/ui/link";
import { Link } from "@/i18n/navigation";
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

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
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data from hardcoded content
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        type="application/ld+json"
      />
    </section>
  );
}
