"use client";

import { IconX } from "@tabler/icons-react";
import { track } from "@vercel/analytics";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { linkVariants } from "@/components/ui/link";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const ANNOUNCEMENT_ID = "api-styling-params";
const STORAGE_PREFIX = "announcement-dismissed-";

export function AnnouncementBanner() {
  const [visible, setVisible] = useState(false);
  const t = useTranslations("Announcement");

  useEffect(() => {
    try {
      if (localStorage.getItem(`${STORAGE_PREFIX}${ANNOUNCEMENT_ID}`)) {
        return;
      }
    } catch {
      // localStorage unavailable (private browsing) - show banner anyway
    }
    setVisible(true);
  }, []);

  if (!visible) {
    return null;
  }

  const handleDismiss = () => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${ANNOUNCEMENT_ID}`, "1");
    } catch {
      // localStorage unavailable - dismiss visually anyway
    }
    track("announcement_dismissed", { id: ANNOUNCEMENT_ID });
    setVisible(false);
  };

  const handleChangelogClick = () => {
    track("announcement_changelog_clicked", { id: ANNOUNCEMENT_ID });
  };

  return (
    <div className="fade-in-0 slide-in-from-top-0 sticky top-0 z-30 min-h-9 animate-in bg-brand py-2 ring-1 ring-foreground/10 duration-200 ease-out">
      <div className="mx-auto flex h-full items-center justify-between gap-3.5 px-2 md:px-4">
        <p className="font-medium text-brand-foreground text-xs">
          {t("message")}{" "}
          <Link
            className={cn(
              linkVariants({ variant: "muted", size: "sm" }),
              "whitespace-nowrap font-semibold text-brand-foreground dark:text-brand-foreground"
            )}
            href="/changelog"
            onClick={handleChangelogClick}
          >
            {t("readMore")} →
          </Link>
        </p>
        <button
          aria-label={t("close")}
          className="shrink-0 text-brand-foreground transition-colors hover:text-foreground"
          onClick={handleDismiss}
          type="button"
        >
          <IconX className="size-5" />
        </button>
      </div>
    </div>
  );
}
