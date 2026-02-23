import { Analytics } from "@vercel/analytics/next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Background } from "@/components/background";
import { ConsentBannerLoader } from "@/components/consent-banner-loader";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { routing } from "@/i18n/routing";
import { getAlternates } from "@/lib/seo";
import { JsonLd } from "./json-ld";

const OG_LOCALES: Record<string, string> = {
  sk: "sk_SK",
  cs: "cs_CZ",
  en: "en_US",
};

function getOgLocale(locale: string) {
  return OG_LOCALES[locale] ?? "sk_SK";
}

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    metadataBase: new URL("https://qr-platby.com"),
    title: {
      default: t("title"),
      template: "%s | QR Platby",
    },
    description: t("description"),
    keywords: t("keywords").split(", "),
    authors: [
      { name: "Roman Denysov", url: "https://github.com/RomanDenysov" },
    ],
    creator: "Roman Denysov",
    publisher: "QR Platby",
    applicationName: "QR Platby",
    generator: "Next.js",
    referrer: "origin-when-cross-origin" as const,
    formatDetection: { telephone: false, email: false, address: false },
    openGraph: {
      type: "website" as const,
      locale: getOgLocale(locale),
      url:
        locale === "sk"
          ? "https://qr-platby.com"
          : `https://qr-platby.com/${locale}`,
      siteName: "QR Platby",
      title: t("title"),
      description: t("ogDescription"),
      images: [
        {
          url: "/og-qr-payments.png",
          width: 1200,
          height: 630,
          alt: t("title"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: t("title"),
      description: t("twitterDescription"),
      images: ["/og-qr-payments.png"],
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large" as const,
        "max-snippet": -1,
      },
    },
    alternates: getAlternates(locale),
    verification: {
      google: "fdbFmzG3Hzf6pZiMA9kWUnywwtYSaivcvhHEsDnA50E",
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <NextIntlClientProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        disableTransitionOnChange
        enableSystem
      >
        <Header />
        <main id="main-content">{children}</main>
        <JsonLd />
        <Footer />
        <Background />
        <Toaster />
        <ConsentBannerLoader />
        <Analytics />
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
