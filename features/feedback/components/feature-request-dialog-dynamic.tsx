"use client";

import { lazy, type ReactElement, Suspense, useEffect, useState } from "react";

const FeatureRequestDialog = lazy(() =>
  import("./feature-request-dialog").then((m) => ({
    default: m.FeatureRequestDialog,
  }))
);

/**
 * Feature request dialog whose code loads after mount. Until then the bare
 * trigger is rendered, so the button is in the server HTML and does not pop in.
 */
export function DynamicFeatureRequestDialog({
  defaultMessage,
  trigger,
}: {
  defaultMessage?: string;
  trigger: ReactElement;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return trigger;
  }
  return (
    <Suspense fallback={trigger}>
      <FeatureRequestDialog defaultMessage={defaultMessage} trigger={trigger} />
    </Suspense>
  );
}
