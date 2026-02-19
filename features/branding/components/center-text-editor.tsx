"use client";

import { useTranslations } from "next-intl";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface CenterTextEditorProps {
  value: string;
  onChange: (text: string) => void;
}

const MAX_CHARS = 50;

export function CenterTextEditor({ value, onChange }: CenterTextEditorProps) {
  const charCount = value.length;
  const isNearLimit = charCount >= MAX_CHARS - 5;
  const t = useTranslations("Branding");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    if (next.length <= MAX_CHARS) {
      onChange(next);
    }
  };

  return (
    <Field>
      <FieldLabel className="flex items-center justify-between">
        <span>{t("centerText")}</span>
        <span
          className={cn(
            "font-normal text-muted-foreground text-xs",
            isNearLimit && "text-foreground"
          )}
        >
          {charCount}/{MAX_CHARS}
        </span>
      </FieldLabel>
      <Textarea
        maxLength={MAX_CHARS}
        onChange={handleChange}
        placeholder={t("centerTextPlaceholder")}
        rows={3}
        value={value}
      />
      <FieldDescription>{t("centerTextDescription")}</FieldDescription>
    </Field>
  );
}
