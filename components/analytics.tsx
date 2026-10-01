"use client";

import { Analytics as VercelAnalytics } from "@vercel/analytics/next";

const SHARE_PATH_RE = /\/p$/;

/**
 * Vercel Analytics with the query stripped from share-page URLs. Share links
 * made before the payment moved to the URL fragment carry it in `?d=`.
 */
export function Analytics() {
  return (
    <VercelAnalytics
      beforeSend={(event) => {
        const url = new URL(event.url);
        if (SHARE_PATH_RE.test(url.pathname)) {
          url.search = "";
          return { ...event, url: url.toString() };
        }
        return event;
      }}
    />
  );
}
