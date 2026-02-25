"use client";

import { useWebMcpQr } from "./use-webmcp-qr";

export function WebMcpProvider() {
  useWebMcpQr();
  return null;
}
