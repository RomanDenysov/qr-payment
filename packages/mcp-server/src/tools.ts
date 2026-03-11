import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const API_BASE = "https://qr-platby.com";
const DATA_URI_PREFIX = /^data:image\/png;base64,/;
const IBAN_FORMAT = /^[A-Z]{2}\d{2}[A-Z0-9]{4,30}$/;

const OPTIONAL_FIELDS = [
  "currency",
  "variableSymbol",
  "specificSymbol",
  "constantSymbol",
  "recipientName",
  "paymentNote",
  "paymentFormat",
  "format",
] as const;

const FORMATS_INFO = `## Supported QR Payment Formats

### PAY by square (bysquare)
- **Country**: Slovakia
- **Currency**: EUR
- **IBAN prefix**: SK
- **Features**: Variable symbol (VS), Specific symbol (SS), Constant symbol (KS), recipient name, payment note
- **API parameter**: \`"paymentFormat": "bysquare"\` (default)

### SPAYD / QR Platba (spayd)
- **Country**: Czech Republic
- **Currency**: CZK
- **IBAN prefix**: CZ
- **Features**: Variable symbol (VS), Specific symbol (SS), Constant symbol (KS), recipient name, payment note
- **API parameter**: \`"paymentFormat": "spayd"\`

### EPC QR (European SEPA)
- **Country**: All EU/SEPA countries
- **Currency**: EUR only
- **Features**: BIC/SWIFT, recipient name (required), payment reference
- **Availability**: Web app only (https://qr-platby.com) - NOT available via API
- **Note**: Requires recipient name and supports BIC code

## Format Selection Guide
- Slovak IBAN (SK...) -> Use bysquare with EUR
- Czech IBAN (CZ...) -> Use spayd with CZK
- Other EU IBAN -> EPC QR via web app only`;

function buildRequestBody(
  params: Record<string, unknown>
): Record<string, unknown> {
  const body: Record<string, unknown> = { iban: params.iban };

  for (const field of OPTIONAL_FIELDS) {
    if (params[field]) {
      body[field] = params[field];
    }
  }

  if (params.amount !== undefined) {
    body.amount = params.amount;
  }
  if (params.size !== undefined) {
    body.size = params.size;
  }

  return body;
}

function formatIssues(
  issues: Array<{ path: string; message: string }>
): string {
  return issues.map((i) => `  - ${i.path}: ${i.message}`).join("\n");
}

function getSuggestion(country: string): string {
  switch (country) {
    case "SK":
      return "Country: Slovakia\nRecommended format: bysquare (PAY by square)\nRecommended currency: EUR\nAPI available: Yes";
    case "CZ":
      return "Country: Czech Republic\nRecommended format: spayd (QR Platba)\nRecommended currency: CZK\nAPI available: Yes";
    default:
      return `Country code: ${country}\nRecommended format: EPC QR (European SEPA)\nRecommended currency: EUR\nAPI available: No - use the web app at https://qr-platby.com`;
  }
}

export function registerTools(server: McpServer) {
  server.tool(
    "generate_qr",
    "Generate a payment QR code. Use bysquare for Slovak IBANs (EUR), spayd for Czech IBANs (CZK). Returns a base64 PNG data URI.",
    {
      iban: z
        .string()
        .describe("Recipient IBAN (e.g. SK3112000000198742637541)"),
      amount: z
        .number()
        .min(0.01)
        .max(999_999_999.99)
        .optional()
        .describe("Payment amount"),
      currency: z
        .enum(["EUR", "CZK"])
        .optional()
        .describe("Currency code (default: EUR)"),
      variableSymbol: z
        .string()
        .max(10)
        .optional()
        .describe("Variable symbol, up to 10 digits"),
      specificSymbol: z
        .string()
        .max(10)
        .optional()
        .describe("Specific symbol, up to 10 digits"),
      constantSymbol: z
        .string()
        .max(4)
        .optional()
        .describe("Constant symbol, up to 4 digits"),
      recipientName: z.string().max(70).optional().describe("Recipient name"),
      paymentNote: z.string().max(140).optional().describe("Payment note"),
      paymentFormat: z
        .enum(["bysquare", "spayd"])
        .optional()
        .describe("QR format: bysquare (Slovak) or spayd (Czech)"),
      format: z
        .enum(["png", "svg"])
        .optional()
        .describe("Output format (default: png)"),
      size: z
        .number()
        .int()
        .min(100)
        .max(1000)
        .optional()
        .describe("QR size in pixels (default: 300)"),
    },
    async (params) => {
      const body = buildRequestBody(params);

      let response: Response;
      try {
        response = await fetch(`${API_BASE}/api/v1/qr`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Network error: ${error instanceof Error ? error.message : "Failed to reach API"}`,
            },
          ],
          isError: true,
        };
      }

      // biome-ignore lint/suspicious/noExplicitAny: API response shape is validated below
      let result: any;
      try {
        result = await response.json();
      } catch {
        return {
          content: [
            {
              type: "text" as const,
              text: `API error (HTTP ${response.status}): Invalid response from server`,
            },
          ],
          isError: true,
        };
      }

      if (!result.success) {
        const issuesText = result.error?.issues
          ? `\n${formatIssues(result.error.issues)}`
          : "";
        return {
          content: [
            {
              type: "text" as const,
              text: `Error: ${result.error?.message ?? "Unknown error"}${issuesText}`,
            },
          ],
          isError: true,
        };
      }

      const summary = `QR code generated successfully.\nIBAN: ${result.iban}\nAmount: ${result.amount ?? "not specified"}\nCurrency: ${result.currency}\nFormat: ${result.format}`;

      if (result.format === "svg") {
        return {
          content: [
            { type: "text" as const, text: summary },
            { type: "text" as const, text: result.data },
          ],
        };
      }

      return {
        content: [
          { type: "text" as const, text: summary },
          {
            type: "image" as const,
            data: result.data.replace(DATA_URI_PREFIX, ""),
            mimeType: "image/png",
          },
        ],
      };
    }
  );

  server.tool(
    "get_formats",
    "Get information about supported QR payment formats and when to use each one.",
    {},
    () => ({
      content: [{ type: "text" as const, text: FORMATS_INFO }],
    })
  );

  server.tool(
    "validate_iban",
    "Validate an IBAN format and suggest the best QR payment format based on country code.",
    {
      iban: z.string().describe("IBAN to validate"),
    },
    ({ iban }) => {
      const cleaned = iban.replaceAll(" ", "").toUpperCase();

      if (!IBAN_FORMAT.test(cleaned)) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Invalid IBAN format: "${iban}"\n\nAn IBAN must start with a 2-letter country code, followed by 2 check digits, then up to 30 alphanumeric characters.`,
            },
          ],
          isError: true,
        };
      }

      const country = cleaned.substring(0, 2);
      const suggestion = getSuggestion(country);

      return {
        content: [
          {
            type: "text" as const,
            text: `IBAN: ${cleaned}\nValid format: Yes\n\n${suggestion}`,
          },
        ],
      };
    }
  );
}
