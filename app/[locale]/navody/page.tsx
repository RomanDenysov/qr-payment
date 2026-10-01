import { IconArrowRight } from "@tabler/icons-react";
import { getTranslations } from "next-intl/server";
import type { ComponentProps } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { getAlternates, getOgLocale, localePath } from "@/lib/seo";

const GUIDES_PATH = "/navody";

interface GuideLink {
  description: string;
  href: ComponentProps<typeof Link>["href"];
  title: string;
}

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("guidesTitle"),
    description: t("guidesDescription"),
    alternates: getAlternates(locale, GUIDES_PATH),
    openGraph: {
      title: t("guidesTitle"),
      description: t("guidesDescription"),
      url: localePath(locale, GUIDES_PATH),
      locale: getOgLocale(locale),
    },
  };
}

/** Index of the how-to and explainer pages, for people rather than developers. */
export default async function GuidesPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Guides" });
  const tMeta = await getTranslations({ locale, namespace: "Metadata" });
  const tNav = await getTranslations({ locale, namespace: "Nav" });

  const guides: GuideLink[] = [
    {
      title: tMeta("guideTitle"),
      description: tMeta("guideDescription"),
      href: "/ako-vytvorit-qr-kod-na-platbu",
    },
    {
      title: tMeta("sepaTitle"),
      description: tMeta("sepaDescription"),
      href: "/sepa-qr-code-generator",
    },
    {
      title: tMeta("faqTitle"),
      description: tMeta("faqDescription"),
      href: { pathname: "/", hash: "faq" },
    },
  ];

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
        item: localePath(locale, GUIDES_PATH),
      },
    ],
  };

  return (
    <div className="flex-1 pt-5 sm:pt-8 md:pt-16">
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data requires script injection
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        type="application/ld+json"
      />
      <div className="mx-auto max-w-4xl">
        <h1 className="font-bold font-pixel text-foreground text-lg tracking-wide sm:text-xl">
          {t("h1")}
        </h1>
        <p className="mt-4 text-muted-foreground">{t("intro")}</p>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {guides.map((guide) => (
            <li key={guide.title}>
              <Card
                className="relative h-full focus-within:ring-foreground/40"
                interactive
              >
                <CardHeader>
                  <CardTitle>
                    <Link
                      className="outline-none after:absolute after:inset-0"
                      href={guide.href}
                    >
                      {guide.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 text-muted-foreground">
                  {guide.description}
                </CardContent>
                <CardContent>
                  <IconArrowRight
                    aria-hidden
                    className="size-4 text-foreground transition-transform duration-150 ease-out group-hover/card:translate-x-0.5"
                  />
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
