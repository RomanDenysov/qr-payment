import { create } from "zustand";
import type { PaymentFormat } from "@/features/payment/format";
import type { GeneratedQR, RowError } from "./bulk-generator";
import type { ParsedRow } from "./csv-parser";

interface BulkState {
  rows: ParsedRow[] | null;
  detectedFormat: PaymentFormat;
  results: GeneratedQR[] | null;
  errors: RowError[] | null;
  error: string | null;
  generating: boolean;
  progress: { current: number; total: number };
}

interface BulkActions {
  setRows: (rows: ParsedRow[] | null) => void;
  setDetectedFormat: (format: PaymentFormat) => void;
  setResults: (results: GeneratedQR[] | null) => void;
  setErrors: (errors: RowError[] | null) => void;
  setError: (error: string | null) => void;
  startGenerating: (total: number) => void;
  updateProgress: (current: number) => void;
  finishGenerating: () => void;
  reset: () => void;
}

type BulkStore = BulkState & { actions: BulkActions };

const initialState: BulkState = {
  rows: null,
  detectedFormat: "bysquare",
  results: null,
  errors: null,
  error: null,
  generating: false,
  progress: { current: 0, total: 0 },
};

const bulkStore = create<BulkStore>((set) => ({
  ...initialState,
  actions: {
    setRows: (rows) => set({ rows }),
    setDetectedFormat: (format) => set({ detectedFormat: format }),
    setResults: (results) => set({ results }),
    setErrors: (errors) => set({ errors }),
    setError: (error) => set({ error }),
    startGenerating: (total) =>
      set({ generating: true, progress: { current: 0, total } }),
    updateProgress: (current) =>
      set((state) => ({ progress: { ...state.progress, current } })),
    finishGenerating: () => set({ generating: false }),
    reset: () => set(initialState),
  },
}));

export const useBulkRows = () => bulkStore((s) => s.rows);
export const useBulkDetectedFormat = () => bulkStore((s) => s.detectedFormat);
export const useBulkResults = () => bulkStore((s) => s.results);
export const useBulkErrors = () => bulkStore((s) => s.errors);
export const useBulkError = () => bulkStore((s) => s.error);
export const useBulkGenerating = () => bulkStore((s) => s.generating);
export const useBulkProgress = () => bulkStore((s) => s.progress);
export const useBulkActions = () => bulkStore((s) => s.actions);
