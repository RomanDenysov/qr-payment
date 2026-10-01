"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import type { UsageStats as UsageStatsData } from "@/lib/api/stats";

// Don't show weak social proof while counters warm up after launch.
const MIN_TOTAL_TO_SHOW = 100;

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-card p-4 ring-1 ring-foreground/10">
      <p className="font-bold font-pixel text-foreground text-xl tabular-nums sm:text-2xl">
        {value}
      </p>
      <p className="mt-1 text-muted-foreground text-sm">{label}</p>
    </div>
  );
}

/**
 * Anonymous usage counters (social proof) under the generator. Fetched on the
 * client from the CDN-cached stats API so the page itself stays static. Renders
 * nothing until loaded, and stays hidden when stats are unavailable or low.
 */
export function UsageStats() {
  const t = useTranslations("Stats");
  const locale = useLocale();
  const [stats, setStats] = useState<UsageStatsData | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/v1/stats");
        if (res.ok && !cancelled) {
          setStats(await res.json());
        }
      } catch (error) {
        console.error("[UsageStats] Failed to load stats:", error);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!stats || stats.total < MIN_TOTAL_TO_SHOW) {
    return null;
  }

  const format = new Intl.NumberFormat(locale);

  return (
    <section className="fade-in-0 mt-8 animate-in duration-200 ease-out-quad">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t("totalLabel")} value={format.format(stats.total)} />
        <StatCard
          label={t("last30Label")}
          value={format.format(stats.last30Days)}
        />
        <StatCard label={t("apiLabel")} value={format.format(stats.api)} />
      </div>
      <p className="mt-3 text-muted-foreground text-xs">{t("caption")}</p>
    </section>
  );
}
