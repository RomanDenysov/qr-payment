import type { GeneratedQR } from "./bulk-generator";

const MIME_RE = /:(.*?);/;

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(MIME_RE)?.[1] ?? "image/png";
  const bytes = atob(base64);
  const buffer = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    buffer[i] = bytes.charCodeAt(i);
  }
  return new Blob([buffer], { type: mime });
}

export async function exportZip(items: GeneratedQR[]): Promise<void> {
  const { downloadZip } = await import("client-zip");

  const files = items.map((item) => ({
    name: item.filename,
    input: dataUrlToBlob(item.dataUrl),
  }));

  let blob: Blob;
  try {
    blob = await downloadZip(files).blob();
  } catch (error) {
    console.error("[ExportZip] Failed to create ZIP:", error);
    throw new Error("Failed to create ZIP file");
  }

  let url: string;
  try {
    url = URL.createObjectURL(blob);
  } catch (error) {
    console.error("[ExportZip] Failed to create object URL:", error);
    throw new Error("Failed to create download link");
  }

  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = "qr-platby.zip";
    a.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}
