import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";
import { hasLocale, IntlErrorCode } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

// The locale comes from the `[locale]` root param, which keeps pages static.
// An explicit override (`getTranslations({ locale })`) wins, and is the only
// option where root params are unavailable (route handlers, server actions).
export default getRequestConfig(async ({ locale: override }) => {
  const locale = override ?? (await rootLocale());
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    onError(error) {
      if (error.code === IntlErrorCode.MISSING_MESSAGE) {
        console.error(`[i18n] Missing translation: ${error.message}`);
        return;
      }
      console.error("[i18n] Translation error:", error);
    },
    getMessageFallback({ namespace, key, error }) {
      const path = [namespace, key].filter(Boolean).join(".");
      if (error.code === IntlErrorCode.MISSING_MESSAGE) {
        return `[MISSING: ${path}]`;
      }
      return path;
    },
  };
});
