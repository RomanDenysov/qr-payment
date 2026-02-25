import { IconBrandGithub, IconBulb, IconCup } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { FeatureRequestDialog } from "@/features/feedback/components/feature-request-dialog";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("Footer");
  const tFeedback = useTranslations("Feedback");

  return (
    <footer className="mt-auto pt-8 pb-4">
      <div className="border border-foreground/10 border-dashed px-4 py-3">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="font-medium text-sm">{tFeedback("ctaTitle")}</p>
            <p className="mt-0.5 text-muted-foreground text-xs">
              {tFeedback("ctaDescription")}
            </p>
          </div>
          <FeatureRequestDialog
            trigger={
              <Button
                className="w-full shrink-0 sm:w-auto"
                size="lg"
                variant="default"
              >
                <IconBulb />
                {tFeedback("trigger")}
              </Button>
            }
          />
        </div>
      </div>

      <p className="mt-4 text-center text-muted-foreground text-xs">
        {t("privacy")}
      </p>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-muted-foreground text-xs">
        <span>{t("copyright")}</span>
        <span className="text-foreground/15">·</span>
        <Link className="hover:text-foreground" href="/ochrana-udajov">
          {t("privacyPolicy")}
        </Link>
        <span className="text-foreground/15">·</span>
        <Link className="hover:text-foreground" href="/podmienky">
          {t("terms")}
        </Link>
        <span className="text-foreground/15">·</span>
        <a
          className="inline-flex items-center gap-1 hover:text-foreground"
          href="https://buymeacoffee.com/romandenysov"
          rel="noopener noreferrer"
          target="_blank"
        >
          <IconCup className="size-4" />
          Buy me a coffee
        </a>
        <span className="text-foreground/15">·</span>
        <a
          className="inline-flex items-center gap-1 hover:text-foreground"
          href="https://github.com/RomanDenysov/qr-payment"
          rel="noopener noreferrer"
          target="_blank"
        >
          <IconBrandGithub className="size-4" />
          GitHub
        </a>
      </div>
    </footer>
  );
}
