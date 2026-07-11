"use client";

import { IconChevronDown } from "@tabler/icons-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "./ui/input-group";

const CURRENCY_RE = /^[\d]*[,.]?[\d]{0,2}$/;
const WHITESPACE_RE = /\s/g;

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  currency?: string;
  id?: string;
  placeholder?: string;
  className?: string;
  ref?: React.Ref<HTMLInputElement>;
  currencies?: string[];
  onCurrencyChange?: (currency: string) => void;
}

export function CurrencyInput({
  value,
  onChange,
  currency = "EUR",
  id,
  placeholder = "0,00",
  className,
  ref,
  currencies = ["EUR", "CZK"],
  onCurrencyChange,
}: CurrencyInputProps) {
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
    const normalized = str.replace(WHITESPACE_RE, "").replace(",", ".");
    const parsed = Number.parseFloat(normalized);
    return Number.isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (CURRENCY_RE.test(raw.replace(WHITESPACE_RE, ""))) {
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
    <InputGroup>
      <InputGroupInput
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
      <InputGroupAddon align="inline-end">
        {onCurrencyChange && currencies.length > 1 ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <InputGroupButton className="pr-1.5! text-xs" variant="ghost">
                  {currency}
                  <IconChevronDown className="size-3" />
                </InputGroupButton>
              }
            />
            <DropdownMenuContent
              align="end"
              alignOffset={-4}
              className="min-w-16"
              sideOffset={8}
            >
              <DropdownMenuGroup>
                <DropdownMenuRadioGroup
                  onValueChange={onCurrencyChange}
                  value={currency}
                >
                  {currencies.map((c) => (
                    <DropdownMenuRadioItem key={c} value={c}>
                      {c}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <span className="px-1.5 text-muted-foreground text-xs">
            {currency}
          </span>
        )}
      </InputGroupAddon>
    </InputGroup>
  );
}
