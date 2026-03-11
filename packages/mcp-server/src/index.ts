#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTools } from "./tools.js";

const server = new McpServer({
  name: "qr-platby",
  version: "1.0.0",
});

registerTools(server);

const transport = new StdioServerTransport();

try {
  await server.connect(transport);
} catch (error) {
  console.error(
    "Failed to start MCP server:",
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
}
