import { IconNotes } from "@tabler/icons-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AppLogo } from "./app-logo";
import { HistorySheet } from "./history-sheet";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";
import { buttonVariants } from "./ui/button";

export function Header() {
  return (
    <header className="sticky top-0">
      <div className="relative z-50 my-2 flex h-12 items-center justify-between rounded-none bg-card p-2 ring-1 ring-foreground/10">
        <Link className="transition-opacity hover:opacity-80" href="/">
          <AppLogo />
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          <Link
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            href="/bulk"
          >
            <IconNotes />
            Hromadné generovanie
          </Link>
          <HistorySheet />
          <ThemeToggle />
        </div>
        <MobileNav />
      </div>
    </header>
  );
}
