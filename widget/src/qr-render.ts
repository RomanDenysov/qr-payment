import qrcode from "qrcode-generator";

type ECLevel = "L" | "M" | "Q" | "H";

const EC_MAP: Record<ECLevel, 0 | 1 | 2 | 3> = {
  L: 1,
  M: 0,
  Q: 3,
  H: 2,
};

export function generateSVG(
  data: string,
  size: number,
  ecLevel: ECLevel = "M",
  fgColor = "#000000",
  bgColor = "#FFFFFF"
): string {
  const qr = qrcode(0, EC_MAP[ecLevel]);
  qr.addData(data);
  qr.make();

  const modules = qr.getModuleCount();
  const cellSize = size / modules;

  const rects: string[] = [];
  for (let row = 0; row < modules; row++) {
    for (let col = 0; col < modules; col++) {
      if (qr.isDark(row, col)) {
        rects.push(
          `<rect x="${col * cellSize}" y="${row * cellSize}" width="${cellSize}" height="${cellSize}" fill="${fgColor}"/>`
        );
      }
    }
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="crispEdges">`,
    `<rect width="${size}" height="${size}" fill="${bgColor}"/>`,
    ...rects,
    "</svg>",
  ].join("");
}

export function svgToDataURL(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function svgToPNGDataURL(svg: string, size: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size * 2;
      canvas.height = size * 2;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context unavailable"));
        return;
      }
      ctx.drawImage(img, 0, 0, size * 2, size * 2);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("Failed to render SVG to PNG"));
    img.src = svgToDataURL(svg);
  });
}

export async function downloadPNG(
  svg: string,
  size: number,
  filename = "qr-payment.png"
): Promise<void> {
  const dataUrl = await svgToPNGDataURL(svg, size);
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}
