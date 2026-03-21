import { getTranslations, setRequestLocale } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { linkVariants } from "@/components/ui/link";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/features/docs/components/code-block";
import { CodeTabs } from "@/features/docs/components/code-tabs";
import { ParameterTable } from "@/features/docs/components/parameter-table";
import { SectionHeading } from "@/features/docs/components/section-heading";
import { Toc } from "@/features/docs/components/toc";
import { TryItForm } from "@/features/docs/components/try-it-form";
import { Link } from "@/i18n/navigation";
import { DAILY_LIMIT, MINUTE_LIMIT } from "@/lib/api/rate-limiter";
import { getAlternates, getOgLocale, localePath } from "@/lib/seo";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("apiDocsTitle"),
    description: t("apiDocsDescription"),
    alternates: getAlternates(locale, "/docs"),
    openGraph: {
      title: t("apiDocsTitle"),
      description: t("apiDocsDescription"),
      url: localePath(locale, "/docs"),
      locale: getOgLocale(locale),
      type: "website" as const,
    },
  };
}

export default async function DocsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Docs" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: t("title"),
    description: t("subtitle"),
    url: localePath(locale, "/docs"),
    dateModified: "2026-03-11",
    author: {
      "@type": "Person",
      name: "Roman Denysov",
      url: "https://github.com/RomanDenysov",
    },
    about: {
      "@type": "WebAPI",
      name: "QR Platby API",
      url: "https://qr-platby.com/api/v1/qr",
    },
  };

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
            <Badge variant="secondary">{t("noAuth")}</Badge>
            <Badge variant="secondary">{t("corsEnabled")}</Badge>
            <Badge variant="secondary">REST / JSON</Badge>
          </div>
        </div>

        <Separator className="my-6" />

        {/* TOC + Content layout */}
        <div className="lg:grid lg:grid-cols-[200px_1fr] lg:gap-8">
          <Toc />

          <div className="space-y-10">
            {/* Quick Start */}
            <section className="space-y-4">
              <SectionHeading id="quick-start">
                {t("quickStart")}
              </SectionHeading>
              <p className="text-muted-foreground text-sm">
                {t("quickStartDesc")}
              </p>
              <CodeBlock
                code={`curl -X POST https://qr-platby.com/api/v1/qr \\
  -H "Content-Type: application/json" \\
  -d '{"iban":"SK3112000000198742637541","amount":25.50,"variableSymbol":"2024001"}'`}
                language="curl"
              />
              <p className="text-muted-foreground text-xs">
                {t("quickStartSpayd")}
              </p>
              <CodeBlock
                code={`curl -X POST https://qr-platby.com/api/v1/qr \\
  -H "Content-Type: application/json" \\
  -d '{"iban":"CZ6508000000192000145399","amount":480.50,"currency":"CZK","paymentFormat":"spayd"}'`}
                language="curl"
              />
            </section>

            {/* Base URL */}
            <section className="space-y-4">
              <SectionHeading id="base-url">{t("baseUrl")}</SectionHeading>
              <CodeBlock code="https://qr-platby.com/api/v1/qr" />
              <ul className="space-y-1 text-muted-foreground text-sm">
                <li>- {t("noAuth")}</li>
                <li>- {t("corsEnabled")}</li>
                <li>- HTTPS only</li>
              </ul>
            </section>

            {/* Endpoints */}
            <section className="space-y-4">
              <SectionHeading id="endpoints">{t("endpoints")}</SectionHeading>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="default">POST</Badge>
                  <code className="text-xs">/api/v1/qr</code>
                  <span className="text-muted-foreground text-xs">
                    - {t("endpointPost")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">GET</Badge>
                  <code className="text-xs">/api/v1/qr</code>
                  <span className="text-muted-foreground text-xs">
                    - {t("endpointGet")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">OPTIONS</Badge>
                  <code className="text-xs">/api/v1/qr</code>
                  <span className="text-muted-foreground text-xs">
                    - CORS preflight
                  </span>
                </div>
              </div>
            </section>

            {/* Parameters */}
            <section className="space-y-4">
              <SectionHeading id="parameters">{t("parameters")}</SectionHeading>
              <p className="text-muted-foreground text-sm">
                {t("parametersDesc")}
              </p>
              <ParameterTable />
              <p className="text-muted-foreground text-xs">{t("epcNote")}</p>
            </section>

            {/* Response */}
            <section className="space-y-4">
              <SectionHeading id="response">{t("response")}</SectionHeading>
              <SectionHeading as="h3" id="response-success">
                {t("responseSuccess")}
              </SectionHeading>
              <CodeBlock
                code={`{
  "success": true,
  "data": "data:image/png;base64,iVBORw0KGgo...",
  "format": "png",
  "iban": "SK3112000000198742637541",
  "amount": 25.5,
  "currency": "EUR"
}`}
                language="json"
              />
              <SectionHeading as="h3" id="response-error">
                {t("responseError")}
              </SectionHeading>
              <CodeBlock
                code={`{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed. Check the issues array for details.",
    "issues": [
      { "path": "iban", "message": "Invalid IBAN" }
    ],
    "hint": "Required: iban (string). Optional: amount, currency, ...",
    "docs": "${localePath(locale, "/docs")}",
    "example": {
      "iban": "SK3112000000198742637541",
      "amount": 25.5
    }
  }
}`}
                language="json"
              />
            </section>

            {/* Errors */}
            <section className="space-y-4">
              <SectionHeading id="errors">{t("errors")}</SectionHeading>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">400</Badge>
                    <span className="font-mono text-xs">VALIDATION_ERROR</span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {t("errorValidation")}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">400</Badge>
                    <span className="font-mono text-xs">VALIDATION_ERROR</span>
                    <span className="text-muted-foreground text-xs">
                      (Invalid JSON)
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {t("errorJson")}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">400</Badge>
                    <span className="font-mono text-xs">VALIDATION_ERROR</span>
                    <span className="text-muted-foreground text-xs">
                      (Invalid IBAN)
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {t("errorIban")}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">400</Badge>
                    <span className="font-mono text-xs">VALIDATION_ERROR</span>
                    <span className="text-muted-foreground text-xs">
                      (SPAYD payload)
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {t("errorSpayd")}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">429</Badge>
                    <span className="font-mono text-xs">RATE_LIMIT</span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {t("errorRateLimit")}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">500</Badge>
                    <span className="font-mono text-xs">INTERNAL_ERROR</span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {t("errorInternal")}
                  </p>
                </div>
              </div>
            </section>

            {/* Rate Limiting */}
            <section className="space-y-4">
              <SectionHeading id="rate-limiting">
                {t("rateLimiting")}
              </SectionHeading>
              <ul className="space-y-1 text-muted-foreground text-sm">
                <li>
                  - {MINUTE_LIMIT} {t("requestsPerMinute")}
                </li>
                <li>
                  - {DAILY_LIMIT} {t("requestsPerDay")}
                </li>
                <li>- GET {t("rateLimitGetNote")}</li>
              </ul>
              <SectionHeading as="h3" id="rate-limit-headers">
                {t("responseHeaders")}
              </SectionHeading>
              <CodeBlock
                code={`X-RateLimit-Limit: ${MINUTE_LIMIT}
X-RateLimit-Remaining: 17
Retry-After: 45  (only on 429)`}
              />
              <p className="text-muted-foreground text-sm">
                {t("rateLimitTip")}
              </p>
            </section>

            {/* Code Examples */}
            <section className="space-y-4">
              <SectionHeading id="examples">{t("codeExamples")}</SectionHeading>
              <CodeTabs />
            </section>

            {/* Try It */}
            <section className="space-y-4">
              <SectionHeading id="try-it">{t("tryIt")}</SectionHeading>
              <p className="text-muted-foreground text-sm">{t("tryItDesc")}</p>
              <TryItForm />
            </section>
          </div>
        </div>

        {/* Back link */}
        <div className="pt-8 pb-4 text-center">
          <Link className={linkVariants({ size: "sm" })} href="/">
            ← {t("backToHome")}
          </Link>
        </div>
      </div>

      {/* JSON-LD structured data - hardcoded content, safe to inject */}
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data from hardcoded content
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        type="application/ld+json"
      />
    </div>
  );
}
