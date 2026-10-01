"use client";

import { Analytics as VercelAnalytics } from "@vercel/analytics/next";

const SHARE_PATH_RE = /\/p$/;

/**
 * Vercel Analytics with the query and fragment stripped from share-page URLs.
 * The payment sits in the fragment; links made before that move carry it in
 * `?d=`.
 */
export function Analytics() {
  return (
    <VercelAnalytics
      beforeSend={(event) => {
        const url = new URL(event.url);
        if (SHARE_PATH_RE.test(url.pathname)) {
          url.search = "";
          url.hash = "";
          return { ...event, url: url.toString() };
        }
        return event;
      }}
    />
  );
}
