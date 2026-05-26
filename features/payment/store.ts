import { electronicFormatIBAN } from "ibantools";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PaymentFormat } from "./format";
import type { PaymentRecord } from "./schema";

type Currency = "EUR" | "CZK";

interface PaymentHistoryState {
  current: PaymentRecord | null;
  history: PaymentRecord[];
  preferredFormat: PaymentFormat;
  preferredCurrency: Currency;
}

interface PaymentHistoryActions {
  setCurrent: (payment: PaymentRecord) => void;
  setPreferredFormat: (format: PaymentFormat) => void;
  setPreferredCurrency: (currency: Currency) => void;
  saveToStorage: () => void;
  loadFromStorage: (id: string) => void;
  removeFromStorage: (id: string) => void;
  clearHistory: () => void;
  clearCurrent: () => void;
  nameEntry: (id: string, name: string) => void;
  unnameEntry: (id: string) => void;
}

const STORAGE_KEY = "qrPayments.v1";
const MAX_HISTORY_SIZE = 50;

type PaymentHistoryStore = PaymentHistoryState & {
  actions: PaymentHistoryActions;
};

function fingerprintIban(payment: PaymentRecord): string {
  return electronicFormatIBAN(payment.iban) || payment.iban;
}

function fingerprintAmount(payment: PaymentRecord): string {
  return (payment.amount || 0).toFixed(2);
}

function fingerprintOptional(value: string | undefined): string {
  return value || "";
}

function fingerprintSymbols(payment: PaymentRecord): string[] {
  return [
    fingerprintOptional(payment.variableSymbol),
    fingerprintOptional(payment.specificSymbol),
    fingerprintOptional(payment.constantSymbol),
    fingerprintOptional(payment.recipientName),
    fingerprintOptional(payment.paymentNote),
  ];
}

function buildEpcFingerprint(
  payment: PaymentRecord,
  iban: string,
  amount: string
): string {
  return [
    "epc",
    iban,
    amount,
    fingerprintOptional(payment.bic),
    fingerprintOptional(payment.recipientName),
    fingerprintOptional(payment.paymentNote),
  ].join("|");
}

function buildSpaydFingerprint(
  payment: PaymentRecord,
  iban: string,
  amount: string
): string {
  return [
    "spayd",
    iban,
    amount,
    payment.currency ?? "CZK",
    ...fingerprintSymbols(payment),
  ].join("|");
}

function buildBysquareFingerprint(
  payment: PaymentRecord,
  iban: string,
  amount: string
): string {
  return [
    "bysquare",
    iban,
    amount,
    payment.currency ?? "EUR",
    ...fingerprintSymbols(payment),
  ].join("|");
}

/**
 * Creates a fingerprint for deduplication based on payment-identifying fields.
 * Two payments with same fingerprint are considered duplicates.
 */
function getPaymentFingerprint(payment: PaymentRecord): string {
  const format = payment.format ?? "bysquare";
  const iban = fingerprintIban(payment);
  const amount = fingerprintAmount(payment);

  switch (format) {
    case "epc":
      return buildEpcFingerprint(payment, iban, amount);
    case "spayd":
      return buildSpaydFingerprint(payment, iban, amount);
    default:
      return buildBysquareFingerprint(payment, iban, amount);
  }
}

/**
 * Finds an existing payment in history by fingerprint (not by ID).
 */
function findDuplicatePayment(
  history: PaymentRecord[],
  payment: PaymentRecord
): PaymentRecord | undefined {
  const fingerprint = getPaymentFingerprint(payment);
  return history.find((p) => getPaymentFingerprint(p) === fingerprint);
}

/**
 * Trims history to MAX_HISTORY_SIZE, but never evicts named (pinned) entries.
 */
function trimHistory(history: PaymentRecord[]): PaymentRecord[] {
  if (history.length <= MAX_HISTORY_SIZE) {
    return history;
  }
  const named = history.filter((p) => p.name);
  const unnamed = history.filter((p) => !p.name);
  return [...named, ...unnamed].slice(
    0,
    Math.max(MAX_HISTORY_SIZE, named.length)
  );
}

const paymentStore = create<PaymentHistoryStore>()(
  persist(
    (set, get) => ({
      current: null,
      history: [],
      preferredFormat: "bysquare",
      preferredCurrency: "EUR",
      actions: {
        setCurrent: (payment: PaymentRecord) => {
          set({ current: payment });

          const { history } = get();
          const duplicate = findDuplicatePayment(history, payment);

          if (duplicate) {
            const updatedPayment = {
              ...payment,
              id: duplicate.id,
              name: duplicate.name,
            };
            const filteredHistory = history.filter(
              (p) => p.id !== duplicate.id
            );
            set({
              history: trimHistory([updatedPayment, ...filteredHistory]),
              current: updatedPayment,
            });
          } else {
            set({
              history: trimHistory([payment, ...history]),
            });
          }
        },
        setPreferredFormat: (format: PaymentFormat) => {
          set({ preferredFormat: format });
        },
        setPreferredCurrency: (currency: Currency) => {
          set({ preferredCurrency: currency });
        },
        saveToStorage: () => {
          const { current, history } = get();
          if (!current) {
            return;
          }
          const duplicate = findDuplicatePayment(history, current);
          if (!duplicate) {
            set({
              history: trimHistory([current, ...history]),
            });
          }
        },
        loadFromStorage: (id) => {
          const { history } = get();
          const payment = history.find((p) => p.id === id);
          if (payment) {
            set({
              current: payment,
              preferredFormat: payment.format ?? "bysquare",
              preferredCurrency: payment.currency ?? "EUR",
            });
          }
        },
        removeFromStorage: (id) =>
          set((state) => ({
            history: state.history.filter((p) => p.id !== id),
            current: state.current?.id === id ? null : state.current,
          })),
        clearHistory: () => set({ history: [] }),
        clearCurrent: () => set({ current: null }),
        nameEntry: (id, name) =>
          set((state) => ({
            history: state.history.map((p) =>
              p.id === id ? { ...p, name } : p
            ),
          })),
        unnameEntry: (id) =>
          set((state) => ({
            history: state.history.map((p) =>
              p.id === id ? { ...p, name: undefined } : p
            ),
          })),
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        history: state.history,
        current: state.current,
        preferredFormat: state.preferredFormat,
        preferredCurrency: state.preferredCurrency,
      }),
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          console.error(
            "[PaymentStore] Failed to rehydrate from localStorage:",
            error
          );
        }
      },
    }
  )
);

export const useCurrentPayment = () => paymentStore((state) => state.current);
export const usePaymentHistory = () => paymentStore((state) => state.history);
export const usePreferredFormat = () =>
  paymentStore((state) => state.preferredFormat);
export const usePreferredCurrency = () =>
  paymentStore((state) => state.preferredCurrency);
export const usePaymentActions = () => paymentStore((state) => state.actions);
