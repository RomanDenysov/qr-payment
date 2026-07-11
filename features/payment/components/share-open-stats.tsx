"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { fetchShareOpenStats, type ShareOpenStatsData } from "../tracking";

interface Props {
  secret: string;
  className?: string;
}

/** "Opened 5× · last yesterday" for a shared payment the user owns. */
export function ShareOpenStats({ secret, className }: Props) {
  const [stats, setStats] = useState<ShareOpenStatsData | null>(null);
  const t = useTranslations("ShareLink");
  const format = useFormatter();

  useEffect(() => {
    let cancelled = false;
    fetchShareOpenStats(secret)
      .then((data) => {
        if (!cancelled) {
          setStats(data);
        }
      })
      .catch((error) => {
        console.error("[ShareOpenStats] Failed to load open stats:", error);
      });
    return () => {
      cancelled = true;
    };
  }, [secret]);

  if (!stats) {
    return null;
  }

  return (
    <p className={cn("text-muted-foreground text-xs", className)}>
      {t("openedCount", { count: stats.count })}
      {stats.last
        ? ` · ${t("lastOpened", {
            time: format.relativeTime(new Date(stats.last)),
          })}`
        : null}
    </p>
  );
}
