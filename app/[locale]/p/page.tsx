import { setRequestLocale } from "next-intl/server";
import { decodeShareData } from "@/features/payment/share-link";
import { SharePaymentView } from "./share-payment-view";

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

  return <SharePaymentView data={data} />;
}
