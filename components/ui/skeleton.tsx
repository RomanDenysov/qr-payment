import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-none bg-muted",
        "before:absolute before:inset-0 before:bg-[length:200%_100%] before:bg-[linear-gradient(90deg,transparent_0%,var(--background)_50%,transparent_100%)] before:opacity-40 motion-safe:before:animate-shimmer dark:before:opacity-20",
        className
      )}
      data-slot="skeleton"
      {...props}
    />
  );
}

export { Skeleton };
