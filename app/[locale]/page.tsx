import { getTranslations } from "next-intl/server";
import { CommunityBanner } from "@/components/community-banner";
import { DynamicApiCard } from "@/features/api/api-card-dynamic";
import { FaqSection } from "@/features/faq/faq-section";
import { PaymentFormCard } from "@/features/payment/components/payment-form-card";
import { QRPreviewCard } from "@/features/payment/components/qr-preview-card";
import { HomeContentSections } from "@/features/seo/home-content";
import { UsageStats } from "@/features/stats/usage-stats";
import { getAlternates } from "@/lib/seo";
import { HomeJsonLd } from "./home-json-ld";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return { alternates: getAlternates(locale) };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return (
    <div className="flex-1 pt-5 sm:pt-8 md:pt-16">
      <HomeJsonLd />
      <h1 className="font-bold font-pixel text-2xl text-foreground tracking-wide sm:text-3xl">
        {t("homeH1")}
      </h1>
      <p className="text-muted-foreground">{t("homeDescription")}</p>
      <section
        className="mt-8 grid scroll-mt-20 gap-8 *:rounded-none md:grid-cols-2"
        id="generator"
      >
        <PaymentFormCard />
        <QRPreviewCard />
      </section>
      <UsageStats />
      <CommunityBanner className="mt-16 sm:mt-20" />
      <HomeContentSections />
      <FaqSection className="mt-20 sm:mt-24" locale={locale} />
      <h2 className="mt-20 font-bold font-pixel text-foreground text-lg tracking-wide sm:mt-24 sm:text-xl">
        {t("sectionApi")}
      </h2>
      <section className="mt-6">
        <DynamicApiCard />
      </section>
    </div>
  );
}
