import { IconArrowUpRight } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { OutboundLink } from "@/components/outbound-link";
import { okfakturaUrl } from "../okfaktura";

/**
 * One line under a generated QR code: the moment someone has a payment QR and
 * often needs an invoice to put it on. Shown for PAY by square only, since
 * okfaktura issues Slovak invoices.
 */
export function OkfakturaQrHint() {
  const t = useTranslations("Okfaktura.hint");

  return (
    <OutboundLink
      className="group/okf flex items-center justify-between gap-3 border-t bg-muted/50 px-4 py-3 outline-none transition-colors duration-150 ease-out hover:bg-muted focus-visible:ring-1 focus-visible:ring-ring/50"
      event="okfaktura_link_clicked"
      href={okfakturaUrl("contractors", "qr-preview")}
      placement="qr-preview"
    >
      <span className="flex flex-col gap-0.5">
        <span className="font-medium text-foreground text-xs">
          {t("title")}
        </span>
        <span className="text-muted-foreground text-xs">{t("text")}</span>
      </span>
      <IconArrowUpRight
        aria-hidden
        className="size-4 shrink-0 text-muted-foreground transition-transform duration-150 ease-out group-hover/okf:translate-x-0.5 group-hover/okf:-translate-y-0.5"
      />
    </OutboundLink>
  );
}
