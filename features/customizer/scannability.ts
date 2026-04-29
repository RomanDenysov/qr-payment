import jsQR from "jsqr";

export type ScanResult =
  | { ok: true; decoded: string }
  | { ok: false; reason: "decode_failed" | "payload_mismatch" };

const SCAN_SIZE = 480;

function loadDataUrl(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("scannability: image load failed"));
    img.src = src;
  });
}

async function dataUrlToImageData(src: string): Promise<ImageData | null> {
  const img = await loadDataUrl(src);
  const canvas = document.createElement("canvas");
  canvas.width = SCAN_SIZE;
  canvas.height = SCAN_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return null;
  }
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, SCAN_SIZE, SCAN_SIZE);
  ctx.drawImage(img, 0, 0, SCAN_SIZE, SCAN_SIZE);
  return ctx.getImageData(0, 0, SCAN_SIZE, SCAN_SIZE);
}

function canvasToImageData(canvas: HTMLCanvasElement): ImageData | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return null;
  }
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

export async function validateScannability(
  source: HTMLCanvasElement | string,
  expectedPayload: string
): Promise<ScanResult> {
  const imageData =
    typeof source === "string"
      ? await dataUrlToImageData(source)
      : canvasToImageData(source);

  if (!imageData) {
    return { ok: false, reason: "decode_failed" };
  }

  const decoded = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: "dontInvert",
  });

  if (!decoded) {
    return { ok: false, reason: "decode_failed" };
  }

  if (decoded.data !== expectedPayload) {
    return { ok: false, reason: "payload_mismatch" };
  }

  return { ok: true, decoded: decoded.data };
}
