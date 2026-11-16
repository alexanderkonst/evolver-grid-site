import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowUp, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CycleEntry, CycleJournalEntryKind } from "../types";
import { JOURNAL_KIND_COPY } from "../phasePlan";
import { RESOURCE_TAGS, formatEntryDate, resourceTagLabel } from "../lib/cycleJournal";
import { MAX_ENTRY_CHARS } from "../hooks/useCycleEntries";

/**
 * CycleJournalInput — the quick-capture surface of the Cycle Journal
 * (issue #331): one calm single-line field, a list of what's been noted.
 *
 * Feel (the #1 acceptance criterion):
 *   • Enter saves; the field clears and KEEPS focus, so the next one can
 *     follow at once. Shift+Enter inserts a newline.
 *   • Saves are optimistic — no spinner, no disabled state, ever.
 *   • The Add button is 44px and doesn't steal focus, so the phone
 *     keyboard stays open between entries.
 *   • 16px text (no iOS zoom-on-focus). No modals.
 *   • Tap (or click) a line to edit it in place. Edit and delete icons show
 *     on hover on a mouse and are always visible on touch.
 *   • Resources only: optional tag chips. Never required, never blocking.
 */

const INSET_SURFACE: React.CSSProperties = {
  background: "rgba(255,255,255,0.35)",
  boxShadow:
    "inset 0 2px 4px rgba(10,22,40,0.08), inset 0 -1px 0 rgba(255,255,255,0.6), 0 1px 2px rgba(10,22,40,0.04)",
};

/** How many saved lines show before "Show N more". */
const VISIBLE_DEFAULT = 6;

export interface CycleJournalInputProps {
  kind: CycleJournalEntryKind;
  /** Entries of the CURRENT cycle (any kind); this component filters. */
  entries: CycleEntry[];
  onAdd: (kind: CycleJournalEntryKind, text: string, tag: string | null, onFail: (text: string) => void) => void;
  onUpdate: (id: string, patch: { text?: string; tag?: string | null }) => void;
  onRemove: (id: string) => void;
  /** Focus the field on mount (used when the user explicitly opened it). */
  autoFocus?: boolean;
  /** Show the heading above the field. Default true. */
  showHeading?: boolean;
}

export const CycleJournalInput = ({
  kind,
  entries,
  onAdd,
  onUpdate,
  onRemove,
  autoFocus = false,
  showHeading = true,
}: CycleJournalInputProps) => {
  const copy = JOURNAL_KIND_COPY[kind];
  const [draft, setDraft] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const fieldRef = useRef<HTMLTextAreaElement>(null);

  const list = entries.filter((e) => e.kind === kind);
  const visible = showAll ? list : list.slice(0, VISIBLE_DEFAULT);
  const hiddenCount = list.length - visible.length;
  const hasDraft = draft.trim().length > 0;

  useAutoGrow(fieldRef, draft);

  useEffect(() => {
    if (autoFocus) fieldRef.current?.focus();
  }, [autoFocus]);

  const save = () => {
    const text = draft.trim();
    if (!text) return;
    const usedTag = kind === "resource" ? tag : null;
    setDraft("");
    setTag(null);
    // If the save is rolled back, the words come back — unless the user has
    // already started the next one.
    onAdd(kind, text, usedTag, (failed) => setDraft((current) => (current.trim() ? current : failed)));
    fieldRef.current?.focus();
  };

  return (
    <div className="flex flex-col gap-2.5">
      {showHeading && (
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#0a1628]/60">
          {copy.heading}
        </p>
      )}

      {/* ── Field ─────────────────────────────────────────────── */}
      <div
        className="flex items-end gap-2 rounded-2xl px-3 py-2 focus-within:ring-2 focus-within:ring-[#a080c0]/50"
        style={INSET_SURFACE}
      >
        <textarea
          ref={fieldRef}
          rows={1}
          value={draft}
          maxLength={MAX_ENTRY_CHARS}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            // `isComposing`: Enter confirms an IME candidate, it must not save.
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              save();
            }
          }}
          enterKeyHint="send"
          autoCapitalize="sentences"
          aria-label={copy.heading}
          placeholder={copy.placeholder}
          className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent py-2.5 text-base leading-snug text-[#0a1628] outline-none placeholder:text-[#0a1628]/50"
        />
        <button
          type="button"
          // Keep focus in the field (and the phone keyboard open) on tap.
          onPointerDown={(e) => e.preventDefault()}
          onClick={save}
          disabled={!hasDraft}
          aria-label={`Save to ${copy.noun}`}
          title="Save (Enter)"
          className={cn(
            "mb-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition",
            hasDraft
              ? "bg-[#0a1628] text-white shadow-sm hover:bg-[#111f35]"
              : "bg-[#0a1628]/8 text-[#0a1628]/30",
          )}
        >
          <ArrowUp size={18} aria-hidden="true" />
        </button>
      </div>

      {/* ── Resource tags (optional) ──────────────────────────── */}
      {kind === "resource" && (
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Tag (optional)">
          {RESOURCE_TAGS.map((t) => {
            const on = tag === t.key;
            return (
              <button
                key={t.key}
                type="button"
                aria-pressed={on}
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => setTag(on ? null : t.key)}
                className={cn(
                  "min-h-[32px] rounded-full border px-3 text-xs font-medium transition",
                  on
                    ? "border-[#0a1628] bg-[#0a1628] text-white"
                    : "border-[#0a1628]/12 bg-white/50 text-[#0a1628]/70 hover:bg-white/80",
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      )}

      <p className="hidden text-[11px] text-[#0a1628]/45 sm:block">
        Enter to save · Shift+Enter for a new line
      </p>

      {/* ── Saved list ────────────────────────────────────────── */}
      {list.length === 0 ? (
        <p className="px-1 text-sm italic text-[#0a1628]/45">{copy.empty}</p>
      ) : (
        <ul className="flex flex-col" aria-label={`${copy.noun} this cycle`}>
          {visible.map((entry) => (
            <EntryRow key={entry.id} entry={entry} onUpdate={onUpdate} onRemove={onRemove} />
          ))}
        </ul>
      )}
      {(hiddenCount > 0 || (showAll && list.length > VISIBLE_DEFAULT)) && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="self-start px-1 text-xs font-medium text-[#0a1628]/60 underline-offset-2 hover:underline"
        >
          {showAll ? "Show fewer" : `Show ${hiddenCount} more`}
        </button>
      )}
    </div>
  );
};

// ─── One saved line ─────────────────────────────────────────────────────

const EntryRow = ({
  entry,
  onUpdate,
  onRemove,
}: {
  entry: CycleEntry;
  onUpdate: CycleJournalInputProps["onUpdate"];
  onRemove: CycleJournalInputProps["onRemove"];
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(entry.text);
  const [draftTag, setDraftTag] = useState<string | null>(entry.tag);
  const editRef = useRef<HTMLTextAreaElement>(null);
  const cancelledRef = useRef(false);

  useAutoGrow(editRef, draft, editing);

  const startEdit = () => {
    cancelledRef.current = false;
    setDraft(entry.text);
    setDraftTag(entry.tag);
    setEditing(true);
  };

  useEffect(() => {
    if (!editing) return;
    const el = editRef.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }, [editing]);

  const commit = () => {
    if (cancelledRef.current) return;
    const text = draft.trim();
    // An emptied line is a cancel, never a silent delete.
    if (text) {
      onUpdate(entry.id, {
        text,
        ...(entry.kind === "resource" ? { tag: draftTag } : {}),
      });
    }
    setEditing(false);
  };

  const cancel = () => {
    cancelledRef.current = true;
    setEditing(false);
  };

  if (editing) {
    return (
      <li className="flex flex-col gap-1.5 rounded-xl bg-white/55 px-2.5 py-2">
        <textarea
          ref={editRef}
          rows={1}
          value={draft}
          maxLength={MAX_ENTRY_CHARS}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              commit();
            } else if (e.key === "Escape") {
              e.preventDefault();
              cancel();
            }
          }}
          aria-label="Edit entry"
          className="max-h-32 w-full resize-none bg-transparent text-base leading-snug text-[#0a1628] outline-none"
        />
        {entry.kind === "resource" && (
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Tag (optional)">
            {RESOURCE_TAGS.map((t) => {
              const on = draftTag === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  aria-pressed={on}
                  // Don't blur the field (which would save and close) on tap.
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => setDraftTag(on ? null : t.key)}
                  className={cn(
                    "min-h-[32px] rounded-full border px-3 text-xs font-medium transition",
                    on
                      ? "border-[#0a1628] bg-[#0a1628] text-white"
                      : "border-[#0a1628]/12 bg-white/60 text-[#0a1628]/70",
                  )}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        )}
        <p className="text-[11px] text-[#0a1628]/45">Enter to save · Esc to cancel</p>
      </li>
    );
  }

  const tagLabel = entry.kind === "resource" ? resourceTagLabel(entry.tag) : null;

  return (
    <li className="group flex items-start gap-2 rounded-xl px-1 py-1.5 focus-within:bg-white/40 hover:bg-white/40">
      <span className="mt-[3px] w-11 shrink-0 text-[11px] tabular-nums text-[#0a1628]/45">
        {formatEntryDate(entry.created_at)}
      </span>
      <button
        type="button"
        onClick={startEdit}
        aria-label={`Edit: ${entry.text}`}
        className="min-h-[28px] flex-1 whitespace-pre-wrap break-words text-left text-[15px] leading-snug text-[#0a1628]/90"
      >
        {entry.text}
        {tagLabel && (
          <span className="ml-2 inline-block rounded-full border border-[#0a1628]/10 bg-white/60 px-2 py-px align-middle text-[10px] font-medium uppercase tracking-wide text-[#0a1628]/60">
            {tagLabel}
          </span>
        )}
      </button>
      <span
        className={cn(
          "flex shrink-0 items-center transition-opacity",
          // Mouse: appear on hover / keyboard focus. Touch: always visible.
          "[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:opacity-100",
        )}
      >
        <button
          type="button"
          onClick={startEdit}
          aria-label="Edit"
          title="Edit"
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#0a1628]/50 hover:bg-[#0a1628]/5 hover:text-[#0a1628]"
        >
          <Pencil size={14} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onRemove(entry.id)}
          aria-label="Delete"
          title="Delete"
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#0a1628]/50 hover:bg-[#0a1628]/5 hover:text-[#0a1628]"
        >
          <Trash2 size={14} aria-hidden="true" />
        </button>
      </span>
    </li>
  );
};

// ─── Auto-grow ──────────────────────────────────────────────────────────

/** Grow a textarea with its content (it starts as a single line). */
function useAutoGrow(ref: React.RefObject<HTMLTextAreaElement>, value: string, active = true) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !active) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [ref, value, active]);
}

export default CycleJournalInput;
