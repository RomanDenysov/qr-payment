import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BrandPreset, BrandPresetFormData } from "./schema";

type BrandingState = {
  presets: BrandPreset[];
  activePresetId: string | null;
};

type BrandingActions = {
  addPreset: (preset: BrandPresetFormData) => boolean;
  updatePreset: (id: string, updates: Partial<BrandPresetFormData>) => void;
  deletePreset: (id: string) => void;
  setActivePreset: (id: string | null) => void;
  getActivePreset: () => BrandPreset | null;
};

const STORAGE_KEY = "qrBranding.v1";
const MAX_PRESETS = 3;

type BrandingStore = BrandingState & {
  actions: BrandingActions;
};

const brandingStore = create<BrandingStore>()(
  persist(
    (set, get) => ({
      presets: [],
      activePresetId: null,
      actions: {
        addPreset: (preset) => {
          const { presets } = get();
          if (presets.length >= MAX_PRESETS) {
            return false;
          }
          const newPreset: BrandPreset = {
            ...preset,
            id: crypto.randomUUID(),
            createdAt: Date.now(),
          };
          set({ presets: [...presets, newPreset] });
          return true;
        },
        updatePreset: (id, updates) => {
          set((state) => ({
            presets: state.presets.map((p) =>
              p.id === id ? { ...p, ...updates } : p
            ),
          }));
        },
        deletePreset: (id) => {
          set((state) => ({
            presets: state.presets.filter((p) => p.id !== id),
            activePresetId:
              state.activePresetId === id ? null : state.activePresetId,
          }));
        },
        setActivePreset: (id) => {
          const { presets } = get();
          if (id === null || presets.some((p) => p.id === id)) {
            set({ activePresetId: id });
          }
        },
        getActivePreset: () => {
          const { presets, activePresetId } = get();
          if (!activePresetId) return null;
          return presets.find((p) => p.id === activePresetId) ?? null;
        },
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        presets: state.presets,
        activePresetId: state.activePresetId,
      }),
    }
  )
);

export const useBrandPresets = () => brandingStore((state) => state.presets);
export const useActivePresetId = () =>
  brandingStore((state) => state.activePresetId);
export const useActivePreset = () =>
  brandingStore((state) => state.actions.getActivePreset());
export const useBrandingActions = () =>
  brandingStore((state) => state.actions);
