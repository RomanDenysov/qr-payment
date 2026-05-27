"use client";

import {
  IconAlertTriangle,
  IconArrowRight,
  IconPalette,
  IconRefresh,
} from "@tabler/icons-react";
import { track } from "@vercel/analytics";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link } from "@/i18n/navigation";
import { useCustomizerActions } from "../store";
import { useGuardrails } from "../use-guardrails";
import { CustomizerControls } from "./customizer-controls";
import { PresetButtons } from "./preset-buttons";
import { TemplateSelector } from "./template-selector";

interface CustomizerSheetProps {
  onApply: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const FOOTER_BUTTON_CLASS =
  "h-12 flex-1 sm:px-4 sm:text-sm sm:[&_svg:not([class*='size-'])]:size-4";

export function CustomizerSheet({
  onApply,
  open: controlledOpen,
  onOpenChange,
}: CustomizerSheetProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (next: boolean) => {
    if (!isControlled) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };
  const actions = useCustomizerActions();
  const t = useTranslations("Branding");
  const guardrails = useGuardrails();
  const hasBlockingIssue = guardrails.some((g) => g.severity === "warning");

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger render={<Button className="h-10" variant="ghost" />}>
        <IconPalette />
        {t("edit")}
      </SheetTrigger>
      <SheetContent
        className="w-full data-[side=left]:w-full data-[side=left]:sm:max-w-lg"
        side="left"
      >
        <SheetHeader className="h-12 flex-row items-center gap-0 border-b px-4 py-0">
          <SheetTitle>{t("dialogTitle")}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col overflow-auto">
          <div className="border-b bg-card px-4 py-3">
            <PresetButtons source="sheet" />
          </div>
          <CustomizerControls />
          <div className="mt-auto border-b bg-card px-4 py-3">
            <TemplateSelector />
          </div>
        </div>

        <SheetFooter className="gap-0 border-t p-0">
          <output
            aria-live="polite"
            className="flex items-start gap-2 px-4 py-3 text-muted-foreground text-xs sm:text-sm/relaxed"
          >
            <IconAlertTriangle className="size-4 shrink-0 translate-y-0.5" />
            <span>{t("warning")}</span>
          </output>
          <div className="flex flex-row divide-x divide-border border-t">
            <Button
              className={FOOTER_BUTTON_CLASS}
              onClick={() => {
                actions.reset();
                track("customizer_reset");
              }}
              type="button"
              variant="ghost"
            >
              <IconRefresh />
              {t("reset")}
            </Button>
            <Button
              className={FOOTER_BUTTON_CLASS}
              disabled={hasBlockingIssue}
              onClick={() => {
                onApply();
                setOpen(false);
              }}
              type="button"
            >
              {t("done")}
            </Button>
          </div>
          <Link
            className="flex h-12 items-center justify-center gap-2 border-t bg-secondary px-4 text-secondary-foreground text-sm transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href="/studio"
          >
            {t("openInStudio")}
            <IconArrowRight className="size-4" />
          </Link>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
