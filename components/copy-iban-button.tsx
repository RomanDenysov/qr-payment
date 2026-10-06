"use client";

import { IconCheck, IconCopy } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useCopyState } from "@/lib/hooks/use-copy-state";

/** Icon button that copies an IBAN, used by the share page and the QR reader. */
export function CopyIbanButton({ iban }: { iban: string }) {
  const t = useTranslations("SharePage");
  const { copied, trigger } = useCopyState();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(iban);
      trigger();
      toast.success(t("copied"));
    } catch (error) {
      console.error("[CopyIbanButton] Failed to copy IBAN", error);
      toast.error(t("copyFailed"));
    }
  };

  return (
    <button
      aria-label={t("copyIban")}
      className="inline-flex size-6 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground"
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
