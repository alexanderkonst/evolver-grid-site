/**
 * DossierScreen — the publication threshold.
 *
 * Composed view of all artifacts at their latest-locked versions.
 * Auto-composed from state (not improved directly). Publishing creates
 * a shareable snapshot at /dossier/{slug}.
 *
 * Day 53 (Sasha 2026-04-27): full editorial re-skin to match the
 * landing/playbook register. The dossier is the most ceremonial UBB
 * surface — the moment the founder's 19 artifacts become a single
 * publishable artifact-of-artifacts. Visual register reflects that
 * weight: Cormorant headline, gold ✦ phase rules, illuminated
 * parchment rows, ceremonial Publish CTA with gold halo.
 *
 * Hardcoded "18" replaced with ALL_ARTIFACT_KEYS.length (now 19) — same
 * fix applied to CanvasOverviewScreen on Day 53 morning.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useUniqueBusiness } from "../UniqueBusinessContext";
import { SpecificityBadge } from "../components/SpecificityBadge";
import { ARTIFACT_LABELS, UBB_ROOT, ARTIFACT_URL_SLUGS, phaseOf, PHASE_LABELS } from "../constants";
import { ALL_ARTIFACT_KEYS } from "../types";
import type { ArtifactKey } from "../types";

export default function DossierScreen() {
  const { artifacts, lockedCount, avgSpecificity, publishDossier } = useUniqueBusiness();
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  const totalArtifacts = ALL_ARTIFACT_KEYS.length;
  const remainingToLock = totalArtifacts - lockedCount;

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const result = await publishDossier();
      const url = `${window.location.origin}/dossier/${result.slug}`;
      setPublishedUrl(url);
    } catch (e: any) {
      toast.error(e?.message || "Publish failed.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopy = () => {
    if (publishedUrl) {
      navigator.clipboard.writeText(publishedUrl);
      toast.success("URL copied.");
    }
  };

  // Group artifacts by phase
  const byPhase: Record<string, ArtifactKey[]> = {};
  for (const key of ALL_ARTIFACT_KEYS) {
    const p = phaseOf(key);
    byPhase[p] = byPhase[p] || [];
    byPhase[p].push(key);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-9">
      {/* ═══ Header ═══ */}
      <header className="space-y-2">
        <h1
          className="leading-[1.05]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 600,
            fontSize: "clamp(28px, 4vw, 40px)",
            letterSpacing: "-0.005em",
            color: "var(--skin-text-primary, #0b2a5a)",
            textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
          }}
        >
          Your Unique Business Dossier
        </h1>
        <p
          className="flex flex-wrap items-baseline gap-x-3 gap-y-1"
          style={{
            fontFamily: "'Source Serif 4', serif",
            fontStyle: "italic",
            fontSize: "15px",
            color: "var(--skin-text-body, rgba(11, 42, 90, 0.85))",
          }}
        >
          <span>
            <span
              className="not-italic"
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums lining-nums",
                color: "var(--skin-text-primary, #0b2a5a)",
              }}
            >
              {lockedCount}
            </span>
            {" of "}
            <span
              className="not-italic"
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums lining-nums",
                color: "var(--skin-text-primary, #0b2a5a)",
              }}
            >
              {totalArtifacts}
            </span>
            {" locked"}
          </span>
          {avgSpecificity > 0 && (
            <span style={{ color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))" }}>
              · avg specificity{" "}
              <span
                className="not-italic"
                style={{
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums lining-nums",
                  color: "var(--skin-text-primary, #0b2a5a)",
                }}
              >
                {avgSpecificity.toFixed(1)}
              </span>
            </span>
          )}
        </p>
      </header>

      {/* ═══ Gap warning ═══ */}
      {lockedCount < totalArtifacts && (
        <div
          className="relative rounded-2xl px-4 py-3.5"
          style={{
            background: "var(--skin-tint-gold-soft, linear-gradient(135deg, rgba(212,175,55,0.08), rgba(212,175,55,0.02)))",
            border: "0.5px solid rgba(212, 175, 55, 0.40)",
            boxShadow: "0 4px 16px -8px rgba(212, 175, 55, 0.22)",
          }}
        >
          <p
            style={{
              fontFamily: "'Source Serif 4', serif",
              fontSize: "14px",
              lineHeight: 1.55,
              color: "var(--skin-text-body, rgba(11, 42, 90, 0.85))",
            }}
          >
            <span
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontWeight: 600,
                color: "var(--skin-text-primary, #0b2a5a)",
                fontVariantNumeric: "tabular-nums lining-nums",
              }}
            >
              {remainingToLock}
            </span>
            {" "}
            artifact{remainingToLock === 1 ? "" : "s"} not yet locked. Gaps shown below — finish them before publishing.
          </p>
        </div>
      )}

      {/* ═══ Phase sections ═══ */}
      {(Object.keys(PHASE_LABELS) as Array<keyof typeof PHASE_LABELS>).map((phase) => {
        const keys = byPhase[phase] || [];
        if (keys.length === 0) return null;
        return (
          <section key={phase} className="space-y-3">
            {/* Phase rule — gold ✦ + Cormorant tracked uppercase + hairline */}
            <div className="flex items-baseline gap-3">
              <span
                aria-hidden="true"
                style={{
                  color: "var(--skin-accent-gold, #b8860b)",
                  textShadow: "var(--skin-accent-gold-glow, 0 0 10px rgba(240,194,127,0.6))",
                  fontSize: "13px",
                }}
              >
                ✦
              </span>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 600,
                  fontSize: "13px",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "var(--skin-accent-gold, #b8860b)",
                }}
              >
                {PHASE_LABELS[phase]}
              </h2>
            </div>
            <div
              className="h-px w-full"
              style={{
                background:
                  "linear-gradient(90deg, rgba(212, 175, 55, 0.45) 0%, rgba(212, 175, 55, 0.18) 25%, rgba(26, 30, 58, 0.08) 70%, rgba(26, 30, 58, 0) 100%)",
              }}
            />
            <div className="space-y-2.5 pt-1">
              {keys.map((k) => (
                <DossierRow key={k} artifactKey={k} />
              ))}
            </div>
          </section>
        );
      })}

      {/* ═══ Publish panel ═══ Ceremonial CTA on a gold-tinted glass card */}
      <div
        className="relative space-y-4 overflow-hidden rounded-2xl px-5 py-5"
        style={{
          background: "var(--skin-card-bg, rgba(255, 255, 255, 0.68))",
          border: "0.5px solid rgba(212, 175, 55, 0.45)",
          boxShadow:
            "0 0 22px -8px rgba(212, 175, 55, 0.30), 0 16px 40px -20px rgba(10, 22, 40, 0.18)",
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                fontSize: "20px",
                letterSpacing: "-0.005em",
                color: "var(--skin-text-primary, #0b2a5a)",
              }}
            >
              Publish this Dossier
            </div>
            <p
              className="mt-1"
              style={{
                fontFamily: "'Source Serif 4', serif",
                fontStyle: "italic",
                fontSize: "13.5px",
                lineHeight: 1.5,
                color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
              }}
            >
              Creates a shareable snapshot of your current {totalArtifacts} artifacts.
            </p>
          </div>
          <button
            onClick={handlePublish}
            disabled={isPublishing || lockedCount === 0}
            className="group relative inline-flex items-center gap-2.5 rounded-full px-6 py-3 transition-all duration-300 hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: "var(--skin-cta-bg, linear-gradient(135deg, rgba(10,22,40,0.82) 0%, rgba(18,28,56,0.72) 50%, rgba(10,22,40,0.82) 100%))",
              color: "var(--skin-cta-text, rgba(245, 245, 250, 0.98))",
              border: "0.5px solid var(--skin-cta-border, rgba(255, 255, 255, 0.14))",
              boxShadow:
                "var(--skin-cta-shadow, 0 0 0 1px rgba(212, 175, 55, 0.28), 0 0 18px -4px rgba(240, 194, 127, 0.45), 0 0 40px -8px rgba(212, 175, 55, 0.28))",
              backdropFilter: "blur(14px) saturate(160%)",
              WebkitBackdropFilter: "blur(14px) saturate(160%)",
            }}
          >
            {isPublishing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" style={{ color: "var(--skin-cta-icon)" }} />
                <span style={ceremonialLabel}>Publishing…</span>
              </>
            ) : (
              <>
                <span aria-hidden="true" style={ceremonialIcon}>✦</span>
                <span style={ceremonialLabel}>Publish Dossier</span>
              </>
            )}
          </button>
        </div>

        {publishedUrl && (
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2.5"
            style={{
              background: "rgba(212, 175, 55, 0.08)",
              border: "0.5px solid rgba(212, 175, 55, 0.45)",
              boxShadow: "inset 0 0 12px -4px rgba(244, 212, 114, 0.30)",
            }}
          >
            <code
              className="flex-1 truncate"
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: "12px",
                color: "var(--skin-text-primary, #0b2a5a)",
              }}
            >
              {publishedUrl}
            </code>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 transition-colors duration-200 hover:bg-white/30"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontSize: "10px",
                color: "var(--skin-text-primary, #0b2a5a)",
              }}
            >
              <Copy className="h-3 w-3" />
              Copy
            </button>
            <a
              href={publishedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full px-3 py-1 transition-all duration-200 hover:translate-y-[-0.5px]"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontSize: "10px",
                color: "var(--skin-text-primary, #0b2a5a)",
                background: "rgba(255, 255, 255, 0.68)",
                border: "0.5px solid rgba(212, 175, 55, 0.55)",
              }}
            >
              Open ↗
            </a>
          </div>
        )}
      </div>

      {/* ═══ Back to Canvas pill ═══ */}
      <div>
        <Link
          to={UBB_ROOT}
          className="group inline-flex items-center gap-2 rounded-full px-4 py-2 transition-all duration-200 hover:translate-y-[-0.5px]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontSize: "11.5px",
            color: "var(--skin-text-primary, #0b2a5a)",
            background: "rgba(255, 255, 255, 0.68)",
            border: "0.5px solid var(--skin-rule-medium, rgba(26, 30, 58, 0.15))",
          }}
        >
          <span
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:-translate-x-0.5"
            style={{ color: "var(--skin-accent-gold, #b8860b)" }}
          >
            ←
          </span>
          Back to Canvas
        </Link>
      </div>
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

/* ─── Dossier row ────────────────────────────────────────────────── */

function DossierRow({ artifactKey }: { artifactKey: ArtifactKey }) {
  const { artifacts } = useUniqueBusiness();
  const state = artifacts[artifactKey];
  const locked = state?.latestLocked;

  if (!locked) {
    // Gap state — soft amber tint, faint italic, "Start" pill
    return (
      <div
        className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
        style={{
          background: "rgba(255, 252, 245, 0.55)",
          border: "0.5px solid rgba(212, 175, 55, 0.30)",
          boxShadow: "0 2px 8px -4px rgba(212, 175, 55, 0.18)",
        }}
      >
        <div className="min-w-0">
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 600,
              fontSize: "16px",
              color: "var(--skin-text-primary, #0b2a5a)",
            }}
          >
            {ARTIFACT_LABELS[artifactKey]}
          </div>
          <div
            className="mt-0.5 italic"
            style={{
              fontFamily: "'Source Serif 4', serif",
              fontSize: "12.5px",
              color: "var(--skin-accent-gold, #b8860b)",
            }}
          >
            Gap — not yet locked.
          </div>
        </div>
        <Link
          to={`${UBB_ROOT}/${ARTIFACT_URL_SLUGS[artifactKey]}`}
          className="inline-flex items-center rounded-full px-4 py-1.5 transition-all duration-200 hover:translate-y-[-0.5px]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontSize: "11px",
            color: "var(--skin-text-primary, #0b2a5a)",
            background: "rgba(255, 255, 255, 0.65)",
            border: "0.5px solid rgba(212, 175, 55, 0.55)",
            boxShadow: "0 0 10px -4px rgba(212, 175, 55, 0.30)",
          }}
        >
          Start
        </Link>
      </div>
    );
  }

  // Locked state — illuminated parchment row
  return (
    <div
      className="rounded-xl px-4 py-3.5"
      style={{
        background: "var(--skin-card-bg, rgba(255, 255, 255, 0.68))",
        border: "0.5px solid var(--skin-card-border, rgba(26, 30, 58, 0.08))",
        boxShadow:
          "var(--skin-card-shadow, 0 4px 16px -8px rgba(10, 22, 40, 0.10), 0 16px 40px -20px rgba(10, 22, 40, 0.15))",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                fontSize: "17px",
                letterSpacing: "0.005em",
                color: "var(--skin-text-primary, #0b2a5a)",
              }}
            >
              {ARTIFACT_LABELS[artifactKey]}
            </div>
            <SpecificityBadge score={locked.specificity_score} size="sm" />
          </div>
          <div className="mt-2">
            <CompactDossierContent content={locked.content} />
          </div>
        </div>
        <Link
          to={`${UBB_ROOT}/${ARTIFACT_URL_SLUGS[artifactKey]}`}
          className="inline-flex flex-shrink-0 items-center rounded-full px-3 py-1 transition-colors duration-200 hover:bg-white/40"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontSize: "10.5px",
            color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
          }}
        >
          Edit
        </Link>
      </div>
    </div>
  );
}

/* ─── Compact content (preview lines for the dossier list) ───────── */

function CompactDossierContent({ content }: { content: unknown }) {
  if (content === null || content === undefined) return null;

  const proseStyle: React.CSSProperties = {
    fontFamily: "'Source Serif 4', serif",
    fontSize: "14px",
    lineHeight: 1.55,
    color: "var(--skin-text-body, rgba(11, 42, 90, 0.85))",
  };

  if (typeof content === "string") {
    return <div className="whitespace-pre-wrap" style={proseStyle}>{content}</div>;
  }
  if (typeof content === "object") {
    const entries = Object.entries(content as Record<string, unknown>);
    return (
      <div className="space-y-1.5">
        {entries.slice(0, 4).map(([k, v]) => (
          <div key={k} className="flex flex-wrap items-baseline gap-x-1.5">
            <span style={inlineLabel}>{k.replace(/[_-]+/g, " ")}:</span>
            {typeof v === "string" ? (
              <span style={proseStyle}>{v}</span>
            ) : Array.isArray(v) && v.every((x) => typeof x === "string") ? (
              <span style={proseStyle}>{(v as string[]).join(" · ")}</span>
            ) : (
              <span
                style={{
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: "12px",
                  color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
                }}
              >
                {JSON.stringify(v).slice(0, 120)}
              </span>
            )}
          </div>
        ))}
        {entries.length > 4 && (
          <div
            className="italic"
            style={{
              fontFamily: "'Source Serif 4', serif",
              fontSize: "12px",
              color: "var(--skin-text-muted, rgba(11, 42, 90, 0.55))",
            }}
          >
            + {entries.length - 4} more field{entries.length - 4 === 1 ? "" : "s"}
          </div>
        )}
      </div>
    );
  }
  return <span style={proseStyle}>{String(content)}</span>;
}

const inlineLabel: React.CSSProperties = {
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontWeight: 500,
  fontSize: "10px",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
};
