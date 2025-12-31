import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PaymentData } from "@/types/payment-data";

type PaymentHistoryState = {
  payments: PaymentData[];
};

type PaymentHistoryActions = {
  addPayment: (paymentData: PaymentData) => void;
  removePayment: (id: string) => void;
  clearPayments: () => void;
};

type PaymentHistoryStore = PaymentHistoryState & {
  actions: PaymentHistoryActions;
};

const paymentHistoryStore = create<PaymentHistoryStore>()(
  persist(
    (set) => ({
      payments: [],
      actions: {
        addPayment: (paymentData: PaymentData) =>
          set((state) => ({ payments: [...state.payments, paymentData] })),
        removePayment: (id: string) =>
          set((state) => ({
            payments: state.payments.filter((payment) => payment.id !== id),
          })),
        clearPayments: () => set({ payments: [] }),
      },
    }),
    {
      name: "payment-history",
      partialize: (state) => ({ payments: state.payments }),
    }
  )
);

export const usePaymentHistory = () =>
  paymentHistoryStore((state) => state.payments);

export const usePaymentHistoryActions = () =>
  paymentHistoryStore((state) => state.actions);
