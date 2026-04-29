"use client";

import { IconX } from "@tabler/icons-react";
import { track } from "@vercel/analytics";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const ANNOUNCEMENT_ID = "advanced-customizer";
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

  return (
    <div className="sticky top-16 z-30 bg-card px-4 py-2 ring-1 ring-foreground/10">
      <div className="container mx-auto flex max-w-5xl items-center justify-between gap-3">
        <p className="text-foreground/80 text-xs">{t("message")}</p>
        <button
          aria-label={t("close")}
          className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
          onClick={handleDismiss}
          type="button"
        >
          <IconX className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
