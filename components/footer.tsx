"use client";

import { IconBrandGithub, IconCup } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="mt-auto pt-8">
      <Separator className="mb-4" />
      <p className="mb-4 text-center text-muted-foreground text-xs">
        {t("privacy")}
      </p>

      <div className="flex items-center justify-center gap-3 pb-3 text-muted-foreground text-xs">
        <a
          className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-foreground"
          href="https://buymeacoffee.com/romandenysov"
          rel="noopener noreferrer"
          target="_blank"
        >
          <IconCup className="size-3.5" />
          Buy me a coffee
        </a>
        <span>•</span>
        <a
          className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-foreground"
          href="https://github.com/RomanDenysov/qr-payment"
          rel="noopener noreferrer"
          target="_blank"
        >
          <IconBrandGithub className="size-3.5" />
          GitHub
        </a>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 pb-4 text-muted-foreground text-xs">
        <span>{t("copyright")}</span>
        <span>•</span>
        <Link
          className="underline underline-offset-4 hover:text-foreground"
          href="/ochrana-udajov"
        >
          {t("privacyPolicy")}
        </Link>
        <span>•</span>
        <Link
          className="underline underline-offset-4 hover:text-foreground"
          href="/podmienky"
        >
          {t("terms")}
        </Link>
      </div>
    </footer>
  );
}
