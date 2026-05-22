/**
 * CanvasOverviewScreen — the entry surface of UBB.
 *
 * Lists all 19 artifacts grouped by phase, each with specificity +
 * version count + lock state. CTA: continue with the next unlocked
 * artifact.
 *
 * Day 53 (Sasha 2026-04-27): full editorial re-skin. The canvas
 * overview is now a manuscript, not a dashboard:
 *   - Cormorant Garamond hero + phase rules + artifact names
 *   - skin-token text + card surfaces (Aurora-aware)
 *   - gold ✦ ornaments on phase rules
 *   - ceremonial CTA pill (liquid-glass-dark + gold halo) for "Continue"
 *   - state icons re-keyed to brand semantics: gold ✓ locked,
 *     navy ⟳ improvable, faint ◯ pending
 *   - hairlines instead of borders, paper-warm card surfaces
 *
 * The visual gravity now matches the spiritual gravity established
 * on the landing + playbook surfaces.
 */

import { Link, useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { useUniqueBusiness } from "../UniqueBusinessContext";
import { SpecificityBadge } from "../components/SpecificityBadge";
import { BulkImprovePanel } from "../components/BulkImprovePanel";
import {
  ALL_ARTIFACT_KEYS,
  PHASE_A_CANVAS,
  PHASE_B_SESSION,
  PHASE_C_MARKET,
  PHASE_D_PUBLICATION,
} from "../types";
import { ARTIFACT_LABELS, ARTIFACT_URL_SLUGS, UBB_ROOT, ROUTES } from "../constants";
import { PARENTS } from "../dependencyTree";
import type { ArtifactKey } from "../types";
import { getStepForArtifact } from "@/data/playbookArtifactMap";
// Day 53 night iter 4 (Sasha 2026-04-27): tier badge for gifted/paid users
// — appears in the Canvas Overview hero so the founder sees their tier
// without needing to check Stripe or settings. Silent on default 'tasting'.
import { EntitlementBadge } from "@/components/EntitlementBadge";

export default function CanvasOverviewScreen() {
  const { artifacts, lockedCount, avgSpecificity, stalenessWarnings, isInitializing } = useUniqueBusiness();
  const navigate = useNavigate();

  const firstUnlocked = ALL_ARTIFACT_KEYS.find((k) => !artifacts[k]?.latestLocked) as
    | ArtifactKey
    | undefined;
  const totalArtifacts = ALL_ARTIFACT_KEYS.length;

  // Day 53 night iter 3 (Sasha 2026-04-27): empty state trigger.
  // A fresh founder lands on /ubb with NO artifacts generated yet —
  // currently sees a wall of 19 "Not started" cards across 4 phase
  // grids. That reads as a dim spreadsheet, not an invitation. When
  // hasStarted is false (no artifact has any `latest` content yet),
  // we render a focused "Begin here" surface instead of the grids.
  // Once they generate even one artifact, the full grid view returns.
  const hasStarted = ALL_ARTIFACT_KEYS.some((k) => !!artifacts[k]?.latest);

  // Skeleton during the initial fetch — without this, the empty state
  // would flash for a beat on every page load before real data arrives.
  if (isInitializing) {
    return <CanvasOverviewSkeleton />;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      {/* ═══ Hero ═══ Cormorant headline + italic subhead + glance row */}
      <section className="space-y-3">
        {/* Tier badge — surfaces gifted/paid status above the title.
            Silent for tasting users (most). */}
        <EntitlementBadge />
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
          Autonomous AI Venture Builder
        </h1>
        <p
          className="max-w-3xl"
          style={{
            fontFamily: "'Source Serif 4', 'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: "16px",
            lineHeight: 1.55,
            color: "var(--skin-text-body, rgba(11, 42, 90, 0.85))",
          }}
        >
          No human in the loop. The AI extracts your uniqueness, composes {totalArtifacts} artifacts of a complete business, and ships them as a live venture. You press <span className="not-italic">✦&nbsp;Improve</span> when something doesn't yet sound like only you. Every pass becomes a new version — nothing is ever lost.
        </p>

        {/* Glance row — DM Sans tabular-nums for digits */}
        <div
          className="flex flex-wrap items-baseline gap-x-6 gap-y-1.5 pt-2"
          style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
        >
          <div className="text-sm">
            <span
              className="text-2xl"
              style={{
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums lining-nums",
                color: "var(--skin-text-primary, #0b2a5a)",
              }}
            >
              {lockedCount}
            </span>
            <span
              className="ml-1.5"
              style={{ color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))" }}
            >
              of {totalArtifacts} locked
            </span>
          </div>
          {avgSpecificity > 0 && (
            <div
              className="text-sm"
              style={{ color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))" }}
            >
              avg specificity{" "}
              <span
                className="text-base"
                style={{
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums lining-nums",
                  color: "var(--skin-text-primary, #0b2a5a)",
                }}
              >
                {avgSpecificity.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {lockedCount >= 10 && lockedCount < totalArtifacts && (
          <p
            className="pt-1 italic"
            style={{
              fontFamily: "'Source Serif 4', serif",
              fontSize: "13.5px",
              color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
            }}
          >
            Some artifacts were seeded from your canvas doc — you can iterate any of them, or generate the remaining {totalArtifacts - lockedCount} from scratch.
          </p>
        )}
      </section>

      {/* ═══ EMPTY STATE — fresh canvas ═══
          Replaces the phase grids when no artifact has been generated yet.
          A focused "Begin with Uniqueness" card + a brief "what's ahead"
          map of the 6 phases as plain text. Re-shows the full grid the
          moment any artifact gets generated. */}
      {!hasStarted && (
        <section className="space-y-8 pt-2">
          <div
            className="relative overflow-hidden rounded-2xl px-7 py-8 text-center"
            style={{
              background: "var(--skin-card-bg, rgba(255, 255, 255, 0.65))",
              border: "0.5px solid rgba(212, 175, 55, 0.45)",
              boxShadow:
                "0 0 24px -8px rgba(212, 175, 55, 0.30), 0 16px 40px -20px rgba(10, 22, 40, 0.18)",
            }}
          >
            {/* Soft gold radial glow behind the begin card */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(244, 212, 114, 0.10) 0%, rgba(244, 212, 114, 0) 70%)",
              }}
            />
            <div className="relative space-y-5">
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 600,
                  fontSize: "11px",
                  letterSpacing: "0.24em",
                  textTransform: "uppercase",
                  color: "var(--skin-accent-gold, #b8860b)",
                  textShadow: "var(--skin-accent-gold-glow, 0 0 8px rgba(240,194,127,0.55))",
                }}
              >
                Begin here
              </div>
              <h2
                className="leading-[1.1]"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 600,
                  fontSize: "clamp(24px, 3vw, 32px)",
                  letterSpacing: "-0.005em",
                  color: "var(--skin-text-primary, #0b2a5a)",
                  textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
                }}
              >
                One seed. A whole venture, autonomously composed.
              </h2>
              <p
                className="mx-auto max-w-xl"
                style={{
                  fontFamily: "'Source Serif 4', serif",
                  fontStyle: "italic",
                  fontSize: "15px",
                  lineHeight: 1.6,
                  color: "var(--skin-text-body, rgba(11, 42, 90, 0.85))",
                }}
              >
                Name your Uniqueness once. The AI takes it from there — tribe, pain, promise, offer, lead magnet, value ladder, first session, marketing, distribution, communications, landing page. End-to-end. No human in the loop. You stay the editor: press ✦ Improve on anything that doesn't yet sound like only you.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => navigate(`${UBB_ROOT}/${ARTIFACT_URL_SLUGS.uniqueness}`)}
                  className="group relative inline-flex items-center gap-2.5 rounded-full px-7 py-3 transition-all duration-300 hover:translate-y-[-1px]"
                  style={{
                    background:
                      "var(--skin-cta-bg, linear-gradient(135deg, rgba(10,22,40,0.82) 0%, rgba(18,28,56,0.72) 50%, rgba(10,22,40,0.82) 100%))",
                    color: "var(--skin-cta-text, rgba(245, 245, 250, 0.98))",
                    border: "0.5px solid var(--skin-cta-border, rgba(255, 255, 255, 0.14))",
                    boxShadow:
                      "var(--skin-cta-shadow, 0 0 0 1px rgba(212, 175, 55, 0.28), 0 0 18px -4px rgba(240, 194, 127, 0.45), 0 0 40px -8px rgba(212, 175, 55, 0.28), 0 10px 24px -10px rgba(10, 22, 40, 0.55))",
                    backdropFilter: "blur(14px) saturate(160%)",
                    WebkitBackdropFilter: "blur(14px) saturate(160%)",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      color: "var(--skin-cta-icon, rgba(244, 212, 114, 0.98))",
                      textShadow: "var(--skin-cta-icon-shadow, 0 0 12px rgba(244,212,114,0.8))",
                      fontSize: "16px",
                    }}
                  >
                    ✦
                  </span>
                  <span
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontWeight: 600,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      fontSize: "13px",
                      textShadow: "var(--skin-cta-text-shadow, 0 0 16px rgba(240,194,127,0.28))",
                    }}
                  >
                    Seed the Venture
                  </span>
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:translate-x-0.5"
                    style={{ color: "var(--skin-cta-icon, rgba(244, 212, 114, 0.98))" }}
                  >
                    →
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* What's ahead — plain-text map of the 6 phases, no grids */}
          <div className="space-y-3">
            <div
              className="text-center"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                fontSize: "10.5px",
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: "var(--skin-text-muted, rgba(11, 42, 90, 0.55))",
              }}
            >
              What the AI composes for you
            </div>
            <ol
              className="mx-auto max-w-xl space-y-2 text-center"
              style={{
                fontFamily: "'Source Serif 4', serif",
                fontSize: "14.5px",
                lineHeight: 1.55,
                color: "var(--skin-text-body, rgba(11, 42, 90, 0.78))",
              }}
            >
              <li>
                <span style={{ color: "var(--skin-accent-gold, #b8860b)", fontWeight: 600, fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "12px" }}>1</span>
                {"  Canvas — uniqueness, myth, tribe, pain, promise, lead magnet, value ladder."}
              </li>
              <li>
                <span style={{ color: "var(--skin-accent-gold, #b8860b)", fontWeight: 600, fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "12px" }}>2</span>
                {"  First Session — the transformation a paying client walks out with."}
              </li>
              <li>
                <span style={{ color: "var(--skin-accent-gold, #b8860b)", fontWeight: 600, fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "12px" }}>3</span>
                {"  Marketing — core belief, packaging, frictionless purchase."}
              </li>
              <li>
                <span style={{ color: "var(--skin-accent-gold, #b8860b)", fontWeight: 600, fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "12px" }}>4</span>
                {"  Distribution — how the right people find you."}
              </li>
              <li>
                <span style={{ color: "var(--skin-accent-gold, #b8860b)", fontWeight: 600, fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "12px" }}>5</span>
                {"  Communications — surface inventory, tuning fork, golden DM."}
              </li>
              <li>
                <span style={{ color: "var(--skin-accent-gold, #b8860b)", fontWeight: 600, fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "12px" }}>6</span>
                {"  Landing Page — the public surface where strangers convert."}
              </li>
            </ol>
            <p
              className="pt-2 text-center italic"
              style={{
                fontFamily: "'Source Serif 4', serif",
                fontSize: "13px",
                color: "var(--skin-text-muted, rgba(11, 42, 90, 0.5))",
              }}
            >
              Next version adds License and Business Model. The grid view returns the moment the first artifact lands.
            </p>
          </div>
        </section>
      )}

      {/*
       * Day 74 (Sasha 2026-05-22): the flat staleness list used to live here.
       * Replaced by BulkImprovePanel — same slot, but now a one-click cascade
       * action (with cost + AI-compute time estimate) instead of a passive
       * warning. Renders nothing when no work to do AND no cascade running.
       */}
      <BulkImprovePanel />

      {/* ═══ Phase sections ═══ rendered only after the canvas has been started */}
      {hasStarted && (
        <>
          <PhaseSection title="Canvas" keys={PHASE_A_CANVAS as readonly ArtifactKey[]} />
          <PhaseSection title="Session Bridge" keys={PHASE_B_SESSION as readonly ArtifactKey[]} />
          <PhaseSection title="Market Path" keys={PHASE_C_MARKET as readonly ArtifactKey[]} />
          <PhaseSection title="Publication" keys={PHASE_D_PUBLICATION as readonly ArtifactKey[]} />
        </>
      )}

      {/* ═══ Dossier panel ═══ — hidden until the canvas has been started */}
      {hasStarted && (
        <>
          <div
            className="relative overflow-hidden rounded-2xl px-5 py-4"
            style={{
              background: "var(--skin-card-bg, rgba(255, 255, 255, 0.45))",
              border: "0.5px solid var(--skin-card-border, rgba(26, 30, 58, 0.08))",
              boxShadow: "var(--skin-card-shadow, 0 4px 16px -8px rgba(10, 22, 40, 0.12), 0 16px 40px -20px rgba(10, 22, 40, 0.18))",
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 600,
                    fontSize: "20px",
                    color: "var(--skin-text-primary, #0b2a5a)",
                    letterSpacing: "-0.005em",
                  }}
                >
                  Your Dossier
                </div>
                <div
                  className="mt-0.5"
                  style={{
                    fontFamily: "'Source Serif 4', serif",
                    fontStyle: "italic",
                    fontSize: "13.5px",
                    color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
                  }}
                >
                  Composed overview of all {totalArtifacts} artifacts.{" "}
                  {lockedCount === totalArtifacts
                    ? "Ready to publish."
                    : `${totalArtifacts - lockedCount} more to lock first.`}
                </div>
              </div>
              <Link
                to={ROUTES.dossier}
                className="inline-flex flex-shrink-0 items-center rounded-full px-4 py-2 transition-all duration-200 hover:translate-y-[-1px]"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontSize: "11.5px",
                  color: "var(--skin-text-primary, #0b2a5a)",
                  background: "rgba(255, 255, 255, 0.68)",
                  border: "0.5px solid rgba(212, 175, 55, 0.45)",
                  boxShadow: "0 0 12px -4px rgba(212, 175, 55, 0.30)",
                }}
              >
                Open Dossier
              </Link>
            </div>
          </div>
        </>
      )}

      {/* ═══ Continue CTA ═══ Ceremonial pill matching landing CTAs.
          Hidden in empty state (the Begin-with-Uniqueness card owns
          the lone primary action when nothing has been started). */}
      {hasStarted && firstUnlocked && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => navigate(`${UBB_ROOT}/${ARTIFACT_URL_SLUGS[firstUnlocked]}`)}
            className="group relative inline-flex items-center gap-2.5 rounded-full px-7 py-3 transition-all duration-300 hover:translate-y-[-1px]"
            style={{
              background: "var(--skin-cta-bg, linear-gradient(135deg, rgba(10,22,40,0.82) 0%, rgba(18,28,56,0.72) 50%, rgba(10,22,40,0.82) 100%))",
              color: "var(--skin-cta-text, rgba(245, 245, 250, 0.98))",
              border: "0.5px solid var(--skin-cta-border, rgba(255, 255, 255, 0.14))",
              boxShadow: "var(--skin-cta-shadow, 0 0 0 1px rgba(212, 175, 55, 0.28), 0 0 18px -4px rgba(240, 194, 127, 0.45), 0 0 40px -8px rgba(212, 175, 55, 0.28), 0 10px 24px -10px rgba(10, 22, 40, 0.55))",
              backdropFilter: "blur(14px) saturate(160%)",
              WebkitBackdropFilter: "blur(14px) saturate(160%)",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                color: "var(--skin-cta-icon, rgba(244, 212, 114, 0.98))",
                textShadow: "var(--skin-cta-icon-shadow, 0 0 12px rgba(244,212,114,0.8))",
                fontSize: "16px",
              }}
            >
              ✦
            </span>
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontSize: "13px",
                textShadow: "var(--skin-cta-text-shadow, 0 0 16px rgba(240,194,127,0.28))",
              }}
            >
              Continue with {ARTIFACT_LABELS[firstUnlocked]}
            </span>
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-0.5"
              style={{ color: "var(--skin-cta-icon, rgba(244, 212, 114, 0.98))" }}
            >
              →
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Skeleton — initial fetch placeholder ───────────────────────── */
//
// Shown only during the brief window between mount and first data
// arrival (~200-500ms typical). Mirrors the eventual layout — hero
// strip, four phase rules with grid placeholders — so the page
// doesn't visibly relayout when data lands. Pulse animation honors
// prefers-reduced-motion via Tailwind's `motion-safe:` prefix.

function CanvasOverviewSkeleton() {
  const skBlock = (h: string, w: string, opacity = 1): React.CSSProperties => ({
    height: h,
    width: w,
    background:
      "linear-gradient(90deg, rgba(11, 42, 90, 0.04) 0%, rgba(11, 42, 90, 0.10) 50%, rgba(11, 42, 90, 0.04) 100%)",
    borderRadius: "8px",
    opacity,
  });

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <section className="space-y-3">
        <div className="motion-safe:animate-pulse" style={skBlock("44px", "65%")} />
        <div className="motion-safe:animate-pulse" style={skBlock("18px", "85%", 0.7)} />
        <div className="motion-safe:animate-pulse" style={skBlock("18px", "55%", 0.7)} />
        <div className="flex gap-6 pt-2">
          <div className="motion-safe:animate-pulse" style={skBlock("28px", "120px")} />
          <div className="motion-safe:animate-pulse" style={skBlock("28px", "180px", 0.7)} />
        </div>
      </section>

      {[0, 1, 2, 3].map((i) => (
        <section key={i} className="space-y-3">
          <div className="motion-safe:animate-pulse" style={skBlock("16px", "200px")} />
          <div
            className="h-px w-full"
            style={{
              background:
                "linear-gradient(90deg, rgba(212, 175, 55, 0.20) 0%, rgba(26, 30, 58, 0.05) 70%, rgba(26, 30, 58, 0) 100%)",
            }}
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pt-1">
            {[0, 1, 2].map((j) => (
              <div key={j} className="motion-safe:animate-pulse" style={skBlock("78px", "100%", 0.85 - j * 0.05)} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/* ─── Phase rule + grid ──────────────────────────────────────────── */

function PhaseSection({ title, keys }: { title: string; keys: readonly ArtifactKey[] }) {
  // Show all Playbook steps this phase spans (Day 51 Sasha logic preserved).
  const stepLinks = (() => {
    const seen = new Set<number>();
    const out: { slug: string; number: number; appName: string }[] = [];
    for (const k of keys) {
      const s = getStepForArtifact(k);
      if (s && !seen.has(s.number)) {
        seen.add(s.number);
        out.push(s);
      }
    }
    return out.sort((a, b) => a.number - b.number);
  })();

  return (
    <section className="space-y-4">
      {/* Phase rule — gold ✦ + Cormorant tracked uppercase + hairline */}
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <span
            aria-hidden="true"
            style={{
              color: "var(--skin-accent-gold, #b8860b)",
              textShadow: "var(--skin-accent-gold-glow, 0 0 10px rgba(240,194,127,0.6))",
              fontSize: "13px",
              letterSpacing: 0,
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
            {title}
          </h2>
        </div>
        {stepLinks.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {stepLinks.map((sl) => (
              <Link
                key={sl.number}
                to={`/playbook/${sl.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 transition-all duration-200 hover:translate-y-[-0.5px]"
                style={{
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontWeight: 500,
                  fontSize: "10px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
                  background: "rgba(255, 255, 255, 0.45)",
                  border: "0.5px solid var(--skin-rule-medium, rgba(26, 30, 58, 0.15))",
                }}
                title={`This phase implements Playbook Step ${sl.number} — ${sl.appName}`}
              >
                <BookOpen className="h-3 w-3" aria-hidden="true" />
                Step {sl.number} · {sl.appName}
              </Link>
            ))}
          </div>
        )}
      </div>
      {/* Hairline beneath phase title */}
      <div
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, rgba(212, 175, 55, 0.45) 0%, rgba(212, 175, 55, 0.18) 25%, rgba(26, 30, 58, 0.08) 70%, rgba(26, 30, 58, 0) 100%)",
        }}
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {keys.map((k) => (
          <ArtifactCard key={k} artifactKey={k} />
        ))}
      </div>
    </section>
  );
}

/* ─── Artifact card ──────────────────────────────────────────────── */

function ArtifactCard({ artifactKey }: { artifactKey: ArtifactKey }) {
  const { artifacts } = useUniqueBusiness();
  const state = artifacts[artifactKey];
  const hasLatest = !!state?.latest;
  const isLocked = !!state?.latestLocked;
  const isStale = !!state?.isStale;
  const latestSpec = state?.latest?.specificity_score;
  const versionCount = state?.versionCount;

  const href = `${UBB_ROOT}/${ARTIFACT_URL_SLUGS[artifactKey]}`;

  // Day 74 (Sasha 2026-05-22): derivation hint — names the direct parents so
  // the founder intuits what cascades downstream when they re-lock this card.
  // Root artifacts (uniqueness, surface_inventory) show their seed source
  // instead of leaving the line blank.
  const parents = PARENTS[artifactKey];
  const derivesFromLabel: string =
    parents.length > 0
      ? `derives from ${parents.map((p) => ARTIFACT_LABELS[p]).join(" · ")}`
      : artifactKey === "uniqueness"
        ? "derives from your Zone of Genius"
        : artifactKey === "surface_inventory"
          ? "derives from your live surfaces"
          : "foundation";

  return (
    <Link
      to={href}
      className="group relative block rounded-xl p-4 transition-all duration-300 hover:translate-y-[-1px]"
      style={{
        background: "var(--skin-card-bg, rgba(255, 255, 255, 0.68))",
        border: "0.5px solid var(--skin-card-border, rgba(26, 30, 58, 0.08))",
        boxShadow:
          "var(--skin-card-shadow, 0 4px 16px -8px rgba(10, 22, 40, 0.12), 0 16px 40px -20px rgba(10, 22, 40, 0.18))",
      }}
    >
      {/* Hover gold rim (revealed via opacity) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          border: "0.5px solid rgba(212, 175, 55, 0.55)",
          boxShadow: "0 0 18px -6px rgba(244, 212, 114, 0.40)",
        }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <StateGlyph hasLatest={hasLatest} isLocked={isLocked} />
            <div
              className="truncate"
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
          </div>
          {versionCount ? (
            <div
              className="mt-1"
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: "11px",
                color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
                fontVariantNumeric: "tabular-nums lining-nums",
              }}
            >
              v{state?.latest?.version ?? 1} · {versionCount} version
              {versionCount === 1 ? "" : "s"}
            </div>
          ) : (
            <div
              className="mt-1 italic"
              style={{
                fontFamily: "'Source Serif 4', serif",
                fontSize: "12px",
                color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
              }}
            >
              Not started
            </div>
          )}
          {/*
           * Day 74 (Sasha 2026-05-22): derivation hint. Tertiary text,
           * sits one tier below the version/state line. Lets the founder
           * intuit which upstream changes will cascade onto this card.
           */}
          <div
            className="mt-1 italic truncate"
            style={{
              fontFamily: "'Source Serif 4', serif",
              fontSize: "11.5px",
              color: "var(--skin-text-muted, rgba(11, 42, 90, 0.45))",
              letterSpacing: "0.005em",
            }}
            title={derivesFromLabel}
          >
            {derivesFromLabel}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {typeof latestSpec === "number" && latestSpec > 0 && (
            <SpecificityBadge score={latestSpec} size="sm" />
          )}
          {/*
           * Day 74 (Sasha 2026-05-22): stale chip on the card itself.
           *
           * Phase 1 axis (parent_relocked) → "re-derive" chip — a cascade
           *   from an upstream lock; the founder rebuilds against new context.
           * Phase 2 axis (prompt_changed) → "re-improve" chip — the AI's
           *   ceiling moved; the founder reaches for a higher version.
           *
           * Both use the same gold register so the locked ✓ identity reads
           * as "earned but now in motion again." Hover gives the full reason.
           */}
          {isStale && isLocked && (
            <span
              aria-label={state?.staleReason || "stale"}
              title={state?.staleReason || "stale"}
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: "10px",
                fontWeight: 500,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "#9a7a1f",
                background: "rgba(244, 212, 114, 0.18)",
                border: "0.5px solid rgba(212, 175, 55, 0.55)",
                borderRadius: "9999px",
                padding: "2px 8px",
                whiteSpace: "nowrap",
              }}
            >
              {state?.stalenessSource?.type === "prompt_changed"
                ? "re-improve"
                : "re-derive"}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ─── State glyph ────────────────────────────────────────────────── */
//
// Three semantic states, brand-coherent:
//   locked   → solid gold ✓ with halo (the "earned" state)
//   drafted  → soft navy ⟳ (the "in motion" state)
//   pending  → faint dashed ◯ (the "still gathering" state)

function StateGlyph({ hasLatest, isLocked }: { hasLatest: boolean; isLocked: boolean }) {
  if (isLocked) {
    return (
      <span
        aria-hidden="true"
        className="inline-flex h-4 w-4 flex-shrink-0 items-center justify-center"
        style={{
          color: "var(--skin-accent-gold, #b8860b)",
          textShadow: "var(--skin-accent-gold-glow, 0 0 10px rgba(240,194,127,0.6))",
          fontSize: "13px",
          fontWeight: 700,
        }}
        title="Locked"
      >
        ✓
      </span>
    );
  }
  if (hasLatest) {
    return (
      <span
        aria-hidden="true"
        className="inline-flex h-4 w-4 flex-shrink-0 items-center justify-center"
        style={{
          color: "var(--skin-text-primary, #0b2a5a)",
          opacity: 0.55,
          fontSize: "12px",
        }}
        title="Drafted — open to iterate"
      >
        ⟳
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-4 w-4 flex-shrink-0 items-center justify-center"
      style={{
        color: "var(--skin-text-muted, rgba(11, 42, 90, 0.4))",
        fontSize: "13px",
      }}
      title="Not yet generated"
    >
      ◯
    </span>
  );
}
