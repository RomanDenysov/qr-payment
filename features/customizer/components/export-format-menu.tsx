"use client";

import {
  IconChevronDown,
  IconFileTypePdf,
  IconFileTypeSvg,
} from "@tabler/icons-react";
import { track } from "@vercel/analytics";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PaymentFormData } from "@/features/payment/schema";
import type { CustomizerConfig } from "../types";

type ExportFormat = "svg" | "pdf";

interface ExportFormatMenuProps {
  className?: string;
  config: CustomizerConfig;
  disabled?: boolean;
  filePrefix: string;
  payment: PaymentFormData | null;
  source: "home" | "studio";
}

export function ExportFormatMenu({
  className,
  config,
  disabled,
  filePrefix,
  payment,
  source,
}: ExportFormatMenuProps) {
  const t = useTranslations("QRPreview.export");
  const [pending, startExport] = useTransition();

  const handleExport = (format: ExportFormat) => {
    if (!payment) {
      return;
    }
    startExport(async () => {
      try {
        const { downloadQrPdf, downloadQrSvg } = await import(
          "../export-vector"
        );
        const run = format === "svg" ? downloadQrSvg : downloadQrPdf;
        await run(payment, config, filePrefix);
        track("qr_exported", { format, source });
        toast.success(t("done"));
      } catch (error) {
        console.error(`[ExportFormatMenu] Failed to export ${format}:`, error);
        toast.error(t("failed"));
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("menuAria")}
        disabled={disabled || !payment}
        render={
          <Button className={className} isPending={pending} variant="ghost">
            {pending ? null : <IconChevronDown />}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuItem onClick={() => handleExport("svg")}>
          <IconFileTypeSvg />
          <div className="flex flex-col">
            <span>{t("svg")}</span>
            <span className="text-muted-foreground">{t("svgHint")}</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("pdf")}>
          <IconFileTypePdf />
          <div className="flex flex-col">
            <span>{t("pdf")}</span>
            <span className="text-muted-foreground">{t("pdfHint")}</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
