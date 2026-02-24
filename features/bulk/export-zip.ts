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

  const blob = await downloadZip(files).blob();
  const url = URL.createObjectURL(blob);

  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = "qr-platby.zip";
    a.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}
