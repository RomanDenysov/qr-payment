import { electronicFormatIBAN } from "ibantools";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PaymentRecord } from "./schema";

interface PaymentHistoryState {
  history: PaymentRecord[];
}

interface PaymentHistoryActions {
  setCurrent: (payment: PaymentRecord) => void;
  loadFromStorage: (id: string) => void;
  removeFromStorage: (id: string) => void;
  clearHistory: () => void;
  nameEntry: (id: string, name: string) => void;
  setShareSecret: (id: string, secret: string) => void;
}

const STORAGE_KEY = "qrPayments.v1";
const MAX_HISTORY_SIZE = 50;

type PaymentHistoryStore = PaymentHistoryState & {
  actions: PaymentHistoryActions;
};

/**
 * Content fingerprint for deduplication. Two payments with the same fingerprint
 * are the same payment and collapse into a single history entry. Format is part
 * of the key, so the same details encoded as bysquare/epc/spayd stay distinct.
 */
function getPaymentFingerprint(payment: PaymentRecord): string {
  // join() coerces undefined to "", so optional fields need no fallback.
  // iban is normalized (spaces/case) and amount fixed to 2dp so equivalent
  // inputs collapse to one entry.
  return [
    payment.format,
    electronicFormatIBAN(payment.iban) || payment.iban,
    (payment.amount || 0).toFixed(2),
    payment.currency,
    payment.variableSymbol,
    payment.specificSymbol,
    payment.constantSymbol,
    payment.bic,
    payment.recipientName,
    payment.paymentNote,
    payment.paymentDueDate,
    payment.invoiceId,
    payment.spaydReference,
    payment.purposeCode,
  ].join("|");
}

/** Trims history to MAX_HISTORY_SIZE, but never evicts named (pinned) entries. */
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

/**
 * Inserts a payment at the front of history, collapsing any content-duplicate.
 * A duplicate's id + name + shareSecret are reused so a pinned or shared
 * entry survives a regen.
 */
function upsertHistory(
  history: PaymentRecord[],
  payment: PaymentRecord
): PaymentRecord[] {
  const fingerprint = getPaymentFingerprint(payment);
  const duplicate = history.find(
    (p) => getPaymentFingerprint(p) === fingerprint
  );
  const record = duplicate
    ? {
        ...payment,
        id: duplicate.id,
        name: duplicate.name,
        shareSecret: payment.shareSecret ?? duplicate.shareSecret,
      }
    : payment;
  return trimHistory([record, ...history.filter((p) => p !== duplicate)]);
}

const paymentStore = create<PaymentHistoryStore>()(
  persist(
    (set) => ({
      history: [],
      actions: {
        setCurrent: (payment) =>
          set((state) => ({ history: upsertHistory(state.history, payment) })),
        loadFromStorage: (id) =>
          set((state) => {
            const payment = state.history.find((p) => p.id === id);
            if (!payment) {
              return state;
            }
            // Move to front so it becomes the previewed (most recent) payment.
            return {
              history: [payment, ...state.history.filter((p) => p.id !== id)],
            };
          }),
        removeFromStorage: (id) =>
          set((state) => ({
            history: state.history.filter((p) => p.id !== id),
          })),
        clearHistory: () => set({ history: [] }),
        nameEntry: (id, name) =>
          set((state) => ({
            history: state.history.map((p) =>
              p.id === id ? { ...p, name: name.trim() || undefined } : p
            ),
          })),
        setShareSecret: (id, secret) =>
          set((state) => ({
            history: state.history.map((p) =>
              p.id === id ? { ...p, shareSecret: secret } : p
            ),
          })),
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ history: state.history }),
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

export const useCurrentPayment = () =>
  paymentStore((state) => state.history[0] ?? null);
export const usePaymentHistory = () => paymentStore((state) => state.history);
export const usePaymentActions = () => paymentStore((state) => state.actions);
