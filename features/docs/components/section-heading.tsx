import type { ReactNode } from "react";

interface SectionHeadingProps {
  id: string;
  children: ReactNode;
  as?: "h2" | "h3";
}

export function SectionHeading({
  id,
  children,
  as: Tag = "h2",
}: SectionHeadingProps) {
  const className =
    Tag === "h2"
      ? "group scroll-mt-20 font-bold font-pixel text-base tracking-wide sm:text-lg"
      : "group scroll-mt-20 font-bold font-pixel text-sm tracking-wide sm:text-base";

  return (
    <Tag className={className} id={id}>
      <a className="no-underline" href={`#${id}`}>
        {children}
        <span className="ml-2 text-muted-foreground/0 transition-colors group-hover:text-muted-foreground">
          #
        </span>
      </a>
    </Tag>
  );
}
