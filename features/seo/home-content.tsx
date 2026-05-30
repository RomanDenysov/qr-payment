import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { linkVariants } from "@/components/ui/link";
import { Link } from "@/i18n/navigation";

interface FormatTile {
  name: string;
  region: string;
  description: string;
}

const SECTION_HEADING_CLASS =
  "font-bold font-pixel text-foreground text-lg tracking-wide sm:text-xl";

interface BankColumnProps {
  title: string;
  banks: string[];
}

function BankColumn({ title, banks }: BankColumnProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-foreground text-sm">{title}</h3>
      <ul className="flex flex-wrap gap-2">
        {banks.map((bank) => (
          <li key={bank}>
            <Badge className="h-6 px-2.5 text-[0.8rem]" variant="outline">
              {bank}
            </Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Long-form SEO content (explainer, payment-format trio, how-to steps,
 * supported banks). Rendered directly below the generator so first-time
 * visitors get "what is this / how / which banks" before objections (FAQ)
 * and the developer API section. Supplies head-term + format/bank entity
 * coverage for long-tail queries.
 */
export async function HomeContentSections() {
  const t = await getTranslations("HomeContent");
  const formats = t.raw("formats") as FormatTile[];
  const steps = t.raw("section2Steps") as string[];
  const banksSlovak = t.raw("section3Banks1") as string[];
  const banksCzech = t.raw("section3Banks2") as string[];

  return (
    <>
      <section className="mt-24 space-y-6 sm:mt-32">
        <h2 className={SECTION_HEADING_CLASS}>{t("section1Title")}</h2>
        <p className="text-muted-foreground">{t("section1Para1")}</p>
        <p className="text-muted-foreground">{t("section1Para2")}</p>
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

      <section className="mt-20 space-y-6 sm:mt-24">
        <h2 className={SECTION_HEADING_CLASS}>{t("section2Title")}</h2>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li
              className="flex gap-3 bg-card p-4 ring-1 ring-foreground/10"
              key={step}
            >
              <span className="font-bold font-pixel text-base text-muted-foreground/50 tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-muted-foreground text-sm/relaxed">
                {step}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-20 space-y-6 sm:mt-24">
        <h2 className={SECTION_HEADING_CLASS}>{t("section3Title")}</h2>
        <div className="grid gap-8 sm:grid-cols-2">
          <BankColumn banks={banksSlovak} title={t("section3Col1")} />
          <BankColumn banks={banksCzech} title={t("section3Col2")} />
        </div>
      </section>
    </>
  );
}

/**
 * Secondary "more tools" links (Studio, Bulk), rendered at the very bottom of
 * the homepage after the developer API section. The API docs link is omitted
 * here because the API card directly above already links out to the docs.
 */
export async function HomeMoreTools() {
  const t = await getTranslations("HomeContent");

  return (
    <section className="mt-20 space-y-6 sm:mt-24">
      <h3 className="font-semibold text-foreground text-sm">
        {t("section4MoreLinksTitle")}
      </h3>
      <div className="flex flex-wrap items-center gap-3">
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
  );
}
