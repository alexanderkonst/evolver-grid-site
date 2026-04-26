/**
 * SpecificityBadge — pill showing current specificity (0–10) with optional delta.
 *
 * Color gradient by score band (see constants.SPECIFICITY_BANDS).
 * Delta pill shows ↑ or ↓ with a count-up animation on positive changes.
 *
 * Day 51 (Sasha 2026-04-25): if `onScoreChange` prop is provided, the badge
 * becomes click-to-edit — AI suggests, human adjusts. Click → number input,
 * Enter or blur to save, Esc to cancel. Without onScoreChange, behaves as
 * read-only display (Dossier, Improve drawer Before/After, etc.).
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

const bandColorClasses: Record<string, string> = {
  info: "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200",
  warning: "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200",
  success: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200",
};

const clamp = (n: number) => Math.max(0, Math.min(10, n));

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
      // Focus + select on next tick so the user can immediately overwrite.
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

  if (editing) {
    return (
      <div className={cn("inline-flex items-center gap-1.5", className)}>
        <span
          className={cn(
            "inline-flex items-center rounded-full font-medium tabular-nums",
            bandColorClasses[band.color] || bandColorClasses.info,
            size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
            saving && "opacity-50"
          )}
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
            className="w-12 bg-transparent text-center tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            aria-label="Adjust specificity score"
          />
          <span className="ml-1 text-[0.85em] opacity-70">/ 10</span>
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
          "group inline-flex items-center rounded-full font-medium tabular-nums",
          bandColorClasses[band.color] || bandColorClasses.info,
          size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
          editable && "cursor-pointer hover:ring-1 hover:ring-current/20 transition"
        )}
        aria-label={
          editable
            ? `Specificity ${score.toFixed(1)} of 10 — ${band.label}. Click to adjust.`
            : `Specificity ${score.toFixed(1)} of 10 — ${band.label}`
        }
        title={editable ? "AI suggests this score — click to adjust" : undefined}
        disabled={!editable}
      >
        {score.toFixed(1)}
        <span className="ml-1 text-[0.85em] opacity-70">/ 10</span>
        {editable && (
          <Pencil className="ml-1 h-3 w-3 opacity-40 group-hover:opacity-80 transition" aria-hidden="true" />
        )}
      </button>
      {typeof delta === "number" && delta !== 0 && (
        <span
          className={cn(
            "text-xs tabular-nums",
            isUp && "text-emerald-600",
            isDown && "text-red-600"
          )}
          aria-live="polite"
        >
          {isUp ? "↑" : "↓"} {Math.abs(delta).toFixed(1)}
        </span>
      )}
    </div>
  );
}
