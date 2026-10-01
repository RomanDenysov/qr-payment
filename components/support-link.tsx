"use client";

import { track } from "@vercel/analytics";
import type { ReactNode } from "react";

interface SupportLinkProps {
  children: ReactNode;
  className?: string;
  /** Where the link sits, so placements can be compared in analytics. */
  placement: "footer" | "home";
}

/** Outbound "Buy me a coffee" link that records the click before leaving. */
export function SupportLink({
  children,
  className,
  placement,
}: SupportLinkProps) {
  return (
    <a
      className={className}
      href="https://buymeacoffee.com/romandenysov"
      onClick={() => track("support_link_clicked", { placement })}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
    </a>
  );
}
