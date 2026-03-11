import { getTranslations, setRequestLocale } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { linkVariants } from "@/components/ui/link";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/features/docs/components/code-block";
import { SectionHeading } from "@/features/docs/components/section-heading";
import { Link } from "@/i18n/navigation";
import { getAlternates, localePath } from "@/lib/seo";
import { WidgetConfigurator } from "./_components/widget-configurator";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("widgetTitle"),
    description: t("widgetDescription"),
    alternates: getAlternates(locale, "/widget"),
  };
}

function JsonLd({
  locale,
  title,
  subtitle,
}: {
  locale: string;
  title: string;
  subtitle: string;
}) {
  const data = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: title,
    description: subtitle,
    url: localePath(locale, "/widget"),
    dateModified: "2026-03-11",
    author: {
      "@type": "Person",
      name: "Roman Denysov",
      url: "https://github.com/RomanDenysov",
    },
  });

  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD from hardcoded content
      dangerouslySetInnerHTML={{ __html: data }}
      type="application/ld+json"
    />
  );
}

export default async function WidgetPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Widget" });

  return (
    <div className="flex-1 pt-5 sm:pt-8 md:pt-16">
      <div className="mx-auto max-w-5xl">
        {/* Title */}
        <div className="space-y-2">
          <h1 className="font-bold font-pixel text-foreground text-lg tracking-wide sm:text-xl">
            {t("title")}
          </h1>
          <p className="text-muted-foreground text-sm/relaxed">
            {t("subtitle")}
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{t("badgeNoServer")}</Badge>
            <Badge variant="secondary">{t("badgeFree")}</Badge>
            <Badge variant="secondary">{t("badgeShadowDom")}</Badge>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="space-y-10">
          {/* Quick Start */}
          <section className="space-y-4">
            <SectionHeading id="quick-start">{t("quickStart")}</SectionHeading>
            <p className="text-muted-foreground text-sm">
              {t("quickStartDesc")}
            </p>
            <CodeBlock
              code={`<!-- Add this to your HTML -->
<div class="qr-platby-widget"
  data-format="paybysquare"
  data-iban="SK3112000000198742637541"
  data-amount="25.50"
  data-recipient="Jan Novak">
</div>

<script src="https://qr-platby.com/widget.js" async></script>`}
              language="html"
            />
          </section>

          {/* Live Configurator */}
          <section className="space-y-4">
            <SectionHeading id="configurator">
              {t("configurator")}
            </SectionHeading>
            <p className="text-muted-foreground text-sm">
              {t("configuratorDesc")}
            </p>
            <WidgetConfigurator />
          </section>

          {/* Supported Formats */}
          <section className="space-y-4">
            <SectionHeading id="formats">{t("formats")}</SectionHeading>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1 border p-4">
                <p className="font-medium text-foreground text-sm">
                  PAY by square
                </p>
                <p className="text-muted-foreground text-xs">
                  {t("formatPaybysquare")}
                </p>
                <code className="text-xs">data-format="paybysquare"</code>
              </div>
              <div className="space-y-1 border p-4">
                <p className="font-medium text-foreground text-sm">
                  SPAYD / QR Platba
                </p>
                <p className="text-muted-foreground text-xs">
                  {t("formatSpayd")}
                </p>
                <code className="text-xs">data-format="spayd"</code>
              </div>
              <div className="space-y-1 border p-4">
                <p className="font-medium text-foreground text-sm">EPC QR</p>
                <p className="text-muted-foreground text-xs">
                  {t("formatEpc")}
                </p>
                <code className="text-xs">data-format="epc"</code>
              </div>
            </div>
          </section>

          {/* Data Attributes */}
          <section className="space-y-4">
            <SectionHeading id="attributes">{t("attributes")}</SectionHeading>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pr-4 pb-2 font-medium">{t("attrName")}</th>
                    <th className="pr-4 pb-2 font-medium">{t("attrType")}</th>
                    <th className="pr-4 pb-2 font-medium">
                      {t("attrDefault")}
                    </th>
                    <th className="pb-2 font-medium">{t("attrDescription")}</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground text-xs">
                  <tr className="border-b">
                    <td className="py-2 pr-4">
                      <code>data-format</code>
                    </td>
                    <td className="py-2 pr-4">string</td>
                    <td className="py-2 pr-4">paybysquare</td>
                    <td className="py-2">paybysquare, spayd, epc</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">
                      <code>data-iban</code>
                    </td>
                    <td className="py-2 pr-4">string</td>
                    <td className="py-2 pr-4">-</td>
                    <td className="py-2">{t("attrIban")}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">
                      <code>data-amount</code>
                    </td>
                    <td className="py-2 pr-4">number</td>
                    <td className="py-2 pr-4">-</td>
                    <td className="py-2">{t("attrAmount")}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">
                      <code>data-currency</code>
                    </td>
                    <td className="py-2 pr-4">string</td>
                    <td className="py-2 pr-4">EUR</td>
                    <td className="py-2">{t("attrCurrency")}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">
                      <code>data-recipient</code>
                    </td>
                    <td className="py-2 pr-4">string</td>
                    <td className="py-2 pr-4">-</td>
                    <td className="py-2">{t("attrRecipient")}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">
                      <code>data-message</code>
                    </td>
                    <td className="py-2 pr-4">string</td>
                    <td className="py-2 pr-4">-</td>
                    <td className="py-2">{t("attrMessage")}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">
                      <code>data-variable-symbol</code>
                    </td>
                    <td className="py-2 pr-4">string</td>
                    <td className="py-2 pr-4">-</td>
                    <td className="py-2">{t("attrVs")}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">
                      <code>data-size</code>
                    </td>
                    <td className="py-2 pr-4">number</td>
                    <td className="py-2 pr-4">200</td>
                    <td className="py-2">{t("attrSize")}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">
                      <code>data-theme</code>
                    </td>
                    <td className="py-2 pr-4">string</td>
                    <td className="py-2 pr-4">light</td>
                    <td className="py-2">light, dark</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">
                      <code>data-show-download</code>
                    </td>
                    <td className="py-2 pr-4">boolean</td>
                    <td className="py-2 pr-4">true</td>
                    <td className="py-2">{t("attrDownload")}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">
                      <code>data-show-amount-input</code>
                    </td>
                    <td className="py-2 pr-4">boolean</td>
                    <td className="py-2 pr-4">false</td>
                    <td className="py-2">{t("attrAmountInput")}</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">
                      <code>data-branding</code>
                    </td>
                    <td className="py-2 pr-4">boolean</td>
                    <td className="py-2 pr-4">true</td>
                    <td className="py-2">{t("attrBranding")}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* JavaScript API */}
          <section className="space-y-4">
            <SectionHeading id="js-api">{t("jsApi")}</SectionHeading>
            <p className="text-muted-foreground text-sm">{t("jsApiDesc")}</p>
            <CodeBlock
              code={`// Create widget programmatically
const widget = QRPlatby.create({
  element: document.getElementById('my-container'),
  format: 'spayd',
  iban: 'CZ6508000000192000145399',
  amount: 1500,
  currency: 'CZK',
  theme: 'light'
});

// Update parameters dynamically
widget.update({ amount: 2000, message: 'Updated invoice' });

// Get QR code as data URL
const dataUrl = widget.toDataURL();

// Get QR code as SVG string
const svg = widget.toSVG();

// Destroy widget
widget.destroy();`}
              language="javascript"
            />
          </section>

          {/* How It Works */}
          <section className="space-y-4">
            <SectionHeading id="how-it-works">{t("howItWorks")}</SectionHeading>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>- {t("howClientSide")}</li>
              <li>- {t("howNoData")}</li>
              <li>- {t("howShadowDom")}</li>
              <li>- {t("howMultiple")}</li>
            </ul>
          </section>
        </div>

        {/* Back link */}
        <div className="pt-8 pb-4 text-center">
          <Link className={linkVariants({ size: "sm" })} href="/">
            ← {t("backToHome")}
          </Link>
        </div>
      </div>

      <JsonLd locale={locale} subtitle={t("subtitle")} title={t("title")} />
    </div>
  );
}
