import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_STUDIO_CONFIG,
  type StudioConfig,
  type StudioTemplate,
} from "./types";

function migrateFrame(config: StudioConfig): void {
  if (!config.frame) {
    config.frame = structuredClone(DEFAULT_STUDIO_CONFIG.frame);
    return;
  }
  const f = config.frame;
  const d = DEFAULT_STUDIO_CONFIG.frame;
  f.titleSize ??= d.titleSize;
  f.captionSize ??= d.captionSize;
  f.titleBold ??= d.titleBold;
  f.captionBold ??= d.captionBold;
  f.font ??= d.font;
}

interface StudioState {
  config: StudioConfig;
  templates: StudioTemplate[];
  actions: {
    update: (partial: Partial<StudioConfig>) => void;
    replace: (config: StudioConfig) => void;
    reset: () => void;
    saveTemplate: (name: string) => boolean;
    loadTemplate: (id: string) => boolean;
    deleteTemplate: (id: string) => void;
    renameTemplate: (id: string, name: string) => void;
  };
}

const STORAGE_KEY = "qrStudio.v1";
const MAX_TEMPLATES = 30;

const studioStore = create<StudioState>()(
  persist(
    (set, get) => ({
      config: structuredClone(DEFAULT_STUDIO_CONFIG),
      templates: [],
      actions: {
        update: (partial) =>
          set((state) => ({ config: { ...state.config, ...partial } })),
        replace: (config) => set({ config }),
        reset: () => set({ config: structuredClone(DEFAULT_STUDIO_CONFIG) }),
        saveTemplate: (name) => {
          const { config, templates } = get();
          try {
            const template: StudioTemplate = {
              id: crypto.randomUUID(),
              name,
              config: structuredClone(config),
            };
            set({
              templates: [template, ...templates].slice(0, MAX_TEMPLATES),
            });
            return true;
          } catch (error) {
            console.error("[StudioStore] Failed to save template:", error);
            return false;
          }
        },
        loadTemplate: (id) => {
          const template = get().templates.find((t) => t.id === id);
          if (!template) {
            return false;
          }
          try {
            set({ config: structuredClone(template.config) });
            return true;
          } catch (error) {
            console.error("[StudioStore] Failed to load template:", error);
            return false;
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
      onRehydrateStorage: () => (state, error) => {
        if (error || !state) {
          return;
        }
        migrateFrame(state.config);
        for (const tpl of state.templates) {
          migrateFrame(tpl.config);
        }
      },
    }
  )
);

export const useStudioConfig = () => studioStore((s) => s.config);
export const useStudioTemplates = () => studioStore((s) => s.templates);
export const useStudioActions = () => studioStore((s) => s.actions);
export { MAX_TEMPLATES };
