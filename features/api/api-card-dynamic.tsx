"use client";

import dynamic from "next/dynamic";

const ApiCard = dynamic(
  () => import("./api-card").then((mod) => ({ default: mod.ApiCard })),
  {
    ssr: false,
  }
);

export function DynamicApiCard() {
  return <ApiCard />;
}
