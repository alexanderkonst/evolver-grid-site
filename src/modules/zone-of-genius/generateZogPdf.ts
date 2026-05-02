/**
 * Top Talent PDF Generator — Day 58 (Sasha 2026-05-02) editorial revamp.
 *
 * Produces a portable artifact that mirrors the platform Top Talent
 * profile structure + register. Designed to be handed to the user's AI
 * as ongoing context ("give the PDF to your AI so it can know more
 * about you" — copy on /game/me/zone-of-genius).
 *
 * Section list (parity with platform side-nav):
 *   1. Hero (archetype, bullseye, core pattern)
 *   2. How It Shows Up           ┐
 *   3. Three Key Talents         │  All sourced from the deep
 *   4. Top Shadow                │  topTalentProfile fields produced
 *   5. One Action                ┘  by the appleseed prompt (Wave 4.4).
 *   6. Appreciated For
 *   7. Path of Mastery (+ "Book a session" gold pill)
 *   8. Ideal Environments
 *   9. Complementary Partner (fused-paragraph form, legacy fallback)
 *  10. Monetization (avenues + career sweet spots)
 *
 * Visual register (the "easy way out" for glassmorphism in jsPDF):
 *   • Page bg: warm cream (no white sterility)
 *   • Cards: solid cream + 0.5pt gold hairline border. No backdrop-blur
 *     attempts — emulate the editorial AESTHETIC, not the filter.
 *   • Headers: small gold ornament glyph + thin rules, then eyebrow +
 *     title. No navy banner.
 *   • Fonts: Cormorant Garamond (serif headings) + Source Serif 4
 *     (body) loaded at runtime from /public/fonts/. Falls back to Times
 *     gracefully if the TTFs aren't present yet — see Day-58 follow-up.
 *
 * Page size: A4. Filename: <archetype-slug>-top-talent-profile.pdf.
 */

import jsPDF from "jspdf";
import { AppleseedData } from "./appleseedGenerator";
import { ExcaliburData } from "./excaliburGenerator";

// ─────────────────────────────────────────────────────────────────────
// Page geometry — A4 (mm)
// ─────────────────────────────────────────────────────────────────────

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 22;
const CONTENT_W = PAGE_W - MARGIN * 2;
const FOOTER_Y = PAGE_H - 12;
const SECTION_GAP = 9;

// ─────────────────────────────────────────────────────────────────────
// Color tokens — cream/gold editorial register, RGB triples for jsPDF
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
};

const MASTERY_CTA_URL = "https://t.me/integralevolution";
const MASTERY_CTA_TEXT = "Accelerate your path of mastery — book a session";

// ─────────────────────────────────────────────────────────────────────
// Data formatting helpers (mirror the platform: strip glyphs, sentence
// case the bullseye, slugify for filename)
// ─────────────────────────────────────────────────────────────────────

const stripDecorativeGlyphs = (s: string): string =>
    s.replace(/[✦✧◆◇❖✱★☆]/g, "").trim();

const formatBullseye = (s: string): string =>
    s.toLowerCase().replace(/\.\s*$/, "").trim();

const slugifyArchetype = (s: string): string =>
    stripDecorativeGlyphs(s)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "my-top-talent";

// ─────────────────────────────────────────────────────────────────────
// Font loading — graceful fallback to jsPDF's built-in Times if the
// TTFs aren't bundled. When Sasha drops the fonts in /public/fonts/,
// the PDF lights up with the full editorial register automatically.
// ─────────────────────────────────────────────────────────────────────

interface FontMap {
    serif: string;  // headings
    body: string;   // body
}

const TIMES: FontMap = { serif: "times", body: "times" };

async function tryLoadFont(url: string): Promise<string | null> {
    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        const buf = await res.arrayBuffer();
        const bytes = new Uint8Array(buf);
        // Chunked base64 to avoid stack overflow on large buffers.
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
// PdfBuilder — primitives, page background, common building blocks
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

    // Editorial separator: a filled gold dot flanked by thin gold
    // hairlines. Day 58 (Sasha 2026-05-02 evening) — replaced the
    // unicode "✦" glyph (which was absent in the fallback font and
    // rendered as nothing, leaving two stubby dashes with an empty
    // middle) with a vector circle that always renders. Centered,
    // small, low-key.
    ornament(centerX: number = PAGE_W / 2) {
        this.ensureSpace(8);
        const half = 22;
        const gapHalf = 4;
        const dotR = 0.8; // mm
        this.doc.setDrawColor(...C.goldHairline);
        this.doc.setLineWidth(0.3);
        this.doc.line(centerX - half, this.y, centerX - gapHalf, this.y);
        this.doc.line(centerX + gapHalf, this.y, centerX + half, this.y);
        this.doc.setFillColor(...C.gold);
        this.doc.circle(centerX, this.y, dotR, "F");
        this.y += 6;
    }

    // Small uppercase gold eyebrow with letter-spacing simulated via
    // inserted spaces. jsPDF has no native tracking so this is the
    // closest visual analog.
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
        // Day 58 (Sasha 2026-05-02 evening) bug fix: jsPDF's text() uses
        // alphabetic baseline by default — y is the BASELINE, not the
        // top. For a 26pt title, the cap-height reaches ~6mm above the
        // baseline. If we draw at the same y where the previous element
        // (eyebrow) just left off, the title's cap-height overlaps the
        // eyebrow text. Pad y down by the cap-height before drawing
        // so the title sits CLEANLY below the eyebrow.
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

    // Card with body text inside — measures, draws, fills.
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

    // Numbered card — gold pip + body. For Three Key Talents and stages.
    numberedCard(num: number | string, text: string) {
        const size = 9.5;
        const pad = 5;
        const pipDiam = 6;
        const pipGap = 3;
        const textIndent = pipDiam + pipGap;
        const w = CONTENT_W - pad * 2 - textIndent;
        this.doc.setFont(this.fonts.body, "normal");
        this.doc.setFontSize(size);
        const lines = this.doc.splitTextToSize(text, w);
        const cardH = pad * 2 + Math.max(pipDiam + 1, lines.length * (size * 0.5));
        this.ensureSpace(cardH + 2);
        const top = this.y;
        // Card
        this.doc.setFillColor(...C.cardCream);
        this.doc.setDrawColor(...C.goldHairline);
        this.doc.setLineWidth(0.3);
        this.doc.roundedRect(MARGIN, top, CONTENT_W, cardH, 3, 3, "FD");
        // Pip
        const pipX = MARGIN + pad + pipDiam / 2;
        const pipY = top + pad + pipDiam / 2;
        this.doc.setFillColor(...C.goldHairline);
        this.doc.setDrawColor(...C.goldDeep);
        this.doc.setLineWidth(0.2);
        this.doc.circle(pipX, pipY, pipDiam / 2, "FD");
        this.doc.setFont(this.fonts.body, "bold");
        this.doc.setFontSize(7);
        this.doc.setTextColor(...C.ink);
        this.doc.text(`${num}`, pipX, pipY + 1.2, { align: "center" });
        // Body
        this.doc.setFont(this.fonts.body, "normal");
        this.doc.setFontSize(size);
        this.doc.setTextColor(...C.inkBody);
        let ty = top + pad + size * 0.4;
        for (const line of lines) {
            this.doc.text(line, MARGIN + pad + textIndent, ty);
            ty += size * 0.5;
        }
        this.y = top + cardH + 3;
    }

    // Bullet card — single body line with a leading gold star glyph.
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
        // Bullet glyph
        this.doc.setFont(this.fonts.serif, "normal");
        this.doc.setFontSize(size);
        this.doc.setTextColor(...C.gold);
        this.doc.text("✦", MARGIN + pad, top + pad + size * 0.4);
        // Text
        this.doc.setFont(this.fonts.body, "normal");
        this.doc.setTextColor(...C.inkBody);
        let ty = top + pad + size * 0.4;
        for (const line of lines) {
            this.doc.text(line, MARGIN + pad + indent, ty);
            ty += size * 0.5;
        }
        this.y = top + cardH + 2.5;
    }

    // Gold pill CTA — full-width, clickable, centered text.
    goldPill(text: string, url: string) {
        const size = 9.5;
        const padY = 4;
        const cardH = padY * 2 + size * 0.55;
        this.ensureSpace(cardH + 4);
        const top = this.y;
        this.doc.setFillColor(...C.goldFill);
        this.doc.setDrawColor(...C.gold);
        this.doc.setLineWidth(0.4);
        this.doc.roundedRect(MARGIN, top, CONTENT_W, cardH, 50, 50, "FD");
        this.doc.setFont(this.fonts.serif, "bold");
        this.doc.setFontSize(size);
        this.doc.setTextColor(...C.goldDeep);
        this.doc.textWithLink(text, PAGE_W / 2, top + cardH / 2 + 1.4, {
            url,
            align: "center",
        });
        this.doc.link(MARGIN, top, CONTENT_W, cardH, { url });
        this.y = top + cardH + 5;
    }

    sectionGap() {
        this.y += SECTION_GAP;
    }

    // Section divider — ornament + small spacing
    sectionRule() {
        this.ensureSpace(10);
        this.ornament();
        this.y += 2;
    }
}

// ─────────────────────────────────────────────────────────────────────
// Section renderers — one per logical block
// ─────────────────────────────────────────────────────────────────────

function renderHero(b: PdfBuilder, appleseed: AppleseedData) {
    b.y = MARGIN + 10;

    b.ornament();
    b.y += 3;

    b.eyebrow("My Top Talent Is", { center: true });
    b.y += 1;

    b.title(stripDecorativeGlyphs(appleseed.vibrationalKey.name), {
        size: 26,
        center: true,
    });
    b.y += 3;

    if (appleseed.bullseyeSentence) {
        const text = `I ${formatBullseye(appleseed.bullseyeSentence)}`;
        b.doc.setFont(b.fonts.serif, "italic");
        b.doc.setFontSize(13);
        b.doc.setTextColor(...C.inkBody);
        const lines = b.doc.splitTextToSize(text, CONTENT_W - 30);
        for (const line of lines) {
            b.ensureSpace(7);
            b.doc.text(line, PAGE_W / 2, b.y, { align: "center" });
            b.y += 6;
        }
        b.y += 2;
    }

    if (appleseed.topTalentProfile?.core_pattern) {
        b.body(appleseed.topTalentProfile.core_pattern, { center: true });
    }
    b.y += 4;
}

function renderHowItShowsUp(b: PdfBuilder, appleseed: AppleseedData) {
    const text = appleseed.topTalentProfile?.how_genius_shows_up;
    if (!text) return;
    b.sectionRule();
    b.eyebrow("How It Shows Up");
    b.y += 1;
    b.cardBody(text);
    b.sectionGap();
}

function renderThreeKeyTalents(b: PdfBuilder, appleseed: AppleseedData) {
    const talents = appleseed.topTalentProfile?.top_three_talents;
    if (!talents || talents.length === 0) return;
    b.sectionRule();
    b.eyebrow("Three Key Talents");
    b.y += 1;
    talents.forEach((talent, i) => b.numberedCard(i + 1, talent));
    b.sectionGap();
}

function renderTopShadow(b: PdfBuilder, appleseed: AppleseedData) {
    const oneSentence = appleseed.topTalentProfile?.top_shadow_one_sentence?.trim();
    const paragraph = appleseed.topTalentProfile?.edge_and_traps?.trim();
    if (!oneSentence && !paragraph) return;
    b.sectionRule();
    b.eyebrow("Top Shadow");
    b.y += 1;
    // Day 58 (Sasha 2026-05-02 evening): mirror the ME-space subpage —
    // synthesized one-sentence at top (in a tinted card with a "MY TOP
    // SHADOW IS" sub-eyebrow), full paragraph below.
    if (oneSentence) {
        b.eyebrow("My top shadow is");
        b.y -= 1;
        b.cardBody(oneSentence, { tinted: true, italic: true });
    }
    if (paragraph) {
        b.cardBody(paragraph);
    }
    b.sectionGap();
}

function renderOneAction(b: PdfBuilder, appleseed: AppleseedData) {
    const text = appleseed.topTalentProfile?.flywheel_action;
    if (!text) return;
    b.sectionRule();
    b.eyebrow("One Action — repeat this");
    b.y += 1;
    b.cardBody(text, { tinted: true });
    b.sectionGap();
}

// renderAppreciatedFor — Day 58 (Sasha 2026-05-02 evening): retired.
// Sasha: "let's just delete it". Removed from PDF chapter list and
// from the function definitions to avoid unused-export drift.

function renderPathOfMastery(b: PdfBuilder, appleseed: AppleseedData) {
    const stages = appleseed.masteryStages;
    if (!stages || stages.length === 0) return;
    b.sectionRule();
    b.eyebrow("Path of Mastery");
    b.y += 1;
    stages.forEach((stage) => {
        const num = stage.stage || 1;
        const text = stage.description
            ? `${stage.name} — ${stage.description}`
            : stage.name;
        b.numberedCard(num, text);
    });
    b.y += 2;
    b.goldPill(MASTERY_CTA_TEXT, MASTERY_CTA_URL);
    b.sectionGap();
}

function renderIdealEnvironments(b: PdfBuilder, appleseed: AppleseedData) {
    const envs = appleseed.topTalentProfile?.ideal_environments;
    const fallback = appleseed.rolesEnvironments?.environment;
    if ((!envs || envs.length === 0) && !fallback) return;
    b.sectionRule();
    b.eyebrow("Ideal Environments");
    b.y += 1;
    if (envs && envs.length > 0) {
        envs.forEach((env) => b.bulletCard(env));
    } else if (fallback) {
        b.cardBody(fallback);
    }
    b.sectionGap();
}

function renderComplementaryPartner(b: PdfBuilder, appleseed: AppleseedData) {
    const partner = appleseed.complementaryPartner;
    if (!partner) return;
    const synergy = partner.synergy?.trim();
    const hasLegacy = !!(partner.skillsWise || partner.geniusWise || partner.archetypeWise);
    b.sectionRule();
    b.eyebrow("Complementary Partner");
    b.y += 1;
    if (synergy && !hasLegacy) {
        b.cardBody(synergy);
    } else {
        const lines: string[] = [];
        if (partner.skillsWise) lines.push(`Skills — ${partner.skillsWise}`);
        if (partner.geniusWise) lines.push(`Genius — ${partner.geniusWise}`);
        if (partner.archetypeWise) lines.push(`Archetype — ${partner.archetypeWise}`);
        if (synergy) lines.push(`Synergy — ${synergy}`);
        b.cardBody(lines.join("\n\n"));
    }
    b.sectionGap();
}

function renderMonetization(b: PdfBuilder, appleseed: AppleseedData) {
    const avenues = appleseed.monetizationAvenues;
    const sweetSpots = appleseed.topTalentProfile?.career_sweet_spots;
    const hasAvenues = avenues && avenues.length > 0;
    const hasSweet = sweetSpots && sweetSpots.length > 0;
    if (!hasAvenues && !hasSweet) return;
    b.sectionRule();
    b.eyebrow("Monetization");
    b.y += 2;

    if (hasAvenues) {
        b.doc.setFont(b.fonts.body, "bold");
        b.doc.setFontSize(8.5);
        b.doc.setTextColor(...C.gold);
        b.doc.text("Monetization Avenues", MARGIN, b.y);
        b.y += 4.5;
        avenues!.forEach((a) => b.bulletCard(a));
        b.y += 2;
    }

    if (hasSweet) {
        b.doc.setFont(b.fonts.body, "bold");
        b.doc.setFontSize(8.5);
        b.doc.setTextColor(...C.gold);
        b.doc.text("Career Sweet Spots", MARGIN, b.y);
        b.y += 4.5;
        sweetSpots!.forEach((s) => b.bulletCard(s));
    }
    b.sectionGap();
}

// ─────────────────────────────────────────────────────────────────────
// Excalibur (My Unique Genius Business) — kept working but in the new
// register. Day 58: navy/violet banner replaced with cream + ornament
// + Cormorant title to match the rest of the artifact. Full Excalibur
// PDF redesign deferred to its own wave.
// ─────────────────────────────────────────────────────────────────────

function renderExcalibur(b: PdfBuilder, excalibur: ExcaliburData) {
    b.newPage();
    b.y = MARGIN + 10;
    b.ornament();
    b.y += 3;
    b.eyebrow("My Unique Genius Business", { center: true });
    b.y += 1;
    if (excalibur.businessIdentity?.name) {
        b.title(excalibur.businessIdentity.name, { size: 22, center: true });
    }
    b.y += 4;

    const drawSection = (label: string, items: { k: string; v?: string }[]) => {
        const present = items.filter((i) => i.v);
        if (present.length === 0) return;
        b.sectionRule();
        b.eyebrow(label);
        b.y += 1;
        const lines = present.map((i) => `${i.k} — ${i.v}`);
        b.cardBody(lines.join("\n\n"));
        b.sectionGap();
    };

    drawSection("Business Identity", [
        { k: "Tagline", v: excalibur.businessIdentity?.tagline },
    ]);
    drawSection("Essence Anchor", [
        { k: "Genius Apple Seed", v: excalibur.essenceAnchor?.geniusAppleSeed },
        { k: "Prime Driver", v: excalibur.essenceAnchor?.primeDriver },
        { k: "Archetype", v: excalibur.essenceAnchor?.archetype },
    ]);
    drawSection("Your Offer", [
        { k: "Statement", v: excalibur.offer?.statement },
        { k: "Form", v: excalibur.offer?.form },
        { k: "Deliverable", v: excalibur.offer?.deliverable },
    ]);
    drawSection("Ideal Client", [
        { k: "Profile", v: excalibur.idealClient?.profile },
        { k: "Problem", v: excalibur.idealClient?.problem },
        { k: "Aha Moment", v: excalibur.idealClient?.aha },
    ]);
    drawSection("Transformational Promise", [
        { k: "From", v: excalibur.transformationalPromise?.fromState },
        { k: "To", v: excalibur.transformationalPromise?.toState },
        { k: "Journey", v: excalibur.transformationalPromise?.journey },
    ]);
    drawSection("Channels", [
        { k: "Primary", v: excalibur.channels?.primary },
        { k: "Secondary", v: excalibur.channels?.secondary },
        { k: "Hook", v: excalibur.channels?.hook },
    ]);
    drawSection("The Bigger Arc", [
        { k: "Vision", v: excalibur.biggerArc?.vision },
        { k: "Moonshot", v: excalibur.biggerArc?.moonshot },
    ]);
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
// Public API
// ─────────────────────────────────────────────────────────────────────

export async function generateZogPdf(
    appleseed: AppleseedData,
    excalibur?: ExcaliburData | null,
): Promise<void> {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const fonts = await setupFonts(doc);
    const b = new PdfBuilder(doc, fonts);

    // Day 58 (Sasha 2026-05-02 evening) — chapter order mirrors the
    // ME-space subpages (SectionsPanel.tsx subSections):
    //   Hero → How It Shows Up → Three Key Talents → Top Shadow →
    //   Path of Mastery → One Action → Ideal Environments →
    //   Complementary Partner → Monetization.
    // Appreciated For retired (Sasha: "let's just delete it"). Start
    // Here is instructions, not content — skipped in the PDF.
    renderHero(b, appleseed);
    renderHowItShowsUp(b, appleseed);
    renderThreeKeyTalents(b, appleseed);
    renderTopShadow(b, appleseed);
    renderPathOfMastery(b, appleseed);
    renderOneAction(b, appleseed);
    renderIdealEnvironments(b, appleseed);
    renderComplementaryPartner(b, appleseed);
    renderMonetization(b, appleseed);

    if (excalibur) {
        renderExcalibur(b, excalibur);
    }

    renderFooter(b);

    const slug = slugifyArchetype(appleseed.vibrationalKey.name);
    doc.save(`${slug}-top-talent-profile.pdf`);
}
