import { getTranslations } from "next-intl/server";
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

export async function HomeContent() {
  const t = await getTranslations("HomeContent");

  const steps = t.raw("section2Steps") as string[];
  const banksSlovak = t.raw("section3Banks1") as string[];
  const banksCzech = t.raw("section3Banks2") as string[];
  const faqItems = t.raw("section4Items") as FaqItem[];

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
        <h2 className={SECTION_HEADING_CLASS}>{t("section4Title")}</h2>
        <div className="space-y-6">
          {faqItems.map((item) => (
            <div key={item.q}>
              <h3 className="mb-2 font-semibold text-foreground text-sm">
                {item.q}
              </h3>
              <p className="mb-3 text-muted-foreground text-sm">{item.a}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3 text-center">
          <div className="w-full">
            <Link
              className="inline-block font-semibold text-foreground text-sm hover:underline"
              href="/faq"
            >
              {t("section4ViewAllLink")} →
            </Link>
          </div>
          <div className="flex w-full flex-wrap justify-center gap-2 text-muted-foreground text-xs">
            <Link className="hover:underline" href="/docs">
              {t("section4ApiLink")}
            </Link>
            <span>•</span>
            <Link className="hover:underline" href="/studio">
              {t("section4StudioLink")}
            </Link>
            <span>•</span>
            <Link className="hover:underline" href="/bulk">
              {t("section4BulkLink")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
