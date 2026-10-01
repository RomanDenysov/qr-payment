"use client";

import { IconArrowUp } from "@tabler/icons-react";
import { track } from "@vercel/analytics";
import {
  type PaymentFormat,
  SELECT_FORMAT_EVENT,
} from "@/features/payment/format";

interface FormatTileActionProps {
  format: PaymentFormat;
  label: string;
}

/**
 * "Use this format" button of a homepage format tile. Its hit area stretches
 * over the whole tile (the tile must be `relative`). Selects the format in the
 * payment form and scrolls up to it.
 */
export function FormatTileAction({ format, label }: FormatTileActionProps) {
  const handleClick = () => {
    window.dispatchEvent(
      new CustomEvent<PaymentFormat>(SELECT_FORMAT_EVENT, { detail: format })
    );
    document
      .getElementById("generator")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    track("format_tile_clicked", { format });
  };

  return (
    <button
      className="inline-flex items-center gap-1 font-medium text-foreground text-xs outline-none after:absolute after:inset-0 focus-visible:underline"
      onClick={handleClick}
      type="button"
    >
      {label}
      <IconArrowUp
        aria-hidden
        className="size-3.5 transition-transform duration-150 ease-out group-hover/card:-translate-y-0.5"
      />
    </button>
  );
}
