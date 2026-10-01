import { IconBulb, IconCup } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { Button, buttonVariants } from "@/components/ui/button";
import { DynamicFeatureRequestDialog } from "@/features/feedback/components/feature-request-dialog-dynamic";
import { cn } from "@/lib/utils";
import { SupportLink } from "./support-link";

interface CommunityBannerProps {
  className?: string;
  /** Where the banner sits; passed to analytics on a support click. */
  placement: string;
}

/**
 * "You decide where the project goes" block: a support link and the feature
 * request dialog side by side. Used in the footer and under the generator.
 */
export function CommunityBanner({
  className,
  placement,
}: CommunityBannerProps) {
  const t = useTranslations("Community");
  const tFeedback = useTranslations("Feedback");

  return (
    <div
      className={cn(
        "border border-foreground/10 border-dashed px-4 py-3",
        className
      )}
    >
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="font-medium text-sm">{t("title")}</p>
          <p className="mt-0.5 text-muted-foreground text-xs">
            {t("description")}
          </p>
        </div>
        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
          <SupportLink
            className={buttonVariants({ size: "lg", variant: "outline" })}
            placement={placement}
          >
            <IconCup />
            {t("support")}
          </SupportLink>
          <DynamicFeatureRequestDialog
            trigger={
              <Button size="lg" variant="default">
                <IconBulb />
                {tFeedback("trigger")}
              </Button>
            }
          />
        </div>
      </div>
    </div>
  );
}
