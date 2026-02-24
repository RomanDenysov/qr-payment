"use client";

import { IconCopy } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

export function CopyIbanButton({ iban }: { iban: string }) {
  const t = useTranslations("SharePage");

  return (
    <button
      className="inline-flex size-6 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(iban);
          toast.success(t("copied"));
        } catch (error) {
          console.error("[CopyIbanButton] Failed to copy IBAN", error);
          toast.error(t("copyFailed"));
        }
      }}
      type="button"
    >
      <IconCopy className="size-3.5" />
    </button>
  );
}
