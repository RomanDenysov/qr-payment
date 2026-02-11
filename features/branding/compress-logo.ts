const MAX_LOGO_SIZE = 64;
const MAX_BASE64_BYTES = 10 * 1024; // 10KB

/**
 * Compresses an image file to a 64x64 PNG base64 string.
 * SVG files are stored as raw SVG text.
 * Returns null if the result exceeds 10KB.
 */
export async function compressLogo(
  file: File
): Promise<{ data: string; isSvg: boolean } | null> {
  if (file.type === "image/svg+xml") {
    const text = await file.text();
    if (new Blob([text]).size > MAX_BASE64_BYTES) {
      return null;
    }
    return { data: text, isSvg: true };
  }

  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const canvas = drawScaled(img);
    const base64 = canvas.toDataURL("image/png");

    if (base64.length > MAX_BASE64_BYTES) {
      return null;
    }
    return { data: base64, isSvg: false };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

function drawScaled(img: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = MAX_LOGO_SIZE;
  canvas.height = MAX_LOGO_SIZE;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas not supported");
  }

  // Fit image within 64x64, centered
  const scale = Math.min(MAX_LOGO_SIZE / img.width, MAX_LOGO_SIZE / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  const x = (MAX_LOGO_SIZE - w) / 2;
  const y = (MAX_LOGO_SIZE - h) / 2;

  ctx.drawImage(img, x, y, w, h);
  return canvas;
}
