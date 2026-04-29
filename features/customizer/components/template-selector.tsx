"use client";

import {
  IconChevronDown,
  IconDeviceFloppy,
  IconTrash,
} from "@tabler/icons-react";
import { track } from "@vercel/analytics";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useCustomizerActions, useCustomizerTemplates } from "../store";
import { fillPrimaryColor } from "../types";

const COLLAPSED_COUNT = 3;

export function TemplateSelector() {
  const templates = useCustomizerTemplates();
  const { saveTemplate, loadTemplate, deleteTemplate } = useCustomizerActions();
  const [newName, setNewName] = useState("");
  const [expanded, setExpanded] = useState(false);
  const t = useTranslations("Studio");
  const tTpl = useTranslations("Templates");

  const handleSave = () => {
    const name = newName.trim();
    if (!name) {
      return;
    }
    if (saveTemplate(name)) {
      setNewName("");
      track("customizer_template_saved");
    } else {
      toast.error(t("templateSaveFailed"));
    }
  };

  const visible = expanded ? templates : templates.slice(0, COLLAPSED_COUNT);
  const overflow = templates.length - COLLAPSED_COUNT;

  return (
    <div className="flex flex-col gap-2">
      <h2 className="font-medium text-sm">{t("section.templates")}</h2>

      {templates.length > 0 && (
        <div
          className={cn(
            "flex flex-col gap-1",
            expanded && "max-h-40 overflow-auto"
          )}
        >
          {visible.map((template) => (
            <div
              className="flex items-center gap-1.5 px-1 py-0.5 hover:bg-accent"
              key={template.id}
            >
              <button
                className="flex flex-1 items-center gap-2 truncate text-left text-xs"
                onClick={() => {
                  if (loadTemplate(template.id)) {
                    track("customizer_template_loaded");
                  } else {
                    toast.error(t("templateLoadFailed"));
                  }
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
                  track("customizer_template_deleted");
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

      {overflow > 0 && (
        <button
          aria-expanded={expanded}
          className="inline-flex items-center justify-center gap-1 text-muted-foreground text-xs hover:text-foreground"
          onClick={() => setExpanded((v) => !v)}
          type="button"
        >
          {expanded ? tTpl("showLess") : tTpl("showMore", { count: overflow })}
          <IconChevronDown
            className={cn(
              "size-3 transition-transform",
              expanded && "rotate-180"
            )}
          />
        </button>
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
