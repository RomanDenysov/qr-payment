/**
 * Calculate relative luminance of a hex color (WCAG 2.1 formula)
 */
function getLuminance(hex: string): number {
  const rgb = [
    Number.parseInt(hex.slice(1, 3), 16) / 255,
    Number.parseInt(hex.slice(3, 5), 16) / 255,
    Number.parseInt(hex.slice(5, 7), 16) / 255,
  ].map((c) => (c <= 0.039_28 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));

  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

/**
 * Calculate WCAG contrast ratio between two hex colors
 * Returns ratio like 4.5 (minimum for AA) or 7.0 (AAA)
 */
export function getContrastRatio(
  foreground: string,
  background: string
): number {
  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standard (4.5:1)
 */
export function hasValidContrast(
  foreground: string,
  background: string
): boolean {
  return getContrastRatio(foreground, background) >= 4.5;
}

const MAX_LOGO_SIZE = 100;
const MAX_FILE_SIZE = 500 * 1024; // 500KB

export type ImageResizeResult =
  | { success: true; data: string }
  | { success: false; error: string };

/**
 * Resize image to max dimensions and convert to base64
 */
export function resizeImage(file: File): Promise<ImageResizeResult> {
  if (file.size > MAX_FILE_SIZE) {
    return Promise.resolve({
      success: false,
      error: "Súbor je príliš veľký (max 500KB)",
    });
  }

  const validTypes = ["image/png", "image/jpeg", "image/svg+xml"];
  if (!validTypes.includes(file.type)) {
    return Promise.resolve({
      success: false,
      error: "Nepodporovaný formát (PNG, JPG, SVG)",
    });
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        if (width > MAX_LOGO_SIZE || height > MAX_LOGO_SIZE) {
          const ratio = Math.min(MAX_LOGO_SIZE / width, MAX_LOGO_SIZE / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve({ success: true, data: canvas.toDataURL("image/png") });
        } else {
          resolve({ success: false, error: "Nepodarilo sa spracovať obrázok" });
        }
      };
      img.onerror = () =>
        resolve({ success: false, error: "Neplatný obrázok" });
      img.src = e.target?.result as string;
    };
    reader.onerror = () =>
      resolve({ success: false, error: "Nepodarilo sa načítať súbor" });
    reader.readAsDataURL(file);
  });
}
