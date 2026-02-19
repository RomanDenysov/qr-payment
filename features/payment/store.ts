import { electronicFormatIBAN } from "ibantools";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PaymentFormat } from "./format";
import type { PaymentRecord } from "./schema";

interface PaymentHistoryState {
  current: PaymentRecord | null;
  history: PaymentRecord[];
  preferredFormat: PaymentFormat;
}

interface PaymentHistoryActions {
  setCurrent: (payment: PaymentRecord) => void;
  setPreferredFormat: (format: PaymentFormat) => void;
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

/**
 * Creates a fingerprint for deduplication based on payment-identifying fields.
 * Two payments with same fingerprint are considered duplicates.
 */
function getPaymentFingerprint(payment: PaymentRecord): string {
  const format = payment.format ?? "bysquare";
  const iban = electronicFormatIBAN(payment.iban) || payment.iban;

  if (format === "epc") {
    return ["epc", iban, payment.amount.toFixed(2), payment.bic || ""].join(
      "|"
    );
  }

  return [
    "bysquare",
    iban,
    payment.amount.toFixed(2),
    payment.variableSymbol || "",
    payment.specificSymbol || "",
    payment.constantSymbol || "",
  ].join("|");
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
      actions: {
        setCurrent: (payment: PaymentRecord) => {
          set({ current: payment });

          const { history } = get();
          const duplicate = findDuplicatePayment(history, payment);

          if (duplicate) {
            const updatedPayment = {
              ...duplicate,
              createdAt: payment.createdAt,
              qrDataUrl: payment.qrDataUrl,
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
      }),
    }
  )
);

export const useCurrentPayment = () => paymentStore((state) => state.current);
export const usePaymentHistory = () => paymentStore((state) => state.history);
export const usePreferredFormat = () =>
  paymentStore((state) => state.preferredFormat);
export const usePaymentActions = () => paymentStore((state) => state.actions);
