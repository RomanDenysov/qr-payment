import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const containerVariants = cva("container mx-auto max-w-5xl px-2 md:px-4", {
  variants: {
    variant: {
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type ContainerProps = ComponentProps<"div"> &
  VariantProps<typeof containerVariants>;

function Container({ className, variant, ...props }: ContainerProps) {
  return (
    <div className={cn(containerVariants({ variant, className }))} {...props} />
  );
}

export { Container, containerVariants };
