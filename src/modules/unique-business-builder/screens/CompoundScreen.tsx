/**
 * CompoundScreen — renders multiple sub-artifacts on one screen.
 *
 * Used for:
 *   /ubb/session         → [session_bridge]
 *   /ubb/marketing       → [core_belief, packaging, frictionless_purchase]
 *   /ubb/distribution    → [reach, delivery, spread]
 *   /ubb/communications  → [surface_inventory, tuning_fork, golden_dm]
 *
 * Day 53 (Sasha 2026-04-27): full editorial re-skin to match the
 * landing/playbook register — Cormorant headline + italic subtitle,
 * skin-token sub-artifact panels, ceremonial Generate button, gold
 * hairlines between sections, navigation pills with gold rims for
 * Prev/Next. Sub-artifact cards now read as illuminated parchment
 * blocks rather than generic shadcn cards.
 */

import { useLocation, Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useUniqueBusiness } from "../UniqueBusinessContext";
import { ImproveButton } from "../components/ImproveButton";
import { SpecificityBadge } from "../components/SpecificityBadge";
import { ARTIFACT_LABELS, ROUTES, UBB_ROOT } from "../constants";
import { COMPOUND_GROUPING, type ArtifactKey, type CompoundScreenKey } from "../types";

const SLUG_TO_COMPOUND: Record<string, CompoundScreenKey> = {
  session: "session",
  marketing: "marketing",
  distribution: "distribution",
  communications: "communications",
};

const COMPOUND_ORDER: CompoundScreenKey[] = ["session", "marketing", "distribution", "communications"];

type NavTarget = { label: string; to: string };

const COMPOUND_TITLES: Record<CompoundScreenKey, { title: string; subtitle: string }> = {
  session: {
    title: "1st Session Design",
    subtitle:
      "Transformational Result → Trinity of Sub-Results → 1st Session that delivers guaranteed wins without overwhelm.",
  },
  marketing: {
    title: "Marketing — 3 Pillars",
    subtitle: "Core Belief · Packaging · Frictionless Purchase.",
  },
  distribution: {
    title: "Distribution — 3 Pillars",
    subtitle: "Reach · Delivery · Spread.",
  },
  communications: {
    title: "Communications",
    subtitle: "Surface Inventory · Tuning Fork · Golden DM.",
  },
};

const nextTarget = (current: CompoundScreenKey): NavTarget | null => {
  const idx = COMPOUND_ORDER.indexOf(current);
  if (idx >= 0 && idx < COMPOUND_ORDER.length - 1) {
    const next = COMPOUND_ORDER[idx + 1];
    return { label: COMPOUND_TITLES[next].title, to: `${UBB_ROOT}/${next}` };
  }
  if (current === "communications") {
    return { label: "Landing Page", to: ROUTES.landingPage };
  }
  return null;
};

const prevTarget = (current: CompoundScreenKey): NavTarget | null => {
  const idx = COMPOUND_ORDER.indexOf(current);
  if (idx > 0) {
    const prev = COMPOUND_ORDER[idx - 1];
    return { label: COMPOUND_TITLES[prev].title, to: `${UBB_ROOT}/${prev}` };
  }
  if (current === "session") {
    return { label: "Canvas", to: UBB_ROOT };
  }
  return null;
};

export default function CompoundScreen() {
  const location = useLocation();
  const slug = location.pathname.split("/").pop() || "";
  const compound = SLUG_TO_COMPOUND[slug];

  if (!compound) {
    return (
      <div
        className="mx-auto max-w-2xl py-16 text-center"
        style={{ color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))" }}
      >
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "16px",
            fontStyle: "italic",
          }}
        >
          Unknown section: {slug}
        </div>
        <Link
          to={UBB_ROOT}
          className="mt-4 inline-flex items-center rounded-full px-4 py-2"
          style={navPillStyle}
        >
          ← Back to Canvas
        </Link>
      </div>
    );
  }

  const subKeys = COMPOUND_GROUPING[compound];
  const meta = COMPOUND_TITLES[compound];
  const next = nextTarget(compound);
  const prev = prevTarget(compound);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* ═══ Header ═══ Cormorant title + Source Serif italic subtitle */}
      <header className="space-y-2">
        <h1
          className="leading-[1.05]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 600,
            fontSize: "clamp(28px, 3.5vw, 36px)",
            letterSpacing: "-0.005em",
            color: "var(--skin-text-primary, #0b2a5a)",
            textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
          }}
        >
          {meta.title}
        </h1>
        <p
          style={{
            fontFamily: "'Source Serif 4', serif",
            fontStyle: "italic",
            fontSize: "15.5px",
            lineHeight: 1.55,
            color: "var(--skin-text-body, rgba(11, 42, 90, 0.85))",
          }}
        >
          {meta.subtitle}
        </p>
        {/* Hairline beneath header */}
        <div
          className="h-px w-full"
          style={{
            background:
              "linear-gradient(90deg, rgba(212, 175, 55, 0.45) 0%, rgba(212, 175, 55, 0.18) 25%, rgba(26, 30, 58, 0.08) 70%, rgba(26, 30, 58, 0) 100%)",
          }}
        />
      </header>

      {/* ═══ Sub-artifact cards ═══ */}
      <div className="space-y-5">
        {subKeys.map((key) => (
          <SubArtifactCard key={key} artifactKey={key} />
        ))}
      </div>

      {/* ═══ Prev / Next nav row ═══ */}
      {(next || prev) && (
        <div
          className="mt-12 flex items-center justify-between gap-4 pt-6"
          style={{ borderTop: "0.5px solid var(--skin-rule-medium, rgba(26, 30, 58, 0.15))" }}
        >
          <div>
            {prev && (
              <Link to={prev.to} className="group inline-flex items-center gap-2 rounded-full px-4 py-2 transition-all duration-200 hover:translate-y-[-0.5px]" style={navPillStyle}>
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:-translate-x-0.5"
                  style={{ color: "var(--skin-accent-gold, #b8860b)" }}
                >
                  ←
                </span>
                {prev.label}
              </Link>
            )}
          </div>
          <div>
            {next && (
              <Link to={next.to} className="group inline-flex items-center gap-2 rounded-full px-5 py-2.5 transition-all duration-200 hover:translate-y-[-0.5px]" style={navPillStyleStrong}>
                <span
                  style={{
                    fontFamily: "'Source Serif 4', serif",
                    fontStyle: "italic",
                    fontSize: "11.5px",
                    color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
                    textTransform: "none",
                    letterSpacing: 0,
                    fontWeight: 500,
                  }}
                >
                  Next:&nbsp;
                </span>
                {next.label}
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                  style={{ color: "var(--skin-accent-gold, #b8860b)" }}
                >
                  →
                </span>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Pill styles ────────────────────────────────────────────────── */

const navPillStyle: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontWeight: 600,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  fontSize: "11.5px",
  color: "var(--skin-text-primary, #0b2a5a)",
  background: "rgba(255, 255, 255, 0.68)",
  border: "0.5px solid var(--skin-rule-medium, rgba(26, 30, 58, 0.15))",
};

const navPillStyleStrong: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontWeight: 600,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  fontSize: "12.5px",
  color: "var(--skin-text-primary, #0b2a5a)",
  background: "rgba(255, 255, 255, 0.68)",
  border: "0.5px solid rgba(212, 175, 55, 0.55)",
  boxShadow: "0 0 14px -4px rgba(212, 175, 55, 0.32)",
};

/* ─── Sub-artifact card ──────────────────────────────────────────── */

function SubArtifactCard({ artifactKey }: { artifactKey: ArtifactKey }) {
  // Day 62 (Sasha 2026-05-05) BUG FIX — compound sub-artifacts had no
  // Lock UI. Generated content lived on `latest`, but `latestLocked`
  // stayed null forever because there was no button to flip
  // `is_locked = true`. As a result:
  //   • DossierScreen rendered every compound row as "Gap — not yet
  //     locked" (it reads `latestLocked` as the source of truth).
  //   • The pane-2 build navigation showed Marketing 0/3, Distribution
  //     0/3, Communications 0/3, 1st Session 0/1 — even after the
  //     founder had improved each artifact several times.
  //   • The dossier's avg specificity / locked count derived metrics
  //     ignored compound work entirely.
  // The data was correct all along; the UI just had no way to lock.
  // Mirroring the Lock & Unlock pattern from GenericArtifactScreen's
  // ArtifactView (single-artifact route) restores parity. After this
  // ships, Sasha clicks Lock on each of his existing 10 compound
  // sub-artifacts once and the counters/dossier update correctly.
  const { artifacts, generateArtifact, isGenerating, lockArtifact, unlockArtifact, updateArtifactScore } = useUniqueBusiness();
  const state = artifacts[artifactKey];
  const latest = state?.latest;
  const isLocked = !!state?.latestLocked;
  const thisIsGenerating = isGenerating === artifactKey;

  return (
    <div
      className="relative rounded-2xl p-5"
      style={{
        background: "var(--skin-card-bg, rgba(255, 255, 255, 0.68))",
        border: "0.5px solid var(--skin-card-border, rgba(26, 30, 58, 0.08))",
        boxShadow:
          "var(--skin-card-shadow, 0 4px 16px -8px rgba(10, 22, 40, 0.12), 0 16px 40px -20px rgba(10, 22, 40, 0.18))",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                fontSize: "20px",
                letterSpacing: "-0.005em",
                color: "var(--skin-text-primary, #0b2a5a)",
              }}
            >
              {ARTIFACT_LABELS[artifactKey]}
            </h2>
            {latest && (
              <SpecificityBadge
                score={latest.specificity_score}
                size="sm"
                onScoreChange={state?.latestLocked ? undefined : (s) => updateArtifactScore(artifactKey, s)}
              />
            )}
          </div>
          {latest && (
            <div
              className="mt-1"
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: "11px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontWeight: 500,
                color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
                fontVariantNumeric: "tabular-nums lining-nums",
              }}
            >
              v{latest.version} · {state?.versionCount} version
              {state?.versionCount === 1 ? "" : "s"}
              {state?.latestLocked && (
                <>
                  {" · "}
                  <span style={{ color: "var(--skin-accent-gold, #b8860b)" }}>locked</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        {!latest ? (
          <div className="py-4 text-center">
            <p
              className="mb-3"
              style={{
                fontFamily: "'Source Serif 4', serif",
                fontStyle: "italic",
                fontSize: "14px",
                color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
              }}
            >
              Not generated yet.
            </p>
            <button
              onClick={() => generateArtifact(artifactKey)}
              disabled={thisIsGenerating}
              className="group relative inline-flex items-center gap-2 rounded-full px-5 py-2.5 transition-all duration-300 hover:translate-y-[-0.5px] disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background: "var(--skin-cta-bg, linear-gradient(135deg, rgba(10,22,40,0.82) 0%, rgba(18,28,56,0.72) 50%, rgba(10,22,40,0.82) 100%))",
                color: "var(--skin-cta-text, rgba(245, 245, 250, 0.98))",
                border: "0.5px solid var(--skin-cta-border, rgba(255, 255, 255, 0.14))",
                boxShadow:
                  "var(--skin-cta-shadow, 0 0 0 1px rgba(212, 175, 55, 0.28), 0 0 18px -4px rgba(240, 194, 127, 0.45))",
                backdropFilter: "blur(14px) saturate(160%)",
                WebkitBackdropFilter: "blur(14px) saturate(160%)",
              }}
            >
              {thisIsGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" style={{ color: "var(--skin-cta-icon)" }} />
                  <span style={ceremonialLabelSm}>Generating…</span>
                </>
              ) : (
                <>
                  <span aria-hidden="true" style={ceremonialIconSm}>✦</span>
                  <span style={ceremonialLabelSm}>Generate {ARTIFACT_LABELS[artifactKey]}</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <>
            {/* Day 53 night iter 2 (Sasha 2026-04-27): was a card-inside-
                card (outer 0.65 cream + inner 0.45 cream) — visually
                identical to the wrapping SubArtifactCard, no information
                layering. Replaced with gold-left-rule treatment: 1.5px
                hairline at the left edge, no background. Reads as a
                "quoted excerpt" of the artifact rather than a nested
                card. The outer SubArtifactCard owns the card-ness; the
                inner content is just the founder's words. */}
            <div
              className="mb-4 pl-4 py-1"
              style={{
                borderLeft: "1.5px solid rgba(212, 175, 55, 0.55)",
              }}
            >
              <CompactContent content={latest.content} />
            </div>
            {/* Day 62 (Sasha 2026-05-05): Action row — Improve · Lock.
                Was previously just <ImproveButton/> end-justified, with
                no Lock affordance. Now mirrors GenericArtifactScreen's
                Improve-Lock pair (Continue lives at the compound-level
                Next button at the bottom of the screen, not per-card —
                multiple sub-artifacts per screen, so Continue is the
                whole-compound's job). */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <ImproveButton artifactKey={artifactKey} size="default" />
              {!isLocked ? (
                <button
                  onClick={() => lockArtifact(artifactKey)}
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 transition-all duration-200 hover:translate-y-[-0.5px]"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 600,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    fontSize: "12px",
                    color: "var(--skin-text-primary, #0b2a5a)",
                    background: "rgba(255, 255, 255, 0.68)",
                    border: "0.5px solid rgba(212, 175, 55, 0.55)",
                    boxShadow: "0 0 14px -4px rgba(212, 175, 55, 0.32)",
                  }}
                >
                  <span aria-hidden="true" style={{ color: "var(--skin-accent-gold, #b8860b)" }}>✓</span>
                  Lock
                </button>
              ) : (
                <button
                  onClick={() => unlockArtifact(artifactKey)}
                  className="text-xs underline transition-colors duration-200 hover:no-underline"
                  style={{
                    fontFamily: "'Source Serif 4', serif",
                    fontStyle: "italic",
                    fontSize: "12.5px",
                    color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
                  }}
                >
                  Unlock to improve again
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const ceremonialLabelSm: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontWeight: 600,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  fontSize: "12px",
  textShadow: "var(--skin-cta-text-shadow, 0 0 16px rgba(240,194,127,0.28))",
};

const ceremonialIconSm: React.CSSProperties = {
  color: "var(--skin-cta-icon, rgba(244, 212, 114, 0.98))",
  textShadow: "var(--skin-cta-icon-shadow, 0 0 12px rgba(244,212,114,0.8))",
  fontSize: "14px",
};

/* ─── Compact content renderer ───────────────────────────────────── */
//
// Day 51: recursive renderer — was rendering nested objects/arrays as
// raw JSON via JSON.stringify. Day 53: typography upgraded to skin
// tokens + Source Serif 4 prose + DM Sans labels + gold middot bullets.

function renderCompactValue(v: unknown): React.ReactNode {
  if (v === null || v === undefined) {
    return <span style={italicMutedSm}>(empty)</span>;
  }
  if (typeof v === "string") {
    return <span className="whitespace-pre-wrap">{v}</span>;
  }
  if (typeof v === "number" || typeof v === "boolean") {
    return <span style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>{String(v)}</span>;
  }
  if (Array.isArray(v)) {
    const allStrings = v.every((x) => typeof x === "string");
    if (allStrings) {
      return (
        <ul className="space-y-1 pl-0">
          {v.map((s, i) => (
            <li
              key={i}
              className="flex gap-1.5"
              style={{ color: "var(--skin-text-body, rgba(11, 42, 90, 0.85))" }}
            >
              <span
                aria-hidden="true"
                className="flex-shrink-0"
                style={{
                  color: "var(--skin-accent-gold, #b8860b)",
                  fontSize: "12px",
                  lineHeight: "1.4",
                }}
              >
                ·
              </span>
              <span>{s as string}</span>
            </li>
          ))}
        </ul>
      );
    }
    return (
      <div className="space-y-1.5">
        {v.map((x, i) => (
          <div
            key={i}
            className="rounded p-2"
            style={{
              border: "0.5px solid var(--skin-rule-hairline, rgba(26, 30, 58, 0.08))",
            }}
          >
            {renderCompactValue(x)}
          </div>
        ))}
      </div>
    );
  }
  if (typeof v === "object") {
    return (
      <div className="space-y-1.5">
        {Object.entries(v as Record<string, unknown>).map(([k, val]) => (
          <div key={k}>
            <span style={inlineLabel}>{k.replace(/[_-]+/g, " ")}:</span>{" "}
            <span style={{ fontSize: "13px" }}>{renderCompactValue(val)}</span>
          </div>
        ))}
      </div>
    );
  }
  return <span>{String(v)}</span>;
}

function CompactContent({ content }: { content: unknown }) {
  if (content === null || content === undefined) {
    return <span style={italicMutedSm}>(empty)</span>;
  }
  if (typeof content === "string") {
    return (
      <div
        className="whitespace-pre-wrap"
        style={{
          fontFamily: "'Source Serif 4', serif",
          fontSize: "14.5px",
          lineHeight: 1.55,
          color: "var(--skin-text-body, rgba(11, 42, 90, 0.85))",
        }}
      >
        {content}
      </div>
    );
  }
  if (typeof content === "object") {
    return (
      <div className="space-y-2.5">
        {Object.entries(content as Record<string, unknown>).map(([k, v]) => (
          <div key={k}>
            <span style={inlineLabel}>{k.replace(/[_-]+/g, " ")}:</span>{" "}
            <span
              style={{
                fontFamily: "'Source Serif 4', serif",
                fontSize: "14px",
                lineHeight: 1.55,
                color: "var(--skin-text-body, rgba(11, 42, 90, 0.85))",
              }}
            >
              {renderCompactValue(v)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <span
      style={{ fontFamily: "'Source Serif 4', serif", color: "var(--skin-text-body)" }}
    >
      {String(content)}
    </span>
  );
}

const inlineLabel: React.CSSProperties = {
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontWeight: 500,
  fontSize: "10px",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
};

const italicMutedSm: React.CSSProperties = {
  fontFamily: "'Source Serif 4', serif",
  fontStyle: "italic",
  fontSize: "13px",
  color: "var(--skin-text-muted, rgba(11, 42, 90, 0.55))",
};
