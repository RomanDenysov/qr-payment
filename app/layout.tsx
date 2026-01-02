import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Background } from "@/components/background";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "QR Platby - Generátor QR kódov pre platby",
  description:
    "Bezplatný online generátor QR kódov v BySquare formáte pre Slovensko. Vytvorte QR kód pre platbu bez registrácie.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="dark" lang="sk" suppressHydrationWarning>
      <body className="container relative mx-auto flex min-h-screen max-w-5xl flex-col px-2 tracking-tight md:px-4">
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
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
