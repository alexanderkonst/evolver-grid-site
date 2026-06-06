/**
 * ViabilityReadout — the Vision ↔ Viability axis (Domain 93) made visible.
 *
 * Renders the crash-test result beside the fidelity roast: the kinetic-calm
 * read (small enough to try AND real enough to matter), the one buyer-native
 * next move, the pre-mortem findings, and what survived. Null-safe: renders
 * nothing when viability is absent or marked not-applicable (essence-class
 * artifacts, or when the best-effort pass returned null).
 *
 * Two registers so it reads as one family on both surfaces:
 *   - "dark"  → the UBB ImproveReviewDrawer (navy decision room, gold + cream)
 *   - "light" → the Excalibur reveal (light glass, gold-brown + slate)
 */

import type { Viability } from "@/types/viability";

const DIMENSION_LABELS: Record<string, string> = {
  trust: "Trust",
  timing: "Timing",
  language: "Language",
  cost: "Cost",
  inertia: "Inertia",
  proof: "Proof",
  "action-friction": "Action friction",
};

type Palette = {
  gold: string;
  prose: string;
  proseMuted: string;
  panelBg: string;
  panelBorder: string;
  meterTrack: string;
  meterFill: string;
};

const PALETTES: Record<"dark" | "light", Palette> = {
  dark: {
    gold: "#f4d472",
    prose: "rgba(245, 241, 232, 0.92)",
    proseMuted: "rgba(245, 241, 232, 0.68)",
    panelBg: "rgba(244, 212, 114, 0.06)",
    panelBorder: "0.5px solid rgba(244, 212, 114, 0.32)",
    meterTrack: "rgba(245, 241, 232, 0.12)",
    meterFill: "linear-gradient(90deg, rgba(212,175,55,0.85), rgba(244,212,114,0.95))",
  },
  light: {
    gold: "#7a5108",
    prose: "#2c3150",
    proseMuted: "rgba(44, 49, 80, 0.66)",
    panelBg: "rgba(122, 81, 8, 0.05)",
    panelBorder: "0.5px solid rgba(212, 175, 55, 0.28)",
    meterTrack: "rgba(44, 49, 80, 0.10)",
    meterFill: "linear-gradient(90deg, rgba(160,109,8,0.75), rgba(212,175,55,0.92))",
  },
};

export function ViabilityReadout({
  viability,
  variant = "dark",
}: {
  viability?: Viability | null;
  variant?: "dark" | "light";
}) {
  if (!viability || viability.applicable === false) return null;

  const p = PALETTES[variant];
  const score = Math.round((viability.kinetic_calm ?? 0) * 10) / 10;
  const pct = Math.max(0, Math.min(100, (score / 10) * 100));
  const findings = Array.isArray(viability.findings) ? viability.findings : [];
  const nextMove = viability.next_move?.trim();
  const survivingSeed = viability.surviving_seed?.trim();

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 600,
    fontSize: "10.5px",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: p.gold,
  };
  const proseStyle: React.CSSProperties = {
    fontFamily: "'Source Serif 4', serif",
    fontSize: "13.5px",
    lineHeight: 1.55,
    color: p.prose,
  };

  return (
    <div
      className="rounded-xl"
      style={{ background: p.panelBg, border: p.panelBorder, padding: "13px 15px" }}
    >
      {/* Header + kinetic-calm read */}
      <div className="flex items-baseline justify-between gap-3">
        <span style={labelStyle}>Will it survive contact?</span>
        <span
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.02em",
            color: p.gold,
            whiteSpace: "nowrap",
          }}
          title="Kinetic calm: small enough to try, real enough to matter"
        >
          {score.toFixed(1)} / 10 kinetic calm
        </span>
      </div>

      {/* Meter */}
      <div
        className="mt-2 h-1 w-full overflow-hidden rounded-full"
        style={{ background: p.meterTrack }}
        aria-hidden="true"
      >
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: p.meterFill }} />
      </div>

      {/* The one move */}
      {nextMove && (
        <div className="mt-3">
          <div style={labelStyle}>The one move this week</div>
          <div className="mt-1" style={{ ...proseStyle, color: p.prose }}>
            {nextMove}
          </div>
        </div>
      )}

      {/* Pre-mortem findings — dimension label stacked above the risk,
          matching the roast-finding pattern (no horizontal collision). */}
      {findings.length > 0 && (
        <ul className="mt-3 space-y-2">
          {findings.map((f, i) => (
            <li key={i}>
              <div
                style={{
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: "9px",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: p.gold,
                }}
              >
                {DIMENSION_LABELS[f.dimension] || f.dimension}
              </div>
              <div className="mt-0.5" style={{ ...proseStyle, color: p.proseMuted }}>
                {f.risk}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* What survives */}
      {survivingSeed && (
        <div className="mt-3">
          <div style={labelStyle}>What survives</div>
          <div className="mt-1" style={{ ...proseStyle, fontStyle: "italic", color: p.prose }}>
            {survivingSeed}
          </div>
        </div>
      )}
    </div>
  );
}

export default ViabilityReadout;
