"use client";

import { track } from "@vercel/analytics";
import { useLocale } from "next-intl";
import type { ReactNode } from "react";

interface OutboundLinkProps {
  children: ReactNode;
  className?: string;
  /** Analytics event recorded on click. */
  event:
    | "creator_link_clicked"
    | "github_link_clicked"
    | "okfaktura_link_clicked"
    | "support_link_clicked";
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
  const locale = useLocale();

  return (
    <a
      className={className}
      href={href}
      onClick={() => track(event, { placement, locale })}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
    </a>
  );
}
