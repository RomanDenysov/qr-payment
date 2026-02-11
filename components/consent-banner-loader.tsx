"use client";

import dynamic from "next/dynamic";

const ConsentBanner = dynamic(
  () => import("./consent-banner").then((mod) => mod.ConsentBanner),
  { ssr: false }
);

export function ConsentBannerLoader() {
  return <ConsentBanner />;
}
