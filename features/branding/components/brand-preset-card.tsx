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
