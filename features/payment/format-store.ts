import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PaymentFormat } from "./format";

interface FormatState {
  format: PaymentFormat;
  setFormat: (format: PaymentFormat) => void;
}

const STORAGE_KEY = "qrPayments.format";

export const useFormatStore = create<FormatState>()(
  persist(
    (set) => ({
      format: "bysquare",
      setFormat: (format) => set({ format }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ format: state.format }),
    }
  )
);
