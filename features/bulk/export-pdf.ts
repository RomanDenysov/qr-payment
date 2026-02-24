import { maskIban } from "@/lib/utils";
import type { GeneratedQR } from "./bulk-generator";

const COLS = 2;
const ROWS = 3;
const PER_PAGE = COLS * ROWS;

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 15;
const CELL_W = (PAGE_W - MARGIN * 2) / COLS;
const CELL_H = (PAGE_H - MARGIN * 2) / ROWS;
const QR_SIZE = Math.min(CELL_W, CELL_H) * 0.65;
const FONT_SIZE = 9;

export async function exportPdf(items: GeneratedQR[]): Promise<void> {
  let jsPDF: typeof import("jspdf").jsPDF;
  try {
    const mod = await import("jspdf");
    jsPDF = mod.jsPDF;
  } catch (error) {
    console.error("[ExportPdf] Failed to load jsPDF library:", error);
    throw new Error("Failed to load PDF library");
  }

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  for (const [index, item] of items.entries()) {
    if (index > 0 && index % PER_PAGE === 0) {
      doc.addPage();
    }

    const pageIndex = index % PER_PAGE;
    const col = pageIndex % COLS;
    const row = Math.floor(pageIndex / COLS);

    const cellX = MARGIN + col * CELL_W;
    const cellY = MARGIN + row * CELL_H;

    const qrX = cellX + (CELL_W - QR_SIZE) / 2;
    const qrY = cellY + 4;

    doc.addImage(item.dataUrl, "PNG", qrX, qrY, QR_SIZE, QR_SIZE);

    doc.setFontSize(FONT_SIZE);
    doc.setFont("helvetica", "normal");

    const labelY = qrY + QR_SIZE + 5;
    const centerX = cellX + CELL_W / 2;

    doc.text(maskIban(item.iban), centerX, labelY, { align: "center" });
    doc.text(`${item.amount.toFixed(2)} EUR`, centerX, labelY + 5, {
      align: "center",
    });
  }

  doc.save("qr-platby.pdf");
}
