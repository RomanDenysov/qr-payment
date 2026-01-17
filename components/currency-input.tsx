"use client";

import { forwardRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  currency?: string;
  id?: string;
  placeholder?: string;
  className?: string;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    { value, onChange, currency = "EUR", id, placeholder = "0,00", className },
    ref
  ) => {
    // Store only the string for display during input
    const [inputValue, setInputValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    const formatDisplay = (num: number): string =>
      num
        ? new Intl.NumberFormat("sk-SK", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(num)
        : "";

    const parseValue = (str: string): number => {
      const normalized = str.replace(/\s/g, "").replace(",", ".");
      const parsed = Number.parseFloat(normalized);
      return Number.isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      // Allow: digits, one comma/dot, max 2 digits after the decimal point
      // biome-ignore lint/performance/useTopLevelRegex: Ignore top level regex here
      if (/^[\d]*[,.]?[\d]{0,2}$/.test(raw.replace(/\s/g, ""))) {
        setInputValue(raw);
        onChange(parseValue(raw));
      }
    };

    const handleFocus = () => {
      setIsFocused(true);
      setInputValue(value ? value.toString().replace(".", ",") : "");
    };

    const handleBlur = () => {
      setIsFocused(false);
      setInputValue("");
    };

    return (
      <div className="relative">
        <Input
          className={cn("pr-12", className)}
          id={id}
          inputMode="decimal"
          onBlur={handleBlur}
          onChange={handleChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          ref={ref}
          type="text"
          value={isFocused ? inputValue : formatDisplay(value)}
        />
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground text-xs">
          {currency}
        </span>
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";
