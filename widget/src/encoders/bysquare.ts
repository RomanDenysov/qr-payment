import type { EncoderResult } from "../types";

type BysquareModule = typeof import("bysquare");

let cachedModule: BysquareModule | null = null;
let loadPromise: Promise<BysquareModule> | null = null;

function getScriptBase(): string {
  const scripts = document.querySelectorAll("script[src]");
  for (const script of scripts) {
    const src = (script as HTMLScriptElement).src;
    if (src.includes("widget")) {
      return src.substring(0, src.lastIndexOf("/") + 1);
    }
  }
  return "";
}

function loadBysquareChunk(): Promise<BysquareModule> {
  if (cachedModule) {
    return Promise.resolve(cachedModule);
  }
  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise<BysquareModule>((resolve, reject) => {
    const script = document.createElement("script");
    const base = getScriptBase();
    script.src = `${base}widget-bysquare.js`;
    script.onload = () => {
      const mod = (window as unknown as Record<string, unknown>)
        .__qrPlatbyBysquare as BysquareModule | undefined;
      if (mod) {
        cachedModule = mod;
        resolve(mod);
      } else {
        loadPromise = null;
        reject(new Error("Failed to load PAY by square module"));
      }
    };
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Failed to load PAY by square module"));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}

interface BysquareInput {
  iban: string;
  amount: number;
  currency?: string;
  variableSymbol?: string;
  specificSymbol?: string;
  constantSymbol?: string;
  recipientName?: string;
  paymentNote?: string;
}

export async function encodeBysquareQr(
  input: BysquareInput
): Promise<EncoderResult | { error: string }> {
  let mod: BysquareModule;
  try {
    mod = await loadBysquareChunk();
  } catch {
    return {
      error: "Failed to load PAY by square encoder.",
    };
  }

  const currencyCode =
    input.currency === "CZK" ? mod.CurrencyCode.CZK : mod.CurrencyCode.EUR;

  const payment: Parameters<typeof mod.encode>[0]["payments"][0] = {
    type: mod.PaymentOptions.PaymentOrder,
    amount: input.amount ?? 0,
    currencyCode,
    bankAccounts: [{ iban: input.iban }],
    ...(input.variableSymbol && { variableSymbol: input.variableSymbol }),
    ...(input.specificSymbol && { specificSymbol: input.specificSymbol }),
    ...(input.constantSymbol && { constantSymbol: input.constantSymbol }),
    ...(input.paymentNote && { paymentNote: input.paymentNote }),
    ...(input.recipientName && { beneficiary: { name: input.recipientName } }),
  };

  try {
    const payload = mod.encode({ payments: [payment] });
    return { payload, errorCorrectionLevel: "H" };
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : "PAY by square encoding failed",
    };
  }
}
