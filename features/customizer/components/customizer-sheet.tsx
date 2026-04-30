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
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { TemplateSelector } from "./template-selector";

interface CustomizerSheetProps {
  onApply: () => void;
}

const FOOTER_BUTTON_CLASS =
  "flex-1 sm:h-10 sm:px-4 sm:text-sm sm:[&_svg:not([class*='size-'])]:size-4";

export function CustomizerSheet({ onApply }: CustomizerSheetProps) {
  const [open, setOpen] = useState(false);
  const actions = useCustomizerActions();
  const t = useTranslations("Branding");
  const guardrails = useGuardrails();
  const hasBlockingIssue = guardrails.some((g) => g.severity === "warning");

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger render={<Button size="sm" variant="ghost" />}>
        <IconPalette />
        {t("edit")}
      </SheetTrigger>
      <SheetContent
        className="w-full data-[side=left]:w-full data-[side=left]:sm:max-w-lg"
        side="left"
      >
        <SheetHeader>
          <SheetTitle>{t("dialogTitle")}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-3 overflow-auto px-4 pb-4">
          <CustomizerControls />
          <div className="mt-auto">
            <TemplateSelector />
          </div>
        </div>

        <SheetFooter className="gap-3 border-border border-t">
          <Alert className="items-center px-2 py-1.5 sm:px-3 sm:py-2 sm:text-sm">
            <IconAlertTriangle className="size-5 self-center" />
            <AlertDescription className="sm:text-sm/relaxed">
              {t("warning")}
            </AlertDescription>
          </Alert>
          <div className="flex flex-row gap-2">
            <Button
              className={FOOTER_BUTTON_CLASS}
              onClick={() => {
                actions.reset();
                track("customizer_reset");
              }}
              size="sm"
              type="button"
              variant="outline"
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
              size="sm"
              type="button"
            >
              {t("done")}
            </Button>
          </div>
          <Link
            className="inline-flex items-center justify-center gap-1 text-center text-muted-foreground text-xs underline-offset-2 hover:text-foreground hover:underline"
            href="/studio"
          >
            {t("openInStudio")}
            <IconArrowRight className="size-3.5" />
          </Link>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
