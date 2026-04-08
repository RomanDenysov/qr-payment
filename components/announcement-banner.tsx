"use client";

import { IconX } from "@tabler/icons-react";
import { track } from "@vercel/analytics";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const ANNOUNCEMENT_ID = "optional-amount";
const STORAGE_PREFIX = "announcement-dismissed-";

export function AnnouncementBanner() {
  const [visible, setVisible] = useState(false);
  const t = useTranslations("Announcement");

  useEffect(() => {
    if (localStorage.getItem(`${STORAGE_PREFIX}${ANNOUNCEMENT_ID}`)) {
      return;
    }
    setVisible(true);
  }, []);

  if (!visible) {
    return null;
  }

  const handleDismiss = () => {
    localStorage.setItem(`${STORAGE_PREFIX}${ANNOUNCEMENT_ID}`, "1");
    track("announcement_dismissed", { id: ANNOUNCEMENT_ID });
    setVisible(false);
  };

  return (
    <div className="border-border border-b bg-muted/50 px-4 py-2">
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
