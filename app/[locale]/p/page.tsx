import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { decodeShareData } from "@/features/payment/share-link";
import { Link } from "@/i18n/navigation";
import { PaymentDetails } from "./payment-details";
import { ShareQRSection } from "./share-qr-section";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ d?: string }>;
}

export function generateMetadata() {
  return {
    robots: { index: false, follow: false },
  };
}

export default async function SharePage({ params, searchParams }: Props) {
  const [{ locale }, { d }] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);

  const data = d ? decodeShareData(d) : null;

  if (d && !data) {
    console.error("[SharePage] Invalid share link", {
      locale,
      encodedLength: d.length,
    });
  }

  const t = await getTranslations({ locale, namespace: "SharePage" });

  if (!data) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 pt-16">
        <p className="text-muted-foreground">{t("invalidLink")}</p>
        <Link href="/">
          <Button variant="outline">{t("backHome")}</Button>
        </Link>
      </div>
    );
  }

  const { payment, branding } = data;
  const format = payment.format ?? "bysquare";

  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col items-center pt-5 sm:pt-8 md:pt-16">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <ShareQRSection branding={branding} payment={payment}>
          <PaymentDetails format={format} payment={payment} />
        </ShareQRSection>
      </Card>

      <div className="pt-4 text-center">
        <Link
          className="text-foreground text-xs underline underline-offset-4 hover:text-primary"
          href="/"
        >
          ← {t("backHome")}
        </Link>
      </div>
    </div>
  );
}
