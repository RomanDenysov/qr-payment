# QR Platby MCP Server

MCP server for [QR Platby](https://qr-platby.com) - generate payment QR codes for Slovak and Czech banks directly from Claude Desktop.

## Tools

- **generate_qr** - Generate a payment QR code (PAY by square or SPAYD format)
- **get_formats** - Get info about supported QR payment formats
- **validate_iban** - Validate an IBAN and get the recommended QR format

## Prerequisites

- Bun (or Node.js 18+)

## Setup

```bash
# Clone the repository
git clone https://github.com/RomanDenysov/qr-payment.git
cd qr-payment/packages/mcp-server

# Install dependencies
bun install

# Build
bun run build
```

## Claude Desktop Configuration

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "qr-platby": {
      "command": "bun",
      "args": ["/absolute/path/to/qr-payment/packages/mcp-server/dist/index.js"]
    }
  }
}
```

On macOS, the config file is at `~/Library/Application Support/Claude/claude_desktop_config.json`.

## Usage Examples

Once configured, you can ask Claude:

- "Generate a QR code for 25 EUR to SK3112000000198742637541"
- "Create a Czech SPAYD QR for 500 CZK to CZ6508000000192000145399 with VS 1234567890"
- "What QR payment formats are supported?"
- "Validate this IBAN: SK3112000000198742637541"
