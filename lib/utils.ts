import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAmount(
  amount: number | undefined,
  currency = "EUR"
): string {
  if (amount == null) {
    return "-";
  }
  return `${amount.toFixed(2)} ${currency}`;
}

export function maskIban(iban: string): string {
  if (iban.length <= 8) {
    return iban;
  }
  return `${iban.slice(0, 4)}****${iban.slice(-4)}`;
}
