import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type CustomizerConfig,
  type CustomizerTemplate,
  DEFAULT_CUSTOMIZER_CONFIG,
} from "./types";

const STORAGE_KEY = "qrCustomizer.v1";
const LEGACY_STUDIO_KEY = "qrStudio.v1";
const LEGACY_BRANDING_KEY = "qrBranding.v1";
const MAX_TEMPLATES = 30;

interface LegacyBrandingTemplate {
  id: string;
  name: string;
  config: {
    fgColor?: string;
    bgColor?: string;
    centerText?: string;
    logo?: string | null;
    dotStyle?: CustomizerConfig["dotStyle"];
    centerTextSize?: CustomizerConfig["centerTextSize"];
    centerTextBold?: boolean;
    centerTextFont?: CustomizerConfig["centerTextFont"];
  };
}

function migrateConfig(config: CustomizerConfig): void {
  config.centerTextEnabled ??= DEFAULT_CUSTOMIZER_CONFIG.centerTextEnabled;
  if (!config.frame) {
    config.frame = structuredClone(DEFAULT_CUSTOMIZER_CONFIG.frame);
    return;
  }
  const f = config.frame;
  const d = DEFAULT_CUSTOMIZER_CONFIG.frame;
  f.titleSize ??= d.titleSize;
  f.captionSize ??= d.captionSize;
  f.titleBold ??= d.titleBold;
  f.captionBold ??= d.captionBold;
  f.font ??= d.font;
}

function brandingToCustomizer(
  src: LegacyBrandingTemplate["config"]
): CustomizerConfig {
  const base = structuredClone(DEFAULT_CUSTOMIZER_CONFIG);
  return {
    ...base,
    fgFill: { kind: "solid", color: src.fgColor ?? "#000000" },
    bgFill: { kind: "solid", color: src.bgColor ?? "#ffffff" },
    centerText: src.centerText ?? "",
    logo: src.logo ?? null,
    dotStyle: src.dotStyle ?? base.dotStyle,
    centerTextSize: src.centerTextSize ?? base.centerTextSize,
    centerTextBold: src.centerTextBold ?? base.centerTextBold,
    centerTextFont: src.centerTextFont ?? base.centerTextFont,
  };
}

function readLegacyBrandingTemplates(): CustomizerTemplate[] {
  if (typeof window === "undefined") {
    return [];
  }
  const raw = window.localStorage.getItem(LEGACY_BRANDING_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as {
      state?: { templates?: LegacyBrandingTemplate[] };
    };
    const templates = parsed.state?.templates ?? [];
    return templates.map((tpl) => ({
      id: tpl.id,
      name: tpl.name,
      config: brandingToCustomizer(tpl.config),
    }));
  } catch (error) {
    console.error("[CustomizerStore] Failed to parse legacy branding:", error);
    return [];
  }
}

function readLegacyStudio(): {
  config: CustomizerConfig | null;
  templates: CustomizerTemplate[];
} {
  if (typeof window === "undefined") {
    return { config: null, templates: [] };
  }
  const raw = window.localStorage.getItem(LEGACY_STUDIO_KEY);
  if (!raw) {
    return { config: null, templates: [] };
  }
  try {
    const parsed = JSON.parse(raw) as {
      state?: {
        config?: CustomizerConfig;
        templates?: CustomizerTemplate[];
      };
    };
    return {
      config: parsed.state?.config ?? null,
      templates: parsed.state?.templates ?? [],
    };
  } catch (error) {
    console.error("[CustomizerStore] Failed to parse legacy studio:", error);
    return { config: null, templates: [] };
  }
}

interface CustomizerState {
  config: CustomizerConfig;
  templates: CustomizerTemplate[];
  actions: {
    update: (partial: Partial<CustomizerConfig>) => void;
    replace: (config: CustomizerConfig) => void;
    reset: () => void;
    saveTemplate: (name: string) => boolean;
    loadTemplate: (id: string) => boolean;
    deleteTemplate: (id: string) => void;
    renameTemplate: (id: string, name: string) => void;
  };
}

function mergeTemplates(
  ...sources: CustomizerTemplate[][]
): CustomizerTemplate[] {
  const seen = new Set<string>();
  const merged: CustomizerTemplate[] = [];
  for (const list of sources) {
    for (const tpl of list) {
      if (seen.has(tpl.id) || merged.length >= MAX_TEMPLATES) {
        continue;
      }
      seen.add(tpl.id);
      merged.push(tpl);
    }
  }
  return merged;
}

function applyLegacyImport(state: CustomizerState): void {
  if (typeof window === "undefined") {
    return;
  }
  if (window.localStorage.getItem(STORAGE_KEY) !== null) {
    return;
  }
  if (
    window.localStorage.getItem(LEGACY_STUDIO_KEY) === null &&
    window.localStorage.getItem(LEGACY_BRANDING_KEY) === null
  ) {
    return;
  }
  const studio = readLegacyStudio();
  const branding = readLegacyBrandingTemplates();
  if (studio.config) {
    state.config = studio.config;
  }
  if (studio.templates.length || branding.length) {
    state.templates = mergeTemplates(studio.templates, branding);
  }
}

function onRehydrate(state: CustomizerState | undefined, error: unknown): void {
  if (error) {
    console.error(
      "[CustomizerStore] Failed to rehydrate from localStorage:",
      error
    );
    return;
  }
  if (!state) {
    return;
  }
  applyLegacyImport(state);
  migrateConfig(state.config);
  for (const tpl of state.templates) {
    migrateConfig(tpl.config);
  }
}

const customizerStore = create<CustomizerState>()(
  persist(
    (set, get) => ({
      config: structuredClone(DEFAULT_CUSTOMIZER_CONFIG),
      templates: [],
      actions: {
        update: (partial) =>
          set((state) => ({ config: { ...state.config, ...partial } })),
        replace: (config) => set({ config }),
        reset: () =>
          set({ config: structuredClone(DEFAULT_CUSTOMIZER_CONFIG) }),
        saveTemplate: (name) => {
          const { config, templates } = get();
          try {
            const template: CustomizerTemplate = {
              id: crypto.randomUUID(),
              name,
              config: structuredClone(config),
            };
            set({
              templates: [template, ...templates].slice(0, MAX_TEMPLATES),
            });
            return true;
          } catch (error) {
            console.error("[CustomizerStore] Failed to save template:", error);
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
            console.error("[CustomizerStore] Failed to load template:", error);
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
      onRehydrateStorage: () => onRehydrate,
    }
  )
);

export const useCustomizerConfig = () => customizerStore((s) => s.config);
export const useCustomizerTemplates = () => customizerStore((s) => s.templates);
export const useCustomizerActions = () => customizerStore((s) => s.actions);
export { MAX_TEMPLATES };
