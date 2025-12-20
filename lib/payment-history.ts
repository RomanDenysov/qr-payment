import type { PaymentData } from "./generate-qr-image";

export type PaymentHistoryEntry = PaymentData & {
  id: string;
  createdAt: string;
  qrDataUrl?: string;
};

const STORAGE_KEY = "qrPayments.history.v1";

export function getPaymentHistory(): PaymentHistoryEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored) as PaymentHistoryEntry[];
  } catch {
    return [];
  }
}

export function savePaymentToHistory(
  payment: PaymentData,
  qrDataUrl?: string
): PaymentHistoryEntry {
  const entry: PaymentHistoryEntry = {
    ...payment,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    qrDataUrl,
  };

  const history = getPaymentHistory();
  const updated = [entry, ...history].slice(0, 50); // Keep last 50 entries
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  return entry;
}

export function deletePaymentFromHistory(id: string): void {
  const history = getPaymentHistory();
  const updated = history.filter((entry) => entry.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function clearPaymentHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function maskIban(iban: string): string {
  if (iban.length <= 8) {
    return iban;
  }
  return `${iban.slice(0, 4)}****${iban.slice(-4)}`;
}
