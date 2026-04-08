"use client";

import dynamic from "next/dynamic";

const AnnouncementBanner = dynamic(
  () => import("./announcement-banner").then((mod) => mod.AnnouncementBanner),
  { ssr: false }
);

export function AnnouncementBannerLoader() {
  return <AnnouncementBanner />;
}
