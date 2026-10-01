import { IconArrowUpRight, IconBulb, IconCup } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { Button, buttonVariants } from "@/components/ui/button";
import { DynamicFeatureRequestDialog } from "@/features/feedback/components/feature-request-dialog-dynamic";
import { cn } from "@/lib/utils";
import { SupportLink } from "./support-link";

/**
 * Homepage call to action: "you decide where the project goes". Text on the
 * left, example requests on the right (each opens the feature request dialog
 * prefilled), and two full-width actions along the bottom.
 */
export function CommunityBanner({ className }: { className?: string }) {
  const t = useTranslations("Community");
  const tFeedback = useTranslations("Feedback");
  const examples = t.raw("examples") as string[];

  return (
    <section className={cn("bg-card ring-1 ring-foreground/10", className)}>
      <div className="grid gap-8 px-5 py-6 sm:px-8 sm:py-8 md:grid-cols-2 md:gap-10">
        <div>
          <h2 className="text-balance font-bold font-pixel text-foreground text-xl tracking-wide sm:text-2xl">
            {t("title")}
          </h2>
          <p className="mt-3 text-muted-foreground text-sm/relaxed">
            {t("description")}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wide">
            {t("examplesTitle")}
          </p>
          <ul className="mt-3 space-y-2">
            {examples.map((example) => (
              <li key={example}>
                <DynamicFeatureRequestDialog
                  defaultMessage={example}
                  trigger={
                    <button
                      className="group/example flex w-full items-center justify-between gap-3 border border-foreground/10 px-3 py-2.5 text-left text-foreground text-sm outline-none transition-colors duration-150 ease-out hover:border-foreground/30 hover:bg-muted focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
                      type="button"
                    >
                      {example}
                      <IconArrowUpRight
                        aria-hidden
                        className="size-4 shrink-0 text-muted-foreground transition-transform duration-150 ease-out group-hover/example:translate-x-0.5 group-hover/example:-translate-y-0.5"
                      />
                    </button>
                  }
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="grid border-foreground/10 border-t sm:grid-cols-2">
        <SupportLink
          className={cn(buttonVariants({ variant: "ghost" }), "h-12 w-full")}
          placement="home"
        >
          <IconCup />
          {t("support")}
        </SupportLink>
        <DynamicFeatureRequestDialog
          trigger={
            <Button className="h-12 w-full" variant="default">
              <IconBulb />
              {tFeedback("trigger")}
            </Button>
          }
        />
      </div>
    </section>
  );
}
