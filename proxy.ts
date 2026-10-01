import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { type Locale, routing } from "./i18n/routing";

const handleI18n = createMiddleware(routing);

const LOCALE_COOKIE = "NEXT_LOCALE";

// Visitors from these countries get their national locale no matter what
// language the browser is set to. Everyone else falls back to next-intl's
// Accept-Language detection.
const COUNTRY_LOCALE: Record<string, Locale> = {
  SK: "sk",
  CZ: "cs",
};

/**
 * Locale routing. A locale prefix in the URL or an existing NEXT_LOCALE cookie
 * (an explicit choice via the switcher) always wins; otherwise the visitor's
 * country decides before the browser language does.
 */
export default function proxy(req: NextRequest) {
  const country = req.headers.get("x-vercel-ip-country");
  const locale = country ? COUNTRY_LOCALE[country] : undefined;
  if (locale && !req.cookies.has(LOCALE_COOKIE)) {
    req.cookies.set(LOCALE_COOKIE, locale);
  }
  return handleI18n(req);
}

export const config = {
  matcher: "/((?!api|trpc|serwist|_next|_vercel|.*\\..*).*)",
};
