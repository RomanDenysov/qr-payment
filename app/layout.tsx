import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { Footer } from "@/components/footer";
import { GridBackground } from "@/components/grid-background";
import { Header } from "@/components/header";

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
    <html className="" lang="sk" suppressHydrationWarning>
      <body className="container relative mx-auto flex min-h-screen max-w-5xl flex-col px-2 tracking-tight md:px-4">
        <Header />
        {children}
        <Footer />
        <GridBackground />
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
