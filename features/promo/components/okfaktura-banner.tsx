import { IconArrowUpRight } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { OutboundLink } from "@/components/outbound-link";
import { cn } from "@/lib/utils";
import { type OkfakturaPage, okfakturaUrl } from "../okfaktura";

// Film grain over the okfaktura brand color: SVG fractal noise, blended as overlay.
const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1.4 -0.2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const QUESTIONS: { key: "contractors" | "agencies"; page: OkfakturaPage }[] = [
  { key: "contractors", page: "contractors" },
  { key: "agencies", page: "agencies" },
];

/**
 * Homepage promo for okfaktura, the author's invoicing app. Brand indigo with
 * grain, a question per audience (each links to its okfaktura page) and a
 * full-width link to the site.
 */
export function OkfakturaBanner({ className }: { className?: string }) {
  const t = useTranslations("Okfaktura.banner");

  return (
    <section
      className={cn(
        "relative isolate overflow-hidden bg-[oklch(0.49_0.2_268)] text-white dark:bg-[oklch(0.42_0.17_268)]",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-35 mix-blend-overlay"
        style={{ backgroundImage: GRAIN }}
      />
      <div className="grid gap-8 px-5 py-6 sm:px-8 sm:py-8 md:grid-cols-2 md:gap-10">
        <div>
          <p className="text-white/70 text-xs uppercase tracking-wide">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 text-balance font-bold font-pixel text-xl tracking-wide sm:text-2xl">
            {t("title")}
          </h2>
          <p className="mt-3 text-sm/relaxed text-white/80">
            {t("description")}
          </p>
        </div>
        <ul className="space-y-2">
          {QUESTIONS.map(({ key, page }) => (
            <li key={key}>
              <OutboundLink
                className="group/okf flex w-full items-start justify-between gap-3 border border-white/20 bg-white/5 px-3 py-2.5 outline-none transition-colors duration-150 ease-out hover:border-white/40 hover:bg-white/10 focus-visible:border-white focus-visible:ring-1 focus-visible:ring-white/50"
                event="okfaktura_link_clicked"
                href={okfakturaUrl(page, "home-banner", key)}
                placement={`home-banner-${key}`}
              >
                <span className="flex flex-col gap-1">
                  <span className="font-medium text-sm">
                    {t(`questions.${key}.question`)}
                  </span>
                  <span className="text-white/75 text-xs/relaxed">
                    {t(`questions.${key}.answer`)}
                  </span>
                </span>
                <IconArrowUpRight
                  aria-hidden
                  className="mt-0.5 size-4 shrink-0 text-white/70 transition-transform duration-150 ease-out group-hover/okf:translate-x-0.5 group-hover/okf:-translate-y-0.5"
                />
              </OutboundLink>
            </li>
          ))}
        </ul>
      </div>
      <OutboundLink
        className="flex h-12 w-full items-center justify-center gap-2 border-white/20 border-t font-medium text-sm outline-none transition-colors duration-150 ease-out hover:bg-white/10 focus-visible:bg-white/10"
        event="okfaktura_link_clicked"
        href={okfakturaUrl("home", "home-banner", "cta")}
        placement="home-banner"
      >
        {t("cta")}
        <IconArrowUpRight aria-hidden className="size-4" />
      </OutboundLink>
    </section>
  );
}
