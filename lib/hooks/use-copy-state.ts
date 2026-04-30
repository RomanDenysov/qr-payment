"use client";

import { useEffect, useRef, useState } from "react";

export function useCopyState(timeout = 2000) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const trigger = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setCopied(true);
    timerRef.current = setTimeout(() => setCopied(false), timeout);
  };

  return { copied, trigger };
}
