import { IconBrandGithub } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CommunityBanner } from "./community-banner";

export function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="mt-auto pt-16 pb-4">
      <CommunityBanner placement="footer" />

      <p className="mt-4 text-center text-muted-foreground text-xs">
        {t("privacy")}
      </p>
      <p className="mt-1 text-center text-muted-foreground text-xs">
        {t("hobbyNotice")}
      </p>

      <nav aria-label="Footer">
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
          <Link className="hover:text-foreground" href="/docs">
            {t("apiDocs")}
          </Link>
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
          <span className="text-foreground/15">·</span>
          <span>
            {t("createdBy")}{" "}
            <a
              className="underline underline-offset-2 hover:text-foreground"
              href="https://denysov.dev"
              rel="noopener"
              target="_blank"
            >
              denysov.dev
            </a>
          </span>
        </div>
      </nav>
    </footer>
  );
}
