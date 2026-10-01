"use client";

import { track } from "@vercel/analytics";
import type { ReactNode } from "react";

interface OutboundLinkProps {
  children: ReactNode;
  className?: string;
  /** Analytics event recorded on click. */
  event: string;
  href: string;
  /** Where the link sits, so placements can be compared in analytics. */
  placement: string;
}

/** External link in a new tab that records the click before leaving. */
export function OutboundLink({
  children,
  className,
  event,
  href,
  placement,
}: OutboundLinkProps) {
  return (
    <a
      className={className}
      href={href}
      onClick={() => track(event, { placement })}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
    </a>
  );
}
