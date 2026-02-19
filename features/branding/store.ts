import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface BrandingConfig {
  fgColor: string;
  bgColor: string;
  centerText: string;
  logo: string | null;
}

export interface BrandingTemplate {
  id: string;
  name: string;
  config: BrandingConfig;
}

interface BrandingState {
  config: BrandingConfig;
  templates: BrandingTemplate[];
  actions: {
    update: (partial: Partial<BrandingConfig>) => void;
    reset: () => void;
    saveTemplate: (name: string) => void;
    loadTemplate: (id: string) => void;
    deleteTemplate: (id: string) => void;
    renameTemplate: (id: string, name: string) => void;
  };
}

const DEFAULT_CONFIG: BrandingConfig = {
  fgColor: "#000000",
  bgColor: "#ffffff",
  centerText: "Naskenujte\nbankovou\naplikáciou",
  logo: null,
};

const STORAGE_KEY = "qrBranding.v1";
const MAX_TEMPLATES = 20;

const brandingStore = create<BrandingState>()(
  persist(
    (set, get) => ({
      config: { ...DEFAULT_CONFIG },
      templates: [],
      actions: {
        update: (partial) =>
          set((state) => ({ config: { ...state.config, ...partial } })),
        reset: () => set({ config: { ...DEFAULT_CONFIG } }),
        saveTemplate: (name: string) => {
          const { config, templates } = get();
          const template: BrandingTemplate = {
            id: crypto.randomUUID(),
            name,
            config: { ...config },
          };
          set({
            templates: [template, ...templates].slice(0, MAX_TEMPLATES),
          });
        },
        loadTemplate: (id: string) => {
          const template = get().templates.find((t) => t.id === id);
          if (template) {
            set({ config: { ...template.config } });
          }
        },
        deleteTemplate: (id: string) =>
          set((state) => ({
            templates: state.templates.filter((t) => t.id !== id),
          })),
        renameTemplate: (id: string, name: string) =>
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

export const useBrandingConfig = () => brandingStore((s) => s.config);
export const useBrandingTemplates = () => brandingStore((s) => s.templates);
export const useBrandingActions = () => brandingStore((s) => s.actions);
export { DEFAULT_CONFIG };
