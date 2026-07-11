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
  a?: number;
  vs?: string;
  ss?: string;
  ks?: string;
  n?: string;
  pn?: string;
  b?: string;
  c?: string;
  dd?: string;
  inv?: string;
  rf?: string;
  pc?: string;
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

/** Optional string payment fields -> their compact share-link keys. */
const SHARE_STRING_FIELDS: [keyof PaymentFormData, keyof CompactPayload][] = [
  ["variableSymbol", "vs"],
  ["specificSymbol", "ss"],
  ["constantSymbol", "ks"],
  ["recipientName", "n"],
  ["paymentNote", "pn"],
  ["bic", "b"],
  ["paymentDueDate", "dd"],
  ["invoiceId", "inv"],
  ["spaydReference", "rf"],
  ["purposeCode", "pc"],
];

export function encodeShareData(
  payment: PaymentFormData,
  branding: ShareBranding
): string {
  const compact: CompactPayload = {
    f: payment.format,
    i: payment.iban,
    ...(payment.amount && { a: payment.amount }),
  };

  const compactRecord = compact as unknown as Record<string, string>;
  for (const [src, dest] of SHARE_STRING_FIELDS) {
    const value = payment[src];
    if (typeof value === "string" && value) {
      compactRecord[dest] = value;
    }
  }

  if (payment.currency && payment.currency !== "EUR") {
    compact.c = payment.currency;
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
      (compact.f !== "bysquare" &&
        compact.f !== "epc" &&
        compact.f !== "spayd") ||
      typeof compact.i !== "string" ||
      compact.i.length === 0 ||
      compact.i.length > 34 ||
      (compact.a != null &&
        (typeof compact.a !== "number" ||
          compact.a < 0 ||
          compact.a > 999_999_999.99)) ||
      (compact.c != null && compact.c !== "EUR" && compact.c !== "CZK")
    ) {
      return null;
    }

    return {
      payment: {
        format: compact.f,
        iban: compact.i,
        amount: compact.a ?? 0,
        currency: compact.c ?? "EUR",
        variableSymbol: compact.vs,
        specificSymbol: compact.ss,
        constantSymbol: compact.ks,
        recipientName: compact.n,
        paymentNote: compact.pn,
        bic: compact.b,
        paymentDueDate: compact.dd,
        invoiceId: compact.inv,
        spaydReference: compact.rf,
        purposeCode: compact.pc,
      },
      branding: {
        fgColor: compact.fg ?? DEFAULT_FG,
        bgColor: compact.bg ?? DEFAULT_BG,
        centerText: compact.ct ?? DEFAULT_CENTER_TEXT,
      },
    };
  } catch (error) {
    console.error("[decodeShareData] Failed to decode share link", error, {
      encodedLength: encoded.length,
    });
    return null;
  }
}
