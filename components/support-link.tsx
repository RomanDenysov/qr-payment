import type { ReactNode } from "react";
import { OutboundLink } from "./outbound-link";

interface SupportLinkProps {
  children: ReactNode;
  className?: string;
  placement: "footer" | "home";
}

/** "Buy me a coffee" link, tracked as `support_link_clicked`. */
export function SupportLink({
  children,
  className,
  placement,
}: SupportLinkProps) {
  return (
    <OutboundLink
      className={className}
      event="support_link_clicked"
      href="https://buymeacoffee.com/romandenysov"
      placement={placement}
    >
      {children}
    </OutboundLink>
  );
}
