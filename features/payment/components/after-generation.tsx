"use client";

import { type ReactNode, useEffect, useState } from "react";
import { usePaymentHistory } from "../store";

/**
 * Renders its children once this browser has generated at least one QR code.
 * History lives in localStorage, so it is read after mount to keep the server
 * and first client render identical.
 */
export function AfterGeneration({ children }: { children: ReactNode }) {
  const history = usePaymentHistory();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || history.length === 0) {
    return null;
  }
  return children;
}
