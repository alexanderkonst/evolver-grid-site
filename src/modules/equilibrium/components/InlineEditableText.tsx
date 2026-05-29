import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Inline-editable text — used for Mission / Role / Moon Focus / Strategies.
 *
 * Behavior (per Sasha 2026-05-15):
 *   • Auto-renders the current value (override else upstream).
 *   • Click the pencil to edit inline. Save on blur, Enter, or check button.
 *   • Esc or X cancels.
 *   • Empty save = clear override (null).
 *
 * Voice-laden copy (placeholder, empty-state CTA) is supplied by the caller —
 * this component is purely mechanical.
 */

export interface InlineEditableTextProps {
  value: string | null;
  /** Shown when value is empty AND not editing. Pure mechanical fallback. */
  emptyPlaceholder?: string;
  /** Visual style — body or display. */
  size?: "body" | "display";
  /** Save handler. Receives trimmed text or null when cleared. */
  onSave: (text: string | null) => Promise<void> | void;
  /** Disable editing (e.g., while loading). */
  disabled?: boolean;
  /**
   * Optional advisory word-count hint. When set, while editing, the
   * component renders a small advisory line under the textarea if the
   * draft exceeds `wordLimit` words. Purely advisory — does not block
   * save. Sasha 2026-05-18 Phase C: nudges Lifelong Dedication +
   * Strategy toward short concrete sentences.
   */
  wordLimit?: number;
  /** Copy shown when over the word limit. Required if wordLimit is set. */
  wordLimitHint?: string;
  /**
   * Text alignment. Default `left`. Sasha 2026-05-20: Lifelong
   * Dedication + Role bodies center to match their centered titles
   * (they're identity-anchor sentences that benefit from symmetry).
   * List-based sections (Strategy / Workstreams / Intuitive Tasks /
   * DOING NOW) stay left-aligned.
   */
  align?: "left" | "center";
  /**
   * Optional line-clamp for long values (Sasha 2026-05-29). When set
   * and the rendered text exceeds N lines, show a "show more" link
   * beneath that toggles between clamped + full views. The toggle is
   * its own element OUTSIDE the click-to-edit container so it never
   * enters edit mode by accident.
   *
   * Only applies in display mode; editing always shows the full draft.
   * If the text fits within N lines, no toggle is rendered.
   */
  clampLines?: number;
  className?: string;
}

export const InlineEditableText = ({
  value,
  emptyPlaceholder = "—",
  size = "body",
  onSave,
  disabled,
  wordLimit,
  wordLimitHint,
  align = "left",
  clampLines,
  className,
}: InlineEditableTextProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!editing) setDraft(value ?? "");
  }, [value, editing]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = async () => {
    if (saving) return;
    const trimmed = draft.trim();
    const next = trimmed === "" ? null : trimmed;
    if (next === (value ?? null)) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onSave(next);
    } finally {
      setSaving(false);
      setEditing(false);
    }
  };

  const cancel = () => {
    setDraft(value ?? "");
    setEditing(false);
  };

  const textClass =
    size === "display"
      ? "eq-text-halo font-serif text-lg font-medium text-[#0a1628]"
      : "eq-text-halo text-base font-medium text-[#0a1628]";

  if (editing) {
    const wordCount = draft.trim().split(/\s+/).filter(Boolean).length;
    const overLimit =
      wordLimit !== undefined && wordCount > wordLimit && !!wordLimitHint;
    return (
      <div className={cn("flex flex-col gap-1.5", className)}>
        <div className="flex items-start gap-2">
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void commit();
              } else if (e.key === "Escape") {
                cancel();
              }
            }}
            onBlur={() => void commit()}
            rows={2}
            disabled={saving}
            className={cn(
              "flex-1 resize-none rounded-md border border-[#0a1628]/15 bg-white/70 px-3 py-2 outline-none focus:border-[#0a1628]/40",
              textClass,
              align === "center" && "text-center",
            )}
          />
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => void commit()}
              disabled={saving}
              aria-label="Save"
              className="rounded-md p-1.5 text-[#0a1628]/90 hover:bg-white/60 hover:text-[#0a1628]"
            >
              <Check size={16} />
            </button>
            <button
              type="button"
              onClick={cancel}
              disabled={saving}
              aria-label="Cancel"
              className="rounded-md p-1.5 text-[#0a1628]/90 hover:bg-white/60 hover:text-[#0a1628]"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        {/* Advisory word-count hint — appears when over the limit. Not
            blocking; just a nudge toward concise voice. */}
        {overLimit && (
          <p className="px-2 text-xs italic text-amber-700/85">
            {wordCount} words — {wordLimitHint}
          </p>
        )}
      </div>
    );
  }

  const displayValue = value ?? emptyPlaceholder;
  const isEmpty = !value;

  // ─── Clamp + show-more (Sasha 2026-05-29) ──────────────────────
  // When `clampLines` is set, measure the text element's scroll vs
  // client height to detect overflow. The toggle only renders when
  // the text actually exceeds the clamp — short strategies don't see
  // a useless "show more" link. Click stops propagation so it can't
  // bubble to the click-to-edit container (which is a SIBLING in this
  // structure, but defensive anyway).
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (!clampLines || expanded) {
      // While expanded, we don't render the clamp class — measurement
      // would falsely report "fits." Skip the check.
      return;
    }
    const el = textRef.current;
    if (!el) return;
    // scrollHeight measures full content height; clientHeight is the
    // clipped visible area. Strict > because clientHeight rounds.
    setOverflowing(el.scrollHeight > el.clientHeight + 1);
  }, [clampLines, displayValue, expanded]);

  const shouldClamp = clampLines !== undefined && !expanded;
  const clampStyle = shouldClamp
    ? {
        display: "-webkit-box" as const,
        WebkitBoxOrient: "vertical" as const,
        WebkitLineClamp: clampLines,
        overflow: "hidden" as const,
      }
    : undefined;

  // Outer container is a div (not a button) so the inner "show more"
  // link can be its own button without nesting buttons (invalid HTML).
  // The click-to-edit affordance is a separate inner button that
  // doesn't wrap the show-more control.
  return (
    <div className={cn("flex w-full flex-col gap-1", className)}>
      <button
        type="button"
        onClick={() => !disabled && setEditing(true)}
        disabled={disabled}
        className={cn(
          "group flex w-full items-start gap-2 rounded-md px-2 py-2 transition",
          align === "center" ? "text-center" : "text-left",
          "hover:bg-white/50 focus:bg-white/50 focus:outline-none",
          disabled && "cursor-default opacity-60",
        )}
      >
        <span
          ref={textRef}
          style={clampStyle}
          className={cn(
            "flex-1 min-w-0",
            align === "center" && "text-center",
            textClass,
            isEmpty && "text-[#0a1628]/85",
          )}
        >
          {displayValue}
        </span>
        <Pencil
          size={14}
          className="mt-1 shrink-0 text-[#0a1628]/95 opacity-0 transition group-hover:opacity-100 group-focus:opacity-100"
        />
      </button>
      {clampLines !== undefined && (overflowing || expanded) && (
        <button
          type="button"
          onClick={(e) => {
            // Defensive — keep the toggle from triggering edit mode
            // even if a future refactor nests these inside one button.
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
          className={cn(
            "self-start rounded px-2 text-xs font-semibold uppercase tracking-wider text-emerald-700/80 transition hover:text-emerald-800",
            align === "center" && "self-center",
          )}
        >
          {expanded ? "show less ↑" : "show more ↓"}
        </button>
      )}
    </div>
  );
};

export default InlineEditableText;
