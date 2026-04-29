import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_STUDIO_CONFIG,
  type StudioConfig,
  type StudioTemplate,
} from "./types";

interface StudioState {
  config: StudioConfig;
  templates: StudioTemplate[];
  actions: {
    update: (partial: Partial<StudioConfig>) => void;
    replace: (config: StudioConfig) => void;
    reset: () => void;
    saveTemplate: (name: string) => void;
    loadTemplate: (id: string) => void;
    deleteTemplate: (id: string) => void;
    renameTemplate: (id: string, name: string) => void;
  };
}

const STORAGE_KEY = "qrStudio.v1";
const MAX_TEMPLATES = 30;

const studioStore = create<StudioState>()(
  persist(
    (set, get) => ({
      config: { ...DEFAULT_STUDIO_CONFIG },
      templates: [],
      actions: {
        update: (partial) =>
          set((state) => ({ config: { ...state.config, ...partial } })),
        replace: (config) => set({ config }),
        reset: () => set({ config: { ...DEFAULT_STUDIO_CONFIG } }),
        saveTemplate: (name) => {
          const { config, templates } = get();
          const template: StudioTemplate = {
            id: crypto.randomUUID(),
            name,
            config: structuredClone(config),
          };
          set({
            templates: [template, ...templates].slice(0, MAX_TEMPLATES),
          });
        },
        loadTemplate: (id) => {
          const template = get().templates.find((t) => t.id === id);
          if (template) {
            set({ config: structuredClone(template.config) });
          }
        },
        deleteTemplate: (id) =>
          set((state) => ({
            templates: state.templates.filter((t) => t.id !== id),
          })),
        renameTemplate: (id, name) =>
          set((state) => ({
            templates: state.templates.map((t) =>
              t.id === id ? { ...t, name } : t
            ),
          })),
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        config: state.config,
        templates: state.templates,
      }),
    }
  )
);

export const useStudioConfig = () => studioStore((s) => s.config);
export const useStudioTemplates = () => studioStore((s) => s.templates);
export const useStudioActions = () => studioStore((s) => s.actions);
export { MAX_TEMPLATES };
