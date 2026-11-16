/**
 * Cycle Journal — pure helpers (issue #331).
 *
 * No React, no Supabase: grouping entries into cycles, picking the latest
 * snapshot per slot, and shaping one cycle into the "story of the month"
 * the This-Cycle strip and the Past-cycles list both render.
 */

import type { CycleEntry, ResourceTag } from "../types";

export const RESOURCE_TAGS: { key: ResourceTag; label: string }[] = [
  { key: "money", label: "Money" },
  { key: "people", label: "People" },
  { key: "calls", label: "Calls" },
  { key: "offers", label: "Offers" },
  { key: "info", label: "Info" },
  { key: "help", label: "Help" },
];

export const RESOURCE_TAG_KEYS = RESOURCE_TAGS.map((t) => t.key) as string[];

export function resourceTagLabel(tag: string | null): string | null {
  if (!tag) return null;
  return RESOURCE_TAGS.find((t) => t.key === tag)?.label ?? null;
}

/**
 * True when a Supabase/PostgREST error means "the table isn't there yet"
 * (the migration hasn't been applied). Any failure to read the journal is
 * treated the same way by the hook: hide the new inputs, never crash.
 */
export function isMissingTableError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { code?: string; message?: string };
  if (e.code === "42P01" || e.code === "PGRST205" || e.code === "PGRST204") return true;
  return /does not exist|schema cache|could not find the table/i.test(e.message ?? "");
}

/** Newest first by created_at (stable for equal timestamps). */
export function sortNewestFirst<T extends { created_at: string }>(rows: T[]): T[] {
  return rows
    .map((row, index) => ({ row, index }))
    .sort((a, b) => {
      const diff = Date.parse(b.row.created_at) - Date.parse(a.row.created_at);
      return diff !== 0 ? diff : a.index - b.index;
    })
    .map((x) => x.row);
}

/** "Nov 16" — the user's locale. */
export function formatEntryDate(iso: string | number): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// ─── Latest snapshot per slot ──────────────────────────────────────────

/**
 * Latest snapshot per `tag` slot for one snapshot kind within a set of
 * entries ("latest snapshot per cycle wins"). Entries with a null tag share
 * one slot (Moon Focus has a single slot).
 */
export function latestSnapshotsBySlot(
  entries: CycleEntry[],
  kind: "focus_snapshot" | "strategy_snapshot" | "workstream_snapshot",
): CycleEntry[] {
  const bySlot = new Map<string, CycleEntry>();
  for (const entry of entries) {
    if (entry.kind !== kind) continue;
    const slot = entry.tag ?? "";
    const prev = bySlot.get(slot);
    if (!prev || Date.parse(entry.created_at) >= Date.parse(prev.created_at)) {
      bySlot.set(slot, entry);
    }
  }
  return [...bySlot.values()];
}

// ─── Cycles and their story ────────────────────────────────────────────

export interface CycleStory {
  focus: string | null;
  strategies: { position: number; text: string }[];
  workstreams: string[];
  clearing: CycleEntry[];
  resources: CycleEntry[];
  celebration: CycleEntry[];
}

/** Optional live values that win over snapshots (used for the CURRENT cycle). */
export interface LiveLayers {
  focus: string | null;
  strategies: { position: number; text: string }[];
  workstreams: string[];
}

/** Shape one cycle's entries into its story. Lists are newest first. */
export function buildCycleStory(entries: CycleEntry[], live?: LiveLayers): CycleStory {
  const focusSnap = latestSnapshotsBySlot(entries, "focus_snapshot")[0];
  const strategySnaps = latestSnapshotsBySlot(entries, "strategy_snapshot")
    .map((e) => ({ position: Number(e.tag) || 0, text: e.text }))
    .sort((a, b) => a.position - b.position);
  const workstreamSnaps = sortOldestFirst(latestSnapshotsBySlot(entries, "workstream_snapshot")).map(
    (e) => e.text,
  );

  return {
    focus: live ? live.focus : (focusSnap?.text ?? null),
    strategies: live ? live.strategies : strategySnaps,
    workstreams: live ? live.workstreams : workstreamSnaps,
    clearing: sortNewestFirst(entries.filter((e) => e.kind === "clearing")),
    resources: sortNewestFirst(entries.filter((e) => e.kind === "resource")),
    celebration: sortNewestFirst(entries.filter((e) => e.kind === "celebration")),
  };
}

function sortOldestFirst<T extends { created_at: string }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
}

export interface CycleGroup {
  /** cycle_start as ms. */
  cycleStartMs: number;
  entries: CycleEntry[];
}

/** Group entries by cycle_start, newest cycle first. */
export function groupByCycle(entries: CycleEntry[]): CycleGroup[] {
  const groups = new Map<number, CycleEntry[]>();
  for (const entry of entries) {
    const key = Date.parse(entry.cycle_start);
    if (!Number.isFinite(key)) continue;
    const list = groups.get(key);
    if (list) list.push(entry);
    else groups.set(key, [entry]);
  }
  return [...groups.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([cycleStartMs, list]) => ({ cycleStartMs, entries: list }));
}

/** Entries of one cycle, from the full list. */
export function entriesForCycle(entries: CycleEntry[], cycleStartMs: number): CycleEntry[] {
  return entries.filter((e) => Date.parse(e.cycle_start) === cycleStartMs);
}

/** True when a cycle has anything worth showing as a past-cycle card. */
export function storyHasContent(story: CycleStory): boolean {
  return Boolean(
    story.focus ||
      story.strategies.length ||
      story.workstreams.length ||
      story.clearing.length ||
      story.resources.length ||
      story.celebration.length,
  );
}

/** True when the phase has something to read. Drives the strip's quiet dot. */
export function phaseHasStory(position: number, story: CycleStory, doNow?: string[]): boolean {
  switch (position) {
    case 1:
      return Boolean(story.focus);
    case 2:
      return story.strategies.length > 0;
    case 3:
      return story.clearing.length > 0;
    case 4:
      return story.resources.length > 0;
    case 5:
      return story.workstreams.length > 0;
    case 7:
      return Boolean(doNow && doNow.length > 0);
    case 8:
      return story.celebration.length > 0;
    default:
      return false;
  }
}
