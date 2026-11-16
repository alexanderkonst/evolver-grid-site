import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { CycleEntry, CycleEntryKind } from "../types";
import { entriesForCycle, isMissingTableError, sortNewestFirst } from "../lib/cycleJournal";

/**
 * useCycleEntries — the Cycle Journal data hook (issue #331).
 *
 * Reads and writes `equilibrium_cycle_entries`. Kept apart from
 * useEquilibriumV2 so the journal can be absent (migration not applied
 * yet) without touching the rest of ACT: when the first read fails,
 * `available` stays false and the UI hides the new inputs. Nothing throws.
 *
 * Writes are optimistic: the row appears at once (client-generated id, so
 * edit/delete work immediately), the insert runs in the background, and a
 * failure rolls the row back with one calm toast.
 */

// The table isn't in the generated Supabase types until they're regenerated.
const eqAny = supabase as unknown as { from: (table: string) => any };

const TABLE = "equilibrium_cycle_entries";
const FETCH_LIMIT = 2000;
export const MAX_ENTRY_CHARS = 2000;

function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback for very old browsers: RFC4122-ish v4.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export interface CycleEntriesApi {
  /** True once the table is readable. False = hide the journal UI. */
  available: boolean;
  loading: boolean;
  /** Every entry, newest first. */
  entries: CycleEntry[];
  /** Entries of the current cycle, newest first. */
  currentEntries: CycleEntry[];
  /**
   * Add a journal entry to the current cycle. Optimistic. `onFail` receives
   * the text back if the save is rolled back, so the input can restore it.
   */
  addEntry: (
    kind: CycleEntryKind,
    text: string,
    tag?: string | null,
    onFail?: (text: string) => void,
  ) => void;
  updateEntry: (id: string, patch: { text?: string; tag?: string | null }) => void;
  /** Delete with an Undo toast. */
  removeEntry: (id: string) => void;
  /**
   * Record a snapshot of Moon Focus / a strategy / a workstream title for
   * the current cycle. Silent: history is a by-product, never a blocker.
   * Skips when the latest snapshot for the slot already has the same text.
   */
  recordSnapshot: (
    kind: "focus_snapshot" | "strategy_snapshot" | "workstream_snapshot",
    text: string,
    slot?: string | null,
  ) => void;
}

export function useCycleEntries(
  userId: string | null,
  /** Current cycle start (ms) — from cycleStartMs(). */
  cycleStart: number | null,
  /** Current semantic phase 1-8, stored as `phase` on every new row. */
  position: number,
): CycleEntriesApi {
  const [entries, setEntries] = useState<CycleEntry[]>([]);
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(true);

  // Latest values for callbacks that must stay referentially stable.
  const entriesRef = useRef(entries);
  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);
  const ctxRef = useRef({ cycleStart, position });
  useEffect(() => {
    ctxRef.current = { cycleStart, position };
  }, [cycleStart, position]);

  useEffect(() => {
    let cancelled = false;
    if (!userId) {
      setEntries([]);
      setAvailable(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    (async () => {
      try {
        const res = await eqAny
          .from(TABLE)
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(FETCH_LIMIT);
        if (cancelled) return;
        if (res.error) {
          if (!isMissingTableError(res.error)) {
            console.warn("[equilibrium_cycle_entries] read failed", res.error);
          }
          setAvailable(false);
          setEntries([]);
        } else {
          setEntries(sortNewestFirst((res.data ?? []) as CycleEntry[]));
          setAvailable(true);
        }
      } catch (error) {
        if (cancelled) return;
        console.warn("[equilibrium_cycle_entries] read crashed", error);
        setAvailable(false);
        setEntries([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const buildRow = useCallback(
    (kind: CycleEntryKind, text: string, tag: string | null): CycleEntry | null => {
      const { cycleStart: start, position: phase } = ctxRef.current;
      if (!userId || start === null) return null;
      const now = new Date().toISOString();
      return {
        id: newId(),
        user_id: userId,
        cycle_start: new Date(start).toISOString(),
        phase,
        kind,
        text,
        tag,
        created_by: "human",
        created_at: now,
        updated_at: now,
      };
    },
    [userId],
  );

  const insertRow = useCallback(async (row: CycleEntry): Promise<boolean> => {
    const res = await eqAny.from(TABLE).insert(row);
    if (res.error) {
      console.warn("[equilibrium_cycle_entries] insert failed", res.error);
      return false;
    }
    return true;
  }, []);

  const addEntry = useCallback<CycleEntriesApi["addEntry"]>(
    (kind, text, tag = null, onFail) => {
      const clean = text.trim().slice(0, MAX_ENTRY_CHARS);
      if (!clean) return;
      const row = buildRow(kind, clean, tag ?? null);
      if (!row) return;
      setEntries((prev) => [row, ...prev]);
      void insertRow(row).then((ok) => {
        if (ok) return;
        setEntries((prev) => prev.filter((e) => e.id !== row.id));
        toast.error("Couldn't save that one. Your note is back in the box.");
        onFail?.(clean);
      });
    },
    [buildRow, insertRow],
  );

  const updateEntry = useCallback<CycleEntriesApi["updateEntry"]>((id, patch) => {
    const before = entriesRef.current.find((e) => e.id === id);
    if (!before) return;
    const nextText = patch.text === undefined ? before.text : patch.text.trim().slice(0, MAX_ENTRY_CHARS);
    if (!nextText) return;
    const nextTag = patch.tag === undefined ? before.tag : patch.tag;
    if (nextText === before.text && nextTag === before.tag) return;
    const updatedAt = new Date().toISOString();
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, text: nextText, tag: nextTag, updated_at: updatedAt } : e)),
    );
    void eqAny
      .from(TABLE)
      .update({ text: nextText, tag: nextTag, updated_at: updatedAt })
      .eq("id", id)
      .then((res: { error: unknown }) => {
        if (!res.error) return;
        console.warn("[equilibrium_cycle_entries] update failed", res.error);
        setEntries((prev) => prev.map((e) => (e.id === id ? before : e)));
        toast.error("Couldn't save that edit. The earlier text is back.");
      });
  }, []);

  const removeEntry = useCallback<CycleEntriesApi["removeEntry"]>(
    (id) => {
      const target = entriesRef.current.find((e) => e.id === id);
      if (!target) return;
      setEntries((prev) => prev.filter((e) => e.id !== id));

      const restore = () => setEntries((prev) => sortNewestFirst([target, ...prev.filter((e) => e.id !== id)]));

      const deleting: Promise<{ error: unknown }> = Promise.resolve(
        eqAny.from(TABLE).delete().eq("id", id),
      );

      // The Undo toast appears at once; the delete runs in the background.
      const toastId = toast("Removed", {
        duration: 6000,
        action: {
          label: "Undo",
          onClick: () => {
            restore();
            // Wait for the delete to land so the re-insert can't race it.
            void deleting.then(() => insertRow(target)).then((ok) => {
              if (ok) return;
              setEntries((prev) => prev.filter((e) => e.id !== id));
              toast.error("Couldn't bring it back.");
            });
          },
        },
      });

      void deleting.then((res) => {
        if (!res.error) return;
        console.warn("[equilibrium_cycle_entries] delete failed", res.error);
        toast.dismiss(toastId);
        restore();
        toast.error("Couldn't remove that one. It's back.");
      });
    },
    [insertRow],
  );

  const recordSnapshot = useCallback<CycleEntriesApi["recordSnapshot"]>(
    (kind, text, slot = null) => {
      if (!available) return;
      const clean = text.trim().slice(0, MAX_ENTRY_CHARS);
      if (!clean) return;
      const { cycleStart: start } = ctxRef.current;
      if (start === null) return;

      const latest = entriesForCycle(entriesRef.current, start)
        .filter((e) => e.kind === kind && (e.tag ?? null) === (slot ?? null))
        .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))[0];
      if (latest && latest.text === clean) return;

      const row = buildRow(kind, clean, slot ?? null);
      if (!row) return;
      setEntries((prev) => [row, ...prev]);
      void insertRow(row).then((ok) => {
        if (!ok) setEntries((prev) => prev.filter((e) => e.id !== row.id));
      });
    },
    [available, buildRow, insertRow],
  );

  const currentEntries = useMemo(
    () => (cycleStart === null ? [] : entriesForCycle(entries, cycleStart)),
    [entries, cycleStart],
  );

  return {
    available,
    loading,
    entries,
    currentEntries,
    addEntry,
    updateEntry,
    removeEntry,
    recordSnapshot,
  };
}
