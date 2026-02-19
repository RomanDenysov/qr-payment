import { getTranslations, setRequestLocale } from "next-intl/server";
import { BulkPage } from "@/features/bulk/components/bulk-page";
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

  return <BulkPage />;
}
