import { GeistMono } from "geist/font/mono";
import { GeistPixelSquare } from "geist/font/pixel";
import { useLocale } from "next-intl";
import { getTranslations } from "next-intl/server";

import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = useLocale();

  return (
    <html
      className={`dark ${GeistMono.variable} ${GeistPixelSquare.variable}`}
      lang={locale}
      suppressHydrationWarning
    >
      <body className="container relative mx-auto flex min-h-screen max-w-5xl flex-col px-2 tracking-tight md:px-4">
        <SkipLink />
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'if("serviceWorker"in navigator)navigator.serviceWorker.register("/sw.js")',
          }}
        />
      </body>
    </html>
  );
}

async function SkipLink() {
  const t = await getTranslations("Nav");
  return (
    <a
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-foreground focus:ring-2 focus:ring-ring"
      href="#main-content"
    >
      {t("skipToContent")}
    </a>
  );
}
