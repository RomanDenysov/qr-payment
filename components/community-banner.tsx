import { IconBulb, IconCup } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { Button, buttonVariants } from "@/components/ui/button";
import { DynamicFeatureRequestDialog } from "@/features/feedback/components/feature-request-dialog-dynamic";
import { cn } from "@/lib/utils";
import { SupportLink } from "./support-link";

/**
 * Homepage call to action: "you decide where the project goes", with a
 * support link and the feature request dialog.
 */
export function CommunityBanner({ className }: { className?: string }) {
  const t = useTranslations("Community");
  const tFeedback = useTranslations("Feedback");

  return (
    <section
      className={cn(
        "bg-card px-5 py-8 ring-1 ring-foreground/10 sm:px-8 sm:py-10",
        className
      )}
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-10">
        <div className="min-w-0 max-w-xl">
          <h2 className="font-bold font-pixel text-foreground text-xl tracking-wide sm:text-2xl">
            {t("title")}
          </h2>
          <p className="mt-2 text-muted-foreground text-sm/relaxed">
            {t("description")}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <DynamicFeatureRequestDialog
            trigger={
              <Button className="h-12 px-5 text-sm" variant="default">
                <IconBulb />
                {tFeedback("trigger")}
              </Button>
            }
          />
          <SupportLink
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-12 px-5 text-sm"
            )}
            placement="home"
          >
            <IconCup />
            {t("support")}
          </SupportLink>
        </div>
      </div>
    </section>
  );
}
