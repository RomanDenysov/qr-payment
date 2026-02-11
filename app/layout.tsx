import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Background } from "@/components/background";
import { ConsentBannerLoader } from "@/components/consent-banner-loader";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { JsonLd } from "./json-ld";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://qr-platby.com"),
  title: {
    default: "QR Platby - Generátor QR kódov pre platby",
    template: "%s | QR Platby",
  },
  description:
    "Bezplatný online generátor QR kódov v BySquare formáte pre Slovensko. Vytvorte a upravte QR kód pre platbu bez registrácie — vlastné farby, logo a text. Funguje so všetkými slovenskými bankami.",
  keywords: [
    "QR kód",
    "platba",
    "BySquare",
    "IBAN",
    "Slovensko",
    "generátor",
    "banka",
    "úprava QR kódu",
    "vlastné logo",
    "Tatra banka",
    "VÚB",
    "SLSP",
    "ČSOB",
  ],
  authors: [{ name: "Roman Denysov", url: "https://github.com/RomanDenysov" }],
  creator: "Roman Denysov",
  publisher: "QR Platby",
  applicationName: "QR Platby",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    type: "website",
    locale: "sk_SK",
    url: "https://qr-platby.com",
    siteName: "QR Platby",
    title: "QR Platby - Generátor QR kódov pre platby",
    description:
      "Bezplatný online generátor QR kódov v BySquare formáte. Vytvorte a upravte QR kód pre platbu — vlastné farby, logo a text. Funguje so všetkými slovenskými bankami.",
    images: [
      {
        url: "/og-qr-payments.png",
        width: 1200,
        height: 630,
        alt: "QR Platby - Generátor QR kódov pre platby",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "QR Platby - Generátor QR kódov pre platby",
    description:
      "Bezplatný online generátor QR kódov v BySquare formáte pre Slovensko.",
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
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: { canonical: "https://qr-platby.com" },
  verification: {
    google: "fdbFmzG3Hzf6pZiMA9kWUnywwtYSaivcvhHEsDnA50E",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="dark" lang="sk" suppressHydrationWarning>
      <body className="container relative mx-auto flex min-h-screen max-w-5xl flex-col px-2 tracking-tight md:px-4">
        <JsonLd />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <Header />
          {children}
          <Footer />
          <Background />
          <Toaster />
          <ConsentBannerLoader />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
