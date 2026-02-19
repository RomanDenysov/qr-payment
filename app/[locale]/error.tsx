"use client";

import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Error");

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
      <IconAlertTriangle className="size-12 text-destructive" />
      <h1 className="font-semibold text-xl">{t("title")}</h1>
      <p className="max-w-md text-muted-foreground text-sm">
        {error.message || t("defaultMessage")}
      </p>
      <Button onClick={reset} variant="outline">
        <IconRefresh />
        {t("retry")}
      </Button>
    </div>
  );
}
