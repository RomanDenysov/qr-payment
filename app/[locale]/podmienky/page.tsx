import { getTranslations, setRequestLocale } from "next-intl/server";
import { linkVariants } from "@/components/ui/link";
import { Link } from "@/i18n/navigation";
import { getAlternates } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("termsTitle"),
    description: t("termsDescription"),
    alternates: getAlternates(locale, "/podmienky"),
  };
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Terms" });
  const tMeta = await getTranslations({ locale, namespace: "Metadata" });

  return (
    <div className="flex-1 pt-5 sm:pt-8 md:pt-16">
      <article className="prose-sm mx-auto max-w-2xl space-y-6 text-muted-foreground text-sm leading-relaxed">
        <h1 className="font-bold font-pixel text-foreground text-lg tracking-wide sm:text-xl">
          {t("title")}
        </h1>
        <p className="text-muted-foreground text-xs">{t("lastUpdated")}</p>

        <section className="space-y-2">
          <h2 className="font-pixel font-semibold text-base text-foreground">
            {t("about.heading")}
          </h2>
          <p>{t("about.body")}</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-pixel font-semibold text-base text-foreground">
            {t("responsibility.heading")}
          </h2>
          <p>{t("responsibility.body")}</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-pixel font-semibold text-base text-foreground">
            {t("compatibility.heading")}
          </h2>
          <p>{t("compatibility.body")}</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-pixel font-semibold text-base text-foreground">
            {t("changes.heading")}
          </h2>
          <p>{t("changes.body")}</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-pixel font-semibold text-base text-foreground">
            {t("sourceCode.heading")}
          </h2>
          <p>
            {t.rich("sourceCode.body", {
              link: (chunks) => (
                <a
                  className={linkVariants()}
                  href="https://github.com/RomanDenysov/qr-payment"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {chunks}
                </a>
              ),
            })}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-pixel font-semibold text-base text-foreground">
            {t("contact.heading")}
          </h2>
          <p>
            {t("contact.body")}{" "}
            <a className={linkVariants()} href="mailto:info@qr-platby.com">
              info@qr-platby.com
            </a>
          </p>
        </section>

        <div className="pt-4 text-center">
          <Link className={linkVariants({ size: "sm" })} href="/">
            ← {tMeta("backToHome")}
          </Link>
        </div>
      </article>
    </div>
  );
}
