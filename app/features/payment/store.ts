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

const paymentStore = create<PaymentHistoryStore>()(
  persist(
    (set, get) => ({
      current: null,
      history: [],
      actions: {
        setCurrent: (payment: PaymentRecord) => {
          set({ current: payment });

          const { history } = get();
          const exists = history.some((p) => p.id === payment.id);
          if (!exists) {
            set({ history: [payment, ...history].slice(0, MAX_HISTORY_SIZE) });
          }
        },
        saveToStorage: () => {
          const { current, history } = get();
          if (!current) {
            return;
          }
          const exists = history.some((p) => p.id === current.id);
          if (!exists) {
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
