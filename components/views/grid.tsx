import type { ComponentProps } from "react";

export const Grid = (props: ComponentProps<"section">) => (
  <section
    className="grid gap-8 *:rounded-none sm:grid-cols-2"
    role="feed"
    {...props}
  />
);
