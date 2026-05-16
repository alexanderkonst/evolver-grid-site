import { useEffect, useRef, useState } from "react";
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
  className?: string;
}

export const InlineEditableText = ({
  value,
  emptyPlaceholder = "—",
  size = "body",
  onSave,
  disabled,
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
    return (
      <div className={cn("flex items-start gap-2", className)}>
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
    );
  }

  const displayValue = value ?? emptyPlaceholder;
  const isEmpty = !value;

  return (
    <button
      type="button"
      onClick={() => !disabled && setEditing(true)}
      disabled={disabled}
      className={cn(
        "group flex w-full items-start gap-2 rounded-md px-2 py-2 text-left transition",
        "hover:bg-white/50 focus:bg-white/50 focus:outline-none",
        disabled && "cursor-default opacity-60",
        className,
      )}
    >
      <span className={cn("flex-1", textClass, isEmpty && "text-[#0a1628]/85")}>
        {displayValue}
      </span>
      <Pencil
        size={14}
        className="mt-1 shrink-0 text-[#0a1628]/95 opacity-0 transition group-hover:opacity-100 group-focus:opacity-100"
      />
    </button>
  );
};

export default InlineEditableText;
