"use client";

import { track } from "@vercel/analytics";
import { useTranslations } from "next-intl";
import type { DotStyle } from "@/features/payment/qr-generator";
import { cn } from "@/lib/utils";

interface DotStyleSelectorProps {
  value: DotStyle;
  onChange: (style: DotStyle) => void;
}

const DOT_STYLES: DotStyle[] = ["square", "rounded", "dots", "classy-rounded"];

const LABEL_KEYS: Record<DotStyle, string> = {
  square: "dotStyleSquare",
  rounded: "dotStyleRounded",
  dots: "dotStyleDots",
  "classy-rounded": "dotStyleClassyRounded",
};

function DotPreview({ style }: { style: DotStyle }) {
  const d = 8;
  const g = 3;
  const grid = 3 * d + 2 * g;
  const size = grid + 4;
  const o = (size - grid) / 2;

  const positions = Array.from({ length: 9 }, (_, i) => ({
    x: o + (i % 3) * (d + g),
    y: o + Math.floor(i / 3) * (d + g),
  }));

  const r = d / 2;

  return (
    <svg
      aria-hidden="true"
      className="text-foreground"
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      width={size}
    >
      {positions.map(({ x, y }) => {
        const key = `${x}-${y}`;

        switch (style) {
          case "square":
            return (
              <rect
                fill="currentColor"
                height={d}
                key={key}
                width={d}
                x={x}
                y={y}
              />
            );
          case "rounded":
            return (
              <rect
                fill="currentColor"
                height={d}
                key={key}
                rx={2.5}
                width={d}
                x={x}
                y={y}
              />
            );
          case "dots":
            return (
              <circle
                cx={x + r}
                cy={y + r}
                fill="currentColor"
                key={key}
                r={r}
              />
            );
          case "classy-rounded":
            return (
              <path
                d={`M${x},${y}h${d - r}a${r},${r} 0 0 1 ${r},${r}v${d - r}h${-d}z`}
                fill="currentColor"
                key={key}
              />
            );
          default:
            return null;
        }
      })}
    </svg>
  );
}

export function DotStyleSelector({ value, onChange }: DotStyleSelectorProps) {
  const t = useTranslations("Branding");

  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-medium text-sm">{t("dotStyle")}</span>
      <div className="grid grid-cols-4 gap-2">
        {DOT_STYLES.map((style) => (
          <button
            className={cn(
              "flex flex-col items-center gap-1.5 border p-2 transition-colors",
              value === style
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
            key={style}
            onClick={() => {
              onChange(style);
              track("qr_dot_style_changed", { style });
            }}
            type="button"
          >
            <DotPreview style={style} />
            <span className="text-xs">{t(LABEL_KEYS[style])}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
