/**
 * Build script for the embeddable QR payment widget.
 * Produces:
 *   - public/widget.js (main IIFE bundle, <30KB gz)
 *   - public/widget-bysquare.js (lazy-loaded PAY by square chunk)
 */

/* biome-ignore lint/correctness/noUndeclaredVariables: Bun runtime global */
const b = Bun;

async function buildMain() {
  const result = await b.build({
    entrypoints: ["./widget/src/index.ts"],
    outdir: "./public",
    naming: "widget.js",
    minify: true,
    sourcemap: "linked",
    target: "browser",
    format: "iife",
    external: ["./encoders/bysquare"],
  });

  if (!result.success) {
    console.error("Main widget build failed:");
    for (const log of result.logs) {
      console.error(log);
    }
    process.exit(1);
  }

  const file = b.file("./public/widget.js");
  const size = file.size;
  const content = await file.arrayBuffer();
  const compressed = b.gzipSync(new Uint8Array(content));
  console.log(
    `widget.js: ${(size / 1024).toFixed(1)} KB (${(compressed.length / 1024).toFixed(1)} KB gzipped)`
  );
}

async function buildBysquareChunk() {
  const wrapperCode = `
    import { encode, PaymentOptions, CurrencyCode } from "bysquare";
    window.__qrPlatbyBysquare = { encode, PaymentOptions, CurrencyCode };
  `;

  await b.write("./widget/src/_bysquare-chunk.ts", wrapperCode);

  const result = await b.build({
    entrypoints: ["./widget/src/_bysquare-chunk.ts"],
    outdir: "./public",
    naming: "widget-bysquare.js",
    minify: true,
    sourcemap: "linked",
    target: "browser",
    format: "iife",
  });

  // Clean up temp file
  const { unlink } = await import("node:fs/promises");
  await unlink("./widget/src/_bysquare-chunk.ts").catch(() => {
    // Ignore cleanup errors
  });

  if (!result.success) {
    console.error("Bysquare chunk build failed:");
    for (const log of result.logs) {
      console.error(log);
    }
    process.exit(1);
  }

  const file = b.file("./public/widget-bysquare.js");
  const size = file.size;
  const content = await file.arrayBuffer();
  const compressed = b.gzipSync(new Uint8Array(content));
  console.log(
    `widget-bysquare.js: ${(size / 1024).toFixed(1)} KB (${(compressed.length / 1024).toFixed(1)} KB gzipped)`
  );
}

console.log("Building widget...");
await buildMain();
await buildBysquareChunk();
console.log("Done!");
