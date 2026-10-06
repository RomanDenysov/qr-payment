// ponytail: photos are scaled down to 2000 px on the long side so jsQR stays
// fast on phones; a tiny QR in a huge scan can get lost, crop it first then.
const MAX_SIDE = 2000;

/** Finds a QR code in an image file and returns the text inside, or null. */
export async function readQrFromImage(file: Blob): Promise<string | null> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("readQrFromImage: no 2d canvas context");
  }
  // Transparent PNGs would read as black on black.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const { default: jsQR } = await import("jsqr");
  const { data } = ctx.getImageData(0, 0, width, height);
  const code = jsQR(data, width, height, { inversionAttempts: "attemptBoth" });
  return code?.data ?? null;
}
