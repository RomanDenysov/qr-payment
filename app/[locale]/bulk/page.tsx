import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { BulkContent } from "@/features/bulk/components/bulk-content";
import { Link } from "@/i18n/navigation";
import { getAlternates } from "@/lib/seo";

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
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Bulk" });
  const tMeta = await getTranslations({ locale, namespace: "Metadata" });

  return (
    <div className="flex-1 pt-5 sm:pt-8 md:pt-16">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="font-bold font-pixel text-foreground text-lg tracking-wide sm:text-xl">
          {t("title")}
        </h1>
        <Card>
          <CardHeader>
            <CardDescription>{t("description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <BulkContent />
          </CardContent>
        </Card>
        <div className="pt-4 text-center">
          <Link
            className="text-foreground text-xs underline underline-offset-4 hover:text-primary"
            href="/"
          >
            ← {tMeta("backToHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
