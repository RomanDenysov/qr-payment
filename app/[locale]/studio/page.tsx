import { getTranslations, setRequestLocale } from "next-intl/server";
import { StudioClient } from "@/features/studio/components/studio-client";
import { getAlternates, getOgLocale, localePath } from "@/lib/seo";
import { JsonLd } from "./json-ld";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("studioTitle"),
    description: t("studioDescription"),
    alternates: getAlternates(locale, "/studio"),
    openGraph: {
      title: t("studioTitle"),
      description: t("studioDescription"),
      url: localePath(locale, "/studio"),
      locale: getOgLocale(locale),
    },
  };
}

export default async function StudioPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Studio" });
  const tMeta = await getTranslations({ locale, namespace: "Metadata" });
  const tNav = await getTranslations({ locale, namespace: "Nav" });

  return (
    <div className="flex-1 pt-5 sm:pt-8 md:pt-12">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-2">
          <h1 className="font-bold font-pixel text-foreground text-lg tracking-wide sm:text-xl">
            {t("title")}
          </h1>
          <p className="max-w-2xl text-muted-foreground text-sm">
            {t("intro")}
          </p>
        </header>

        <StudioClient />

        <JsonLd
          homeName={tNav("home")}
          locale={locale}
          studioDescription={tMeta("studioDescription")}
          studioTitle={tMeta("studioTitle")}
        />
      </div>
    </div>
  );
}
