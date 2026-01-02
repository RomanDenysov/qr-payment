import { electronicFormatIBAN } from "ibantools";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PaymentRecord } from "./schema";

type PaymentHistoryState = {
  current: PaymentRecord | null;
  history: PaymentRecord[];
};

type PaymentHistoryActions = {
  setCurrent: (payment: PaymentRecord) => void;
  saveToStorage: () => void;
  loadFromStorage: (id: string) => void;
  removeFromStorage: (id: string) => void;
  clearHistory: () => void;
  clearCurrent: () => void;
};

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
  const iban = electronicFormatIBAN(payment.iban) || payment.iban;
  return [
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

const paymentStore = create<PaymentHistoryStore>()(
  persist(
    (set, get) => ({
      current: null,
      history: [],
      actions: {
        setCurrent: (payment: PaymentRecord) => {
          set({ current: payment });

          const { history } = get();
          const duplicate = findDuplicatePayment(history, payment);

          if (duplicate) {
            // Update existing entry: refresh timestamp, move to top
            const updatedPayment = {
              ...duplicate,
              createdAt: payment.createdAt,
              qrDataUrl: payment.qrDataUrl,
              // Keep original ID for consistency
            };
            const filteredHistory = history.filter(
              (p) => p.id !== duplicate.id
            );
            set({
              history: [updatedPayment, ...filteredHistory].slice(
                0,
                MAX_HISTORY_SIZE
              ),
              current: updatedPayment,
            });
          } else {
            // New unique payment
            set({ history: [payment, ...history].slice(0, MAX_HISTORY_SIZE) });
          }
        },
        saveToStorage: () => {
          const { current, history } = get();
          if (!current) {
            return;
          }
          const duplicate = findDuplicatePayment(history, current);
          if (!duplicate) {
            set({ history: [current, ...history].slice(0, MAX_HISTORY_SIZE) });
          }
        },
        loadFromStorage: (id) => {
          const { history } = get();
          const payment = history.find((p) => p.id === id);
          if (payment) {
            set({ current: payment });
          }
        },
        removeFromStorage: (id) =>
          set((state) => ({
            history: state.history.filter((p) => p.id !== id),
            current: state.current?.id === id ? null : state.current,
          })),
        clearHistory: () => set({ history: [] }),
        clearCurrent: () => set({ current: null }),
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        history: state.history,
        current: state.current,
      }),
    }
  )
);

export const useCurrentPayment = () => paymentStore((state) => state.current);
export const usePaymentHistory = () => paymentStore((state) => state.history);
export const usePaymentActions = () => paymentStore((state) => state.actions);
