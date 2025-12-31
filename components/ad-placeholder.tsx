import { cn } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";

export function AdPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-40 items-center justify-center rounded-none bg-muted/30 ring-1 ring-dashed ring-foreground/10",
        className
      )}
    >
      <Skeleton className="size-full" />
    </div>
  );
}
