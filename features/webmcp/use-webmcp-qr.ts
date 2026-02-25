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

  const { payload, errorCorrectionLevel } = deps.buildQrPayload(
    {
      iban: args.iban as string,
      amount: args.amount as number | undefined,
      variableSymbol: args.variableSymbol as string | undefined,
      specificSymbol: args.specificSymbol as string | undefined,
      constantSymbol: args.constantSymbol as string | undefined,
      recipientName: args.recipientName as string | undefined,
      paymentNote: args.paymentNote as string | undefined,
    },
    cleanIban,
    currencyCode
  );

  const dataUrl = await deps.QRCode.toDataURL(payload, {
    width: 400,
    margin: 2,
    errorCorrectionLevel,
  });

  return mcpResult({
    qrDataUrl: dataUrl,
    iban: cleanIban,
    amount: args.amount ?? null,
    currency,
    format: "PAY by square",
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
          "Generate a PAY by square QR code for Slovak/Czech bank payments. Returns a PNG data URL scannable by any Slovak or Czech banking app.",
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
