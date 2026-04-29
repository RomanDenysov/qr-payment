import type { QRBranding } from "@/features/payment/qr-generator";
import type { CustomizerConfig } from "./types";
import { fillPrimaryColor } from "./types";

/**
 * Flatten a CustomizerConfig down to the legacy QRBranding shape used by
 * generatePaymentQR (bulk export, share links, REST API). Drops gradients,
 * frame, position pickers, and logo size — keeps the visible color identity.
 */
export function customizerToBranding(c: CustomizerConfig): QRBranding {
  return {
    fgColor: fillPrimaryColor(c.fgFill),
    bgColor: fillPrimaryColor(c.bgFill),
    centerText: c.centerText,
    logo: c.logo,
    dotStyle: c.dotStyle,
    centerTextSize: c.centerTextSize,
    centerTextBold: c.centerTextBold,
    centerTextFont: c.centerTextFont,
  };
}
