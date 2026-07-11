"use client";

import { useEffect, useRef } from "react";
import { pingShareOpen } from "@/features/payment/tracking";

/**
 * Fires the share-open counter ping once, from client JS only — never on
 * SSR/GET, so link-unfurl bots (WhatsApp, Slack) don't inflate counts.
 */
export function OpenPing({ id }: { id: string }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) {
      return;
    }
    fired.current = true;
    pingShareOpen(id);
  }, [id]);

  return null;
}
