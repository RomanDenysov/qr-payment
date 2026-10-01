import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["sk", "cs", "en"],
  defaultLocale: "sk",
  localePrefix: "as-needed",
  pathnames: {
    "/": "/",
    "/studio": "/studio",
    "/bulk": "/bulk",
    "/navody": {
      sk: "/navody",
      cs: "/navody",
      en: "/guides",
    },
    "/docs": "/docs",
    "/changelog": "/changelog",
    "/ochrana-udajov": "/ochrana-udajov",
    "/podmienky": "/podmienky",
    "/p": "/p",
    "/~offline": "/~offline",
    "/ako-vytvorit-qr-kod-na-platbu": {
      sk: "/ako-vytvorit-qr-kod-na-platbu",
      cs: "/jak-vytvorit-qr-kod-pro-platbu",
      en: "/how-to-create-payment-qr-code",
    },
    "/sepa-qr-code-generator": {
      sk: "/sepa-qr-kod-generator",
      cs: "/sepa-qr-kod-generator",
      en: "/sepa-qr-code-generator",
    },
  },
});

export type Locale = (typeof routing.locales)[number];
