"use client";

import { cn } from "@/lib/utils";

interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        "inline-flex h-7 items-stretch border border-border bg-muted p-0.5",
        className
      )}
    >
      {options.map((option) => (
        <button
          aria-pressed={value === option.value}
          className={cn(
            "whitespace-nowrap px-2.5 font-medium text-xs transition-colors",
            value === option.value
              ? "bg-background text-foreground shadow-xs"
              : "text-foreground/70 hover:text-foreground"
          )}
          key={option.value}
          onClick={() => onChange(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
