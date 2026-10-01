import { IconBrandGithub } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { DynamicFeatureRequestDialog } from "@/features/feedback/components/feature-request-dialog-dynamic";
import { Link } from "@/i18n/navigation";
import { AppLogo } from "./app-logo";
import { OutboundLink } from "./outbound-link";
import { SupportLink } from "./support-link";

const CREATOR_URL =
  "https://denysov.dev/?utm_source=qr-platby.com&utm_medium=referral&utm_campaign=footer";

const LINK_CLASS =
  "text-foreground underline decoration-foreground/25 underline-offset-4 hover:decoration-foreground";

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
          <Link className="inline-block text-foreground" href="/">
            <AppLogo />
          </Link>
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
              <Link className={LINK_CLASS} href="/navody">
                {tNav("guides")}
              </Link>
            </li>
            <li>
              <Link
                className={LINK_CLASS}
                href={{ pathname: "/", hash: "faq" }}
              >
                {tNav("faq")}
              </Link>
            </li>
            <li>
              <Link className={LINK_CLASS} href="/changelog">
                {tNav("changelog")}
              </Link>
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

      <p className="mt-10 flex items-start gap-2 text-xs/relaxed">
        <IconBrandGithub aria-hidden className="mt-px size-4 shrink-0" />
        <span>
          {t.rich("contribute", {
            link: (chunks) => (
              <OutboundLink
                className={LINK_CLASS}
                event="github_link_clicked"
                href="https://github.com/RomanDenysov/qr-payment"
                placement="footer"
              >
                {chunks}
              </OutboundLink>
            ),
          })}
        </span>
      </p>

      <div className="mt-4 flex flex-col gap-2 border-foreground/10 border-t pt-4 text-xs sm:flex-row sm:items-center sm:justify-between">
        <span>{t("copyright")}</span>
        <span>
          {t.rich("madeBy", {
            link: (chunks) => (
              <OutboundLink
                className={LINK_CLASS}
                event="creator_link_clicked"
                href={CREATOR_URL}
                placement="footer"
              >
                {chunks}
              </OutboundLink>
            ),
          })}
        </span>
      </div>
    </footer>
  );
}
