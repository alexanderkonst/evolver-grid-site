/**
 * Zone of Genius PDF Generator
 *
 * Generates a clean, branded PDF containing the Appleseed perspectives
 * and optional Excalibur (Genius Business) data using jsPDF.
 *
 * Day 52 (Sasha 2026-04-26) — section pruning + Mastery CTA + brand fix:
 *   • REMOVED: Professional Activities, Visual Codes, Elevator Pitch
 *              (career-advisory pollution and redundant articulations
 *              that diluted the recognition moment).
 *   • KEPT:    Bullseye, Vibrational Key, Three Lenses, Appreciated
 *              For, Mastery Stages, Roles & Environments,
 *              Complementary Partner, Monetization Avenues, Life Scene.
 *   • ADDED:   Mastery Stages CTA — "Accelerate your path of mastery
 *              — book a session with Aleksandr → t.me/integralevolution"
 *              rendered as a gold-pill block right under the 7-stage list.
 *   • FIXED:   Footer brand — was "geniusbusiness.app" (legacy),
 *              now "aleksandrkonstantinov.com" (canonical home).
 *
 * Day 52 evening — Monetization Avenues restored (Sasha): the prompt
 * in appleseedGenerator.ts was sharpened to demand voice-matched
 * intro/signature/scale tiers with concrete deliverables (no LinkedIn
 * clichés like "1:1 coaching package", "online course", "membership").
 */

import jsPDF from "jspdf";
import { AppleseedData } from "./appleseedGenerator";
import { ExcaliburData } from "./excaliburGenerator";

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const COLORS = {
  navy: [26, 54, 93] as [number, number, number],
  violet: [132, 96, 234] as [number, number, number],
  text: [44, 49, 80] as [number, number, number],
  muted: [120, 120, 140] as [number, number, number],
  divider: [200, 200, 210] as [number, number, number],
  bg: [245, 245, 250] as [number, number, number],
  // Day 52 (Sasha 2026-04-26): warm gold for the Mastery CTA card —
  // matches the "Work with Aleksandr" gold pill on /ai-os hero, so
  // the same offer reads consistently across surfaces.
  gold: [184, 134, 11] as [number, number, number],
  goldFill: [251, 243, 219] as [number, number, number],
};

const MASTERY_CTA_URL = "https://t.me/integralevolution";
const MASTERY_CTA_TEXT = "Accelerate your path of mastery — book a session with Aleksandr →";

const PAGE_W = 210; // A4 mm
const MARGIN = 20;
const CONTENT_W = PAGE_W - MARGIN * 2;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

class PdfBuilder {
  doc: jsPDF;
  y: number;

  constructor() {
    this.doc = new jsPDF({ unit: "mm", format: "a4" });
    this.y = MARGIN;
  }

  /** Ensure enough vertical room; add a new page if needed. */
  ensureSpace(needed: number) {
    if (this.y + needed > 280) {
      this.doc.addPage();
      this.y = MARGIN;
    }
  }

  /** Draw a thin horizontal rule. */
  hr() {
    this.ensureSpace(6);
    this.doc.setDrawColor(...COLORS.divider);
    this.doc.setLineWidth(0.3);
    this.doc.line(MARGIN, this.y, PAGE_W - MARGIN, this.y);
    this.y += 6;
  }

  /** Section header in navy. */
  sectionHeader(label: string) {
    this.ensureSpace(14);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(11);
    this.doc.setTextColor(...COLORS.navy);
    this.doc.text(label.toUpperCase(), MARGIN, this.y);
    this.y += 7;
  }

  /** Sub-header. */
  subHeader(label: string) {
    this.ensureSpace(10);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(9);
    this.doc.setTextColor(...COLORS.violet);
    this.doc.text(label, MARGIN + 2, this.y);
    this.y += 5;
  }

  /** Body text, auto-wrapped. */
  body(text: string, indent = 0) {
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(9);
    this.doc.setTextColor(...COLORS.text);
    const lines = this.doc.splitTextToSize(text, CONTENT_W - indent);
    for (const line of lines) {
      this.ensureSpace(5);
      this.doc.text(line, MARGIN + indent, this.y);
      this.y += 4.5;
    }
    this.y += 2;
  }

  /** Bold label + normal value on same conceptual block. */
  labelValue(label: string, value: string, indent = 0) {
    this.ensureSpace(10);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(9);
    this.doc.setTextColor(...COLORS.muted);
    this.doc.text(label, MARGIN + indent, this.y);
    this.y += 4.5;
    this.body(value, indent);
  }

  /** Bullet list. */
  bulletList(items: string[], indent = 4) {
    for (const item of items) {
      this.ensureSpace(6);
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(9);
      this.doc.setTextColor(...COLORS.text);
      this.doc.text("•", MARGIN + indent, this.y);
      const lines = this.doc.splitTextToSize(item, CONTENT_W - indent - 6);
      for (const line of lines) {
        this.ensureSpace(5);
        this.doc.text(line, MARGIN + indent + 5, this.y);
        this.y += 4.5;
      }
    }
    this.y += 2;
  }

  /** Numbered list. */
  numberedList(items: { num: string; text: string }[], indent = 4) {
    for (const item of items) {
      this.ensureSpace(6);
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(9);
      this.doc.setTextColor(...COLORS.violet);
      this.doc.text(item.num, MARGIN + indent, this.y);
      this.doc.setFont("helvetica", "normal");
      this.doc.setTextColor(...COLORS.text);
      const lines = this.doc.splitTextToSize(item.text, CONTENT_W - indent - 10);
      for (const line of lines) {
        this.ensureSpace(5);
        this.doc.text(line, MARGIN + indent + 8, this.y);
        this.y += 4.5;
      }
    }
    this.y += 2;
  }

  gap(mm = 4) {
    this.y += mm;
  }
}

// ---------------------------------------------------------------------------
// PDF Sections
// ---------------------------------------------------------------------------

function renderHeader(b: PdfBuilder, appleseed: AppleseedData) {
  // Title bar
  b.doc.setFillColor(...COLORS.navy);
  b.doc.rect(0, 0, PAGE_W, 36, "F");

  b.doc.setFont("helvetica", "bold");
  b.doc.setFontSize(18);
  b.doc.setTextColor(255, 255, 255);
  b.doc.text("Zone of Genius Snapshot", MARGIN, 16);

  b.doc.setFont("helvetica", "normal");
  b.doc.setFontSize(11);
  b.doc.text(`:: ${appleseed.vibrationalKey.name} ::`, MARGIN, 26);

  b.doc.setFontSize(8);
  b.doc.setTextColor(180, 200, 220);
  b.doc.text(`Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, MARGIN, 33);

  b.y = 44;
}

function renderBullseye(b: PdfBuilder, appleseed: AppleseedData) {
  b.sectionHeader("1 · Bullseye Sentence");
  b.doc.setFont("helvetica", "bold");
  b.doc.setFontSize(11);
  b.doc.setTextColor(...COLORS.text);
  const lines = b.doc.splitTextToSize(`I ${appleseed.bullseyeSentence}`, CONTENT_W);
  for (const line of lines) {
    b.ensureSpace(6);
    b.doc.text(line, MARGIN, b.y);
    b.y += 5.5;
  }
  b.gap();
}

function renderVibrationalKey(b: PdfBuilder, appleseed: AppleseedData) {
  b.hr();
  b.sectionHeader("2 · Vibrational Key");
  b.labelValue("Archetype Name", appleseed.vibrationalKey.name);
  b.labelValue("Tagline", `"${appleseed.vibrationalKey.tagline}"`);
  if (appleseed.vibrationalKey.tagline_simple) {
    b.labelValue("In plain words", appleseed.vibrationalKey.tagline_simple);
  }
}

function renderThreeLenses(b: PdfBuilder, appleseed: AppleseedData) {
  b.hr();
  b.sectionHeader("3 · Three Lenses");
  b.labelValue("Actions", appleseed.threeLenses.actions.join(" · "));
  b.labelValue("Prime Driver", appleseed.threeLenses.primeDriver);
  if (appleseed.threeLenses.primeDriver_meaning) {
    b.body(`>> ${appleseed.threeLenses.primeDriver_meaning}`, 6);
  }
  b.labelValue("Archetype", appleseed.threeLenses.archetype);
  if (appleseed.threeLenses.archetype_meaning) {
    b.body(`>> ${appleseed.threeLenses.archetype_meaning}`, 6);
  }
}

function renderAppreciatedFor(b: PdfBuilder, appleseed: AppleseedData) {
  b.hr();
  b.sectionHeader("4 · What You're Appreciated & Paid For");
  for (const item of appleseed.appreciatedFor || []) {
    b.subHeader(item.effect);
    b.body(`Scene: ${item.scene}`, 4);
    b.body(`Outcome: ${item.outcome}`, 4);
  }
}

function renderMasteryStages(b: PdfBuilder, appleseed: AppleseedData) {
  b.hr();
  b.sectionHeader("5 · Mastery Stages");
  b.numberedList(
    (appleseed.masteryStages || []).map((s) => ({
      num: `${s.stage}.`,
      text: `${s.name} — ${s.description}`,
    }))
  );
  // Day 52 (Sasha 2026-04-26): CTA card right under the 7 stages.
  // The path of mastery has stages — and a guide. This pulls users
  // who feel the pull toward acceleration straight to the booking
  // surface (Telegram DM with Aleksandr).
  renderMasteryCta(b);
}

function renderMasteryCta(b: PdfBuilder) {
  b.gap(2);
  b.ensureSpace(18);
  // Soft gold-fill card, gold border, gold link text. jsPDF link()
  // makes the whole card clickable in any standard PDF viewer.
  const cardX = MARGIN;
  const cardY = b.y;
  const cardH = 14;
  const cardW = CONTENT_W;
  b.doc.setFillColor(...COLORS.goldFill);
  b.doc.setDrawColor(...COLORS.gold);
  b.doc.setLineWidth(0.4);
  b.doc.roundedRect(cardX, cardY, cardW, cardH, 2.5, 2.5, "FD");
  b.doc.setFont("helvetica", "bold");
  b.doc.setFontSize(9);
  b.doc.setTextColor(...COLORS.gold);
  b.doc.textWithLink(MASTERY_CTA_TEXT, cardX + 4, cardY + 9, {
    url: MASTERY_CTA_URL,
  });
  // Make the entire card clickable, not only the text glyphs.
  b.doc.link(cardX, cardY, cardW, cardH, { url: MASTERY_CTA_URL });
  b.y = cardY + cardH + 4;
}

function renderRolesEnvironments(b: PdfBuilder, appleseed: AppleseedData) {
  b.hr();
  b.sectionHeader("6 · Roles & Environments");
  b.labelValue("As Creator", appleseed.rolesEnvironments?.asCreator || "—");
  b.labelValue("As Contributor", appleseed.rolesEnvironments?.asContributor || "—");
  b.labelValue("As Founder", appleseed.rolesEnvironments?.asFounder || "—");
  b.labelValue("Ideal Environment", appleseed.rolesEnvironments?.environment || "—");
}

function renderComplementaryPartner(b: PdfBuilder, appleseed: AppleseedData) {
  b.hr();
  b.sectionHeader("7 · Best Complementary Partner");
  b.labelValue("Skills-wise", appleseed.complementaryPartner?.skillsWise || "—");
  b.labelValue("Genius-wise", appleseed.complementaryPartner?.geniusWise || "—");
  b.labelValue("Archetype-wise", appleseed.complementaryPartner?.archetypeWise || "—");
  b.labelValue("Synergy", appleseed.complementaryPartner?.synergy || "—");
}

function renderMonetization(b: PdfBuilder, appleseed: AppleseedData) {
  // Day 52 (Sasha 2026-04-26): restored. The earlier removal stripped a
  // load-bearing section — founders need to see their three voice-matched
  // value-ladder offers (intro / signature / scale). The prompt was
  // sharpened to demand specificity (no LinkedIn clichés); see
  // appleseedGenerator.ts ROASTING_INSTRUCTIONS for the new bar.
  b.hr();
  b.sectionHeader("8 · Monetization Avenues");
  b.bulletList(appleseed.monetizationAvenues || []);
}

function renderLifeScene(b: PdfBuilder, appleseed: AppleseedData) {
  b.hr();
  b.sectionHeader("9 · Life Scene");
  b.doc.setFont("helvetica", "italic");
  b.doc.setFontSize(9);
  b.doc.setTextColor(...COLORS.text);
  const lines = b.doc.splitTextToSize(appleseed.lifeScene || "", CONTENT_W - 4);
  for (const line of lines) {
    b.ensureSpace(5);
    b.doc.text(line, MARGIN + 2, b.y);
    b.y += 4.5;
  }
  b.gap();
}

// Day 52 (Sasha 2026-04-26): Professional Activities, Monetization
// Avenues, Visual Codes, and Elevator Pitch removed from the rendered
// PDF per Sasha. The underlying JSON fields stay populated by the
// generator (no migration), so older snapshots remain valid; the
// renderer simply stops reading them. If we ever want to bring any
// of them back, restore the function and re-add to the call list.

// ---------------------------------------------------------------------------
// Excalibur (Genius Business) — optional page
// ---------------------------------------------------------------------------

function renderExcalibur(b: PdfBuilder, excalibur: ExcaliburData) {
  b.doc.addPage();
  b.y = MARGIN;

  // Header bar
  b.doc.setFillColor(...COLORS.violet);
  b.doc.rect(0, 0, PAGE_W, 28, "F");
  b.doc.setFont("helvetica", "bold");
  b.doc.setFontSize(16);
  b.doc.setTextColor(255, 255, 255);
  b.doc.text("My Unique Genius Business", MARGIN, 14);
  b.doc.setFont("helvetica", "normal");
  b.doc.setFontSize(10);
  b.doc.text(excalibur.businessIdentity?.name || "", MARGIN, 23);
  b.y = 36;

  // Business Identity
  b.sectionHeader("Business Identity");
  b.labelValue("Name", excalibur.businessIdentity?.name || "—");
  b.labelValue("Tagline", excalibur.businessIdentity?.tagline || "—");

  // Essence Anchor
  b.hr();
  b.sectionHeader("Essence Anchor");
  b.labelValue("Genius Apple Seed", excalibur.essenceAnchor?.geniusAppleSeed || "—");
  b.labelValue("Prime Driver", excalibur.essenceAnchor?.primeDriver || "—");
  b.labelValue("Archetype", excalibur.essenceAnchor?.archetype || "—");

  // Offer
  b.hr();
  b.sectionHeader("Your Offer");
  b.labelValue("Statement", excalibur.offer?.statement || "—");
  b.labelValue("Form", excalibur.offer?.form || "—");
  b.labelValue("Deliverable", excalibur.offer?.deliverable || "—");

  // Ideal Client
  b.hr();
  b.sectionHeader("Ideal Client");
  b.labelValue("Profile", excalibur.idealClient?.profile || "—");
  b.labelValue("Problem", excalibur.idealClient?.problem || "—");
  b.labelValue("Aha Moment", excalibur.idealClient?.aha || "—");

  // Transformational Promise
  b.hr();
  b.sectionHeader("Transformational Promise");
  b.labelValue("From", excalibur.transformationalPromise?.fromState || "—");
  b.labelValue("To", excalibur.transformationalPromise?.toState || "—");
  b.labelValue("Journey", excalibur.transformationalPromise?.journey || "—");

  // Channels
  b.hr();
  b.sectionHeader("Channels");
  b.labelValue("Primary", excalibur.channels?.primary || "—");
  b.labelValue("Secondary", excalibur.channels?.secondary || "—");
  b.labelValue("Hook", excalibur.channels?.hook || "—");

  // Bigger Arc
  b.hr();
  b.sectionHeader("The Bigger Arc");
  b.labelValue("Vision", excalibur.biggerArc?.vision || "—");
  b.labelValue("Moonshot", excalibur.biggerArc?.moonshot || "—");
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

function renderFooter(b: PdfBuilder) {
  // Day 52 (Sasha 2026-04-26): brand fix — was "geniusbusiness.app"
  // (legacy product name from the metaprompt era), now the canonical
  // home Sasha actually uses. findyourtoptalent.com redirects there.
  const pageCount = b.doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    b.doc.setPage(i);
    b.doc.setFont("helvetica", "normal");
    b.doc.setFontSize(7);
    b.doc.setTextColor(...COLORS.muted);
    b.doc.text(
      `Page ${i} of ${pageCount}  ·  aleksandrkonstantinov.com`,
      PAGE_W / 2,
      292,
      { align: "center" }
    );
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function generateZogPdf(
  appleseed: AppleseedData,
  excalibur?: ExcaliburData | null
): void {
  const b = new PdfBuilder();

  // Appleseed pages — Day 52 (Sasha 2026-04-26) section list:
  //   1. Bullseye · 2. Vibrational Key · 3. Three Lenses
  //   4. Appreciated For · 5. Mastery Stages (+CTA)
  //   6. Roles & Environments · 7. Complementary Partner
  //   8. Monetization Avenues · 9. Life Scene
  // Removed: Professional Activities, Visual Codes, Elevator Pitch
  // (see file header note for rationale). Monetization restored
  // 2026-04-26 with a sharpened prompt (intro/signature/scale tiers,
  // voice-matched names, no LinkedIn clichés).
  renderHeader(b, appleseed);
  renderBullseye(b, appleseed);
  renderVibrationalKey(b, appleseed);
  renderThreeLenses(b, appleseed);
  renderAppreciatedFor(b, appleseed);
  renderMasteryStages(b, appleseed);
  renderRolesEnvironments(b, appleseed);
  renderComplementaryPartner(b, appleseed);
  renderMonetization(b, appleseed);
  renderLifeScene(b, appleseed);

  // Excalibur page (optional)
  if (excalibur) {
    renderExcalibur(b, excalibur);
  }

  // Page numbers
  renderFooter(b);

  // Download
  const filename = `Zone_of_Genius_${appleseed.vibrationalKey.name.replace(/\s+/g, "_")}.pdf`;
  b.doc.save(filename);
}
