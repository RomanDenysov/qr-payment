import { getTranslations, setRequestLocale } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { linkVariants } from "@/components/ui/link";
import { Separator } from "@/components/ui/separator";
import {
  type ChangelogCategory,
  type ChangelogEntry,
  getChangelogData,
} from "@/features/changelog/data";
import { Link } from "@/i18n/navigation";
import { getAlternates, getOgLocale, localePath } from "@/lib/seo";

const CONTACT_EMAIL = "info@qr-platby.com";

const BADGE_VARIANT: Record<
  ChangelogCategory,
  "default" | "secondary" | "outline" | "destructive"
> = {
  feature: "default",
  api: "secondary",
  improvement: "outline",
  fix: "destructive",
};

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  const entries = getChangelogData(locale);
  const newest = entries[0]?.date;
  const oldest = entries.at(-1)?.date;

  return {
    title: t("changelogTitle"),
    description: t("changelogDescription"),
    alternates: getAlternates(locale, "/changelog"),
    openGraph: {
      type: "article" as const,
      title: t("changelogTitle"),
      description: t("changelogDescription"),
      url: localePath(locale, "/changelog"),
      locale: getOgLocale(locale),
      ...(oldest && { publishedTime: new Date(oldest).toISOString() }),
      ...(newest && { modifiedTime: new Date(newest).toISOString() }),
    },
    ...(newest && {
      other: {
        "article:modified_time": new Date(newest).toISOString(),
      },
    }),
  };
}

export default async function ChangelogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tMeta = await getTranslations({ locale, namespace: "Metadata" });
  const tNav = await getTranslations({ locale, namespace: "Nav" });
  const t = await getTranslations({ locale, namespace: "Changelog" });

  const entries = getChangelogData(locale);
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "long" });

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
        name: tMeta("changelogTitle"),
        item: localePath(locale, "/changelog"),
      },
    ],
  };

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: tMeta("changelogTitle"),
    description: tMeta("changelogDescription"),
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: entries.length,
    itemListElement: entries.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "CreativeWork",
        name: entry.title,
        description: entry.summary,
        datePublished: entry.date,
        keywords: entry.category,
      },
    })),
  };

  return (
    <div className="flex-1 pt-5 sm:pt-8 md:pt-16">
      <div className="mx-auto max-w-2xl space-y-6 px-4 pb-12 sm:px-0">
        <header className="space-y-2">
          <h1 className="font-bold font-pixel text-foreground text-lg tracking-wide sm:text-xl">
            {tMeta("changelogTitle")}
          </h1>
          <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
        </header>

        <ol className="list-none space-y-8 pl-0">
          {entries.map((entry, index) => (
            <ChangelogItem
              dateLabel={dateFormatter.format(new Date(entry.date))}
              entry={entry}
              key={`${entry.date}-${entry.title}`}
              showSeparator={index < entries.length - 1}
              t={(key) => t(key)}
            />
          ))}
        </ol>

        <section className="space-y-2 border border-border bg-card/40 p-4">
          <h2 className="font-medium text-foreground text-sm">
            {t("feedbackTitle")}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t("feedbackBody")}{" "}
            <a
              className={linkVariants()}
              href={`mailto:${CONTACT_EMAIL}`}
              rel="noopener"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>

        <div className="pt-4 text-center">
          <Link className={linkVariants({ size: "sm" })} href="/">
            ← {tMeta("backToHome")}
          </Link>
        </div>

        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data from hardcoded content
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
          type="application/ld+json"
        />
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data from hardcoded content
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
          type="application/ld+json"
        />
      </div>
    </div>
  );
}

function ChangelogItem({
  entry,
  dateLabel,
  showSeparator,
  t,
}: {
  entry: ChangelogEntry;
  dateLabel: string;
  showSeparator: boolean;
  t: (key: string) => string;
}) {
  const categoryLabelKey = `category${capitalize(entry.category)}`;

  return (
    <li>
      <article
        className="space-y-2"
        id={`${entry.date}-${slugify(entry.title)}`}
      >
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <time dateTime={entry.date}>{dateLabel}</time>
          <span aria-hidden="true">·</span>
          <Badge variant={BADGE_VARIANT[entry.category]}>
            {t(categoryLabelKey)}
          </Badge>
        </div>
        <h2 className="font-medium text-base text-foreground">{entry.title}</h2>
        <p className="text-muted-foreground text-sm">{entry.summary}</p>
        {entry.highlights && entry.highlights.length > 0 && (
          <ul className="ml-5 list-disc space-y-1 text-muted-foreground text-sm">
            {entry.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </article>
      {showSeparator && <Separator className="mt-8" />}
    </li>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const DIACRITICS_RE = /[̀-ͯ]/g;
const NON_ALNUM_RE = /[^a-z0-9]+/g;
const TRIM_DASH_RE = /^-+|-+$/g;

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS_RE, "")
    .replace(NON_ALNUM_RE, "-")
    .replace(TRIM_DASH_RE, "");
}
