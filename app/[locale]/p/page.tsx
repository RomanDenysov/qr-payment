import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { SharedPayment } from "./shared-payment";

interface Props {
  params: Promise<{ locale: string }>;
}

export function generateMetadata() {
  return {
    robots: { index: false, follow: false },
  };
}

/**
 * Shared payment page. The payment travels in the URL fragment and is decoded
 * in the browser, so this page is static and the server never sees it.
 */
export default async function SharePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "SharePage" });

  return (
    <SharedPayment>
      <div className="mt-6 flex w-full flex-col items-center gap-2 border border-border bg-card p-5 text-center">
        <p className="font-medium text-sm">{t("ctaTitle")}</p>
        <p className="text-muted-foreground text-xs">{t("ctaDescription")}</p>
        <Link className="mt-1 w-full sm:w-auto" href="/">
          <Button className="w-full sm:w-auto">{t("ctaButton")}</Button>
        </Link>
      </div>
    </SharedPayment>
  );
}
