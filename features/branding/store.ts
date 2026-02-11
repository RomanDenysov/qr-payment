import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BrandingConfig {
  fgColor: string;
  bgColor: string;
  centerText: string;
  logo: string | null;
}

interface BrandingState {
  config: BrandingConfig;
  actions: {
    update: (partial: Partial<BrandingConfig>) => void;
    reset: () => void;
  };
}

const DEFAULT_CONFIG: BrandingConfig = {
  fgColor: "#000000",
  bgColor: "#ffffff",
  centerText: "Naskenujte\nbankovou\naplikáciou",
  logo: null,
};

const STORAGE_KEY = "qrBranding.v1";

const brandingStore = create<BrandingState>()(
  persist(
    (set) => ({
      config: { ...DEFAULT_CONFIG },
      actions: {
        update: (partial) =>
          set((state) => ({ config: { ...state.config, ...partial } })),
        reset: () => set({ config: { ...DEFAULT_CONFIG } }),
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ config: state.config }),
    }
  )
);

export const useBrandingConfig = () => brandingStore((s) => s.config);
export const useBrandingActions = () => brandingStore((s) => s.actions);
export { DEFAULT_CONFIG };
