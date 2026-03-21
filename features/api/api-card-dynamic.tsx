"use client";

import dynamic from "next/dynamic";

function ApiCardSkeleton() {
  return (
    <div className="space-y-3 rounded-none border border-border p-4">
      <div className="h-6 w-24 animate-pulse rounded-none bg-muted" />
      <div className="space-y-2">
        <div className="h-4 w-full animate-pulse rounded-none bg-muted" />
        <div className="h-4 w-5/6 animate-pulse rounded-none bg-muted" />
      </div>
      <div className="h-10 w-32 animate-pulse rounded-none bg-muted" />
    </div>
  );
}

const ApiCard = dynamic(
  () => import("./api-card").then((mod) => ({ default: mod.ApiCard })),
  {
    ssr: false,
    loading: () => <ApiCardSkeleton />,
  }
);

export function DynamicApiCard() {
  return <ApiCard />;
}
