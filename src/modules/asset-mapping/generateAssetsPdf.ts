import jsPDF from "jspdf";
import type { SavedAsset } from "./assetSync";
import { ASSET_TYPES } from "./data/assetTypes";
import { ASSET_SUB_TYPES } from "./data/assetSubtypes";

/**
 * Saved Assets → clean, readable PDF.
 *
 * A straightforward jsPDF layout (default fonts, no glyph embedding) so it is
 * reliable and legible — the point is to hand the full asset list to an AI or
 * work on it elsewhere, so completeness and structure beat ornamentation.
 * Renders in the order given (the "Merge duplicates" pass ranks them
 * most-valuable-first, so the PDF leads with the strongest assets).
 */
export function generateAssetsPdf(assets: SavedAsset[]): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const PAGE_W = 210;
  const PAGE_H = 297;
  const M = 20;
  const CONTENT_W = PAGE_W - M * 2;
  let y = M;

  const ensureSpace = (h: number) => {
    if (y + h > PAGE_H - M) {
      doc.addPage();
      y = M;
    }
  };

  const typeTitle = (id: string) =>
    ASSET_TYPES.find((t) => t.id === id)?.title || id;
  const subTitle = (id?: string) =>
    id ? ASSET_SUB_TYPES.find((s) => s.id === id)?.title || id : "";

  // ── Header ──────────────────────────────────────────────────────────
  doc.setFont("times", "bold");
  doc.setFontSize(22);
  doc.setTextColor(10, 22, 40);
  doc.text("Saved Assets", M, y);
  y += 8.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 130);
  const dateStr = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(`${assets.length} assets · ${dateStr}`, M, y);
  y += 6;

  doc.setDrawColor(205, 195, 170);
  doc.setLineWidth(0.3);
  doc.line(M, y, PAGE_W - M, y);
  y += 8;

  // ── Assets ──────────────────────────────────────────────────────────
  assets.forEach((a, idx) => {
    const t = typeTitle(a.typeId);
    const s = subTitle(a.subTypeId);
    const header = (s ? `${t}  →  ${s}` : t).toUpperCase();

    // Category label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(150, 118, 28);
    const labelLines = doc.splitTextToSize(header, CONTENT_W) as string[];
    ensureSpace(labelLines.length * 3.6 + 2);
    doc.text(labelLines, M, y);
    y += labelLines.length * 3.6 + 1.5;

    // Title
    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.setTextColor(10, 22, 40);
    const titleLines = doc.splitTextToSize(a.title, CONTENT_W) as string[];
    ensureSpace(titleLines.length * 5.2 + 1);
    doc.text(titleLines, M, y);
    y += titleLines.length * 5.2 + 1.5;

    // Description
    if (a.description) {
      doc.setFont("times", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(48, 54, 70);
      const descLines = doc.splitTextToSize(a.description, CONTENT_W) as string[];
      for (const line of descLines) {
        ensureSpace(5);
        doc.text(line, M, y);
        y += 4.9;
      }
    }

    // Separator (not after the last asset)
    y += 4;
    if (idx < assets.length - 1) {
      ensureSpace(4);
      doc.setDrawColor(230, 222, 205);
      doc.setLineWidth(0.2);
      doc.line(M, y, PAGE_W - M, y);
      y += 5;
    }
  });

  doc.save(`saved-assets-${new Date().toISOString().slice(0, 10)}.pdf`);
}
