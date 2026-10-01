"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { SpinningNumber } from "@/components/spinning-number";
import { Skeleton } from "@/components/ui/skeleton";
import type { UsageStats as UsageStatsData } from "@/lib/api/stats";

const SKELETON_CARDS = ["total", "last30", "api"];

// Don't show weak social proof while counters warm up after launch.
const MIN_TOTAL_TO_SHOW = 100;

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-card p-5 ring-1 ring-foreground/10">
      <p className="font-bold font-pixel text-3xl text-foreground tabular-nums sm:text-4xl">
        <SpinningNumber value={value} />
      </p>
      <p className="mt-2 text-muted-foreground text-sm">{label}</p>
    </div>
  );
}

/**
 * Anonymous usage counters (social proof) under the generator. Fetched on the
 * client from the CDN-cached stats API so the page itself stays static. Renders
 * a skeleton while loading, and nothing when stats are unavailable or low.
 */
export function UsageStats() {
  const t = useTranslations("Stats");
  const locale = useLocale();
  // undefined = still loading, null = unavailable
  const [stats, setStats] = useState<UsageStatsData | null | undefined>(
    undefined
  );

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/v1/stats");
        const data = res.ok ? await res.json() : null;
        if (!cancelled) {
          setStats(data);
        }
      } catch (error) {
        console.error("[UsageStats] Failed to load stats:", error);
        if (!cancelled) {
          setStats(null);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (stats === undefined) {
    return (
      <section aria-hidden className="mt-16 sm:mt-20">
        <div className="grid gap-4 sm:grid-cols-3">
          {SKELETON_CARDS.map((key) => (
            <Skeleton className="h-[6.5rem] sm:h-[6.95rem]" key={key} />
          ))}
        </div>
        <Skeleton className="mt-3 h-4 w-64 max-w-full" />
      </section>
    );
  }

  if (!stats || stats.total < MIN_TOTAL_TO_SHOW) {
    return null;
  }

  const format = new Intl.NumberFormat(locale);

  return (
    <section className="fade-in-0 mt-16 animate-in duration-200 ease-out-quad sm:mt-20">
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
