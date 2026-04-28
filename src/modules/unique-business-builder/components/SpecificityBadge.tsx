/**
 * SpecificityBadge — editorial pill showing current specificity (0–10) with optional delta.
 *
 * Day 53 (Sasha 2026-04-27): re-skinned to match the landing/playbook
 * register — gold→amber→emerald gradient by band, DM Sans tabular-nums
 * for the score, gold hairline border, soft glow on the active band.
 * No more Tailwind palette colors (bg-blue-100 / bg-amber-100 etc.) —
 * everything routes through the brand spectrum.
 *
 * Bands (from constants.SPECIFICITY_BANDS):
 *   sketch (0–4)    → cool deep navy + faint gold line
 *   drafted (4–6.5) → warm amber, sub-currents of gold
 *   landing (6.5–8) → solid gold, pre-resonant
 *   sharp (8–9.5)   → bright gold + emerald undertone
 *   photon (9.5+)   → emerald with full gold halo, the "lit" state
 *
 * If `onScoreChange` prop is provided, the badge becomes click-to-edit —
 * AI suggests, human adjusts. Click → number input, Enter or blur to
 * save, Esc to cancel.
 */

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { specificityBand } from "../constants";

type Props = {
  score: number;
  delta?: number;
  size?: "sm" | "md";
  className?: string;
  /** When provided, badge is editable — human adjusts the AI's suggestion. */
  onScoreChange?: (newScore: number) => void | Promise<void>;
};

// Band → editorial gradient + ring + glow. Each band carries its own
// ceremonial weight. Higher score = more lit. Lower = more "still
// gathering." All values brand-consistent (no Tailwind palette refugees).
const bandStyle: Record<
  string,
  {
    background: string;
    border: string;
    color: string;
    boxShadow: string;
  }
> = {
  // sketch (info, low) — deep navy with the faintest gold rim
  info: {
    background:
      "linear-gradient(135deg, rgba(11, 38, 65, 0.10) 0%, rgba(11, 38, 65, 0.04) 100%)",
    border: "0.5px solid rgba(212, 175, 55, 0.30)",
    color: "rgba(11, 42, 90, 0.85)",
    boxShadow: "inset 0 0 0 0.5px rgba(255, 255, 255, 0.40)",
  },
  // landing zone — full gold, pre-resonant
  warning: {
    background:
      "linear-gradient(135deg, rgba(244, 212, 114, 0.32) 0%, rgba(212, 175, 55, 0.18) 100%)",
    border: "0.5px solid rgba(212, 175, 55, 0.85)",
    color: "#7a5108",
    boxShadow:
      "inset 0 0 0 0.5px rgba(255, 255, 255, 0.45), 0 0 12px -3px rgba(244, 212, 114, 0.45)",
  },
  // sharp / photon — emerald with gold halo, the lit state
  success: {
    background:
      "linear-gradient(135deg, rgba(16, 122, 88, 0.22) 0%, rgba(244, 212, 114, 0.18) 100%)",
    border: "0.5px solid rgba(212, 175, 55, 0.95)",
    color: "#0c5b40",
    boxShadow:
      "inset 0 0 0 0.5px rgba(255, 255, 255, 0.50), 0 0 16px -4px rgba(244, 212, 114, 0.55), 0 0 32px -10px rgba(16, 122, 88, 0.35)",
  },
};

const clamp = (n: number) => Math.max(0, Math.min(10, n));

// Plain-English explainer per band, surfaced via native title tooltip.
// "Specificity" = how distinguishable from generic noise this version is —
// the founder's voice, the tribe's words, the moment they're in. Higher
// score = sharper signal, less interchangeable with anyone else's version.
function specificityExplanation(bandLabel: string): string {
  switch (bandLabel) {
    case "sketch":
      return "Sketch (0–4): rough first pass. Reads as a placeholder, not a position. Press Improve.";
    case "drafted":
      return "Drafted (4–6.5): real shape, still generic. The right shape, but a stranger could have written it.";
    case "landing":
      return "Landing (6.5–8): close. Specific enough to be recognizable. Worth one or two more rounds.";
    case "sharp":
      return "Sharp (8–9.5): only this founder, for this tribe, at this moment, could have said this.";
    case "photon":
      return "Photon (9.5–10): the version that ends iteration. Anyone who reads it knows whose it is.";
    default:
      return "Specificity: how distinguishable this version is from generic noise.";
  }
}

export function SpecificityBadge({ score, delta, size = "md", className, onScoreChange }: Props) {
  const band = specificityBand(score);
  const isUp = typeof delta === "number" && delta > 0;
  const isDown = typeof delta === "number" && delta < 0;
  const editable = typeof onScoreChange === "function";

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(score.toFixed(1));
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(score.toFixed(1));
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [editing, score]);

  const commit = async () => {
    if (!onScoreChange) return;
    const parsed = parseFloat(draft);
    if (isNaN(parsed)) {
      setEditing(false);
      return;
    }
    const next = clamp(parsed);
    if (Math.abs(next - score) < 0.05) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onScoreChange(next);
    } finally {
      setSaving(false);
      setEditing(false);
    }
  };

  const cancel = () => {
    setDraft(score.toFixed(1));
    setEditing(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  };

  const style = bandStyle[band.color] || bandStyle.info;

  // Common sizing for both display + edit modes
  const sizeCls =
    size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm";

  if (editing) {
    return (
      <div className={cn("inline-flex items-center gap-1.5", className)}>
        <span
          className={cn(
            "inline-flex items-center rounded-full",
            sizeCls,
            saving && "opacity-50",
          )}
          style={{
            ...style,
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontVariantNumeric: "tabular-nums lining-nums",
            fontFeatureSettings: '"tnum" 1, "lnum" 1',
            fontWeight: 600,
          }}
        >
          <input
            ref={inputRef}
            type="number"
            min={0}
            max={10}
            step={0.1}
            value={draft}
            disabled={saving}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={onKeyDown}
            className="w-12 bg-transparent text-center outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontVariantNumeric: "tabular-nums lining-nums",
            }}
            aria-label="Adjust specificity score"
          />
          <span className="ml-0.5 opacity-60" style={{ fontSize: "0.78em" }}>
            / 10
          </span>
        </span>
      </div>
    );
  }

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <button
        type="button"
        onClick={editable ? () => setEditing(true) : undefined}
        className={cn(
          "group inline-flex items-center rounded-full transition-all duration-200",
          sizeCls,
          editable && "cursor-pointer hover:translate-y-[-0.5px]",
        )}
        style={{
          ...style,
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontVariantNumeric: "tabular-nums lining-nums",
          fontFeatureSettings: '"tnum" 1, "lnum" 1',
          fontWeight: 600,
        }}
        aria-label={
          editable
            ? `Specificity ${score.toFixed(1)} of 10 — ${band.label}. Click to adjust.`
            : `Specificity ${score.toFixed(1)} of 10 — ${band.label}`
        }
        // Day 53 night iter 2 (Sasha 2026-04-27): native title tooltip
        // explains what the score means. Score-only was a mystery — was
        // 9.2 good? Was 7.4 close to enough? Now hover gives plain English.
        // Bands match SPECIFICITY_BANDS in constants.ts.
        title={
          editable
            ? `${specificityExplanation(band.label)}\n\nClick to adjust — AI suggests, you decide.`
            : specificityExplanation(band.label)
        }
        disabled={!editable}
      >
        {score.toFixed(1)}
        <span className="ml-0.5 opacity-60" style={{ fontSize: "0.78em" }}>
          / 10
        </span>
        {editable && (
          <Pencil
            className="ml-1.5 h-3 w-3 opacity-40 transition-opacity duration-200 group-hover:opacity-80"
            aria-hidden="true"
          />
        )}
      </button>
      {typeof delta === "number" && delta !== 0 && (
        <span
          className="text-xs"
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontVariantNumeric: "tabular-nums lining-nums",
            color: isUp ? "#0c5b40" : isDown ? "#a04030" : "var(--skin-text-muted)",
            fontWeight: 500,
          }}
          aria-live="polite"
        >
          {isUp ? "↑" : "↓"} {Math.abs(delta).toFixed(1)}
        </span>
      )}
    </div>
  );
}
