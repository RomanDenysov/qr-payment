import { IconWifiOff } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";

export default async function OfflinePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <OfflineContent />;
}

function OfflineContent() {
  const t = useTranslations("Offline");

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
      <IconWifiOff className="size-12 text-muted-foreground" />
      <h1 className="font-bold font-pixel text-xl tracking-wide">
        {t("title")}
      </h1>
      <p className="max-w-md text-muted-foreground text-sm">
        {t("description")}
      </p>
    </div>
  );
}
