import { getTranslations, setRequestLocale } from "next-intl/server";
import { PaymentFormCard } from "@/features/payment/components/payment-form-card";
import { QRPreviewCard } from "@/features/payment/components/qr-preview-card";
import { getAlternates } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: string }>;
};

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
      <h1 className="font-bold font-pixel text-foreground text-2xl tracking-wide sm:text-3xl">
        {t("homeH1")}
      </h1>
      <section className="mt-6 grid gap-8 *:rounded-none sm:grid-cols-2">
        <PaymentFormCard />
        <QRPreviewCard />
      </section>
    </div>
  );
}
