"use client";

import { IconDeviceFloppy, IconTrash } from "@tabler/icons-react";
import { track } from "@vercel/analytics";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  useBrandingActions,
  useBrandingTemplates,
} from "@/features/branding/store";

export function TemplateSelector() {
  const templates = useBrandingTemplates();
  const { saveTemplate, loadTemplate, deleteTemplate } = useBrandingActions();
  const [newName, setNewName] = useState("");
  const t = useTranslations("Templates");

  const handleSave = () => {
    const name = newName.trim();
    if (!name) {
      return;
    }
    saveTemplate(name);
    setNewName("");
    track("branding_template_saved");
  };

  const handleLoad = (id: string) => {
    loadTemplate(id);
    track("branding_template_loaded");
  };

  return (
    <div className="flex flex-col gap-2">
      <Separator />
      <p className="font-medium text-xs">{t("title")}</p>

      {templates.length > 0 && (
        <div className="flex max-h-32 flex-col gap-1 overflow-auto">
          {templates.map((template) => (
            <div
              className="flex items-center gap-1.5 rounded-sm px-1 py-0.5 hover:bg-accent"
              key={template.id}
            >
              <button
                className="flex flex-1 items-center gap-2 truncate text-left text-xs"
                onClick={() => handleLoad(template.id)}
                type="button"
              >
                <span
                  className="inline-block size-3 shrink-0 rounded-full ring-1 ring-foreground/20"
                  style={{ backgroundColor: template.config.fgColor }}
                />
                {template.name}
              </button>
              <Button
                aria-label={t("deleteTemplate")}
                className="size-6 p-0"
                onClick={() => {
                  deleteTemplate(template.id);
                  track("branding_template_deleted");
                }}
                size="sm"
                variant="ghost"
              >
                <IconTrash className="size-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-1.5">
        <Input
          className="h-7 text-xs"
          maxLength={30}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          placeholder={t("namePlaceholder")}
          value={newName}
        />
        <Button
          disabled={!newName.trim()}
          onClick={handleSave}
          size="sm"
          variant="outline"
        >
          <IconDeviceFloppy className="size-3.5" />
          {t("save")}
        </Button>
      </div>
    </div>
  );
}
