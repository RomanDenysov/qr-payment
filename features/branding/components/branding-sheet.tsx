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
