"use client";

import {
  IconAlertTriangle,
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
import { useBrandingActions, useBrandingConfig } from "../store";
import { CenterTextEditor } from "./center-text-editor";
import { ColorPicker } from "./color-picker";
import { DotStyleSelector } from "./dot-style-selector";
import { LogoUploader } from "./logo-uploader";
import { TemplateSelector } from "./template-selector";

interface BrandingSheetProps {
  onApply: () => void;
}

export function BrandingSheet({ onApply }: BrandingSheetProps) {
  const [open, setOpen] = useState(false);
  const config = useBrandingConfig();
  const actions = useBrandingActions();
  const t = useTranslations("Branding");

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
          <DotStyleSelector
            onChange={(dotStyle) => actions.update({ dotStyle })}
            value={config.dotStyle}
          />
          <CenterTextEditor
            onChange={(centerText) => actions.update({ centerText })}
            onTextBoldChange={(centerTextBold) =>
              actions.update({ centerTextBold })
            }
            onTextFontChange={(centerTextFont) =>
              actions.update({ centerTextFont })
            }
            onTextSizeChange={(centerTextSize) =>
              actions.update({ centerTextSize })
            }
            textBold={config.centerTextBold}
            textFont={config.centerTextFont}
            textSize={config.centerTextSize}
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
            <Button
              className="flex-1"
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
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
