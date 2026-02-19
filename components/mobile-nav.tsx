"use client";

import { IconHome, IconMenu2, IconNotes, IconX } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { HistorySheet } from "@/components/history-sheet";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const t = useTranslations("Nav");

  if (prevPathname.current !== pathname) {
    prevPathname.current = pathname;
    setOpen(false);
  }

  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <Button
        aria-expanded={open}
        aria-label={open ? t("closeMenu") : t("openMenu")}
        onClick={() => setOpen((prev) => !prev)}
        size="icon-sm"
        variant="ghost"
      >
        {open ? <IconX className="size-5" /> : <IconMenu2 className="size-5" />}
      </Button>

      <div
        className="absolute inset-x-0 top-full z-50 grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <nav className="flex flex-col gap-1 border-b bg-card p-3 shadow-md">
            <Link
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "justify-start"
              )}
              href="/"
              onClick={close}
            >
              <IconHome />
              {t("home")}
            </Link>
            <Link
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "justify-start"
              )}
              href="/bulk"
              onClick={close}
            >
              <IconNotes />
              {t("bulk")}
            </Link>

            <div className="flex items-center justify-between">
              <HistorySheet onOpen={close} />
              <div className="flex items-center gap-1">
                <LocaleSwitcher />
                <ThemeToggle />
              </div>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
