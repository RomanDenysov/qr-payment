"use client";

import { Autocomplete } from "@base-ui/react/autocomplete";
import { IconHistory } from "@tabler/icons-react";
import { electronicFormatIBAN, friendlyFormatIBAN } from "ibantools";
import { forwardRef, useMemo } from "react";
import type { PaymentRecord } from "@/features/payment/schema";
import { usePaymentHistory } from "@/features/payment/store";
import { cn } from "@/lib/utils";
import { inputVariants } from "./ui/input";

type IBANSuggestion = {
  id: string;
  iban: string;
  displayIban: string;
  recipientName?: string;
  amount: number;
  payment: PaymentRecord;
};

type IBANAutocompleteProps = {
  value: string;
  onChange: (value: string) => void;
  onSelectPayment?: (payment: PaymentRecord) => void;
  id?: string;
  placeholder?: string;
  className?: string;
  /** Whether the field has an error (for styling) */
  hasError?: boolean;
};

export const IBANAutocomplete = forwardRef<
  HTMLInputElement,
  IBANAutocompleteProps
>(
  (
    {
      value,
      onChange,
      onSelectPayment,
      id,
      placeholder = "SK89 7500 0000 0000 1234 5678",
      className,
      hasError = false,
    },
    ref
  ) => {
    const history = usePaymentHistory();

    // Create unique suggestions from history (by IBAN)
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

    // Display friendly format with spaces (SK00 0000 0000 ...)
    const displayValue = friendlyFormatIBAN(value) || value;

    const handleValueChange = (newValue: string) => {
      // Remove everything except letters and numbers, convert to uppercase
      // Max IBAN length is 34 characters (electronic format)
      const cleaned = newValue
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 34);
      onChange(cleaned);
    };

    const handleItemClick = (suggestion: IBANSuggestion) => {
      onChange(suggestion.iban);
      onSelectPayment?.(suggestion.payment);
    };

    // Custom filter for IBAN (works with both formatted and unformatted input)
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
                Žiadne výsledky z histórie
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
);

IBANAutocomplete.displayName = "IBANAutocomplete";
