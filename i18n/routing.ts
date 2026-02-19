import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["sk", "cs", "en"],
  defaultLocale: "sk",
});

export type Locale = (typeof routing.locales)[number];
