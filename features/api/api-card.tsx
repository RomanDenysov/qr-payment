"use client";

import { IconArrowRight, IconCheck, IconCopy } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

export function ApiCard() {
  const t = useTranslations("Api");
  const [copied, setCopied] = useState<"main" | "alt" | false>(false);

  const handleCopy = async (key: "prompt" | "promptAlt") => {
    try {
      await navigator.clipboard.writeText(t(key));
      const source = key === "prompt" ? "main" : "alt";
      setCopied(source);
      toast.success(t("copied"));
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      toast.error(t("copyFailed"));
    }
  };

  return (
    <article
      aria-label="QR Platby API"
      className="group overflow-hidden ring-1 ring-foreground/10 transition-[box-shadow] duration-300 hover:ring-foreground/20"
      itemScope
      itemType="https://schema.org/WebAPI"
    >
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
          <h3
            className="font-bold font-pixel text-xl tracking-wide sm:text-2xl"
            itemProp="name"
          >
            {t("title")}
          </h3>
          <p
            className="text-muted-foreground text-sm/relaxed"
            itemProp="description"
          >
            {t("description")}
          </p>
        </div>

        {/* Main prompt block */}
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs">{t("promptHint")}</p>
          <div className="group/prompt relative">
            <pre className="overflow-x-auto bg-foreground/[0.04] p-3 ring-1 ring-foreground/5 dark:bg-foreground/[0.06]">
              <code className="flex gap-2 text-xs leading-relaxed">
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
              </code>
            </pre>
            <button
              className="absolute top-2 right-2 bg-background p-1.5 text-muted-foreground opacity-0 ring-1 ring-foreground/10 transition-all hover:text-foreground group-hover/prompt:opacity-100"
              onClick={() => handleCopy("prompt")}
              type="button"
            >
              {copied === "main" ? (
                <IconCheck className="size-3.5" />
              ) : (
                <IconCopy className="size-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Alt prompt block */}
        <div className="space-y-1.5">
          <p className="text-[11px] text-muted-foreground">
            {t("promptAltLabel")}
          </p>
          <div className="group/alt relative">
            <pre className="overflow-x-auto bg-foreground/[0.02] p-2.5 ring-1 ring-foreground/5 dark:bg-foreground/[0.04]">
              <code className="flex gap-2 text-[11px] text-muted-foreground leading-relaxed">
                <span
                  aria-hidden="true"
                  className="shrink-0 select-none text-muted-foreground/40"
                >
                  $
                </span>
                <span className="whitespace-pre-wrap">{t("promptAlt")}</span>
              </code>
            </pre>
            <button
              className="absolute top-1.5 right-1.5 bg-background p-1 text-muted-foreground opacity-0 ring-1 ring-foreground/10 transition-all hover:text-foreground group-hover/alt:opacity-100"
              onClick={() => handleCopy("promptAlt")}
              type="button"
            >
              {copied === "alt" ? (
                <IconCheck className="size-3" />
              ) : (
                <IconCopy className="size-3" />
              )}
            </button>
          </div>
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between">
          <a
            className="inline-flex items-center gap-1 text-muted-foreground text-xs underline-offset-4 transition-colors hover:text-foreground hover:underline"
            href="/api/v1/qr"
            itemProp="documentation"
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

        {/* MCP note */}
        <p className="text-[11px] text-muted-foreground/60">{t("mcpNote")}</p>
      </div>
      <link href="/podmienky" itemProp="termsOfService" />
    </article>
  );
}
