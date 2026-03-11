import type { PaymentFormat, QRPlatbyAPI, WidgetConfig } from "./types";
import { QRPaymentWidget } from "./widget";

function parseDataAttrs(el: HTMLElement): WidgetConfig {
  const get = (name: string) => el.dataset[name];
  const getBool = (name: string, fallback: boolean) => {
    const v = get(name);
    if (v === undefined) {
      return fallback;
    }
    return v !== "false";
  };

  return {
    format: (get("format") ?? "paybysquare") as PaymentFormat,
    iban: get("iban") ?? "",
    amount: get("amount")
      ? Number.parseFloat(get("amount") as string)
      : undefined,
    currency: get("currency"),
    recipient: get("recipient"),
    message: get("message"),
    variableSymbol: get("variableSymbol"),
    constantSymbol: get("constantSymbol"),
    specificSymbol: get("specificSymbol"),
    bic: get("bic"),
    reference: get("reference"),
    size: get("size") ? Number.parseInt(get("size") as string, 10) : 200,
    theme: (get("theme") as "light" | "dark") ?? "light",
    color: get("color") ?? "#000000",
    bgColor: get("bgColor") ?? "#FFFFFF",
    lang: get("lang") as "sk" | "cs" | "en" | undefined,
    showDownload: getBool("showDownload", true),
    showAmountInput: getBool("showAmountInput", false),
    showMessageInput: getBool("showMessageInput", false),
    branding: getBool("branding", true),
    errorCorrection:
      (get("errorCorrection") as "L" | "M" | "Q" | "H") ?? undefined,
  };
}

function init(): void {
  const widgets = document.querySelectorAll<HTMLElement>(".qr-platby-widget");
  for (const el of widgets) {
    if ((el as unknown as Record<string, unknown>).__qrWidget) {
      continue;
    }
    const config = parseDataAttrs(el);
    const widget = new QRPaymentWidget(el, config);
    (el as unknown as Record<string, unknown>).__qrWidget = widget;
  }
}

const api: QRPlatbyAPI = {
  create(config) {
    let element: HTMLElement;
    if (typeof config.element === "string") {
      const el = document.querySelector<HTMLElement>(config.element);
      if (!el) {
        throw new Error(`Element not found: ${config.element}`);
      }
      element = el;
    } else {
      element = config.element;
    }

    const widget = new QRPaymentWidget(element, config);
    (element as unknown as Record<string, unknown>).__qrWidget = widget;
    return widget;
  },
  version: "1.0.0",
};

// Expose global
(window as unknown as Record<string, unknown>).QRPlatby = api;

// Auto-init
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
