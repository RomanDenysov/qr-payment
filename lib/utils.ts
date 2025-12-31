import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function maskIban(iban: string): string {
  if (iban.length <= 8) {
    return iban;
  }
  return `${iban.slice(0, 4)}****${iban.slice(-4)}`;
}
