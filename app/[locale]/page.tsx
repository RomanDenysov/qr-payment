import { setRequestLocale } from "next-intl/server";
import { PaymentFormCard } from "@/features/payment/components/payment-form-card";
import { QRPreviewCard } from "@/features/payment/components/qr-preview-card";
import { getAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return { alternates: getAlternates(locale) };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex-1 pt-5 sm:pt-8 md:pt-16">
      <section className="grid gap-8 *:rounded-none sm:grid-cols-2">
        <PaymentFormCard />
        <QRPreviewCard />
      </section>
    </div>
  );
}
