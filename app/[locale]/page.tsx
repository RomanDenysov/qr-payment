import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/container";
import { QrGeneratorSection } from "@/components/qr-generator-section";
import { QrPlatbyTitle } from "@/components/qr-platby-title";
import { DynamicApiCard } from "@/features/api/api-card-dynamic";
import {
  HomeContentSections,
  HomeMoreTools,
} from "@/features/seo/home-content";
import { UsageStats } from "@/features/seo/usage-stats";
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
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Metadata" });

  return (
    <div className="flex-1 bg-drafting-grid">
      <HomeJsonLd />
      <Container className="py-5 sm:py-8 md:py-16">
        <QrPlatbyTitle className="w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl" />
        <h1 className="mt-5 max-w-2xl font-medium text-foreground text-lg tracking-wide sm:mt-6 sm:text-xl">
          {t("homeH1")}
        </h1>
        <p className="mt-2 text-muted-foreground">{t("homeDescription")}</p>
      </Container>
      <Container className="px-0 md:px-0">
        <QrGeneratorSection />
      </Container>
      <Container>
        <UsageStats />
      </Container>
      <Container>
        <HomeContentSections />
      </Container>
      <Container>
        <h2 className="mt-20 font-bold font-pixel-grid text-foreground text-lg tracking-wide sm:mt-24 sm:text-xl">
          {t("sectionApi")}
        </h2>
        <section className="mt-6">
          <DynamicApiCard />
        </section>
      </Container>
      <Container>
        <HomeMoreTools />
      </Container>
    </div>
  );
}
