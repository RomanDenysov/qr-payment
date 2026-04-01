import { getTranslations, setRequestLocale } from "next-intl/server";
import { linkVariants } from "@/components/ui/link";
import { Link } from "@/i18n/navigation";
import { getAlternates, getOgLocale, localePath } from "@/lib/seo";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("privacyTitle"),
    description: t("privacyDescription"),
    alternates: getAlternates(locale, "/ochrana-udajov"),
    openGraph: {
      title: t("privacyTitle"),
      description: t("privacyDescription"),
      url: localePath(locale, "/ochrana-udajov"),
      locale: getOgLocale(locale),
    },
  };
}

export default async function PrivacyPolicyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "PrivacyPolicy" });
  const tMeta = await getTranslations({ locale, namespace: "Metadata" });
  const t_nav = await getTranslations({ locale, namespace: "Nav" });

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
        name: tMeta("privacyTitle"),
        item: localePath(locale, "/ochrana-udajov"),
      },
    ],
  };

  return (
    <div className="flex-1 pt-5 sm:pt-8 md:pt-16">
      <article className="prose-sm mx-auto max-w-2xl space-y-6 text-muted-foreground text-sm leading-relaxed">
        <h1 className="font-bold font-pixel text-foreground text-lg tracking-wide sm:text-xl">
          {t("title")}
        </h1>
        <p className="text-muted-foreground text-xs">{t("lastUpdated")}</p>

        <section className="space-y-2">
          <h2 className="font-pixel font-semibold text-base text-foreground">
            {t("operator.heading")}
          </h2>
          <p>
            <a
              className={linkVariants()}
              href="https://buymeacoffee.com/romandenysov"
              rel="noopener noreferrer"
              target="_blank"
            >
              {t("operator.author")}
            </a>
          </p>
          <p>
            {t("operator.contact")}{" "}
            <a className={linkVariants()} href="mailto:info@qr-platby.com">
              info@qr-platby.com
            </a>
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-pixel font-semibold text-base text-foreground">
            {t("dataCollection.heading")}
          </h2>
          <p>
            {t.rich("dataCollection.body", {
              strong: (chunks) => (
                <strong className="text-foreground">{chunks}</strong>
              ),
            })}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-pixel font-semibold text-base text-foreground">
            {t("localStorage.heading")}
          </h2>
          <p>{t("localStorage.body1")}</p>
          <p>{t("localStorage.body2")}</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-pixel font-semibold text-base text-foreground">
            {t("analytics.heading")}
          </h2>
          <p>
            {t.rich("analytics.body", {
              link: (chunks) => (
                <a
                  className={linkVariants()}
                  href="https://vercel.com/docs/analytics/privacy-policy"
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
            {t("cookies.heading")}
          </h2>
          <p>{t("cookies.body")}</p>
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

      {/* JSON-LD structured data - hardcoded content, safe to inject */}
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data from hardcoded content
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        type="application/ld+json"
      />
    </div>
  );
}
