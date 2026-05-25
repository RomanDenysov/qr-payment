import { hasLocale, IntlErrorCode } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

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
