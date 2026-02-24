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
  const { locale } = await params;
  setRequestLocale(locale);

  const { d } = await searchParams;
  const data = d ? decodeShareData(d) : null;

  return <SharePaymentView data={data} />;
}
