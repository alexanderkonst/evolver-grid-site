/**
 * GenericArtifactScreen — a single artifact view.
 *
 * Used for uniqueness, myth, tribe, pain, promise, lead_magnet,
 * value_ladder, landing_page. Gets artifact_key from the route.
 *
 * Phase B (session) and Phase C (marketing/distribution/communications)
 * use a separate CompoundScreen to stack multiple sub-artifacts.
 *
 * Day 53 (Sasha 2026-04-27): full editorial re-skin to match the
 * landing/playbook register. Cormorant headline, skin-token body
 * surface, ceremonial Improve / Lock / Continue trio. The artifact
 * card now reads as illuminated parchment, not a settings card.
 */

import { useLocation, Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useUniqueBusiness } from "../UniqueBusinessContext";
import { ImproveButton } from "../components/ImproveButton";
import { SpecificityBadge } from "../components/SpecificityBadge";
import { ARTIFACT_LABELS, UBB_ROOT, ARTIFACT_URL_SLUGS } from "../constants";
import { ALL_ARTIFACT_KEYS } from "../types";
import type { ArtifactKey } from "../types";

// Map URL slug → artifact_key (reverse of ARTIFACT_URL_SLUGS, excluding compound slugs)
const SLUG_TO_KEY: Record<string, ArtifactKey> = {
  uniqueness: "uniqueness",
  myth: "myth",
  tribe: "tribe",
  pain: "pain",
  promise: "promise",
  "lead-magnet": "lead_magnet",
  "value-ladder": "value_ladder",
  "specificity-matrix": "specificity_matrix",
  "landing-page": "landing_page",
};

export default function GenericArtifactScreen() {
  const location = useLocation();
  const slug = location.pathname.split("/").pop() || "";
  const artifactKey = SLUG_TO_KEY[slug];

  if (!artifactKey) {
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
          Unknown artifact: {slug}
        </div>
        <Link
          to={UBB_ROOT}
          className="mt-4 inline-flex items-center rounded-full px-4 py-2"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontSize: "11.5px",
            color: "var(--skin-text-primary, #0b2a5a)",
            background: "rgba(255, 255, 255, 0.68)",
            border: "0.5px solid rgba(212, 175, 55, 0.45)",
          }}
        >
          ← Back to Canvas
        </Link>
      </div>
    );
  }

  return <ArtifactView artifactKey={artifactKey} />;
}

export function ArtifactView({ artifactKey }: { artifactKey: ArtifactKey }) {
  const { artifacts, generateArtifact, isGenerating, lockArtifact, unlockArtifact, updateArtifactScore, isInitializing } = useUniqueBusiness();
  const state = artifacts[artifactKey];
  const latest = state?.latest;
  const isLocked = !!state?.latestLocked;
  const thisIsGenerating = isGenerating === artifactKey;

  const nextKey = findNextUnlocked(artifactKey, artifacts);

  // Day 53 night iter 3 (Sasha 2026-04-27): skeleton during initial fetch.
  // Prevents the "Nothing here yet — Generate your first version" empty
  // state from flashing for ~500ms before real data arrives, which would
  // confuse a returning founder who already generated this artifact.
  if (isInitializing) {
    return <ArtifactSkeleton label={ARTIFACT_LABELS[artifactKey]} />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* ═══ Title ═══ */}
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
        {ARTIFACT_LABELS[artifactKey]}
      </h1>

      {!latest ? (
        /* ─── Empty state — generate first version ─── */
        <div
          className="space-y-5 rounded-2xl px-6 py-8 text-center"
          style={{
            background: "var(--skin-card-bg, rgba(255, 255, 255, 0.68))",
            border: "0.5px solid var(--skin-card-border, rgba(26, 30, 58, 0.08))",
            boxShadow: "var(--skin-card-shadow, 0 4px 16px -8px rgba(10, 22, 40, 0.12), 0 16px 40px -20px rgba(10, 22, 40, 0.18))",
          }}
        >
          <p
            style={{
              fontFamily: "'Source Serif 4', 'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontSize: "16px",
              lineHeight: 1.55,
              color: "var(--skin-text-body, rgba(11, 42, 90, 0.85))",
            }}
          >
            Nothing here yet. Generate your first version to start iterating.
          </p>
          <button
            onClick={() => generateArtifact(artifactKey)}
            disabled={thisIsGenerating}
            className="group relative inline-flex items-center gap-2.5 rounded-full px-6 py-3 transition-all duration-300 hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: "var(--skin-cta-bg, linear-gradient(135deg, rgba(10,22,40,0.82) 0%, rgba(18,28,56,0.72) 50%, rgba(10,22,40,0.82) 100%))",
              color: "var(--skin-cta-text, rgba(245, 245, 250, 0.98))",
              border: "0.5px solid var(--skin-cta-border, rgba(255, 255, 255, 0.14))",
              boxShadow: "var(--skin-cta-shadow, 0 0 0 1px rgba(212, 175, 55, 0.28), 0 0 18px -4px rgba(240, 194, 127, 0.45), 0 0 40px -8px rgba(212, 175, 55, 0.28))",
              backdropFilter: "blur(14px) saturate(160%)",
              WebkitBackdropFilter: "blur(14px) saturate(160%)",
            }}
          >
            {thisIsGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" style={{ color: "var(--skin-cta-icon)" }} />
                <span style={ceremonialLabel}>Generating…</span>
              </>
            ) : (
              <>
                <span aria-hidden="true" style={ceremonialIcon}>✦</span>
                <span style={ceremonialLabel}>Generate {ARTIFACT_LABELS[artifactKey]}</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <>
          {/* ─── Artifact body — illuminated card ─── */}
          <div
            className="relative space-y-5 rounded-2xl px-6 py-6"
            style={{
              background: "var(--skin-card-bg, rgba(255, 255, 255, 0.68))",
              border: "0.5px solid var(--skin-card-border, rgba(26, 30, 58, 0.08))",
              boxShadow: "var(--skin-card-shadow, 0 4px 16px -8px rgba(10, 22, 40, 0.12), 0 16px 40px -20px rgba(10, 22, 40, 0.18))",
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div
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
                  {isLocked && (
                    <>
                      {" · "}
                      <span style={{ color: "var(--skin-accent-gold, #b8860b)" }}>locked</span>
                    </>
                  )}
                </div>
                <div className="mt-3">
                  <ArtifactContentView content={latest.content} />
                </div>
              </div>
              <SpecificityBadge
                score={latest.specificity_score}
                onScoreChange={isLocked ? undefined : (s) => updateArtifactScore(artifactKey, s)}
              />
            </div>
          </div>

          {/* ─── Action row — Improve · Lock · Continue ─── */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <ImproveButton artifactKey={artifactKey} />
            {!isLocked ? (
              <button
                onClick={() => lockArtifact(artifactKey)}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 transition-all duration-200 hover:translate-y-[-0.5px]"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontSize: "12.5px",
                  color: "var(--skin-text-primary, #0b2a5a)",
                  background: "rgba(255, 255, 255, 0.68)",
                  border: "0.5px solid rgba(212, 175, 55, 0.55)",
                  boxShadow: "0 0 14px -4px rgba(212, 175, 55, 0.32)",
                }}
              >
                <span aria-hidden="true" style={{ color: "var(--skin-accent-gold, #b8860b)" }}>✓</span>
                Lock & Continue
              </button>
            ) : nextKey ? (
              <Link
                to={`${UBB_ROOT}/${ARTIFACT_URL_SLUGS[nextKey]}`}
                className="group inline-flex items-center gap-2 rounded-full px-5 py-2.5 transition-all duration-200 hover:translate-y-[-0.5px]"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontSize: "12.5px",
                  color: "var(--skin-text-primary, #0b2a5a)",
                  background: "rgba(255, 255, 255, 0.68)",
                  border: "0.5px solid rgba(212, 175, 55, 0.55)",
                  boxShadow: "0 0 14px -4px rgba(212, 175, 55, 0.32)",
                }}
              >
                Continue to {ARTIFACT_LABELS[nextKey]}
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                  style={{ color: "var(--skin-accent-gold, #b8860b)" }}
                >
                  →
                </span>
              </Link>
            ) : (
              <Link
                to={`${UBB_ROOT}/dossier`}
                className="group inline-flex items-center gap-2 rounded-full px-5 py-2.5 transition-all duration-200 hover:translate-y-[-0.5px]"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontSize: "12.5px",
                  color: "var(--skin-text-primary, #0b2a5a)",
                  background: "rgba(255, 255, 255, 0.68)",
                  border: "0.5px solid rgba(212, 175, 55, 0.55)",
                  boxShadow: "0 0 14px -4px rgba(212, 175, 55, 0.32)",
                }}
              >
                Open Dossier
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

          {isLocked && (
            <div className="text-center">
              <button
                onClick={() => unlockArtifact(artifactKey)}
                className="text-xs underline transition-colors duration-200 hover:no-underline"
                style={{
                  fontFamily: "'Source Serif 4', serif",
                  fontStyle: "italic",
                  color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
                }}
              >
                Unlock to improve again
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Ceremonial typography presets ──────────────────────────────── */

const ceremonialLabel: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontWeight: 600,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  fontSize: "13px",
  textShadow: "var(--skin-cta-text-shadow, 0 0 16px rgba(240,194,127,0.28))",
};

const ceremonialIcon: React.CSSProperties = {
  color: "var(--skin-cta-icon, rgba(244, 212, 114, 0.98))",
  textShadow: "var(--skin-cta-icon-shadow, 0 0 12px rgba(244,212,114,0.8))",
  fontSize: "16px",
};

/* ─── Skeleton — initial fetch placeholder ───────────────────────── */

function ArtifactSkeleton({ label }: { label: string }) {
  const skBlock = (h: string, w: string, opacity = 1): React.CSSProperties => ({
    height: h,
    width: w,
    background:
      "linear-gradient(90deg, rgba(11, 42, 90, 0.04) 0%, rgba(11, 42, 90, 0.10) 50%, rgba(11, 42, 90, 0.04) 100%)",
    borderRadius: "8px",
    opacity,
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Real title — keeps the user oriented during the load */}
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
        {label}
      </h1>
      <div
        className="space-y-4 rounded-2xl px-6 py-6"
        style={{
          background: "var(--skin-card-bg, rgba(255, 255, 255, 0.65))",
          border: "0.5px solid var(--skin-card-border, rgba(26, 30, 58, 0.08))",
          boxShadow:
            "var(--skin-card-shadow, 0 4px 16px -8px rgba(10, 22, 40, 0.12), 0 16px 40px -20px rgba(10, 22, 40, 0.18))",
        }}
      >
        <div className="motion-safe:animate-pulse" style={skBlock("12px", "120px")} />
        <div className="space-y-2 pt-2">
          <div className="motion-safe:animate-pulse" style={skBlock("14px", "92%", 0.8)} />
          <div className="motion-safe:animate-pulse" style={skBlock("14px", "78%", 0.8)} />
          <div className="motion-safe:animate-pulse" style={skBlock("14px", "85%", 0.8)} />
          <div className="motion-safe:animate-pulse" style={skBlock("14px", "60%", 0.8)} />
        </div>
      </div>
    </div>
  );
}

/* ─── Recursive content renderer ─────────────────────────────────── */
//
// Day 51 (Sasha): renderValue handles arrays as bullet lists and nested
// objects as labeled blocks. Day 53: typography upgraded — labels in
// Cormorant tracked-uppercase + skin-text-muted, values in Source Serif
// 4 italic for prose, DM Sans for data, with skin-token colors. Lists
// use a gold middot pseudo-bullet.

function renderValue(v: unknown): React.ReactNode {
  if (v === null || v === undefined) {
    return <span style={italicMuted}>(empty)</span>;
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
        <ul className="space-y-1.5 pl-0">
          {v.map((s, i) => (
            <li
              key={i}
              className="flex gap-2 leading-relaxed"
              style={{ color: "var(--skin-text-body, rgba(11, 42, 90, 0.85))" }}
            >
              <span
                aria-hidden="true"
                className="flex-shrink-0"
                style={{
                  color: "var(--skin-accent-gold, #b8860b)",
                  textShadow: "var(--skin-accent-gold-glow, 0 0 6px rgba(240,194,127,0.5))",
                  fontSize: "13px",
                  lineHeight: "1.5",
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
      <div className="space-y-2.5">
        {v.map((x, i) => (
          <div
            key={i}
            className="rounded-lg p-3"
            style={{
              background: "rgba(255, 255, 255, 0.45)",
              border: "0.5px solid var(--skin-rule-medium, rgba(26, 30, 58, 0.15))",
            }}
          >
            {renderValue(x)}
          </div>
        ))}
      </div>
    );
  }
  if (typeof v === "object") {
    return (
      <div className="space-y-2.5">
        {Object.entries(v as Record<string, unknown>).map(([k, val]) => (
          <div key={k}>
            <div style={fieldLabel}>{k.replace(/[_-]+/g, " ")}</div>
            <div
              className="mt-0.5"
              style={{
                fontFamily: "'Source Serif 4', serif",
                fontSize: "14.5px",
                lineHeight: 1.55,
                color: "var(--skin-text-body, rgba(11, 42, 90, 0.85))",
              }}
            >
              {renderValue(val)}
            </div>
          </div>
        ))}
      </div>
    );
  }
  return <span>{String(v)}</span>;
}

function ArtifactContentView({ content }: { content: unknown }) {
  if (content === null || content === undefined) {
    return <div style={italicMuted}>(empty)</div>;
  }
  if (typeof content === "string") {
    return (
      <div
        className="whitespace-pre-wrap"
        style={{
          fontFamily: "'Source Serif 4', serif",
          fontSize: "16px",
          lineHeight: 1.6,
          color: "var(--skin-text-body, rgba(11, 42, 90, 0.85))",
        }}
      >
        {content}
      </div>
    );
  }
  if (isSpecificityMatrix(content)) {
    return <SpecificityMatrixView content={content} />;
  }
  if (typeof content === "object") {
    return (
      <div className="space-y-4">
        {Object.entries(content as Record<string, unknown>).map(([k, v]) => (
          <div key={k}>
            <div style={sectionLabel}>{k.replace(/[_-]+/g, " ")}</div>
            <div
              className="mt-1.5"
              style={{
                fontFamily: "'Source Serif 4', serif",
                fontSize: "15px",
                lineHeight: 1.6,
                color: "var(--skin-text-body, rgba(11, 42, 90, 0.85))",
              }}
            >
              {renderValue(v)}
            </div>
          </div>
        ))}
      </div>
    );
  }
  return <div style={{ fontFamily: "'Source Serif 4', serif", color: "var(--skin-text-body)" }}>{String(content)}</div>;
}

const sectionLabel: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontWeight: 600,
  fontSize: "11.5px",
  letterSpacing: "0.20em",
  textTransform: "uppercase",
  color: "var(--skin-accent-gold, #b8860b)",
};

const fieldLabel: React.CSSProperties = {
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontWeight: 500,
  fontSize: "10px",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
};

const italicMuted: React.CSSProperties = {
  fontFamily: "'Source Serif 4', serif",
  fontStyle: "italic",
  fontSize: "14px",
  color: "var(--skin-text-muted, rgba(11, 42, 90, 0.55))",
};

/* ─── Specificity Matrix renderer ────────────────────────────────── */

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
    return typeof r.resonant === "string" && typeof r.partial === "string" && typeof r.off === "string";
  });
}

function SpecificityMatrixView({ content }: { content: MatrixContent }) {
  return (
    <div className="space-y-5">
      {content.meta_question && (
        <div>
          <div style={sectionLabel}>The question every reveal asks beneath the words</div>
          <div
            className="mt-1.5 italic"
            style={{
              fontFamily: "'Source Serif 4', serif",
              fontSize: "15px",
              lineHeight: 1.55,
              color: "var(--skin-text-body, rgba(11, 42, 90, 0.85))",
            }}
          >
            {content.meta_question}
          </div>
        </div>
      )}
      {content.voice_signature && (
        <div>
          <div style={sectionLabel}>Voice signature</div>
          <div
            className="mt-1.5"
            style={{
              fontFamily: "'Source Serif 4', serif",
              fontSize: "15px",
              lineHeight: 1.55,
              color: "var(--skin-text-body, rgba(11, 42, 90, 0.85))",
            }}
          >
            {content.voice_signature}
          </div>
        </div>
      )}
      <div
        className="overflow-x-auto rounded-xl"
        style={{
          background: "rgba(255, 255, 255, 0.40)",
          border: "0.5px solid var(--skin-rule-medium, rgba(26, 30, 58, 0.15))",
        }}
      >
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr
              style={{
                borderBottom: "0.5px solid var(--skin-rule-strong, rgba(26, 30, 58, 0.25))",
                background: "var(--skin-tint-gold-soft, rgba(212, 175, 55, 0.06))",
              }}
            >
              <th className="px-4 py-3 text-left" style={tableHeader}>Stage</th>
              <th className="px-4 py-3 text-left" style={tableHeader}>Resonant (8–10)</th>
              <th className="px-4 py-3 text-left" style={tableHeader}>Partial (5–7)</th>
              <th className="px-4 py-3 text-left" style={tableHeader}>Off (1–4)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(content.stages).map(([stage, row]) => (
              <tr
                key={stage}
                className="align-top"
                style={{
                  borderBottom: "0.5px solid var(--skin-rule-hairline, rgba(26, 30, 58, 0.08))",
                }}
              >
                <td
                  className="px-4 py-3.5"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 600,
                    fontSize: "12px",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "var(--skin-accent-gold, #b8860b)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {stage}
                </td>
                <td
                  className="px-4 py-3.5 italic"
                  style={{
                    fontFamily: "'Source Serif 4', serif",
                    fontSize: "13.5px",
                    lineHeight: 1.55,
                    color: "var(--skin-text-body, rgba(11, 42, 90, 0.85))",
                  }}
                >
                  {row.resonant}
                </td>
                <td
                  className="px-4 py-3.5 italic"
                  style={{
                    fontFamily: "'Source Serif 4', serif",
                    fontSize: "13.5px",
                    lineHeight: 1.55,
                    color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
                  }}
                >
                  {row.partial}
                </td>
                <td
                  className="px-4 py-3.5 italic"
                  style={{
                    fontFamily: "'Source Serif 4', serif",
                    fontSize: "13.5px",
                    lineHeight: 1.55,
                    color: "var(--skin-text-muted, rgba(11, 42, 90, 0.5))",
                  }}
                >
                  {row.off}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const tableHeader: React.CSSProperties = {
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontWeight: 600,
  fontSize: "10.5px",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
};

function findNextUnlocked(
  after: ArtifactKey,
  artifacts: Partial<Record<ArtifactKey, { latestLocked: unknown }>>
): ArtifactKey | null {
  const idx = ALL_ARTIFACT_KEYS.indexOf(after);
  for (let i = idx + 1; i < ALL_ARTIFACT_KEYS.length; i++) {
    const k = ALL_ARTIFACT_KEYS[i];
    if (!artifacts[k]?.latestLocked) return k;
  }
  return null;
}
