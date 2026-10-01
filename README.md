## QR Platby

Free online generator of payment QR codes: PAY by square (Slovakia), SPAYD / QR Platba (Czechia) and EPC QR (SEPA). Live at [qr-platby.com](https://qr-platby.com).

Enter the IBAN, recipient name, amount and symbols, and the site produces a QR code that banking apps scan to fill in a payment order. No registration, no fees.

- Per-format optional fields: due date, invoice number, BIC, SPAYD reference and instant payment, SEPA purpose code.
- QR customizer and studio (colors, gradients, logo, frame), bulk generation from CSV, share links.
- Public REST API at `/api/v1/qr` with an OpenAPI spec, plus an MCP server in `packages/mcp-server`.
- Slovak, Czech and English.

Payment data entered in the web app stays in the browser: history lives in localStorage and share links carry the payment in the URL fragment. The REST API processes requests on the server and stores nothing.

It is a hobby project. Development notes are in [CLAUDE.md](CLAUDE.md).

```bash
bun install
bun dev
```
