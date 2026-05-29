/**
 * BulkImprovePanel — Day 74 (Sasha 2026-05-22).
 *
 * Replaces the flat "Some artifacts may be stale" banner. Two states:
 *
 *   IDLE (one or more stale artifacts, no cascade running):
 *     → "N stale · Improve all (~$0.0XX · ~Ns AI compute)" call-to-action
 *     → expandable list of which artifacts and why
 *
 *   CASCADING (bulk improve in progress):
 *     → live progress: "X of N · currently improving Pain"
 *     → tally so far: improved · rejected · skipped · failed
 *     → cancel button (any in-flight AI call resolves naturally; queue stops)
 *
 * Renders nothing when there is no work to do and no cascade running.
 *
 * Design register matches the canvas overview: paper-warm card, gold accents
 * on the action surface, Cormorant for the headline, DM Sans for tabular nums.
 */

import { useMemo, useState } from "react";
import { useUniqueBusiness } from "../UniqueBusinessContext";
import { ARTIFACT_LABELS } from "../constants";
import type { ArtifactKey, ArtifactState } from "../types";

// Cost ≈ $0.0005 per Improve call (midpoint of $0.0003–$0.0008 observed
// against Gemini 2.5 Flash via Lovable AI Gateway). Time ≈ 7 seconds of
// AI compute per call — excludes the founder's own review time, which
// varies. We surface AI compute only; review time is the user's, not ours
// to estimate.
const COST_PER_CALL_USD = 0.0005;
const SECONDS_PER_CALL = 7;

function formatCost(n: number): string {
  const total = n * COST_PER_CALL_USD;
  // Keep three decimals so 1 artifact reads as $0.001 (not $0.000).
  return `$${total.toFixed(3)}`;
}

function formatAiTime(n: number): string {
  const seconds = n * SECONDS_PER_CALL;
  if (seconds < 60) return `~${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `~${m}m ${s}s` : `~${m}m`;
}

export function BulkImprovePanel() {
  const { artifacts, bulkImprove, startBulkImprove, cancelBulkImprove } = useUniqueBusiness();
  const [expanded, setExpanded] = useState(false);

  // Collect stale artifacts in dependency order via the artifacts map.
  // The reason copy lives on each ArtifactState (set by the parent-aware
  // staleness compute in UniqueBusinessContext).
  const stale = useMemo(() => {
    return Object.values(artifacts)
      .filter((s): s is ArtifactState => !!s && s.isStale)
      .map((s) => s.key);
  }, [artifacts]);

  // Day 74 Phase 2 (Sasha 2026-05-22) + Day 78 Phase 4b (Sasha 2026-05-21):
  // classify the stale set by axis so the banner copy can reflect the actual
  // cause. Three axes with distinct semantics:
  //   parent_relocked = structural cascade (upstream changed)
  //   prompt_changed  = AI ceiling lift (prompt code edited)
  //   input_changed   = founder reality drift (mission / assets / ZoG edited)
  // Mixing them under one generic banner would conflate the signals.
  const staleMix = useMemo(() => {
    let promptCount = 0;
    let inputCount = 0;
    let parentCount = 0;
    for (const k of stale) {
      const src = artifacts[k]?.stalenessSource;
      if (src?.type === "prompt_changed") promptCount++;
      else if (src?.type === "input_changed") inputCount++;
      else if (src?.type === "parent_relocked") parentCount++;
    }
    return { promptCount, inputCount, parentCount };
  }, [stale, artifacts]);

  // Don't render anything when nothing to do and no cascade running.
  if (!bulkImprove && stale.length === 0) return null;

  // ─── Cascading state ────────────────────────────────────────────────
  if (bulkImprove) {
    const processed =
      bulkImprove.accepted.length +
      bulkImprove.rejected.length +
      bulkImprove.skipped.length +
      bulkImprove.failed.length;
    const currentLabel = bulkImprove.current
      ? ARTIFACT_LABELS[bulkImprove.current]
      : "queuing next…";

    const tallyParts = [
      bulkImprove.accepted.length > 0 ? `${bulkImprove.accepted.length} improved` : null,
      bulkImprove.rejected.length > 0 ? `${bulkImprove.rejected.length} rejected` : null,
      bulkImprove.skipped.length > 0 ? `${bulkImprove.skipped.length} skipped` : null,
      bulkImprove.failed.length > 0 ? `${bulkImprove.failed.length} failed` : null,
    ].filter(Boolean);

    return (
      <div
        className="relative rounded-2xl p-4"
        style={{
          background:
            "var(--skin-tint-gold-soft, linear-gradient(135deg, rgba(212,175,55,0.10), rgba(212,175,55,0.03)))",
          border: "0.5px solid rgba(212, 175, 55, 0.50)",
          boxShadow: "0 4px 16px -8px rgba(212, 175, 55, 0.25)",
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                fontSize: "17px",
                color: "var(--skin-text-primary, #0b2a5a)",
              }}
            >
              Cascading {processed + 1} of {bulkImprove.total}
              <span
                aria-hidden="true"
                style={{
                  margin: "0 0.4em",
                  color: "var(--skin-text-muted, rgba(11, 42, 90, 0.45))",
                }}
              >
                ·
              </span>
              <span
                style={{
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: "var(--skin-text-muted, rgba(11, 42, 90, 0.72))",
                }}
              >
                {currentLabel}
              </span>
            </div>
            {tallyParts.length > 0 && (
              <div
                className="mt-1"
                style={{
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: "11.5px",
                  color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
                  fontVariantNumeric: "tabular-nums lining-nums",
                }}
              >
                {tallyParts.join(" · ")}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={cancelBulkImprove}
            className="shrink-0 rounded-full px-3 py-1.5 transition-all hover:opacity-90"
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "var(--skin-text-primary, #0b2a5a)",
              background: "rgba(11, 42, 90, 0.06)",
              border: "0.5px solid rgba(11, 42, 90, 0.18)",
            }}
            aria-label="Stop the bulk cascade"
          >
            Stop
          </button>
        </div>
      </div>
    );
  }

  // ─── Idle state with stale artifacts ────────────────────────────────
  const n = stale.length;

  // Day 74 Phase 2: pick the banner narrative by which axis dominates.
  // Pure prompt-stale → ceiling lift framing. Pure parent-stale → cascade
  // framing (Phase 1 wording, preserved). Mixed → name both honestly so
  // the founder reads the breakdown before clicking "Improve all."
  const { promptCount, inputCount, parentCount } = staleMix;
  let headline = "";
  let subhead = "";
  if (promptCount > 0 && inputCount === 0 && parentCount === 0) {
    headline =
      n === 1
        ? "Prompt updated — 1 artifact below ceiling"
        : `Prompt updated — ${n} artifacts below ceiling`;
    subhead =
      "The AI's prompt has been refined since these were locked. Re-Improve to claim the new ceiling.";
  } else if (inputCount > 0 && promptCount === 0 && parentCount === 0) {
    headline =
      n === 1
        ? "Your context updated — 1 artifact needs refresh"
        : `Your context updated — ${n} artifacts need refresh`;
    subhead =
      "Your mission or assets changed since these were locked. Re-Improve to carry the new context.";
  } else if (parentCount > 0 && promptCount === 0 && inputCount === 0) {
    headline = `${n} ${n === 1 ? "artifact" : "artifacts"} may be stale`;
    subhead =
      "An upstream artifact was relocked after these — re-Improving carries the change downstream.";
  } else {
    const parts: string[] = [];
    if (promptCount > 0) parts.push(`${promptCount} prompt`);
    if (inputCount > 0) parts.push(`${inputCount} context`);
    if (parentCount > 0) parts.push(`${parentCount} cascade`);
    headline = `${n} stale · ${parts.join(" · ")}`;
    subhead =
      "Multiple updates fired since these were locked. Open the list to see which is which.";
  }

  return (
    <div
      className="relative rounded-2xl p-4"
      style={{
        background:
          "var(--skin-tint-gold-soft, linear-gradient(135deg, rgba(212,175,55,0.08), rgba(212,175,55,0.02)))",
        border: "0.5px solid rgba(212, 175, 55, 0.40)",
        boxShadow: "0 4px 16px -8px rgba(212, 175, 55, 0.20)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 600,
              fontSize: "17px",
              color: "var(--skin-text-primary, #0b2a5a)",
            }}
          >
            {headline}
          </div>
          <div
            className="mt-1"
            style={{
              fontFamily: "'Source Serif 4', serif",
              fontStyle: "italic",
              fontSize: "13px",
              color: "var(--skin-text-muted, rgba(11, 42, 90, 0.65))",
            }}
          >
            {subhead}
          </div>
        </div>
        <button
          type="button"
          onClick={() => startBulkImprove(stale)}
          className="shrink-0 rounded-full px-4 py-2 transition-all hover:translate-y-[-1px]"
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.03em",
            color: "#3a2c08",
            background: "linear-gradient(135deg, #f4d472, #d4af37)",
            border: "0.5px solid rgba(212, 175, 55, 0.65)",
            boxShadow: "0 4px 14px -4px rgba(212, 175, 55, 0.5)",
            whiteSpace: "nowrap",
          }}
          aria-label={`Improve all ${n} stale artifacts`}
        >
          Improve all {n}
          <span
            style={{
              marginLeft: "0.5em",
              opacity: 0.7,
              fontVariantNumeric: "tabular-nums lining-nums",
              fontWeight: 500,
            }}
          >
            ~{formatCost(n)} · {formatAiTime(n)}
          </span>
        </button>
      </div>

      {/* Expandable per-artifact list */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-2.5 text-left transition-opacity hover:opacity-100"
        style={{
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontSize: "11px",
          fontWeight: 500,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "var(--skin-text-muted, rgba(11, 42, 90, 0.55))",
          opacity: 0.85,
          background: "transparent",
          border: "none",
          padding: 0,
          cursor: "pointer",
        }}
      >
        {expanded ? "Hide details" : "Show which ones"}
      </button>

      {expanded && (
        <ul
          className="mt-2 space-y-1"
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: "12px",
            color: "var(--skin-text-muted, rgba(11, 42, 90, 0.72))",
          }}
        >
          {stale.map((k) => {
            const state = artifacts[k];
            return (
              <li key={k} className="flex items-start gap-2">
                <span
                  aria-hidden="true"
                  style={{ color: "#b8860b", fontSize: "9px", marginTop: "5px" }}
                >
                  ●
                </span>
                <span>
                  <strong style={{ fontWeight: 600 }}>{ARTIFACT_LABELS[k]}</strong>
                  {state?.staleReason ? (
                    <span
                      style={{
                        color: "var(--skin-text-muted, rgba(11, 42, 90, 0.55))",
                        marginLeft: "0.4em",
                      }}
                    >
                      — {state.staleReason}
                    </span>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// Helper export — used by the canvas overview to decide whether to allocate
// the "stale section" slot at all. Mirrors the panel's own render check so
// the spacing stays clean.
export function useShouldShowBulkPanel(): boolean {
  const { artifacts, bulkImprove } = useUniqueBusiness();
  const anyStale = useMemo(
    () => Object.values(artifacts).some((s) => !!s && s.isStale),
    [artifacts]
  );
  return !!bulkImprove || anyStale;
}
