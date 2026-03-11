import { encodeEpcQr } from "./encoders/epc";
import { encodeSpaydQr } from "./encoders/spayd";
import { downloadPNG, generateSVG, svgToDataURL } from "./qr-render";
import { WIDGET_CSS } from "./styles";
import type { EncoderResult, QRWidget, WidgetConfig } from "./types";
import { validateIBAN, validatePayment } from "./validate";

const LABELS: Record<string, Record<string, string>> = {
  sk: {
    amount: "Suma",
    message: "Spr\u00E1va",
    download: "Stiahnu\u0165 QR",
    loading: "Na\u010D\u00EDtavam...",
  },
  cs: {
    amount: "\u010C\u00E1stka",
    message: "Zpr\u00E1va",
    download: "St\u00E1hnout QR",
    loading: "Na\u010D\u00EDt\u00E1m...",
  },
  en: {
    amount: "Amount",
    message: "Message",
    download: "Download QR",
    loading: "Loading...",
  },
};

function detectLang(): string {
  const lang = navigator.language?.slice(0, 2);
  if (lang === "sk" || lang === "cs") {
    return lang;
  }
  return "en";
}

function debounce(fn: () => void, ms: number): () => void {
  let timer: ReturnType<typeof setTimeout>;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(fn, ms);
  };
}

/**
 * Parse a self-generated SVG string into a DOM element.
 * Only used with SVG output from our own generateSVG function.
 */
function parseSVG(svgString: string): SVGElement | null {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");
  const svg = doc.documentElement;
  if (svg instanceof SVGElement) {
    return svg;
  }
  return null;
}

function clearElement(el: HTMLElement): void {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

export class QRPaymentWidget implements QRWidget {
  private readonly root: ShadowRoot;
  private readonly container: HTMLElement;
  private readonly config: WidgetConfig;
  private currentSVG = "";
  private hasPinged = false;
  private readonly lang: Record<string, string>;

  constructor(container: HTMLElement, config: WidgetConfig) {
    this.container = container;
    this.config = {
      size: 200,
      theme: "light",
      color: "#000000",
      bgColor: "#FFFFFF",
      showDownload: true,
      showAmountInput: false,
      showMessageInput: false,
      branding: true,
      errorCorrection: "M",
      currency: config.format === "spayd" ? "CZK" : "EUR",
      ...config,
    };

    const langKey = this.config.lang ?? detectLang();
    this.lang = LABELS[langKey] ?? LABELS.en;

    // Set theme attribute for CSS
    this.container.setAttribute("data-theme", this.config.theme ?? "light");

    this.root = this.container.attachShadow({ mode: "open" });

    // Inject styles
    const style = document.createElement("style");
    style.textContent = WIDGET_CSS;
    this.root.appendChild(style);

    this.render();
  }

  private render(): void {
    // Remove previous content (keep style)
    const existing = this.root.querySelector(".qr-widget");
    if (existing) {
      existing.remove();
    }

    const wrapper = document.createElement("div");
    wrapper.className = "qr-widget";

    // Validate
    const errors = validatePayment(
      this.config.format,
      this.config.iban,
      this.config.amount,
      this.config.currency,
      this.config.recipient
    );

    if (errors.length > 0) {
      for (const err of errors) {
        const errorEl = document.createElement("div");
        errorEl.className = "qr-error-box";
        errorEl.textContent = err.message;
        wrapper.appendChild(errorEl);
      }
      this.root.appendChild(wrapper);
      return;
    }

    // QR container
    const qrContainer = document.createElement("div");
    qrContainer.className = "qr-container";
    qrContainer.style.setProperty("--qr-size", `${this.config.size}px`);
    wrapper.appendChild(qrContainer);

    // Generate QR
    this.generateQR(qrContainer, wrapper);
  }

  private async generateQR(
    qrContainer: HTMLElement,
    wrapper: HTMLElement
  ): Promise<void> {
    const result = this.encode();

    if (result instanceof Promise) {
      const loadingDiv = document.createElement("div");
      loadingDiv.className = "qr-loading";
      loadingDiv.textContent = this.lang.loading;
      qrContainer.appendChild(loadingDiv);
      this.root.appendChild(wrapper);
      const res = await result;
      clearElement(qrContainer);
      this.handleEncoderResult(res, qrContainer, wrapper);
      return;
    }

    this.handleEncoderResult(result, qrContainer, wrapper);
    this.root.appendChild(wrapper);
  }

  private handleEncoderResult(
    result: EncoderResult | { error: string },
    qrContainer: HTMLElement,
    wrapper: HTMLElement
  ): void {
    if ("error" in result) {
      clearElement(qrContainer);
      const errorEl = document.createElement("div");
      errorEl.className = "qr-error-box";
      errorEl.textContent = result.error;
      qrContainer.appendChild(errorEl);
      return;
    }

    const ecLevel = this.config.errorCorrection ?? result.errorCorrectionLevel;
    const svg = generateSVG(
      result.payload,
      this.config.size ?? 200,
      ecLevel,
      this.config.color,
      this.config.bgColor
    );
    this.currentSVG = svg;

    clearElement(qrContainer);
    const svgEl = parseSVG(svg);
    if (svgEl) {
      qrContainer.appendChild(svgEl);
    } else {
      const errorEl = document.createElement("div");
      errorEl.className = "qr-error-box";
      errorEl.textContent = "Failed to render QR code";
      qrContainer.appendChild(errorEl);
      return;
    }

    // Editable fields
    if (this.config.showAmountInput) {
      this.addField(
        wrapper,
        "amount",
        this.lang.amount,
        String(this.config.amount ?? "")
      );
    }
    if (this.config.showMessageInput) {
      this.addField(
        wrapper,
        "message",
        this.lang.message,
        this.config.message ?? ""
      );
    }

    // Download button
    if (this.config.showDownload) {
      const actions = document.createElement("div");
      actions.className = "qr-actions";
      const btn = document.createElement("button");
      btn.className = "qr-btn";
      btn.textContent = this.lang.download;
      btn.addEventListener("click", () => {
        downloadPNG(this.currentSVG, this.config.size ?? 200).catch(
          (err: unknown) => {
            console.warn("[QR Platby] Download failed:", err);
          }
        );
      });
      actions.appendChild(btn);
      wrapper.appendChild(actions);
    }

    // Branding
    if (this.config.branding) {
      const footer = document.createElement("div");
      footer.className = "qr-footer";
      const domain =
        typeof window !== "undefined" ? window.location.hostname : "";
      const a = document.createElement("a");
      a.href = `https://qr-platby.com?ref=widget&domain=${encodeURIComponent(domain)}`;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = "Powered by QR Platby";
      footer.appendChild(a);
      wrapper.appendChild(footer);
    }

    this.pingAnalytics();
  }

  private addField(
    parent: HTMLElement,
    name: string,
    label: string,
    value: string
  ): void {
    const field = document.createElement("div");
    field.className = "qr-field";

    const labelEl = document.createElement("label");
    labelEl.className = "qr-label";
    labelEl.textContent = label;
    field.appendChild(labelEl);

    const input = document.createElement("input");
    input.className = "qr-input";
    input.type = name === "amount" ? "number" : "text";
    input.value = value;
    if (name === "amount") {
      input.min = "0.01";
      input.step = "0.01";
    }
    field.appendChild(input);

    const debouncedUpdate = debounce(() => {
      if (name === "amount") {
        const num = Number.parseFloat(input.value);
        if (!Number.isNaN(num) && num > 0) {
          this.update({ amount: num });
        }
      } else {
        this.update({ message: input.value });
      }
    }, 300);

    input.addEventListener("input", debouncedUpdate);
    parent.appendChild(field);
  }

  private encode():
    | (EncoderResult | { error: string })
    | Promise<EncoderResult | { error: string }> {
    const ibanResult = validateIBAN(this.config.iban);
    const cleanIban = ibanResult.clean;

    if (this.config.format === "epc") {
      return encodeEpcQr({
        iban: cleanIban,
        amount: this.config.amount ?? 0,
        beneficiaryName: this.config.recipient ?? "",
        bic: this.config.bic || undefined,
        remittanceText: this.config.message || undefined,
      });
    }

    if (this.config.format === "spayd") {
      return encodeSpaydQr({
        iban: cleanIban,
        amount: this.config.amount ?? 0,
        currency: this.config.currency ?? "CZK",
        variableSymbol: this.config.variableSymbol || undefined,
        specificSymbol: this.config.specificSymbol || undefined,
        constantSymbol: this.config.constantSymbol || undefined,
        recipientName: this.config.recipient || undefined,
        paymentNote: this.config.message || undefined,
        bic: this.config.bic || undefined,
      });
    }

    // PAY by square - async lazy load
    return import("./encoders/bysquare").then(({ encodeBysquareQr }) =>
      encodeBysquareQr({
        iban: cleanIban,
        amount: this.config.amount ?? 0,
        currency: this.config.currency ?? "EUR",
        variableSymbol: this.config.variableSymbol || undefined,
        specificSymbol: this.config.specificSymbol || undefined,
        constantSymbol: this.config.constantSymbol || undefined,
        recipientName: this.config.recipient || undefined,
        paymentNote: this.config.message || undefined,
      })
    );
  }

  private pingAnalytics(): void {
    if (this.hasPinged) {
      return;
    }
    this.hasPinged = true;

    const domain =
      typeof window !== "undefined" ? window.location.hostname : "";
    const url = `https://qr-platby.com/api/v1/widget-ping?format=${this.config.format}&domain=${encodeURIComponent(domain)}&v=1.0.0`;

    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url);
      } else {
        fetch(url, { mode: "no-cors", keepalive: true });
      }
    } catch (err: unknown) {
      console.warn("[QR Platby] Analytics ping failed:", err);
    }
  }

  update(data: Partial<WidgetConfig>): void {
    Object.assign(this.config, data);
    if (data.theme) {
      this.container.setAttribute("data-theme", data.theme);
    }
    this.render();
  }

  destroy(): void {
    clearElement(this.root);
  }

  toDataURL(): string {
    return svgToDataURL(this.currentSVG);
  }

  toSVG(): string {
    return this.currentSVG;
  }
}
