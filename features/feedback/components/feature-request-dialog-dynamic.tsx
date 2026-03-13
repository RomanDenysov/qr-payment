"use client";

import dynamic from "next/dynamic";
import type React from "react";

const FeatureRequestDialog = dynamic(
  () => import("./feature-request-dialog").then((m) => m.FeatureRequestDialog),
  { ssr: false }
);

export function DynamicFeatureRequestDialog({
  trigger,
}: {
  trigger: React.ReactElement;
}) {
  return <FeatureRequestDialog trigger={trigger} />;
}
