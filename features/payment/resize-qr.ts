import { loadImage } from "./qr-shared";

async function resizeOntoCanvas(
  dataUrl: string,
  targetWidth: number
): Promise<HTMLCanvasElement | null> {
  const img = await loadImage(dataUrl);
  if (img.width === targetWidth) {
    return null;
  }

  const aspect = img.height / img.width;
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = Math.round(targetWidth * aspect);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas not supported");
  }

  // Disable smoothing on upscale so QR module edges stay scannable;
  // enable high-quality smoothing on downscale to avoid moire.
  const isUpscale = targetWidth > img.width;
  ctx.imageSmoothingEnabled = !isUpscale;
  if (!isUpscale) {
    ctx.imageSmoothingQuality = "high";
  }
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export async function resizePngDataUrl(
  dataUrl: string,
  targetWidth: number
): Promise<string> {
  const canvas = await resizeOntoCanvas(dataUrl, targetWidth);
  return canvas ? canvas.toDataURL("image/png") : dataUrl;
}

export async function resizePngToBlob(
  dataUrl: string,
  targetWidth: number
): Promise<Blob> {
  const canvas = await resizeOntoCanvas(dataUrl, targetWidth);
  if (canvas) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) =>
          blob ? resolve(blob) : reject(new Error("Failed to encode QR PNG")),
        "image/png"
      );
    });
  }
  const response = await fetch(dataUrl);
  return response.blob();
}
