import { getTranslations } from "next-intl/server";
import { JsonLdScript } from "@/components/json-ld";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { linkVariants } from "@/components/ui/link";
import { BulkContent } from "@/features/bulk/components/bulk-content";
import { Link } from "@/i18n/navigation";
import {
  breadcrumbJsonLd,
  getAlternates,
  getOgLocale,
  localePath,
} from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("bulkTitle"),
    description: t("bulkDescription"),
    alternates: getAlternates(locale, "/bulk"),
    openGraph: {
      title: t("bulkTitle"),
      description: t("bulkDescription"),
      url: localePath(locale, "/bulk"),
      locale: getOgLocale(locale),
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Bulk" });
  const tMeta = await getTranslations({ locale, namespace: "Metadata" });
  const t_nav = await getTranslations({ locale, namespace: "Nav" });

  return (
    <div className="flex-1 pt-5 sm:pt-8 md:pt-16">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="font-bold font-pixel text-foreground text-lg tracking-wide sm:text-xl print:hidden">
          {t("title")}
        </h1>
        <Card>
          <CardHeader className="print:hidden">
            <CardDescription>{t("description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <BulkContent />
          </CardContent>
        </Card>
        <div className="pt-4 text-center print:hidden">
          <Link className={linkVariants({ size: "sm" })} href="/">
            ← {tMeta("backToHome")}
          </Link>
        </div>
      </div>

      <JsonLdScript
        data={breadcrumbJsonLd(locale, t_nav("home"), {
          name: tMeta("bulkTitle"),
          path: "/bulk",
        })}
      />
    </div>
  );
}
