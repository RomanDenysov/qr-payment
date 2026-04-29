"use client";

import { IconDeviceFloppy, IconTrash } from "@tabler/icons-react";
import { track } from "@vercel/analytics";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStudioActions, useStudioTemplates } from "../store";
import { fillPrimaryColor } from "../types";

export function StudioTemplateSelector() {
  const templates = useStudioTemplates();
  const { saveTemplate, loadTemplate, deleteTemplate } = useStudioActions();
  const [newName, setNewName] = useState("");
  const t = useTranslations("Studio");
  const tTpl = useTranslations("Templates");

  const handleSave = () => {
    const name = newName.trim();
    if (!name) {
      return;
    }
    saveTemplate(name);
    setNewName("");
    track("studio_template_saved");
  };

  return (
    <div className="flex flex-col gap-2">
      <h2 className="font-medium text-sm">{t("section.templates")}</h2>

      {templates.length > 0 && (
        <div className="flex max-h-40 flex-col gap-1 overflow-auto">
          {templates.map((template) => (
            <div
              className="flex items-center gap-1.5 px-1 py-0.5 hover:bg-accent"
              key={template.id}
            >
              <button
                className="flex flex-1 items-center gap-2 truncate text-left text-xs"
                onClick={() => {
                  loadTemplate(template.id);
                  track("studio_template_loaded");
                }}
                type="button"
              >
                <span
                  className="inline-block size-3 shrink-0 ring-1 ring-foreground/20"
                  style={{
                    backgroundColor: fillPrimaryColor(template.config.fgFill),
                  }}
                />
                {template.name}
              </button>
              <Button
                aria-label={tTpl("deleteTemplate")}
                className="size-6 p-0"
                onClick={() => {
                  deleteTemplate(template.id);
                  track("studio_template_deleted");
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
          placeholder={t("templateNamePlaceholder")}
          value={newName}
        />
        <Button
          disabled={!newName.trim()}
          onClick={handleSave}
          size="sm"
          variant="outline"
        >
          <IconDeviceFloppy className="size-3.5" />
          {tTpl("save")}
        </Button>
      </div>
    </div>
  );
}
