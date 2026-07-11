import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { decodeShareData } from "@/features/payment/share-link";
import { SHARE_ID_RE } from "@/features/payment/tracking";
import { Link } from "@/i18n/navigation";
import { OpenPing } from "./open-ping";
import { PaymentDetails } from "./payment-details";
import { ShareQRSection } from "./share-qr-section";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ d?: string; t?: string }>;
}

export function generateMetadata() {
  return {
    robots: { index: false, follow: false },
  };
}

export default async function SharePage({ params, searchParams }: Props) {
  const [{ locale }, { d, t: trackId }] = await Promise.all([
    params,
    searchParams,
  ]);
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
          <Button>{t("backHome")}</Button>
        </Link>
      </div>
    );
  }

  const { payment, branding } = data;
  const format = payment.format ?? "bysquare";

  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col items-center pt-5 sm:pt-8 md:pt-16">
      {trackId && SHARE_ID_RE.test(trackId) ? <OpenPing id={trackId} /> : null}
      <Card className="w-full py-0">
        <CardHeader className="h-10 gap-0 border-b px-0">
          <CardTitle className="h-full grow px-4 py-2">{t("title")}</CardTitle>
        </CardHeader>
        <ShareQRSection branding={branding} payment={payment}>
          <PaymentDetails format={format} payment={payment} />
        </ShareQRSection>
      </Card>

      <div className="mt-6 flex w-full flex-col items-center gap-2 border border-border bg-card p-5 text-center">
        <p className="font-medium text-sm">{t("ctaTitle")}</p>
        <p className="text-muted-foreground text-xs">{t("ctaDescription")}</p>
        <Link className="mt-1 w-full sm:w-auto" href="/">
          <Button className="w-full sm:w-auto">{t("ctaButton")}</Button>
        </Link>
      </div>
    </div>
  );
}
