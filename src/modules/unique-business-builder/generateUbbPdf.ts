/**
 * Unique Business Dossier — PDF generator.
 *
 * Day 62 (Sasha 2026-05-05): downloadable companion to the on-screen
 * /ubb/dossier page. Walks all 19 artifacts at their latest-locked
 * versions (falling back to draft `latest` for unlocked-but-drafted
 * artifacts, and showing "Gap — not yet locked" for genuinely empty
 * slots) and renders them grouped by phase into a portable artifact.
 *
 * Visual register: identical editorial cream/gold pattern as the Top
 * Talent PDF (src/modules/zone-of-genius/generateZogPdf.ts) — same
 * geometry, same color tokens, same font-loading pattern, same
 * PdfBuilder primitives (ornament, eyebrow, title, body, cardBody,
 * bulletCard, numberedCard, etc.). The two PDFs deliberately read as
 * one body of work in print so a founder who downloads both ends up
 * with a coherent archive.
 *
 * NOT extracted into a shared lib (yet): a future refactor can lift
 * PdfBuilder + color tokens + font loader into `src/lib/pdf/` once a
 * third PDF surface justifies the extraction. Until then the small
 * duplication is preferable to a Medium-risk refactor of the talent
 * PDF (which is on the production hot path).
 *
 * Section list (mirrors DossierScreen.tsx phase grouping):
 *   1. Hero (title, locked count, avg specificity)
 *   2. Canvas (uniqueness, myth, tribe, pain, promise, lead_magnet,
 *              value_ladder, specificity_matrix)
 *   3. Session Bridge (session_bridge)
 *   4. Marketing (core_belief, packaging, frictionless_purchase)
 *   5. Distribution (reach, delivery, spread)
 *   6. Communications (surface_inventory, tuning_fork, golden_dm)
 *   7. Publication (landing_page)
 *
 * Page size: A4. Filename: unique-business-dossier.pdf.
 */

import jsPDF from "jspdf";
import {
    ALL_ARTIFACT_KEYS,
    PHASE_A_CANVAS,
    PHASE_B_SESSION,
    PHASE_C_MARKET,
    PHASE_D_PUBLICATION,
    COMPOUND_GROUPING,
    type ArtifactKey,
    type ArtifactState,
    type VersionRow,
} from "./types";
import { ARTIFACT_LABELS } from "./constants";

// ─────────────────────────────────────────────────────────────────────
// Page geometry — A4 (mm). Identical to generateZogPdf.ts.
// ─────────────────────────────────────────────────────────────────────

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 22;
const CONTENT_W = PAGE_W - MARGIN * 2;
const FOOTER_Y = PAGE_H - 12;
const SECTION_GAP = 9;

// ─────────────────────────────────────────────────────────────────────
// Color tokens — cream/gold editorial register, RGB triples for jsPDF.
// Matched to generateZogPdf.ts so the two PDFs share the same palette.
// ─────────────────────────────────────────────────────────────────────

const C = {
    cream:        [251, 247, 238] as [number, number, number],
    cardCream:    [253, 250, 242] as [number, number, number],
    ink:          [10, 22, 40]    as [number, number, number],
    inkBody:      [40, 50, 70]    as [number, number, number],
    muted:        [120, 125, 140] as [number, number, number],
    gold:         [184, 134, 11]  as [number, number, number],
    goldFill:     [251, 243, 219] as [number, number, number],
    goldDeep:     [93, 67, 7]     as [number, number, number],
    goldHairline: [212, 175, 55]  as [number, number, number],
    gapAmber:     [184, 134, 11]  as [number, number, number],
};

// ─────────────────────────────────────────────────────────────────────
// Font loading — graceful fallback to Times if TTFs aren't bundled.
// Identical pattern to generateZogPdf.ts.
// ─────────────────────────────────────────────────────────────────────

interface FontMap {
    serif: string;
    body: string;
}

const TIMES: FontMap = { serif: "times", body: "times" };

async function tryLoadFont(url: string): Promise<string | null> {
    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        const buf = await res.arrayBuffer();
        const bytes = new Uint8Array(buf);
        let binary = "";
        const chunk = 0x8000;
        for (let i = 0; i < bytes.length; i += chunk) {
            binary += String.fromCharCode.apply(
                null,
                Array.from(bytes.subarray(i, i + chunk)),
            );
        }
        return btoa(binary);
    } catch {
        return null;
    }
}

async function setupFonts(doc: jsPDF): Promise<FontMap> {
    const fonts: FontMap = { ...TIMES };
    const cormorant = await tryLoadFont("/fonts/CormorantGaramond-Regular.ttf");
    const cormorantBold = await tryLoadFont("/fonts/CormorantGaramond-Bold.ttf");
    if (cormorant) {
        doc.addFileToVFS("CormorantGaramond-Regular.ttf", cormorant);
        doc.addFont("CormorantGaramond-Regular.ttf", "Cormorant", "normal");
        if (cormorantBold) {
            doc.addFileToVFS("CormorantGaramond-Bold.ttf", cormorantBold);
            doc.addFont("CormorantGaramond-Bold.ttf", "Cormorant", "bold");
        }
        fonts.serif = "Cormorant";
    }
    const sourceSerif = await tryLoadFont("/fonts/SourceSerif4-Regular.ttf");
    const sourceSerifItalic = await tryLoadFont("/fonts/SourceSerif4-Italic.ttf");
    const sourceSerifBold = await tryLoadFont("/fonts/SourceSerif4-Bold.ttf");
    if (sourceSerif) {
        doc.addFileToVFS("SourceSerif4-Regular.ttf", sourceSerif);
        doc.addFont("SourceSerif4-Regular.ttf", "SourceSerif", "normal");
        if (sourceSerifItalic) {
            doc.addFileToVFS("SourceSerif4-Italic.ttf", sourceSerifItalic);
            doc.addFont("SourceSerif4-Italic.ttf", "SourceSerif", "italic");
        }
        if (sourceSerifBold) {
            doc.addFileToVFS("SourceSerif4-Bold.ttf", sourceSerifBold);
            doc.addFont("SourceSerif4-Bold.ttf", "SourceSerif", "bold");
        }
        fonts.body = "SourceSerif";
    }
    return fonts;
}

// ─────────────────────────────────────────────────────────────────────
// PdfBuilder — same primitives as generateZogPdf.ts. Kept in-sync by
// hand for now; future shared lib will dedupe.
// ─────────────────────────────────────────────────────────────────────

class PdfBuilder {
    doc: jsPDF;
    y: number;
    fonts: FontMap;

    constructor(doc: jsPDF, fonts: FontMap) {
        this.doc = doc;
        this.fonts = fonts;
        this.y = MARGIN;
        this.paintPageBg();
    }

    paintPageBg() {
        this.doc.setFillColor(...C.cream);
        this.doc.rect(0, 0, PAGE_W, PAGE_H, "F");
    }

    newPage() {
        this.doc.addPage();
        this.y = MARGIN;
        this.paintPageBg();
    }

    ensureSpace(needed: number) {
        if (this.y + needed > FOOTER_Y - 4) {
            this.newPage();
        }
    }

    ornament(centerX: number = PAGE_W / 2) {
        this.ensureSpace(8);
        const half = 22;
        const gapHalf = 4;
        const dotR = 0.8;
        this.doc.setDrawColor(...C.goldHairline);
        this.doc.setLineWidth(0.3);
        this.doc.line(centerX - half, this.y, centerX - gapHalf, this.y);
        this.doc.line(centerX + gapHalf, this.y, centerX + half, this.y);
        this.doc.setFillColor(...C.gold);
        this.doc.circle(centerX, this.y, dotR, "F");
        this.y += 6;
    }

    eyebrow(label: string, opts: { center?: boolean } = {}) {
        this.ensureSpace(6);
        this.doc.setFont(this.fonts.body, "bold");
        this.doc.setFontSize(7.5);
        this.doc.setTextColor(...C.gold);
        const spaced = label.toUpperCase().split("").join(" ");
        const x = opts.center ? PAGE_W / 2 : MARGIN;
        this.doc.text(spaced, x, this.y, opts.center ? { align: "center" } : undefined);
        this.y += 5;
    }

    title(text: string, opts: { size?: number; center?: boolean } = {}) {
        const size = opts.size ?? 16;
        const capHeightMm = size * 0.36;
        this.ensureSpace(capHeightMm + size * 0.5 + 2);
        this.y += capHeightMm;
        this.doc.setFont(this.fonts.serif, "bold");
        this.doc.setFontSize(size);
        this.doc.setTextColor(...C.ink);
        const x = opts.center ? PAGE_W / 2 : MARGIN;
        const lines = this.doc.splitTextToSize(text, CONTENT_W);
        for (const line of lines) {
            this.doc.text(line, x, this.y, opts.center ? { align: "center" } : undefined);
            this.y += size * 0.42;
        }
        this.y += 2;
    }

    body(text: string, opts: {
        italic?: boolean;
        size?: number;
        indent?: number;
        center?: boolean;
        color?: [number, number, number];
    } = {}) {
        const size = opts.size ?? 9.5;
        const indent = opts.indent ?? 0;
        const w = CONTENT_W - indent * 2;
        this.doc.setFont(this.fonts.body, opts.italic ? "italic" : "normal");
        this.doc.setFontSize(size);
        this.doc.setTextColor(...(opts.color ?? C.inkBody));
        const lines = this.doc.splitTextToSize(text, w);
        for (const line of lines) {
            this.ensureSpace(size * 0.5);
            const x = opts.center ? PAGE_W / 2 : MARGIN + indent;
            this.doc.text(line, x, this.y, opts.center ? { align: "center" } : undefined);
            this.y += size * 0.5;
        }
    }

    cardBody(text: string, opts: { tinted?: boolean; italic?: boolean } = {}) {
        const size = 9.5;
        const pad = 5;
        this.doc.setFont(this.fonts.body, opts.italic ? "italic" : "normal");
        this.doc.setFontSize(size);
        const lines = this.doc.splitTextToSize(text, CONTENT_W - pad * 2);
        const cardH = pad * 2 + lines.length * (size * 0.5);
        this.ensureSpace(cardH + 2);
        const top = this.y;
        this.doc.setFillColor(...(opts.tinted ? C.goldFill : C.cardCream));
        this.doc.setDrawColor(...C.goldHairline);
        this.doc.setLineWidth(0.3);
        this.doc.roundedRect(MARGIN, top, CONTENT_W, cardH, 3, 3, "FD");
        this.doc.setTextColor(...(opts.tinted ? C.goldDeep : C.inkBody));
        this.doc.setFont(this.fonts.body, opts.italic ? "italic" : "normal");
        this.doc.setFontSize(size);
        let ty = top + pad + size * 0.4;
        for (const line of lines) {
            this.doc.text(line, MARGIN + pad, ty);
            ty += size * 0.5;
        }
        this.y = top + cardH + 3;
    }

    bulletCard(text: string) {
        const size = 9.5;
        const pad = 5;
        const indent = 6;
        const w = CONTENT_W - pad * 2 - indent;
        this.doc.setFont(this.fonts.body, "normal");
        this.doc.setFontSize(size);
        const lines = this.doc.splitTextToSize(text, w);
        const cardH = pad * 2 + lines.length * (size * 0.5);
        this.ensureSpace(cardH + 2);
        const top = this.y;
        this.doc.setFillColor(...C.cardCream);
        this.doc.setDrawColor(...C.goldHairline);
        this.doc.setLineWidth(0.3);
        this.doc.roundedRect(MARGIN, top, CONTENT_W, cardH, 3, 3, "FD");
        this.doc.setFont(this.fonts.serif, "normal");
        this.doc.setFontSize(size);
        this.doc.setTextColor(...C.gold);
        this.doc.text("•", MARGIN + pad, top + pad + size * 0.4);
        this.doc.setFont(this.fonts.body, "normal");
        this.doc.setTextColor(...C.inkBody);
        let ty = top + pad + size * 0.4;
        for (const line of lines) {
            this.doc.text(line, MARGIN + pad + indent, ty);
            ty += size * 0.5;
        }
        this.y = top + cardH + 2.5;
    }

    /**
     * Phase header — gold ornament + uppercase Cormorant tracked label.
     * Mirrors DossierScreen's per-phase divider.
     */
    phaseHeader(label: string) {
        this.sectionGap();
        this.ensureSpace(14);
        this.ornament();
        this.eyebrow(label, { center: true });
        this.y += 1;
    }

    /**
     * Artifact section header — left-aligned label + small specificity
     * pill on the right. Compact, dense — many of these stack on one
     * page so we keep the chrome light.
     */
    artifactHeader(label: string, score: number | null, status: "locked" | "draft" | "gap") {
        this.ensureSpace(14);
        const top = this.y;
        // Left side — artifact label
        this.doc.setFont(this.fonts.serif, "bold");
        this.doc.setFontSize(13);
        this.doc.setTextColor(...C.ink);
        this.doc.text(label, MARGIN, top + 4);
        // Right side — status pill
        const statusText =
            status === "locked"
                ? `Locked · ${score?.toFixed(1) ?? "—"}`
                : status === "draft"
                ? `Draft · ${score?.toFixed(1) ?? "—"}`
                : "Gap";
        this.doc.setFont(this.fonts.body, "bold");
        this.doc.setFontSize(7);
        const statusW = this.doc.getTextWidth(statusText) + 6;
        const pillX = PAGE_W - MARGIN - statusW;
        const pillY = top - 0.5;
        const pillH = 5.5;
        if (status === "gap") {
            this.doc.setFillColor(255, 252, 245);
            this.doc.setDrawColor(...C.gapAmber);
        } else {
            this.doc.setFillColor(...C.goldFill);
            this.doc.setDrawColor(...C.goldHairline);
        }
        this.doc.setLineWidth(0.25);
        this.doc.roundedRect(pillX, pillY, statusW, pillH, 2.5, 2.5, "FD");
        this.doc.setTextColor(...(status === "gap" ? C.gapAmber : C.goldDeep));
        this.doc.text(statusText, pillX + statusW / 2, pillY + 3.7, { align: "center" });
        this.y = top + 6.5;
    }

    sectionGap() {
        this.y += SECTION_GAP;
    }
}

// ─────────────────────────────────────────────────────────────────────
// Generic content renderer — handles the artifact content shapes seen
// in GenericArtifactScreen.tsx: strings, arrays-of-strings, key/value
// objects, and the SpecificityMatrix special case.
// ─────────────────────────────────────────────────────────────────────

type MatrixStageRow = { resonant: string; partial: string; off: string };
type MatrixContent = {
    stages: Record<string, MatrixStageRow>;
    meta_question?: string;
    voice_signature?: string;
};

function isSpecificityMatrix(content: unknown): content is MatrixContent {
    if (!content || typeof content !== "object") return false;
    const c = content as Record<string, unknown>;
    if (!c.stages || typeof c.stages !== "object") return false;
    const stages = Object.values(c.stages as Record<string, unknown>);
    if (stages.length === 0) return false;
    return stages.every((row) => {
        if (!row || typeof row !== "object") return false;
        const r = row as Record<string, unknown>;
        return typeof r.resonant === "string"
            && typeof r.partial === "string"
            && typeof r.off === "string";
    });
}

function humanizeKey(k: string): string {
    return k
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Render an artifact's content into the PDF. Walks the structure
 * recursively for nested objects/arrays.
 */
function renderArtifactContent(b: PdfBuilder, content: unknown) {
    if (content === null || content === undefined) {
        b.body("(empty)", { italic: true, color: C.muted });
        return;
    }
    if (typeof content === "string") {
        const text = content.trim();
        if (!text) {
            b.body("(empty)", { italic: true, color: C.muted });
            return;
        }
        b.cardBody(text);
        return;
    }
    if (typeof content === "number" || typeof content === "boolean") {
        b.cardBody(String(content));
        return;
    }
    if (isSpecificityMatrix(content)) {
        renderSpecificityMatrix(b, content);
        return;
    }
    if (Array.isArray(content)) {
        // Array of strings → bullets. Array of objects → labeled blocks.
        if (content.every((x) => typeof x === "string")) {
            content.forEach((s) => b.bulletCard(s as string));
            return;
        }
        content.forEach((item, i) => {
            b.eyebrow(`Item ${i + 1}`);
            b.y += 0.5;
            renderArtifactContent(b, item);
        });
        return;
    }
    if (typeof content === "object") {
        const entries = Object.entries(content as Record<string, unknown>);
        for (const [k, v] of entries) {
            renderField(b, humanizeKey(k), v);
        }
        return;
    }
    b.cardBody(String(content));
}

/**
 * Render one labeled field — small uppercase eyebrow + value. Inline
 * for short strings, card for long strings, recursive for nested
 * structures.
 */
function renderField(b: PdfBuilder, label: string, value: unknown) {
    if (value === null || value === undefined || value === "") {
        return; // skip empty fields silently — they're just clutter
    }
    b.ensureSpace(10);
    // Field label
    b.doc.setFont(b.fonts.body, "bold");
    b.doc.setFontSize(7.5);
    b.doc.setTextColor(...C.gold);
    const spaced = label.toUpperCase().split("").join(" ");
    b.doc.text(spaced, MARGIN, b.y);
    b.y += 4;
    // Value
    if (typeof value === "string") {
        b.body(value);
        b.y += 2;
        return;
    }
    if (typeof value === "number" || typeof value === "boolean") {
        b.body(String(value));
        b.y += 2;
        return;
    }
    if (Array.isArray(value)) {
        if (value.every((x) => typeof x === "string")) {
            value.forEach((s) => b.bulletCard(s as string));
            b.y += 1;
            return;
        }
        value.forEach((item, i) => {
            b.body(`${i + 1}.`, { color: C.gold });
            renderArtifactContent(b, item);
        });
        return;
    }
    if (typeof value === "object") {
        const entries = Object.entries(value as Record<string, unknown>);
        for (const [k, v] of entries) {
            renderField(b, humanizeKey(k), v);
        }
        return;
    }
    b.body(String(value));
    b.y += 2;
}

/**
 * Specificity Matrix — render as a 4-column table (Stage / Resonant /
 * Partial / Off). Adapts the on-screen <SpecificityMatrixView> to PDF.
 */
function renderSpecificityMatrix(b: PdfBuilder, content: MatrixContent) {
    if (content.meta_question) {
        renderField(b, "The question every reveal asks", content.meta_question);
    }
    if (content.voice_signature) {
        renderField(b, "Voice signature", content.voice_signature);
    }

    const stageNames = Object.keys(content.stages);
    if (stageNames.length === 0) return;

    // Column widths (mm). Stage gets a narrow first column; the three
    // verdict columns split the rest equally.
    const colStage = 26;
    const colVerdict = (CONTENT_W - colStage) / 3;
    const colX = [
        MARGIN,
        MARGIN + colStage,
        MARGIN + colStage + colVerdict,
        MARGIN + colStage + colVerdict * 2,
    ];
    const padX = 2.5;
    const padY = 3;
    const rowFontSize = 8;

    // Header row
    b.ensureSpace(10);
    const headerTop = b.y;
    b.doc.setFillColor(...C.goldFill);
    b.doc.setDrawColor(...C.goldHairline);
    b.doc.setLineWidth(0.3);
    b.doc.roundedRect(MARGIN, headerTop, CONTENT_W, 7, 1, 1, "FD");
    b.doc.setFont(b.fonts.body, "bold");
    b.doc.setFontSize(7);
    b.doc.setTextColor(...C.goldDeep);
    const headers = ["Stage", "Resonant (8–10)", "Partial (5–7)", "Off (1–4)"];
    headers.forEach((h, i) => {
        b.doc.text(h, colX[i] + padX, headerTop + 4.6);
    });
    b.y = headerTop + 7;

    // Data rows
    b.doc.setFont(b.fonts.body, "normal");
    b.doc.setFontSize(rowFontSize);
    for (const stageName of stageNames) {
        const row = content.stages[stageName];
        const stageLines = b.doc.splitTextToSize(stageName, colStage - padX * 2);
        const resonantLines = b.doc.splitTextToSize(row.resonant, colVerdict - padX * 2);
        const partialLines = b.doc.splitTextToSize(row.partial, colVerdict - padX * 2);
        const offLines = b.doc.splitTextToSize(row.off, colVerdict - padX * 2);
        const maxLines = Math.max(
            stageLines.length,
            resonantLines.length,
            partialLines.length,
            offLines.length,
        );
        const rowH = padY * 2 + maxLines * (rowFontSize * 0.5);
        b.ensureSpace(rowH + 1);
        const rowTop = b.y;
        b.doc.setFillColor(...C.cardCream);
        b.doc.setDrawColor(...C.goldHairline);
        b.doc.setLineWidth(0.2);
        b.doc.rect(MARGIN, rowTop, CONTENT_W, rowH, "FD");
        // Stage label — bold, gold
        b.doc.setFont(b.fonts.serif, "bold");
        b.doc.setFontSize(8.5);
        b.doc.setTextColor(...C.goldDeep);
        let ty = rowTop + padY + rowFontSize * 0.45;
        stageLines.forEach((line: string) => {
            b.doc.text(line, colX[0] + padX, ty);
            ty += rowFontSize * 0.5;
        });
        // Three verdict columns
        b.doc.setFont(b.fonts.body, "italic");
        b.doc.setFontSize(rowFontSize);
        b.doc.setTextColor(...C.inkBody);
        const verdictData = [resonantLines, partialLines, offLines];
        verdictData.forEach((lines, ci) => {
            let vy = rowTop + padY + rowFontSize * 0.45;
            lines.forEach((line: string) => {
                b.doc.text(line, colX[ci + 1] + padX, vy);
                vy += rowFontSize * 0.5;
            });
        });
        b.y = rowTop + rowH;
    }
    b.y += 3;
}

// ─────────────────────────────────────────────────────────────────────
// Per-artifact section
// ─────────────────────────────────────────────────────────────────────

function renderArtifactSection(
    b: PdfBuilder,
    artifactKey: ArtifactKey,
    state: ArtifactState | undefined,
) {
    const label = ARTIFACT_LABELS[artifactKey];
    const locked: VersionRow | null = state?.latestLocked ?? null;
    const latest: VersionRow | null = state?.latest ?? null;
    const usable = locked ?? latest;
    const status: "locked" | "draft" | "gap" = locked
        ? "locked"
        : latest
        ? "draft"
        : "gap";
    const score = usable?.specificity_score ?? null;

    b.artifactHeader(label, score, status);

    if (status === "gap") {
        b.body("Gap — not yet locked.", { italic: true, color: C.gapAmber });
        b.y += 4;
        return;
    }

    if (status === "draft") {
        b.body(
            "Draft version (not yet locked). Lock from the screen surface to finalize.",
            { italic: true, color: C.muted, size: 8.5 },
        );
        b.y += 2;
    }

    if (usable && state?.isStale) {
        b.body(
            state.staleReason
                ? `Stale — ${state.staleReason}`
                : "Stale — a sibling has been re-locked since this version.",
            { italic: true, color: C.gapAmber, size: 8.5 },
        );
        b.y += 2;
    }

    renderArtifactContent(b, usable?.content);
    b.y += 4;
}

// ─────────────────────────────────────────────────────────────────────
// Hero / title page
// ─────────────────────────────────────────────────────────────────────

function renderHero(
    b: PdfBuilder,
    lockedCount: number,
    totalCount: number,
    avgSpecificity: number,
) {
    b.y = MARGIN + 24;
    b.ornament();
    b.y += 4;
    b.eyebrow("Unique Business Builder", { center: true });
    b.y += 2;
    b.title("Your Unique Business Dossier", { size: 28, center: true });
    b.y += 4;

    // Stats line
    const statsParts: string[] = [];
    statsParts.push(`${lockedCount} of ${totalCount} locked`);
    if (avgSpecificity > 0) {
        statsParts.push(`avg specificity ${avgSpecificity.toFixed(1)}`);
    }
    b.doc.setFont(b.fonts.body, "italic");
    b.doc.setFontSize(11);
    b.doc.setTextColor(...C.muted);
    b.doc.text(statsParts.join("  ·  "), PAGE_W / 2, b.y, { align: "center" });
    b.y += 8;

    b.ornament();
    b.y += 4;

    // Editorial intro line
    b.doc.setFont(b.fonts.body, "italic");
    b.doc.setFontSize(10);
    b.doc.setTextColor(...C.inkBody);
    const intro =
        "A snapshot of all 19 artifacts that compose your unique business — Canvas, Session Bridge, Marketing, Distribution, Communications, and Publication. Locked rows are final. Draft rows are still in motion.";
    const lines = b.doc.splitTextToSize(intro, CONTENT_W - 20);
    for (const line of lines) {
        b.doc.text(line, PAGE_W / 2, b.y, { align: "center" });
        b.y += 5;
    }
}

// ─────────────────────────────────────────────────────────────────────
// Footer — page-N-of-M, brand
// ─────────────────────────────────────────────────────────────────────

function renderFooter(b: PdfBuilder) {
    const pageCount = b.doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        b.doc.setPage(i);
        b.doc.setFont(b.fonts.body, "normal");
        b.doc.setFontSize(7);
        b.doc.setTextColor(...C.muted);
        b.doc.text(
            `Page ${i} of ${pageCount}  ·  findyourtoptalent.com`,
            PAGE_W / 2,
            FOOTER_Y,
            { align: "center" },
        );
    }
}

// ─────────────────────────────────────────────────────────────────────
// Phase grouping — mirrors DossierScreen's section structure.
// ─────────────────────────────────────────────────────────────────────

const PHASE_STRUCTURE: Array<{ label: string; keys: readonly ArtifactKey[] }> = [
    { label: "Canvas", keys: PHASE_A_CANVAS },
    { label: "Session Bridge", keys: PHASE_B_SESSION },
    // Phase C is split into its three compound groupings to match the
    // on-screen dossier's per-phase rules.
    { label: "Marketing", keys: COMPOUND_GROUPING.marketing },
    { label: "Distribution", keys: COMPOUND_GROUPING.distribution },
    { label: "Communications", keys: COMPOUND_GROUPING.communications },
    { label: "Publication", keys: PHASE_D_PUBLICATION },
];

// ─────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────

export interface UbbPdfState {
    artifacts: Partial<Record<ArtifactKey, ArtifactState>>;
    lockedCount: number;
    avgSpecificity: number;
}

/**
 * Generate the Unique Business Dossier PDF and trigger a download.
 *
 * @param state Snapshot of the live UniqueBusinessContext: artifacts,
 *              lockedCount, avgSpecificity. Only the safe public bits;
 *              no actions, no transient UI flags.
 */
export async function generateUbbPdf(state: UbbPdfState): Promise<void> {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const fonts = await setupFonts(doc);
    const b = new PdfBuilder(doc, fonts);

    const totalCount = ALL_ARTIFACT_KEYS.length;
    renderHero(b, state.lockedCount, totalCount, state.avgSpecificity);

    for (const phase of PHASE_STRUCTURE) {
        // Skip phases whose artifacts ALL lack any version — keeps the
        // PDF tight for early-stage canvases. Headers only render when
        // there's at least one row to show inside.
        const hasAny = phase.keys.some((k) => {
            const s = state.artifacts[k];
            return !!(s?.latestLocked || s?.latest);
        });
        // Always show the header so the structure is visible even on
        // early canvases — but with a soft "Gap" treatment per row.
        // Skipping a phase entirely would break the architectural shape
        // of the document.
        void hasAny;

        b.phaseHeader(phase.label);

        for (const key of phase.keys) {
            renderArtifactSection(b, key, state.artifacts[key]);
        }
    }

    renderFooter(b);

    doc.save("unique-business-dossier.pdf");
}
