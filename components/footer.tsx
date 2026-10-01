import { IconBrandGithub } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { DynamicFeatureRequestDialog } from "@/features/feedback/components/feature-request-dialog-dynamic";
import { Link } from "@/i18n/navigation";
import { SupportLink } from "./support-link";

const LINK_CLASS = "hover:text-foreground";

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h2 className="font-semibold text-foreground text-xs uppercase tracking-wide">
        {title}
      </h2>
      <ul className="mt-3 space-y-2">{children}</ul>
    </div>
  );
}

export function Footer() {
  const t = useTranslations("Footer");
  const tNav = useTranslations("Nav");
  const tHome = useTranslations("HomeContent");
  const tCommunity = useTranslations("Community");
  const tFeedback = useTranslations("Feedback");

  return (
    <footer className="mt-auto pt-20 pb-6 text-muted-foreground text-sm">
      <div className="grid gap-10 border-foreground/10 border-t pt-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-3">
          <p className="font-bold font-pixel text-base text-foreground tracking-wide">
            QR Platby
          </p>
          <p className="text-xs/relaxed">{t("privacy")}</p>
          <p className="text-xs/relaxed">{t("hobbyNotice")}</p>
        </div>

        <nav aria-label={t("colTools")}>
          <FooterColumn title={t("colTools")}>
            <li>
              <Link className={LINK_CLASS} href="/">
                {t("generator")}
              </Link>
            </li>
            <li>
              <Link
                className={LINK_CLASS}
                href="/ako-vytvorit-qr-kod-na-platbu"
              >
                {tHome("section4GuideLink")}
              </Link>
            </li>
            <li>
              <Link className={LINK_CLASS} href="/sepa-qr-code-generator">
                {tHome("section4SepaLink")}
              </Link>
            </li>
            <li>
              <Link className={LINK_CLASS} href="/studio">
                {tHome("section4StudioLink")}
              </Link>
            </li>
            <li>
              <Link className={LINK_CLASS} href="/bulk">
                {tHome("section4BulkLink")}
              </Link>
            </li>
          </FooterColumn>
        </nav>

        <nav aria-label={t("colResources")}>
          <FooterColumn title={t("colResources")}>
            <li>
              <Link className={LINK_CLASS} href="/docs">
                {t("apiDocs")}
              </Link>
            </li>
            <li>
              <Link className={LINK_CLASS} href="/faq">
                {tNav("faq")}
              </Link>
            </li>
            <li>
              <Link className={LINK_CLASS} href="/changelog">
                {tNav("changelog")}
              </Link>
            </li>
            <li>
              <a
                className={`inline-flex items-center gap-1 ${LINK_CLASS}`}
                href="https://github.com/RomanDenysov/qr-payment"
                rel="noopener noreferrer"
                target="_blank"
              >
                <IconBrandGithub className="size-4" />
                GitHub
              </a>
            </li>
          </FooterColumn>
        </nav>

        <nav aria-label={t("colProject")}>
          <FooterColumn title={t("colProject")}>
            <li>
              <SupportLink className={LINK_CLASS} placement="footer">
                {tCommunity("support")}
              </SupportLink>
            </li>
            <li>
              <DynamicFeatureRequestDialog
                trigger={
                  <button className={LINK_CLASS} type="button">
                    {tFeedback("trigger")}
                  </button>
                }
              />
            </li>
            <li>
              <Link className={LINK_CLASS} href="/ochrana-udajov">
                {t("privacyPolicy")}
              </Link>
            </li>
            <li>
              <Link className={LINK_CLASS} href="/podmienky">
                {t("terms")}
              </Link>
            </li>
          </FooterColumn>
        </nav>
      </div>

      <div className="mt-10 flex flex-col gap-2 border-foreground/10 border-t pt-4 text-xs sm:flex-row sm:items-center sm:justify-between">
        <span>{t("copyright")}</span>
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
    </footer>
  );
}
