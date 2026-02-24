import type { PaymentFormData } from "./schema";

interface ShareBranding {
  fgColor: string;
  bgColor: string;
  centerText: string;
}

export interface SharePayload {
  payment: PaymentFormData;
  branding: ShareBranding;
}

interface CompactPayload {
  f: string;
  i: string;
  a: number;
  vs?: string;
  ss?: string;
  ks?: string;
  n?: string;
  pn?: string;
  b?: string;
  fg?: string;
  bg?: string;
  ct?: string;
}

const DEFAULT_FG = "#000000";
const DEFAULT_BG = "#ffffff";
const DEFAULT_CENTER_TEXT = "Naskenujte\nbankovou\naplikáciou";

const PLUS_RE = /\+/g;
const SLASH_RE = /\//g;
const TRAILING_EQ_RE = /=+$/;
const DASH_RE = /-/g;
const UNDERSCORE_RE = /_/g;

function toBase64Url(str: string): string {
  return btoa(str)
    .replace(PLUS_RE, "-")
    .replace(SLASH_RE, "_")
    .replace(TRAILING_EQ_RE, "");
}

function fromBase64Url(str: string): string {
  const padded = str.replace(DASH_RE, "+").replace(UNDERSCORE_RE, "/");
  const pad = padded.length % 4;
  return atob(pad ? padded + "=".repeat(4 - pad) : padded);
}

export function encodeShareData(
  payment: PaymentFormData,
  branding: ShareBranding
): string {
  const compact: CompactPayload = {
    f: payment.format,
    i: payment.iban,
    a: payment.amount,
  };

  if (payment.variableSymbol) {
    compact.vs = payment.variableSymbol;
  }
  if (payment.specificSymbol) {
    compact.ss = payment.specificSymbol;
  }
  if (payment.constantSymbol) {
    compact.ks = payment.constantSymbol;
  }
  if (payment.recipientName) {
    compact.n = payment.recipientName;
  }
  if (payment.paymentNote) {
    compact.pn = payment.paymentNote;
  }
  if (payment.bic) {
    compact.b = payment.bic;
  }

  if (branding.fgColor !== DEFAULT_FG) {
    compact.fg = branding.fgColor;
  }
  if (branding.bgColor !== DEFAULT_BG) {
    compact.bg = branding.bgColor;
  }
  if (branding.centerText !== DEFAULT_CENTER_TEXT) {
    compact.ct = branding.centerText;
  }

  const json = JSON.stringify(compact);
  const bytes = new TextEncoder().encode(json);
  const binary = String.fromCharCode(...bytes);
  return toBase64Url(binary);
}

export function decodeShareData(encoded: string): SharePayload | null {
  try {
    const binary = fromBase64Url(encoded);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    const compact: CompactPayload = JSON.parse(json);

    if (
      typeof compact.f !== "string" ||
      (compact.f !== "bysquare" && compact.f !== "epc") ||
      typeof compact.i !== "string" ||
      compact.i.length === 0 ||
      compact.i.length > 34 ||
      typeof compact.a !== "number" ||
      compact.a < 0 ||
      compact.a > 999_999_999.99
    ) {
      return null;
    }

    return {
      payment: {
        format: compact.f,
        iban: compact.i,
        amount: compact.a,
        variableSymbol: compact.vs,
        specificSymbol: compact.ss,
        constantSymbol: compact.ks,
        recipientName: compact.n,
        paymentNote: compact.pn,
        bic: compact.b,
      },
      branding: {
        fgColor: compact.fg ?? DEFAULT_FG,
        bgColor: compact.bg ?? DEFAULT_BG,
        centerText: compact.ct ?? DEFAULT_CENTER_TEXT,
      },
    };
  } catch {
    return null;
  }
}
