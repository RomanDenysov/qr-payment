"use client";

type AdPlaceholderProps = {
  size: "mobile" | "desktop";
};

export function AdPlaceholder({ size }: AdPlaceholderProps) {
  const dimensions =
    size === "mobile"
      ? { width: 320, height: 100 }
      : { width: 728, height: 90 };

  return (
    <div
      className="flex items-center justify-center border border-dashed bg-muted/30"
      style={{
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        maxWidth: "100%",
      }}
    >
      <span className="text-muted-foreground text-xs">
        AdSense {dimensions.width}×{dimensions.height}
      </span>
    </div>
  );
}
