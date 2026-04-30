"use client";

import type { CurrencyCode } from "bysquare";
import { useEffect } from "react";

const TOOL_NAME = "generate_pay_by_square_qr";

function mcpError(message: string) {
  return {
    content: [
      { type: "text" as const, text: JSON.stringify({ error: message }) },
    ],
    isError: true,
  };
}

function mcpResult(data: Record<string, unknown>) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data) }],
  };
}

function buildColorOption(
  dark: string | undefined,
  light: string | undefined
): { dark?: string; light?: string } | undefined {
  if (!(dark || light)) {
    return;
  }
  return {
    ...(dark && { dark }),
    ...(light && { light }),
  };
}

interface ToolDeps {
  electronicFormatIBAN: (iban: string) => string | null;
  isValidIBAN: (iban: string) => boolean;
  buildQrPayload: typeof import("@/features/payment/qr-payload").buildQrPayload;
  currencyMap: Record<string, CurrencyCode>;
  defaultCurrency: CurrencyCode;
  QRCode: typeof import("qrcode");
}

async function executeGenerateQr(
  args: Record<string, unknown>,
  deps: ToolDeps
) {
  const cleanIban = deps.electronicFormatIBAN(args.iban as string);
  if (!(cleanIban && deps.isValidIBAN(cleanIban))) {
    return mcpError(`Invalid IBAN: ${args.iban}`);
  }

  const currency = (args.currency as string) || "EUR";
  const currencyCode = deps.currencyMap[currency] ?? deps.defaultCurrency;

  const formatInput = args.format as string | undefined;
  const format =
    formatInput === "spayd" ||
    formatInput === "bysquare" ||
    formatInput === "epc"
      ? formatInput
      : "bysquare";

  if (format === "epc") {
    if (currency !== "EUR") {
      return mcpError("EPC format only supports EUR currency");
    }
    if (!(args.recipientName as string)?.trim()) {
      return mcpError("EPC format requires recipientName");
    }
    for (const field of [
      "variableSymbol",
      "specificSymbol",
      "constantSymbol",
    ]) {
      if (args[field]) {
        return mcpError(`EPC format does not support ${field}`);
      }
    }
  }

  const { payload, errorCorrectionLevel: derivedEcc } = deps.buildQrPayload(
    {
      format,
      iban: args.iban as string,
      amount: args.amount as number | undefined,
      variableSymbol: args.variableSymbol as string | undefined,
      specificSymbol: args.specificSymbol as string | undefined,
      constantSymbol: args.constantSymbol as string | undefined,
      recipientName: args.recipientName as string | undefined,
      paymentNote: args.paymentNote as string | undefined,
      bic: args.bic as string | undefined,
    },
    cleanIban,
    currencyCode
  );

  const eccOverride = args.errorCorrectionLevel as
    | "L"
    | "M"
    | "Q"
    | "H"
    | undefined;
  const margin = (args.margin as number | undefined) ?? 2;
  const color = buildColorOption(
    args.darkColor as string | undefined,
    args.lightColor as string | undefined
  );

  const dataUrl = await deps.QRCode.toDataURL(payload, {
    width: 400,
    margin,
    errorCorrectionLevel: eccOverride ?? derivedEcc,
    ...(color && { color }),
  });

  return mcpResult({
    qrDataUrl: dataUrl,
    iban: cleanIban,
    amount: args.amount ?? null,
    currency,
    format:
      format === "spayd"
        ? "SPAYD"
        : format === "epc"
          ? "EPC QR"
          : "PAY by square",
  });
}

export function useWebMcpQr() {
  useEffect(() => {
    let unregister: (() => void) | undefined;

    async function register() {
      if (!navigator.modelContext) {
        return;
      }

      await import("@mcp-b/global");

      if (!navigator.modelContext) {
        return;
      }

      const { electronicFormatIBAN, isValidIBAN } = await import("ibantools");
      const { buildQrPayload } = await import("@/features/payment/qr-payload");
      const { CurrencyCode } = await import("bysquare");
      const QRCode = (await import("qrcode")).default;

      const deps: ToolDeps = {
        electronicFormatIBAN,
        isValidIBAN,
        buildQrPayload,
        currencyMap: { EUR: CurrencyCode.EUR, CZK: CurrencyCode.CZK },
        defaultCurrency: CurrencyCode.EUR,
        QRCode,
      };

      const result = navigator.modelContext.registerTool({
        name: TOOL_NAME,
        description:
          "Generate a PAY by square, SPAYD, or EPC QR code for bank payments. Returns a PNG data URL scannable by banking apps.",
        inputSchema: {
          type: "object",
          properties: {
            iban: {
              type: "string",
              description:
                "IBAN bank account number (e.g. SK3112000000198742637541)",
            },
            amount: {
              type: "number",
              description: "Payment amount (0.01 - 999999999.99)",
            },
            currency: {
              type: "string",
              enum: ["EUR", "CZK"],
              description: "Currency code. Default: EUR",
            },
            format: {
              type: "string",
              enum: ["bysquare", "spayd", "epc"],
              description:
                "Payment format. 'bysquare' for Slovak banks, 'spayd' for Czech banks, 'epc' for EU SEPA. Default: bysquare",
            },
            variableSymbol: {
              type: "string",
              description: "Variable symbol (up to 10 digits)",
            },
            specificSymbol: {
              type: "string",
              description: "Specific symbol (up to 10 digits)",
            },
            constantSymbol: {
              type: "string",
              description: "Constant symbol (up to 4 digits)",
            },
            recipientName: {
              type: "string",
              description: "Recipient name (max 70 characters)",
            },
            paymentNote: {
              type: "string",
              description: "Payment note / reference (max 140 characters)",
            },
            bic: {
              type: "string",
              description: "BIC/SWIFT code",
            },
            darkColor: {
              type: "string",
              description:
                "Foreground hex color #RRGGBB or #RRGGBBAA (default: #000000)",
            },
            lightColor: {
              type: "string",
              description:
                "Background hex color #RRGGBB or #RRGGBBAA (default: #ffffff; use #FFFFFF00 for transparent)",
            },
            margin: {
              type: "number",
              description: "Quiet zone width in QR modules, 0-10 (default: 2)",
            },
            errorCorrectionLevel: {
              type: "string",
              enum: ["L", "M", "Q", "H"],
              description:
                "Override auto-derived ECC: L=7%, M=15%, Q=25%, H=30% recovery",
            },
          },
          required: ["iban"],
        } as const,
        execute: async (args) => {
          try {
            return await executeGenerateQr(args, deps);
          } catch (error) {
            return mcpError(
              error instanceof Error ? error.message : "QR generation failed"
            );
          }
        },
      });

      const handle = result as unknown as
        | { unregister: () => void }
        | undefined;
      if (handle?.unregister) {
        unregister = handle.unregister;
      }
    }

    // WebMCP not available in most browsers — ignore silently
    register().catch(() => undefined);

    return () => {
      if (unregister) {
        unregister();
      } else {
        navigator.modelContext?.unregisterTool(TOOL_NAME);
      }
    };
  }, []);
}
