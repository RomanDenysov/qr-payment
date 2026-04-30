function loadDataUrlImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load QR image"));
    img.src = dataUrl;
  });
}

export async function resizePngDataUrl(
  dataUrl: string,
  targetWidth: number
): Promise<string> {
  const img = await loadDataUrlImage(dataUrl);
  if (img.width === targetWidth) {
    return dataUrl;
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
  return canvas.toDataURL("image/png");
}
