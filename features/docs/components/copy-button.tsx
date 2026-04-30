"use client";

import { IconCheck, IconCopy } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useCopyState } from "@/lib/hooks/use-copy-state";

export function CopyButton({ text }: { text: string }) {
  const t = useTranslations("Docs");
  const { copied, trigger } = useCopyState();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      trigger();
      toast.success(t("copied"));
    } catch (error) {
      console.error("[CopyButton] Failed to copy:", error);
      toast.error(t("copyFailed"));
    }
  };

  return (
    <button
      aria-label={t("copy")}
      className="absolute top-2 right-2 bg-background p-1.5 text-muted-foreground opacity-0 ring-1 ring-foreground/10 transition-all hover:text-foreground group-hover/code:opacity-100"
      onClick={handleCopy}
      type="button"
    >
      {copied ? (
        <IconCheck className="size-3.5" />
      ) : (
        <IconCopy className="size-3.5" />
      )}
    </button>
  );
}
