import { cn } from "@/lib/utils";

type BackgroundScope = "viewport" | "container";

interface BackgroundLayersProps {
  /** viewport = fixed full screen (layout); container = absolute fill parent */
  scope?: BackgroundScope;
  /** Edge darkening — on by default for viewport, off for containers */
  vignette?: boolean;
  className?: string;
}

/** Reusable noise + scanlines (+ optional vignette). Parent must be `relative overflow-hidden` for container scope. */
export function BackgroundLayers({
  scope = "viewport",
  vignette,
  className,
}: BackgroundLayersProps) {
  const position = scope === "viewport" ? "fixed" : "absolute";
  const showVignette = vignette ?? scope === "viewport";

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none inset-0 -z-10", position, className)}
    >
      {showVignette ? <div className="absolute inset-0 bg-vignette" /> : null}
      <div className="absolute inset-0 bg-noise opacity-[0.035] dark:opacity-[0.05]" />
      <div className="absolute inset-0 bg-scanlines" />
    </div>
  );
}

/** Full-page background — use once in layout */
export function Background() {
  return <BackgroundLayers scope="viewport" />;
}
