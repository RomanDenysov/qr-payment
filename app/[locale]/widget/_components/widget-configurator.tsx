"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { SegmentedControl } from "@/components/ui/segmented-control";

type Format = "paybysquare" | "spayd" | "epc";

interface ConfigState {
  format: Format;
  iban: string;
  amount: string;
  currency: string;
  recipient: string;
  message: string;
  variableSymbol: string;
  theme: "light" | "dark";
  size: string;
  showDownload: boolean;
  showAmountInput: boolean;
  branding: boolean;
}

const DEFAULT_CONFIG: ConfigState = {
  format: "paybysquare",
  iban: "SK3112000000198742637541",
  amount: "25.50",
  currency: "EUR",
  recipient: "Jan Novak",
  message: "",
  variableSymbol: "",
  theme: "light",
  size: "200",
  showDownload: true,
  showAmountInput: false,
  branding: true,
};

const FORMAT_OPTIONS = [
  { value: "paybysquare" as const, label: "PAY by square" },
  { value: "spayd" as const, label: "SPAYD / QR Platba" },
  { value: "epc" as const, label: "EPC QR (SEPA)" },
];

const CURRENCY_OPTIONS = [
  { value: "EUR", label: "EUR" },
  { value: "CZK", label: "CZK" },
];

const THEME_OPTIONS = [
  { value: "light" as const, label: "Light" },
  { value: "dark" as const, label: "Dark" },
];

const AMP_RE = /&/g;
const QUOT_RE = /"/g;
const LT_RE = /</g;
const GT_RE = />/g;

function escapeAttr(str: string): string {
  return str
    .replace(AMP_RE, "&amp;")
    .replace(QUOT_RE, "&quot;")
    .replace(LT_RE, "&lt;")
    .replace(GT_RE, "&gt;");
}

function buildEmbedCode(config: ConfigState): string {
  const attrs: string[] = [];
  attrs.push(`  data-format="${escapeAttr(config.format)}"`);
  attrs.push(`  data-iban="${escapeAttr(config.iban)}"`);
  if (config.amount) {
    attrs.push(`  data-amount="${escapeAttr(config.amount)}"`);
  }
  if (config.currency !== "EUR") {
    attrs.push(`  data-currency="${escapeAttr(config.currency)}"`);
  }
  if (config.recipient) {
    attrs.push(`  data-recipient="${escapeAttr(config.recipient)}"`);
  }
  if (config.message) {
    attrs.push(`  data-message="${escapeAttr(config.message)}"`);
  }
  if (config.variableSymbol) {
    attrs.push(`  data-variable-symbol="${escapeAttr(config.variableSymbol)}"`);
  }
  if (config.theme !== "light") {
    attrs.push(`  data-theme="${escapeAttr(config.theme)}"`);
  }
  if (config.size !== "200") {
    attrs.push(`  data-size="${escapeAttr(config.size)}"`);
  }
  if (!config.showDownload) {
    attrs.push('  data-show-download="false"');
  }
  if (config.showAmountInput) {
    attrs.push('  data-show-amount-input="true"');
  }
  if (!config.branding) {
    attrs.push('  data-branding="false"');
  }

  return `<div class="qr-platby-widget"\n${attrs.join("\n")}>\n</div>\n\n<script src="https://qr-platby.com/widget.js" async></script>`;
}

function buildPreviewHTML(config: ConfigState, origin: string): string {
  const attrs = [
    `data-format="${escapeAttr(config.format)}"`,
    `data-iban="${escapeAttr(config.iban)}"`,
    config.amount ? `data-amount="${escapeAttr(config.amount)}"` : "",
    config.currency !== "EUR"
      ? `data-currency="${escapeAttr(config.currency)}"`
      : "",
    config.recipient ? `data-recipient="${escapeAttr(config.recipient)}"` : "",
    config.message ? `data-message="${escapeAttr(config.message)}"` : "",
    config.variableSymbol
      ? `data-variable-symbol="${escapeAttr(config.variableSymbol)}"`
      : "",
    `data-theme="${escapeAttr(config.theme)}"`,
    `data-size="${escapeAttr(config.size)}"`,
    config.showDownload ? "" : 'data-show-download="false"',
    config.showAmountInput ? 'data-show-amount-input="true"' : "",
    config.branding ? "" : 'data-branding="false"',
  ]
    .filter(Boolean)
    .join(" ");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>body{margin:0;display:flex;justify-content:center;padding:16px;background:${config.theme === "dark" ? "#111827" : "#ffffff"};}</style></head>
<body>
<div class="qr-platby-widget" ${attrs}></div>
<script src="${origin}/widget.js"></script>
</body>
</html>`;
}

export function WidgetConfigurator() {
  const t = useTranslations("Widget");
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const updateConfig = useCallback(
    (key: keyof ConfigState, value: string | boolean) => {
      setConfig((prev) => {
        const next = { ...prev, [key]: value };
        // Auto-adjust currency for format
        if (key === "format") {
          if (value === "spayd") {
            next.currency = "CZK";
          }
          if (value === "epc") {
            next.currency = "EUR";
          }
        }
        return next;
      });
    },
    []
  );

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) {
      return;
    }
    const html = buildPreviewHTML(config, window.location.origin);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    iframe.src = url;
    return () => URL.revokeObjectURL(url);
  }, [config]);

  const embedCode = buildEmbedCode(config);

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Config form */}
      <div className="space-y-4">
        {/* Format */}
        <div className="space-y-1">
          <p className="font-medium text-xs">{t("cfgFormat")}</p>
          <SegmentedControl
            className="w-full"
            onChange={(value) => updateConfig("format", value)}
            options={FORMAT_OPTIONS}
            value={config.format}
          />
        </div>

        {/* IBAN */}
        <div className="space-y-1">
          <label className="font-medium text-xs" htmlFor="cfg-iban">
            IBAN
          </label>
          <input
            className="w-full border bg-background p-2 font-mono text-sm"
            id="cfg-iban"
            onChange={(e) => updateConfig("iban", e.target.value)}
            value={config.iban}
          />
        </div>

        {/* Amount + Currency */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="font-medium text-xs" htmlFor="cfg-amount">
              {t("cfgAmount")}
            </label>
            <input
              className="w-full border bg-background p-2 text-sm"
              id="cfg-amount"
              min="0.01"
              onChange={(e) => updateConfig("amount", e.target.value)}
              step="0.01"
              type="number"
              value={config.amount}
            />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-xs">{t("cfgCurrency")}</p>
            <SegmentedControl
              onChange={(value) => updateConfig("currency", value)}
              options={
                config.format === "epc"
                  ? [{ value: "EUR", label: "EUR" }]
                  : CURRENCY_OPTIONS
              }
              value={config.currency}
            />
          </div>
        </div>

        {/* Recipient */}
        <div className="space-y-1">
          <label className="font-medium text-xs" htmlFor="cfg-recipient">
            {t("cfgRecipient")}
          </label>
          <input
            className="w-full border bg-background p-2 text-sm"
            id="cfg-recipient"
            onChange={(e) => updateConfig("recipient", e.target.value)}
            value={config.recipient}
          />
        </div>

        {/* Variable Symbol */}
        {config.format !== "epc" && (
          <div className="space-y-1">
            <label className="font-medium text-xs" htmlFor="cfg-vs">
              {t("cfgVs")}
            </label>
            <input
              className="w-full border bg-background p-2 text-sm"
              id="cfg-vs"
              onChange={(e) => updateConfig("variableSymbol", e.target.value)}
              value={config.variableSymbol}
            />
          </div>
        )}

        {/* Theme + Size */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <p className="font-medium text-xs">{t("cfgTheme")}</p>
            <SegmentedControl
              onChange={(value) => updateConfig("theme", value)}
              options={THEME_OPTIONS}
              value={config.theme}
            />
          </div>
          <div className="space-y-1">
            <label className="font-medium text-xs" htmlFor="cfg-size">
              {t("cfgSize")}
            </label>
            <input
              className="w-full border bg-background p-2 text-sm"
              id="cfg-size"
              max="500"
              min="150"
              onChange={(e) => updateConfig("size", e.target.value)}
              type="number"
              value={config.size}
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-1.5">
            <input
              checked={config.showDownload}
              onChange={(e) => updateConfig("showDownload", e.target.checked)}
              type="checkbox"
            />
            {t("cfgDownload")}
          </label>
          <label className="flex items-center gap-1.5">
            <input
              checked={config.showAmountInput}
              onChange={(e) =>
                updateConfig("showAmountInput", e.target.checked)
              }
              type="checkbox"
            />
            {t("cfgAmountInput")}
          </label>
          <label className="flex items-center gap-1.5">
            <input
              checked={config.branding}
              onChange={(e) => updateConfig("branding", e.target.checked)}
              type="checkbox"
            />
            {t("cfgBranding")}
          </label>
        </div>
      </div>

      {/* Preview + Embed code */}
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="font-medium text-xs">{t("preview")}</p>
          <div className="border bg-background">
            <iframe
              className="w-full"
              ref={iframeRef}
              sandbox="allow-scripts allow-same-origin"
              style={{
                height: `${Number(config.size) + 140}px`,
                border: "none",
              }}
              title="Widget preview"
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <p className="font-medium text-xs">{t("embedCode")}</p>
            <button
              className="border px-3 py-1 text-xs hover:bg-accent"
              onClick={handleCopy}
              type="button"
            >
              {copied ? t("copied") : t("copy")}
            </button>
          </div>
          <pre className="overflow-x-auto border bg-muted/50 p-3 text-xs">
            <code>{embedCode}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
