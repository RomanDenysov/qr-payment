import { getLocale, getTranslations } from "next-intl/server";
import { readStatsCached } from "@/lib/api/stats";

interface StatCardProps {
  value: string;
  label: string;
}

function StatCard({ value, label }: StatCardProps) {
  return (
    <div className="bg-card p-4 ring-1 ring-foreground/10">
      <p className="font-bold font-pixel-grid text-foreground text-xl tabular-nums sm:text-2xl">
        {value}
      </p>
      <p className="mt-1 text-muted-foreground text-sm">{label}</p>
    </div>
  );
}

/**
 * Anonymous usage counters (social proof) under the generator. Hidden when
 * Redis is unconfigured or counters are still empty; the month card appears
 * only once a full previous month of data exists.
 */
// Don't show weak social proof while counters warm up after launch.
const MIN_TOTAL_TO_SHOW = 100;

export async function UsageStats() {
  const stats = await readStatsCached();
  if (!stats || stats.total < MIN_TOTAL_TO_SHOW) {
    return null;
  }

  const t = await getTranslations("Stats");
  const locale = await getLocale();
  const format = new Intl.NumberFormat(locale);
  const showMonth = stats.prevMonth > 0;

  return (
    <section className="mt-20 sm:mt-24">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t("totalLabel")} value={format.format(stats.total)} />
        {showMonth ? (
          <StatCard
            label={t("monthLabel")}
            value={format.format(stats.month)}
          />
        ) : (
          <StatCard label={t("fallbackLabel")} value={t("fallbackValue")} />
        )}
        <StatCard label={t("apiLabel")} value={format.format(stats.api)} />
      </div>
      <p className="mt-3 text-muted-foreground text-xs">{t("caption")}</p>
    </section>
  );
}
