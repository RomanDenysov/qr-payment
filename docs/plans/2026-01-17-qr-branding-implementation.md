# QR Branding Feature Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add brand preset customization allowing users to personalize QR codes with colors, logos, corner styles, and text frames.

**Architecture:** Feature module in `features/branding/` following existing payment feature patterns. Zustand store with localStorage persistence. Canvas-based QR rendering extended with branding options.

**Tech Stack:** React 19, Zustand, Zod, Canvas API, Tailwind CSS, shadcn/ui components, Tabler icons.

**Design Document:** `docs/plans/2026-01-17-qr-branding-design.md`

---

## Task 1: Create Branding Schema

**Files:**
- Create: `features/branding/schema.ts`

**Step 1: Create the Zod schema and TypeScript types**

```typescript
import z from "zod";

export const brandPresetSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Názov je povinný").max(30, "Max 30 znakov"),
  colors: z.object({
    foreground: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Neplatná farba"),
    background: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Neplatná farba"),
  }),
  logo: z
    .object({
      data: z.string(),
      size: z.number().min(10).max(20),
    })
    .optional(),
  cornerStyle: z.enum(["square", "rounded", "dots"]),
  frame: z
    .object({
      enabled: z.boolean(),
      text: z.string().max(40, "Max 40 znakov"),
      position: z.enum(["top", "bottom"]),
    })
    .optional(),
  createdAt: z.number(),
});

export type BrandPreset = z.infer<typeof brandPresetSchema>;

export const brandPresetFormSchema = brandPresetSchema.omit({
  id: true,
  createdAt: true,
});

export type BrandPresetFormData = z.infer<typeof brandPresetFormSchema>;
```

**Step 2: Verify lint passes**

Run: `bun x ultracite check features/branding/schema.ts`
Expected: No errors

**Step 3: Commit**

```bash
git add features/branding/schema.ts
git commit -m "feat(branding): add Zod schema and types for brand presets"
```

---

## Task 2: Create Branding Utilities

**Files:**
- Create: `features/branding/utils.ts`

**Step 1: Create contrast calculation and image resize utilities**

```typescript
/**
 * Calculate relative luminance of a hex color (WCAG 2.1 formula)
 */
function getLuminance(hex: string): number {
  const rgb = [
    Number.parseInt(hex.slice(1, 3), 16) / 255,
    Number.parseInt(hex.slice(3, 5), 16) / 255,
    Number.parseInt(hex.slice(5, 7), 16) / 255,
  ].map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));

  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

/**
 * Calculate WCAG contrast ratio between two hex colors
 * Returns ratio like 4.5 (minimum for AA) or 7.0 (AAA)
 */
export function getContrastRatio(foreground: string, background: string): number {
  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standard (4.5:1)
 */
export function hasValidContrast(foreground: string, background: string): boolean {
  return getContrastRatio(foreground, background) >= 4.5;
}

const MAX_LOGO_SIZE = 100;
const MAX_FILE_SIZE = 500 * 1024; // 500KB

export type ImageResizeResult =
  | { success: true; data: string }
  | { success: false; error: string };

/**
 * Resize image to max dimensions and convert to base64
 */
export async function resizeImage(file: File): Promise<ImageResizeResult> {
  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: "Súbor je príliš veľký (max 500KB)" };
  }

  const validTypes = ["image/png", "image/jpeg", "image/svg+xml"];
  if (!validTypes.includes(file.type)) {
    return { success: false, error: "Nepodporovaný formát (PNG, JPG, SVG)" };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        if (width > MAX_LOGO_SIZE || height > MAX_LOGO_SIZE) {
          const ratio = Math.min(MAX_LOGO_SIZE / width, MAX_LOGO_SIZE / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve({ success: true, data: canvas.toDataURL("image/png") });
        } else {
          resolve({ success: false, error: "Nepodarilo sa spracovať obrázok" });
        }
      };
      img.onerror = () => resolve({ success: false, error: "Neplatný obrázok" });
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve({ success: false, error: "Nepodarilo sa načítať súbor" });
    reader.readAsDataURL(file);
  });
}
```

**Step 2: Verify lint passes**

Run: `bun x ultracite check features/branding/utils.ts`
Expected: No errors

**Step 3: Commit**

```bash
git add features/branding/utils.ts
git commit -m "feat(branding): add contrast and image resize utilities"
```

---

## Task 3: Create Branding Store

**Files:**
- Create: `features/branding/store.ts`

**Step 1: Create Zustand store with localStorage persistence**

```typescript
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
            activePresetId: state.activePresetId === id ? null : state.activePresetId,
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
export const useActivePresetId = () => brandingStore((state) => state.activePresetId);
export const useActivePreset = () => brandingStore((state) => state.actions.getActivePreset());
export const useBrandingActions = () => brandingStore((state) => state.actions);
```

**Step 2: Verify lint passes**

Run: `bun x ultracite check features/branding/store.ts`
Expected: No errors

**Step 3: Commit**

```bash
git add features/branding/store.ts
git commit -m "feat(branding): add Zustand store with localStorage persistence"
```

---

## Task 4: Create Color Picker Component

**Files:**
- Create: `features/branding/components/color-picker.tsx`

**Step 1: Create color picker with contrast validation**

```typescript
"use client";

import { IconAlertTriangle } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getContrastRatio, hasValidContrast } from "../utils";

type ColorPickerProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  contrastWith?: string;
};

export function ColorPicker({
  label,
  value,
  onChange,
  contrastWith,
}: ColorPickerProps) {
  const isValid = !contrastWith || hasValidContrast(value, contrastWith);
  const ratio = contrastWith ? getContrastRatio(value, contrastWith) : null;

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          className="h-10 w-14 cursor-pointer p-1"
          onChange={(e) => onChange(e.target.value)}
          type="color"
          value={value}
        />
        <Input
          className="w-24 font-mono text-xs uppercase"
          maxLength={7}
          onChange={(e) => {
            const val = e.target.value;
            if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
              onChange(val);
            }
          }}
          value={value}
        />
        {ratio !== null && (
          <span
            className={`text-xs ${isValid ? "text-muted-foreground" : "text-destructive"}`}
          >
            {ratio.toFixed(1)}:1
          </span>
        )}
      </div>
      {!isValid && (
        <p className="flex items-center gap-1 text-destructive text-xs">
          <IconAlertTriangle className="size-3" />
          Nízky kontrast - QR kód nemusí byť čitateľný
        </p>
      )}
    </div>
  );
}
```

**Step 2: Verify lint passes**

Run: `bun x ultracite check features/branding/components/color-picker.tsx`
Expected: No errors

**Step 3: Commit**

```bash
git add features/branding/components/color-picker.tsx
git commit -m "feat(branding): add color picker with contrast validation"
```

---

## Task 5: Create Corner Style Picker Component

**Files:**
- Create: `features/branding/components/corner-style-picker.tsx`

**Step 1: Create visual corner style selector**

```typescript
"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type CornerStyle = "square" | "rounded" | "dots";

type CornerStylePickerProps = {
  value: CornerStyle;
  onChange: (value: CornerStyle) => void;
};

const styles: { value: CornerStyle; label: string }[] = [
  { value: "square", label: "Štvorec" },
  { value: "rounded", label: "Zaoblené" },
  { value: "dots", label: "Bodky" },
];

function CornerPreview({ style }: { style: CornerStyle }) {
  const base = "size-4 bg-foreground";
  switch (style) {
    case "square":
      return <div className={cn(base, "rounded-none")} />;
    case "rounded":
      return <div className={cn(base, "rounded-sm")} />;
    case "dots":
      return <div className={cn(base, "rounded-full")} />;
  }
}

export function CornerStylePicker({ value, onChange }: CornerStylePickerProps) {
  return (
    <div className="space-y-2">
      <Label>Štýl rohov</Label>
      <div className="flex gap-2">
        {styles.map((style) => (
          <button
            className={cn(
              "flex flex-col items-center gap-1 rounded-md border p-3 transition-colors",
              value === style.value
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            )}
            key={style.value}
            onClick={() => onChange(style.value)}
            type="button"
          >
            <CornerPreview style={style.value} />
            <span className="text-xs">{style.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Verify lint passes**

Run: `bun x ultracite check features/branding/components/corner-style-picker.tsx`
Expected: No errors

**Step 3: Commit**

```bash
git add features/branding/components/corner-style-picker.tsx
git commit -m "feat(branding): add corner style picker component"
```

---

## Task 6: Create Logo Uploader Component

**Files:**
- Create: `features/branding/components/logo-uploader.tsx`

**Step 1: Create logo upload with preview**

```typescript
"use client";

import { IconPhoto, IconTrash } from "@tabler/icons-react";
import { useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { resizeImage } from "../utils";

type LogoUploaderProps = {
  value?: { data: string; size: number };
  onChange: (value: { data: string; size: number } | undefined) => void;
};

export function LogoUploader({ value, onChange }: LogoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await resizeImage(file);
    if (result.success) {
      onChange({ data: result.data, size: 15 });
    } else {
      toast.error(result.error);
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <Label>Logo (voliteľné)</Label>
      <input
        accept="image/png,image/jpeg,image/svg+xml"
        className="hidden"
        onChange={handleFileChange}
        ref={inputRef}
        type="file"
      />

      {value ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex size-16 items-center justify-center rounded-md border bg-muted">
              <img
                alt="Logo"
                className="max-h-14 max-w-14 object-contain"
                src={value.data}
              />
            </div>
            <Button
              onClick={() => onChange(undefined)}
              size="sm"
              type="button"
              variant="destructive"
            >
              <IconTrash className="size-4" />
              Odstrániť
            </Button>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Veľkosť: {value.size}%</Label>
            <Slider
              max={20}
              min={10}
              onValueChange={([size]) => onChange({ ...value, size })}
              step={1}
              value={[value.size]}
            />
          </div>
        </div>
      ) : (
        <Button
          className="w-full"
          onClick={() => inputRef.current?.click()}
          type="button"
          variant="outline"
        >
          <IconPhoto className="size-4" />
          Nahrať logo
        </Button>
      )}
    </div>
  );
}
```

**Step 2: Add Slider component from shadcn (if not exists)**

Run: `bun x shadcn@latest add slider --cwd /Users/denysr/Documents/Projects/qr-payment-sk/qr-payments/.worktrees/qr-branding`

**Step 3: Verify lint passes**

Run: `bun x ultracite check features/branding/components/logo-uploader.tsx`
Expected: No errors

**Step 4: Commit**

```bash
git add features/branding/components/logo-uploader.tsx components/ui/slider.tsx
git commit -m "feat(branding): add logo uploader with preview and resize"
```

---

## Task 7: Create Frame Editor Component

**Files:**
- Create: `features/branding/components/frame-editor.tsx`

**Step 1: Create frame toggle and text editor**

```typescript
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type FramePosition = "top" | "bottom";

type FrameValue = {
  enabled: boolean;
  text: string;
  position: FramePosition;
};

type FrameEditorProps = {
  value?: FrameValue;
  onChange: (value: FrameValue | undefined) => void;
};

const positions: { value: FramePosition; label: string }[] = [
  { value: "top", label: "Hore" },
  { value: "bottom", label: "Dole" },
];

export function FrameEditor({ value, onChange }: FrameEditorProps) {
  const frameValue = value ?? { enabled: false, text: "", position: "bottom" as const };
  const charCount = frameValue.text.length;
  const isOverLimit = charCount > 40;

  const handleToggle = (enabled: boolean) => {
    if (enabled) {
      onChange({ enabled: true, text: frameValue.text, position: frameValue.position });
    } else {
      onChange(undefined);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Rámček s textom</Label>
        <Switch checked={frameValue.enabled} onCheckedChange={handleToggle} />
      </div>

      {frameValue.enabled && (
        <>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Text</Label>
              <span
                className={cn(
                  "text-xs",
                  isOverLimit ? "text-destructive" : "text-muted-foreground"
                )}
              >
                {charCount}/40
              </span>
            </div>
            <Input
              onChange={(e) =>
                onChange({ ...frameValue, text: e.target.value })
              }
              placeholder="Naskenujte pre platbu"
              value={frameValue.text}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Pozícia</Label>
            <div className="flex gap-2">
              {positions.map((pos) => (
                <button
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-xs transition-colors",
                    frameValue.position === pos.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                  key={pos.value}
                  onClick={() => onChange({ ...frameValue, position: pos.value })}
                  type="button"
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
```

**Step 2: Add Switch component from shadcn (if not exists)**

Run: `bun x shadcn@latest add switch --cwd /Users/denysr/Documents/Projects/qr-payment-sk/qr-payments/.worktrees/qr-branding`

**Step 3: Verify lint passes**

Run: `bun x ultracite check features/branding/components/frame-editor.tsx`
Expected: No errors

**Step 4: Commit**

```bash
git add features/branding/components/frame-editor.tsx components/ui/switch.tsx
git commit -m "feat(branding): add frame editor with text and position"
```

---

## Task 8: Create Brand Preset Card Component

**Files:**
- Create: `features/branding/components/brand-preset-card.tsx`

**Step 1: Create preset display card**

```typescript
"use client";

import { IconCheck, IconPencil, IconTrash } from "@tabler/icons-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BrandPreset } from "../schema";

type BrandPresetCardProps = {
  preset: BrandPreset;
  isActive: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function BrandPresetCard({
  preset,
  isActive,
  onSelect,
  onEdit,
  onDelete,
}: BrandPresetCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3 transition-colors",
        isActive ? "border-primary bg-primary/5" : "border-border"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          className="flex flex-1 items-center gap-3 text-left"
          onClick={onSelect}
          type="button"
        >
          {/* Color preview */}
          <div
            className="size-10 shrink-0 rounded-md border"
            style={{ backgroundColor: preset.colors.background }}
          >
            <div
              className="m-2 size-6 rounded-sm"
              style={{ backgroundColor: preset.colors.foreground }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate font-medium text-sm">{preset.name}</span>
              {isActive && <IconCheck className="size-4 text-primary" />}
            </div>
            <div className="flex flex-wrap gap-1 text-muted-foreground text-xs">
              <span>{preset.cornerStyle}</span>
              {preset.logo && <span>• logo</span>}
              {preset.frame?.enabled && <span>• rámček</span>}
            </div>
          </div>
        </button>

        <div className="flex shrink-0 gap-1">
          <Button
            className="size-8 p-0"
            onClick={onEdit}
            size="sm"
            title="Upraviť"
            variant="ghost"
          >
            <IconPencil className="size-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  className="size-8 p-0"
                  size="sm"
                  title="Vymazať"
                  variant="ghost"
                >
                  <IconTrash className="size-4" />
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Vymazať preset?</AlertDialogTitle>
                <AlertDialogDescription>
                  Táto akcia sa nedá vrátiť späť. Preset &quot;{preset.name}&quot;
                  bude odstránený.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Zrušiť</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Vymazať</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Verify lint passes**

Run: `bun x ultracite check features/branding/components/brand-preset-card.tsx`
Expected: No errors

**Step 3: Commit**

```bash
git add features/branding/components/brand-preset-card.tsx
git commit -m "feat(branding): add brand preset card component"
```

---

## Task 9: Create Brand Preset Editor Component

**Files:**
- Create: `features/branding/components/brand-preset-editor.tsx`

**Step 1: Create full preset editor form**

```typescript
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconArrowLeft } from "@tabler/icons-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { BrandPreset, BrandPresetFormData } from "../schema";
import { brandPresetFormSchema } from "../schema";
import { useBrandingActions } from "../store";
import { hasValidContrast } from "../utils";
import { ColorPicker } from "./color-picker";
import { CornerStylePicker } from "./corner-style-picker";
import { FrameEditor } from "./frame-editor";
import { LogoUploader } from "./logo-uploader";

type BrandPresetEditorProps = {
  preset?: BrandPreset;
  onClose: () => void;
};

const defaultValues: BrandPresetFormData = {
  name: "",
  colors: { foreground: "#000000", background: "#ffffff" },
  cornerStyle: "square",
};

export function BrandPresetEditor({ preset, onClose }: BrandPresetEditorProps) {
  const { addPreset, updatePreset } = useBrandingActions();
  const isEditing = !!preset;

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BrandPresetFormData>({
    resolver: zodResolver(brandPresetFormSchema),
    defaultValues: preset
      ? {
          name: preset.name,
          colors: preset.colors,
          logo: preset.logo,
          cornerStyle: preset.cornerStyle,
          frame: preset.frame,
        }
      : defaultValues,
  });

  const colors = watch("colors");
  const frameText = watch("frame.text") ?? "";
  const isContrastValid = hasValidContrast(colors.foreground, colors.background);
  const isFrameTextValid = frameText.length <= 40;

  const onSubmit = (data: BrandPresetFormData) => {
    if (!isContrastValid) {
      toast.error("Kontrast farieb je príliš nízky");
      return;
    }
    if (!isFrameTextValid) {
      toast.error("Text rámčeka je príliš dlhý");
      return;
    }

    if (isEditing) {
      updatePreset(preset.id, data);
      toast.success("Preset bol aktualizovaný");
    } else {
      const success = addPreset(data);
      if (success) {
        toast.success("Preset bol vytvorený");
      } else {
        toast.error("Dosiahli ste limit 3 presetov");
        return;
      }
    }
    onClose();
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center gap-2">
        <Button
          className="size-8 p-0"
          onClick={onClose}
          size="sm"
          type="button"
          variant="ghost"
        >
          <IconArrowLeft className="size-4" />
        </Button>
        <h3 className="font-semibold">
          {isEditing ? "Upraviť preset" : "Nový preset"}
        </h3>
      </div>

      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <FieldGroup error={errors.name?.message} label="Názov presetu">
            <Input {...field} placeholder="Môj biznis" />
          </FieldGroup>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          control={control}
          name="colors.foreground"
          render={({ field }) => (
            <ColorPicker
              contrastWith={colors.background}
              label="Farba QR kódu"
              onChange={field.onChange}
              value={field.value}
            />
          )}
        />
        <Controller
          control={control}
          name="colors.background"
          render={({ field }) => (
            <ColorPicker
              contrastWith={colors.foreground}
              label="Farba pozadia"
              onChange={field.onChange}
              value={field.value}
            />
          )}
        />
      </div>

      <Controller
        control={control}
        name="cornerStyle"
        render={({ field }) => (
          <CornerStylePicker onChange={field.onChange} value={field.value} />
        )}
      />

      <Controller
        control={control}
        name="logo"
        render={({ field }) => (
          <LogoUploader onChange={field.onChange} value={field.value} />
        )}
      />

      <Controller
        control={control}
        name="frame"
        render={({ field }) => (
          <FrameEditor onChange={field.onChange} value={field.value} />
        )}
      />

      <Button
        className="w-full"
        disabled={!isContrastValid || !isFrameTextValid}
        type="submit"
      >
        {isEditing ? "Uložiť zmeny" : "Vytvoriť preset"}
      </Button>
    </form>
  );
}
```

**Step 2: Verify lint passes**

Run: `bun x ultracite check features/branding/components/brand-preset-editor.tsx`
Expected: No errors

**Step 3: Commit**

```bash
git add features/branding/components/brand-preset-editor.tsx
git commit -m "feat(branding): add brand preset editor form"
```

---

## Task 10: Create Branding Sheet Component

**Files:**
- Create: `features/branding/components/branding-sheet.tsx`

**Step 1: Create branding sheet with preset list and editor**

```typescript
"use client";

import { IconPalette, IconPlus, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { BrandPreset } from "../schema";
import {
  useActivePresetId,
  useBrandingActions,
  useBrandPresets,
} from "../store";
import { BrandPresetCard } from "./brand-preset-card";
import { BrandPresetEditor } from "./brand-preset-editor";

export function BrandingSheet() {
  const [open, setOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<BrandPreset | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const presets = useBrandPresets();
  const activePresetId = useActivePresetId();
  const { setActivePreset, deletePreset } = useBrandingActions();

  const showEditor = isCreating || editingPreset !== null;
  const canAddMore = presets.length < 3;

  const handleClose = () => {
    setEditingPreset(null);
    setIsCreating(false);
  };

  const handleSelectPreset = (id: string) => {
    setActivePreset(activePresetId === id ? null : id);
  };

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
      >
        <IconPalette />
        Branding
      </SheetTrigger>
      <SheetContent className="w-full data-[side=right]:w-full data-[side=right]:sm:max-w-lg">
        {showEditor ? (
          <BrandPresetEditor
            onClose={handleClose}
            preset={editingPreset ?? undefined}
          />
        ) : (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2">
                <SheetTitle>Branding</SheetTitle>
                <Badge variant="secondary">{presets.length}/3</Badge>
              </div>
            </SheetHeader>

            <div className="flex flex-col gap-4 py-4">
              {/* Default option */}
              <button
                className={cn(
                  "rounded-lg border p-3 text-left transition-colors",
                  activePresetId === null
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
                onClick={() => setActivePreset(null)}
                type="button"
              >
                <div className="flex items-center gap-2">
                  <IconX className="size-4 text-muted-foreground" />
                  <span className="text-sm">Predvolený štýl</span>
                </div>
              </button>

              {/* Preset list */}
              {presets.map((preset) => (
                <BrandPresetCard
                  isActive={activePresetId === preset.id}
                  key={preset.id}
                  onDelete={() => deletePreset(preset.id)}
                  onEdit={() => setEditingPreset(preset)}
                  onSelect={() => handleSelectPreset(preset.id)}
                  preset={preset}
                />
              ))}

              {/* Add new button */}
              <Button
                className="w-full"
                disabled={!canAddMore}
                onClick={() => setIsCreating(true)}
                variant="outline"
              >
                <IconPlus className="size-4" />
                {canAddMore ? "Nový preset" : "Limit 3 presetov"}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
```

**Step 2: Verify lint passes**

Run: `bun x ultracite check features/branding/components/branding-sheet.tsx`
Expected: No errors

**Step 3: Commit**

```bash
git add features/branding/components/branding-sheet.tsx
git commit -m "feat(branding): add branding sheet with preset management"
```

---

## Task 11: Create Feature Index and Integrate with Header

**Files:**
- Create: `features/branding/index.ts`
- Modify: `components/header.tsx`

**Step 1: Create feature index for clean exports**

```typescript
export { BrandingSheet } from "./components/branding-sheet";
export { useActivePreset, useBrandPresets } from "./store";
export type { BrandPreset } from "./schema";
```

**Step 2: Add BrandingSheet to Header**

Modify `components/header.tsx`:

```typescript
import Link from "next/link";
import { AppLogo } from "./app-logo";
import { HistorySheet } from "./history-sheet";
import { ThemeToggle } from "./theme-toggle";
import { BrandingSheet } from "@/features/branding";

export function Header() {
  return (
    <header className="sticky top-0">
      <div className="z-50 my-2 flex h-12 items-center justify-between rounded-none bg-card p-2 ring-1 ring-foreground/10">
        <Link className="transition-opacity hover:opacity-80" href="/">
          <AppLogo />
        </Link>
        <div className="flex items-center gap-1">
          <BrandingSheet />
          <HistorySheet />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
```

**Step 3: Verify lint passes**

Run: `bun x ultracite check features/branding/index.ts components/header.tsx`
Expected: No errors

**Step 4: Verify build passes**

Run: `bun run build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add features/branding/index.ts components/header.tsx
git commit -m "feat(branding): integrate branding sheet into header"
```

---

## Task 12: Extend QR Generator with Branding Options

**Files:**
- Modify: `features/payment/qr-generator.ts`

**Step 1: Add branding types and extend generatePaymentQR**

Replace entire file with:

```typescript
import { CurrencyCode, encode, PaymentOptions } from "bysquare";
import { electronicFormatIBAN, isValidIBAN } from "ibantools";
import QRCode from "qrcode";
import type { PaymentFormData } from "./schema";

export class InvalidIBANError extends Error {
  constructor(iban: string) {
    super(`Neplatný IBAN: ${iban}`);
    this.name = "InvalidIBANError";
  }
}

type CornerStyle = "square" | "rounded" | "dots";

type BrandingOptions = {
  colors?: { foreground: string; background: string };
  logo?: { data: string; size: number };
  cornerStyle?: CornerStyle;
  frame?: { text: string; position: "top" | "bottom" };
};

const QR_SIZE = 400;
const FRAME_PADDING = 16;
const FRAME_HEIGHT = 32;
const CENTER_TEXT = "Naskenujte\nbankovou\naplikáciou";
const FONT_STACK =
  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';

/** Draws centered text overlay on QR code canvas */
function drawCenterText(
  ctx: CanvasRenderingContext2D,
  size: number,
  bgColor: string,
  fgColor: string
): void {
  const lines = CENTER_TEXT.split("\n");
  const fontSize = Math.round(size * 0.038);
  const lineHeight = fontSize * 1.15;
  const padding = fontSize * 0.4;
  const totalTextHeight = lines.length * lineHeight;

  ctx.font = `600 ${fontSize}px ${FONT_STACK}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const maxWidth = Math.max(
    ...lines.map((line) => ctx.measureText(line).width)
  );
  const boxWidth = maxWidth + padding * 2;
  const boxHeight = totalTextHeight + padding * 1.2;

  const centerX = size / 2;
  const centerY = size / 2;

  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.roundRect(
    centerX - boxWidth / 2,
    centerY - boxHeight / 2,
    boxWidth,
    boxHeight,
    6
  );
  ctx.fill();

  ctx.fillStyle = fgColor;
  const startY = centerY - (totalTextHeight - lineHeight) / 2;
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], centerX, startY + i * lineHeight);
  }
}

/** Draws logo in center of QR code */
function drawLogo(
  ctx: CanvasRenderingContext2D,
  size: number,
  logoData: string,
  logoSizePercent: number
): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const logoSize = size * (logoSizePercent / 100);
      const x = (size - logoSize) / 2;
      const y = (size - logoSize) / 2;

      // White background behind logo
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(x - 4, y - 4, logoSize + 8, logoSize + 8, 6);
      ctx.fill();

      ctx.drawImage(img, x, y, logoSize, logoSize);
      resolve();
    };
    img.onerror = () => resolve(); // Skip logo on error
    img.src = logoData;
  });
}

/** Draws frame with text around QR code */
function drawFrame(
  sourceCanvas: HTMLCanvasElement,
  text: string,
  position: "top" | "bottom",
  bgColor: string,
  fgColor: string
): HTMLCanvasElement {
  const frameCanvas = document.createElement("canvas");
  const totalHeight = sourceCanvas.height + FRAME_HEIGHT + FRAME_PADDING;
  frameCanvas.width = sourceCanvas.width;
  frameCanvas.height = totalHeight;

  const ctx = frameCanvas.getContext("2d");
  if (!ctx) return sourceCanvas;

  // Fill background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, frameCanvas.width, frameCanvas.height);

  // Draw QR code
  const qrY = position === "top" ? FRAME_HEIGHT + FRAME_PADDING / 2 : FRAME_PADDING / 2;
  ctx.drawImage(sourceCanvas, 0, qrY);

  // Draw text
  ctx.fillStyle = fgColor;
  ctx.font = `600 14px ${FONT_STACK}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const textY = position === "top" ? FRAME_HEIGHT / 2 : totalHeight - FRAME_HEIGHT / 2;
  ctx.fillText(text, frameCanvas.width / 2, textY);

  return frameCanvas;
}

/** Redraws corner eyes with custom style */
function drawCornerStyle(
  ctx: CanvasRenderingContext2D,
  size: number,
  style: CornerStyle,
  fgColor: string,
  bgColor: string
): void {
  if (style === "square") return; // Default, no changes needed

  const moduleSize = size / 25; // Approximate module size for version 3 QR
  const eyeSize = moduleSize * 7;
  const innerSize = moduleSize * 3;
  const margin = moduleSize * 2;

  const corners = [
    { x: margin, y: margin }, // Top-left
    { x: size - margin - eyeSize, y: margin }, // Top-right
    { x: margin, y: size - margin - eyeSize }, // Bottom-left
  ];

  for (const corner of corners) {
    // Clear existing eye
    ctx.fillStyle = bgColor;
    ctx.fillRect(corner.x, corner.y, eyeSize, eyeSize);

    // Draw new eye based on style
    ctx.fillStyle = fgColor;

    if (style === "rounded") {
      // Outer rounded square
      ctx.beginPath();
      ctx.roundRect(corner.x, corner.y, eyeSize, eyeSize, moduleSize);
      ctx.fill();

      // Inner white
      ctx.fillStyle = bgColor;
      ctx.beginPath();
      ctx.roundRect(
        corner.x + moduleSize * 1.5,
        corner.y + moduleSize * 1.5,
        eyeSize - moduleSize * 3,
        eyeSize - moduleSize * 3,
        moduleSize * 0.5
      );
      ctx.fill();

      // Inner dot
      ctx.fillStyle = fgColor;
      ctx.beginPath();
      ctx.roundRect(
        corner.x + moduleSize * 2,
        corner.y + moduleSize * 2,
        innerSize,
        innerSize,
        moduleSize * 0.25
      );
      ctx.fill();
    } else if (style === "dots") {
      // Outer circle
      const centerX = corner.x + eyeSize / 2;
      const centerY = corner.y + eyeSize / 2;

      ctx.beginPath();
      ctx.arc(centerX, centerY, eyeSize / 2, 0, Math.PI * 2);
      ctx.fill();

      // Inner white ring
      ctx.fillStyle = bgColor;
      ctx.beginPath();
      ctx.arc(centerX, centerY, eyeSize / 2 - moduleSize * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Inner dot
      ctx.fillStyle = fgColor;
      ctx.beginPath();
      ctx.arc(centerX, centerY, innerSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export async function generatePaymentQR(
  data: PaymentFormData,
  branding?: BrandingOptions
): Promise<string> {
  const cleanIban = electronicFormatIBAN(data.iban);
  if (!(cleanIban && isValidIBAN(cleanIban))) {
    throw new InvalidIBANError(data.iban);
  }

  const payment: Parameters<typeof encode>[0]["payments"][0] = {
    type: PaymentOptions.PaymentOrder,
    amount: data.amount,
    currencyCode: CurrencyCode.EUR,
    bankAccounts: [{ iban: cleanIban }],
    ...(data.variableSymbol && { variableSymbol: data.variableSymbol }),
    ...(data.specificSymbol && { specificSymbol: data.specificSymbol }),
    ...(data.constantSymbol && { constantSymbol: data.constantSymbol }),
    ...(data.paymentNote && { paymentNote: data.paymentNote }),
  };

  const fgColor = branding?.colors?.foreground ?? "#000000";
  const bgColor = branding?.colors?.background ?? "#ffffff";

  // High error correction allows center overlay (~30% coverage)
  const canvas = document.createElement("canvas");
  await QRCode.toCanvas(canvas, encode({ payments: [payment] }), {
    width: QR_SIZE,
    margin: 2,
    errorCorrectionLevel: "H",
    color: {
      dark: fgColor,
      light: bgColor,
    },
  });

  const ctx = canvas.getContext("2d");
  if (ctx) {
    // Apply corner style
    if (branding?.cornerStyle) {
      drawCornerStyle(ctx, QR_SIZE, branding.cornerStyle, fgColor, bgColor);
    }

    // Draw logo or default text overlay
    if (branding?.logo) {
      await drawLogo(ctx, QR_SIZE, branding.logo.data, branding.logo.size);
    } else {
      drawCenterText(ctx, QR_SIZE, bgColor, fgColor);
    }
  }

  // Apply frame if specified
  let finalCanvas = canvas;
  if (branding?.frame?.text) {
    finalCanvas = drawFrame(
      canvas,
      branding.frame.text,
      branding.frame.position,
      bgColor,
      fgColor
    );
  }

  return finalCanvas.toDataURL("image/png");
}
```

**Step 2: Verify lint passes**

Run: `bun x ultracite check features/payment/qr-generator.ts`
Expected: No errors

**Step 3: Commit**

```bash
git add features/payment/qr-generator.ts
git commit -m "feat(qr): extend generator with branding colors, logo, corners, frame"
```

---

## Task 13: Integrate Branding with Payment Generator Hook

**Files:**
- Modify: `features/payment/use-payment-generator.ts`

**Step 1: Read current hook implementation**

Read the file first to understand current implementation.

**Step 2: Update hook to use active brand preset**

Add import and use branding in QR generation:

```typescript
// Add to imports
import { useActivePreset } from "@/features/branding";

// Inside the hook, get active preset
const activePreset = useActivePreset();

// Update generatePaymentQR call to include branding
const branding = activePreset
  ? {
      colors: activePreset.colors,
      logo: activePreset.logo,
      cornerStyle: activePreset.cornerStyle,
      frame: activePreset.frame?.enabled
        ? { text: activePreset.frame.text, position: activePreset.frame.position }
        : undefined,
    }
  : undefined;

const qrDataUrl = await generatePaymentQR(data, branding);
```

**Step 3: Verify lint passes**

Run: `bun x ultracite check features/payment/use-payment-generator.ts`
Expected: No errors

**Step 4: Verify build passes**

Run: `bun run build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add features/payment/use-payment-generator.ts
git commit -m "feat(payment): integrate brand preset into QR generation"
```

---

## Task 14: Add Analytics Events

**Files:**
- Modify: `features/branding/store.ts`
- Modify: `features/branding/components/logo-uploader.tsx`

**Step 1: Add analytics to store actions**

In `features/branding/store.ts`, add tracking:

```typescript
import { track } from "@vercel/analytics";

// In addPreset action, after successful add:
track("preset_created");

// In setActivePreset action, when setting non-null:
if (id !== null) {
  track("preset_applied");
}
```

**Step 2: Add analytics to logo uploader**

In `features/branding/components/logo-uploader.tsx`:

```typescript
import { track } from "@vercel/analytics";

// After successful resize, before onChange:
track("logo_uploaded");
```

**Step 3: Verify lint passes**

Run: `bun x ultracite check features/branding/store.ts features/branding/components/logo-uploader.tsx`
Expected: No errors

**Step 4: Commit**

```bash
git add features/branding/store.ts features/branding/components/logo-uploader.tsx
git commit -m "feat(branding): add analytics tracking for preset actions"
```

---

## Task 15: Final Build Verification

**Step 1: Run full build**

Run: `bun run build`
Expected: Build succeeds with no errors

**Step 2: Run lint check**

Run: `bun x ultracite check`
Expected: No errors

**Step 3: Manual testing checklist**

Run: `bun dev`

- [ ] Branding button appears in header
- [ ] Sheet opens and shows "Predvolený štýl" selected
- [ ] Can create new preset with all options
- [ ] Color contrast warning shows when colors are too similar
- [ ] Logo upload works and shows preview
- [ ] Corner style picker updates preview
- [ ] Frame text with position works
- [ ] Preset appears in list after saving
- [ ] Can select/deselect preset
- [ ] QR code generates with selected branding
- [ ] Can edit existing preset
- [ ] Can delete preset with confirmation
- [ ] 3 preset limit is enforced
- [ ] Presets persist after page reload

**Step 4: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix(branding): address issues from manual testing"
```

---

## Summary

14 implementation tasks covering:
1. Schema and types
2. Utilities (contrast, image resize)
3. Zustand store
4. Color picker component
5. Corner style picker component
6. Logo uploader component
7. Frame editor component
8. Preset card component
9. Preset editor form
10. Branding sheet
11. Header integration
12. QR generator extension
13. Payment hook integration
14. Analytics events
15. Final verification

Each task follows: implement → lint check → commit pattern.
