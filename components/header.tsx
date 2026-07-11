import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { AnnouncementBanner } from "./announcement-banner";
import { AppLogo } from "./app-logo";
import { BackgroundLayers } from "./background";
import { HistorySheet } from "./history-sheet";
import { LocaleSwitcher } from "./locale-switcher";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";
import { buttonVariants } from "./ui/button";

export function Header({ className }: { className?: string }) {
  const t = useTranslations("Nav");

  return (
    <header
      className={cn(
        "sticky inset-x-0 top-0 z-40 mx-auto overflow-hidden border-brand border-b border-dashed",
        className
      )}
    >
      <BackgroundLayers
        className="bg-background"
        scope="container"
        vignette={false}
      />
      <AnnouncementBanner />
      <div className="container relative mx-auto flex h-12 w-full max-w-6xl items-center justify-between border-brand border-x border-dashed px-2 py-2 md:px-4">
        <Link href="/">
          <AppLogo />
        </Link>
        <nav>
          <ul className="hidden items-center gap-1 md:flex">
            <li>
              <Link
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                href="/bulk"
              >
                {t("bulk")}
              </Link>
            </li>
            <li>
              <Link
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                href="/docs"
              >
                {t("apiDocs")}
              </Link>
            </li>
            <li>
              <Link
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                href="/faq"
              >
                {t("faq")}
              </Link>
            </li>
            <HistorySheet />
            <LocaleSwitcher />
            <ThemeToggle />
          </ul>
        </nav>
        <MobileNav />
      </div>
    </header>
  );
}
