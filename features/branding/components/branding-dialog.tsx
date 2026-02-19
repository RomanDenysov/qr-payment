"use client";

import { Dialog } from "@base-ui/react/dialog";
import {
  IconAlertTriangle,
  IconPalette,
  IconRefresh,
} from "@tabler/icons-react";
import { track } from "@vercel/analytics";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useBrandingActions, useBrandingConfig } from "../store";
import { CenterTextEditor } from "./center-text-editor";
import { ColorPicker } from "./color-picker";
import { LogoUploader } from "./logo-uploader";
import { TemplateSelector } from "./template-selector";

function DialogPortal({ ...props }: Dialog.Portal.Props) {
  return <Dialog.Portal data-slot="dialog-portal" {...props} />;
}

function DialogOverlay({ className, ...props }: Dialog.Backdrop.Props) {
  return (
    <Dialog.Backdrop
      className={cn(
        "data-closed:fade-out-0 data-open:fade-in-0 fixed inset-0 isolate z-50 bg-black/10 duration-100 data-closed:animate-out data-open:animate-in supports-backdrop-filter:backdrop-blur-xs",
        className
      )}
      data-slot="dialog-overlay"
      {...props}
    />
  );
}

function DialogContent({ className, ...props }: Dialog.Popup.Props) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <Dialog.Popup
        className={cn(
          "data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 fixed top-1/2 left-1/2 z-50 grid w-full max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-none bg-background p-4 outline-none ring-1 ring-foreground/10 duration-100 data-closed:animate-out data-open:animate-in",
          className
        )}
        data-slot="dialog-content"
        {...props}
      />
    </DialogPortal>
  );
}

interface BrandingDialogProps {
  onApply: () => void;
}

export function BrandingDialog({ onApply }: BrandingDialogProps) {
  const config = useBrandingConfig();
  const actions = useBrandingActions();
  const t = useTranslations("Branding");

  return (
    <Dialog.Root>
      <Dialog.Trigger render={<Button size="sm" variant="ghost" />}>
        <IconPalette />
        {t("edit")}
      </Dialog.Trigger>
      <DialogContent>
        <Dialog.Title className="font-medium text-sm">
          {t("dialogTitle")}
        </Dialog.Title>
        <Alert>
          <IconAlertTriangle className="size-5" />
          <AlertDescription>{t("warning")}</AlertDescription>
        </Alert>
        <div className="flex flex-col gap-3">
          <ColorPicker
            contrastWith={config.bgColor}
            label={t("fgColor")}
            onChange={(fgColor) => actions.update({ fgColor })}
            value={config.fgColor}
          />
          <ColorPicker
            contrastWith={config.fgColor}
            label={t("bgColor")}
            onChange={(bgColor) => actions.update({ bgColor })}
            value={config.bgColor}
          />
          <CenterTextEditor
            onChange={(centerText) => actions.update({ centerText })}
            value={config.centerText}
          />
          <div className="flex flex-col gap-1.5">
            <LogoUploader
              onChange={(logo) => {
                actions.update({ logo });
                track("logo_uploaded");
              }}
              value={config.logo}
            />
            <p className="text-muted-foreground text-xs">{t("logoHelp")}</p>
          </div>
          <TemplateSelector />
          <div className="flex gap-2 pt-2">
            <Button
              className="flex-1"
              onClick={() => {
                actions.reset();
                track("branding_reset");
              }}
              size="sm"
              type="button"
              variant="outline"
            >
              <IconRefresh />
              {t("reset")}
            </Button>
            <Dialog.Close
              className="flex-1"
              onClick={onApply}
              render={<Button size="sm" type="button" />}
            >
              {t("done")}
            </Dialog.Close>
          </div>
        </div>
      </DialogContent>
    </Dialog.Root>
  );
}
