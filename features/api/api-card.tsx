"use client";

import {
  IconApi,
  IconArrowRight,
  IconCheck,
  IconCopy,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

export function ApiCard() {
  const t = useTranslations("Api");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(t("prompt"));
      setCopied(true);
      toast.success(t("copied"));
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      toast.error(t("copyFailed"));
    }
  };

  return (
    <div className="group overflow-hidden ring-1 ring-foreground/10 transition-[box-shadow] duration-300 hover:ring-foreground/20">
      {/* Terminal header bar */}
      <div className="flex items-center justify-between border-foreground/10 border-b bg-muted/50 px-4 py-2">
        <div className="flex items-center gap-3">
          <div aria-hidden="true" className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-foreground/15" />
            <div className="size-2 rounded-full bg-foreground/15" />
            <div className="size-2 rounded-full bg-foreground/15" />
          </div>
          <span className="text-muted-foreground text-xs">~/api/v1/qr</span>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[10px] text-green-600 dark:text-green-400">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-500 opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-green-500" />
          </span>
          LIVE
        </span>
      </div>

      {/* Card body */}
      <div className="space-y-4 px-4 py-4">
        <div className="space-y-1">
          <h3 className="flex items-center gap-2 font-bold font-pixel text-xl tracking-wide sm:text-2xl">
            <IconApi className="size-6" />
            {t("title")}
          </h3>
          <p className="text-muted-foreground text-sm/relaxed">
            {t("description")}
          </p>
        </div>

        {/* Prompt block */}
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs">{t("promptHint")}</p>
          <div className="group/prompt relative">
            <div className="overflow-x-auto bg-foreground/[0.04] p-3 ring-1 ring-foreground/5 dark:bg-foreground/[0.06]">
              <div className="flex gap-2 text-xs leading-relaxed">
                <span
                  aria-hidden="true"
                  className="shrink-0 select-none text-muted-foreground/60"
                >
                  $
                </span>
                <span className="whitespace-pre-wrap">
                  {t("prompt")}
                  <span
                    aria-hidden="true"
                    className="ml-0.5 inline-block h-[14px] w-[6px] translate-y-[2px] bg-foreground/70"
                    style={{ animation: "blink 1s step-end infinite" }}
                  />
                </span>
              </div>
            </div>
            <button
              className="absolute top-2 right-2 bg-background p-1.5 text-muted-foreground opacity-0 ring-1 ring-foreground/10 transition-all hover:text-foreground group-hover/prompt:opacity-100"
              onClick={handleCopy}
              type="button"
            >
              {copied ? (
                <IconCheck className="size-3.5" />
              ) : (
                <IconCopy className="size-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between">
          <a
            className="inline-flex items-center gap-1 text-muted-foreground text-xs underline-offset-4 transition-colors hover:text-foreground hover:underline"
            href="/api/v1/qr"
            rel="noopener noreferrer"
            target="_blank"
          >
            {t("viewDocs")}
            <IconArrowRight className="size-3.5" />
          </a>
          <span className="text-[10px] text-muted-foreground/50">
            free &middot; no auth &middot; 10 req/min
          </span>
        </div>
      </div>
    </div>
  );
}
