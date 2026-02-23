"use client";

import {
  IconAlertTriangle,
  IconPalette,
  IconRefresh,
} from "@tabler/icons-react";
import { track } from "@vercel/analytics";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useBrandingActions, useBrandingConfig } from "../store";
import { CenterTextEditor } from "./center-text-editor";
import { ColorPicker } from "./color-picker";
import { LogoUploader } from "./logo-uploader";
import { TemplateSelector } from "./template-selector";

interface BrandingDialogProps {
  onApply: () => void;
}

export function BrandingDialog({ onApply }: BrandingDialogProps) {
  const config = useBrandingConfig();
  const actions = useBrandingActions();
  const t = useTranslations("Branding");

  return (
    <Dialog>
      <DialogTrigger render={<Button size="sm" variant="ghost" />}>
        <IconPalette />
        {t("edit")}
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{t("dialogTitle")}</DialogTitle>
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
            <DialogClose
              className="flex-1"
              onClick={onApply}
              render={<Button size="sm" type="button" />}
            >
              {t("done")}
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
