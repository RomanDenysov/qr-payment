import { cn } from "@/lib/utils";

export const AppLogo = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "inline-flex items-center gap-1 font-bold text-xl leading-none",
      className
    )}
  >
    <span className="rounded-none bg-primary p-1 font-pixel text-primary-foreground">
      QR
    </span>
    <span>Platby</span>
  </div>
);
