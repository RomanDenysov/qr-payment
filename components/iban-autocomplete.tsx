"use client";

import { Autocomplete } from "@base-ui/react/autocomplete";
import { IconHistory } from "@tabler/icons-react";
import { track } from "@vercel/analytics";
import { electronicFormatIBAN, friendlyFormatIBAN } from "ibantools";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import type { PaymentRecord } from "@/features/payment/schema";
import { usePaymentHistory } from "@/features/payment/store";
import { domesticAccountToIban } from "@/lib/iban-bank";
import { cn } from "@/lib/utils";
import { inputVariants } from "./ui/input";

const EMPTY_HISTORY: PaymentRecord[] = [];

/** Digits with `-` or `/`: a Czech or Slovak account number being typed. */
const DOMESTIC_TYPING_RE = /^\d[\d\s/-]*$/;
const DOMESTIC_SEPARATOR_RE = /[/-]/;
const WHITESPACE_RE = /\s/g;
const NON_IBAN_CHARS_RE = /[^A-Z0-9]/g;

interface IBANSuggestion {
  id: string;
  iban: string;
  displayIban: string;
  recipientName?: string;
  amount: number;
  payment: PaymentRecord;
}

interface IBANAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelectPayment?: (payment: PaymentRecord) => void;
  id?: string;
  placeholder?: string;
  className?: string;
  hasError?: boolean;
  isValid?: boolean;
  ref?: React.Ref<HTMLInputElement>;
}

export function IBANAutocomplete({
  value,
  onChange,
  onSelectPayment,
  id,
  placeholder = "SK89 7500 0000 0000 1234 5678",
  className,
  hasError = false,
  isValid = false,
  ref,
}: IBANAutocompleteProps) {
  const t = useTranslations("PaymentForm");
  const persistedHistory = usePaymentHistory();
  // Gate localStorage-backed history behind a mount flag so SSR and the first
  // client render produce identical DOM (same item count → same Base UI
  // `useId()` sequence → no hydration mismatch).
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const history = mounted ? persistedHistory : EMPTY_HISTORY;

  const suggestions = useMemo((): IBANSuggestion[] => {
    const uniqueIbans = new Map<string, PaymentRecord>();

    for (const payment of history) {
      const electronic = electronicFormatIBAN(payment.iban);
      if (electronic && !uniqueIbans.has(electronic)) {
        uniqueIbans.set(electronic, payment);
      }
    }

    return Array.from(uniqueIbans.entries()).map(([iban, payment]) => ({
      id: payment.id,
      iban,
      displayIban: friendlyFormatIBAN(iban) || iban,
      recipientName: payment.recipientName,
      amount: payment.amount,
      payment,
    }));
  }, [history]);

  // A half-typed account number keeps its separators; grouping it like an
  // IBAN would drop the `/` before the bank code is in.
  const displayValue = DOMESTIC_SEPARATOR_RE.test(value)
    ? value
    : friendlyFormatIBAN(value) || value;

  const handleValueChange = (newValue: string) => {
    const iban = domesticAccountToIban(newValue);
    if (iban) {
      onChange(iban);
      track("domestic_account_converted", { country: iban.slice(0, 2) });
      return;
    }
    if (DOMESTIC_TYPING_RE.test(newValue.trim())) {
      // Longest domestic form: 6-digit prefix, 10-digit number, 4-digit code.
      onChange(newValue.replace(WHITESPACE_RE, "").slice(0, 22));
      return;
    }
    onChange(
      newValue.toUpperCase().replace(NON_IBAN_CHARS_RE, "").slice(0, 34)
    );
  };

  const handleItemClick = (suggestion: IBANSuggestion) => {
    onChange(suggestion.iban);
    onSelectPayment?.(suggestion.payment);
  };

  const filterIban = (item: IBANSuggestion, query: string) => {
    const cleanQuery = query.toUpperCase().replace(/[^A-Z0-9]/g, "");
    return item.iban.includes(cleanQuery);
  };

  return (
    <Autocomplete.Root
      filter={filterIban}
      items={suggestions}
      itemToStringValue={(item: IBANSuggestion) => item.displayIban}
      onValueChange={handleValueChange}
      value={displayValue}
    >
      <Autocomplete.Input
        aria-invalid={hasError}
        className={cn(
          inputVariants(),
          "h-8!",
          hasError && "border-destructive focus-visible:ring-destructive",
          isValid &&
            !hasError &&
            "border-success ring-1 ring-success/40 focus-visible:border-success focus-visible:ring-success/50",
          className
        )}
        id={id}
        placeholder={placeholder}
        ref={ref}
      />

      <Autocomplete.Portal>
        <Autocomplete.Positioner className="z-50" sideOffset={4}>
          <Autocomplete.Popup
            className={cn(
              "max-h-[300px] min-w-(--anchor-width) overflow-auto rounded-none border bg-popover p-1 text-popover-foreground shadow-md",
              "data-ending-style:opacity-0 data-starting-style:opacity-0",
              "data-ending-style:scale-95 data-starting-style:scale-95",
              "transition-[opacity,transform] duration-150"
            )}
          >
            <Autocomplete.Empty className="h-8 px-3 py-2 text-center text-muted-foreground text-sm">
              {t("noHistoryResults")}
            </Autocomplete.Empty>

            <Autocomplete.List>
              {(suggestion: IBANSuggestion) => (
                <Autocomplete.Item
                  className={cn(
                    "relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
                    "data-highlighted:bg-accent data-highlighted:text-accent-foreground",
                    "data-disabled:pointer-events-none data-disabled:opacity-50"
                  )}
                  key={suggestion.id}
                  onClick={() => handleItemClick(suggestion)}
                  value={suggestion}
                >
                  <IconHistory className="size-4 shrink-0 text-muted-foreground" />
                  <div className="flex flex-col gap-0.5 overflow-hidden">
                    <span className="truncate font-mono text-xs">
                      {suggestion.displayIban}
                    </span>
                    {Boolean(suggestion.recipientName) && (
                      <span className="truncate text-muted-foreground text-xs">
                        {suggestion.recipientName}
                      </span>
                    )}
                  </div>
                  <span className="ml-auto shrink-0 text-muted-foreground text-xs">
                    {suggestion.amount.toFixed(2)} €
                  </span>
                </Autocomplete.Item>
              )}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  );
}
