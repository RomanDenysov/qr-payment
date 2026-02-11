"use client";

import { IconHome, IconMenu2, IconNotes, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { HistorySheet } from "@/components/history-sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  if (prevPathname.current !== pathname) {
    prevPathname.current = pathname;
    setOpen(false);
  }

  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <Button
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
              Domov
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
              Hromadné generovanie
            </Link>

            <div className="flex items-center justify-between">
              <HistorySheet onOpen={close} />
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
