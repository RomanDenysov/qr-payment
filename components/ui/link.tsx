import { cva, type VariantProps } from "class-variance-authority";

export const linkVariants = cva("underline underline-offset-4", {
  variants: {
    variant: {
      default: "text-foreground hover:text-primary",
      muted: "text-muted-foreground hover:text-foreground",
    },
    size: {
      default: "",
      sm: "text-xs",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export type LinkVariantProps = VariantProps<typeof linkVariants>;
