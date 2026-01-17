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
