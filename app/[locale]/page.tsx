import { getTranslations, setRequestLocale } from "next-intl/server";
import { DynamicApiCard } from "@/features/api/api-card-dynamic";
import { PaymentFormCard } from "@/features/payment/components/payment-form-card";
import { QRPreviewCard } from "@/features/payment/components/qr-preview-card";
import { getAlternates } from "@/lib/seo";

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
    <div className="flex-1 pt-5 sm:pt-8 md:pt-16">
      <h1 className="font-bold font-pixel text-2xl text-foreground tracking-wide sm:text-3xl">
        {t("homeH1")}
      </h1>
      <p className="mt-4 text-muted-foreground">{t("homeDescription")}</p>
      <h2 className="mt-8 font-bold font-pixel text-foreground text-lg tracking-wide sm:text-xl">
        {t("sectionPayment")}
      </h2>
      <section className="mt-6 grid gap-8 *:rounded-none sm:grid-cols-2">
        <PaymentFormCard />
        <QRPreviewCard />
      </section>
      <h2 className="mt-16 font-bold font-pixel text-foreground text-lg tracking-wide sm:text-xl">
        {t("sectionApi")}
      </h2>
      <section className="mt-6">
        <DynamicApiCard />
      </section>
    </div>
  );
}
