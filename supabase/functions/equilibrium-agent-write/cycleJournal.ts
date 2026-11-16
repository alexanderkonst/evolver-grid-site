// Cycle Journal operations for equilibrium-agent-write (issue #331).
//
// Kept in a sibling module with no remote imports so vitest can exercise it
// against an in-memory client (src/modules/equilibrium/__tests__/agentCycleJournal.test.ts).
// index.ts validates raw payloads with the helpers below, then calls the
// mutators with clean values. Mutators honor `dryRun` (reads and validation
// happen, writes do not).
//
// The cycle clock is injected as `segmentIndexAt(ms)` (astronomical lunar
// segment 0-7, New Moon = 0) so this file doesn't duplicate the lunar math:
// index.ts passes its inline port, tests pass the app's getLunarState.
// `cycleStartFrom` mirrors cycleStartMs() in
// src/modules/equilibrium/phasePlan.ts — keep the two in sync (a test pins
// them to the same value).

// deno-lint-ignore no-explicit-any
type SupabaseAdmin = any;

export const CYCLE_ENTRY_TABLE = "equilibrium_cycle_entries";

/** Kinds an agent may write by hand. Snapshots are written by the app/server on save. */
export const JOURNAL_KINDS = ["clearing", "resource", "celebration"] as const;
export type JournalKind = (typeof JOURNAL_KINDS)[number];

export const SNAPSHOT_KINDS = ["focus_snapshot", "strategy_snapshot", "workstream_snapshot"] as const;
export type SnapshotKind = (typeof SNAPSHOT_KINDS)[number];

export const RESOURCE_TAGS = ["money", "people", "calls", "offers", "info", "help"] as const;

export const MAX_ENTRY_CHARS = 2000;
/** read_state lists at most this many entries of the current cycle. */
export const MAX_CYCLE_ENTRIES_READ = 200;

export function cleanJournalKind(value: unknown): JournalKind {
  if (typeof value !== "string" || !(JOURNAL_KINDS as readonly string[]).includes(value)) {
    throw new Error(`payload.kind must be one of: ${JOURNAL_KINDS.join(", ")}.`);
  }
  return value as JournalKind;
}

/** Optional tag: resources only. Returns null when absent. */
export function cleanResourceTag(value: unknown, kind: JournalKind): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (kind !== "resource") throw new Error("payload.tag is only valid for kind resource.");
  if (typeof value !== "string" || !(RESOURCE_TAGS as readonly string[]).includes(value)) {
    throw new Error(`payload.tag must be one of: ${RESOURCE_TAGS.join(", ")}.`);
  }
  return value;
}

export function cleanEntryText(value: unknown): string {
  if (typeof value !== "string") throw new Error("payload.text must be a string.");
  const trimmed = value.trim();
  if (!trimmed) throw new Error("payload.text cannot be empty.");
  if (trimmed.length > MAX_ENTRY_CHARS) throw new Error("payload.text is too long.");
  return trimmed;
}

// ─── Cycle clock ───────────────────────────────────────────────────────

const MINUTE_MS = 60_000;
const COARSE_STEP_MS = 3 * 60 * 60 * 1000;
const MAX_COARSE_STEPS = 280;
/** Astronomical segment index of Planning (Last Quarter). */
const PLANNING_INDEX = 6;

/** Semantic cycle position (1-8) from the astronomical segment index (0-7). */
export function semanticPosition(segmentIndex: number): number {
  const idx = ((segmentIndex % 8) + 8) % 8;
  return ((idx + 2) % 8) + 1;
}

/**
 * Start of the current cycle (ms): the first whole minute inside the most
 * recent Planning segment at or before `nowMs`. Same algorithm and result as
 * cycleStartMs() in src/modules/equilibrium/phasePlan.ts.
 */
export function cycleStartFrom(segmentIndexAt: (ms: number) => number, nowMs: number): number {
  const isPlanning = (t: number) => segmentIndexAt(t) === PLANNING_INDEX;

  let hi = nowMs;
  let guard = 0;
  while (!isPlanning(hi) && guard++ < MAX_COARSE_STEPS) hi -= COARSE_STEP_MS;

  let lo = hi - COARSE_STEP_MS;
  guard = 0;
  while (isPlanning(lo) && guard++ < MAX_COARSE_STEPS) {
    hi = lo;
    lo -= COARSE_STEP_MS;
  }

  let loM = Math.floor(lo / MINUTE_MS);
  let hiM = Math.ceil(hi / MINUTE_MS);
  if (!isPlanning(hiM * MINUTE_MS)) hiM = Math.floor(hi / MINUTE_MS);
  while (hiM - loM > 1) {
    const mid = Math.floor((loM + hiM) / 2);
    if (isPlanning(mid * MINUTE_MS)) hiM = mid;
    else loM = mid;
  }
  return hiM * MINUTE_MS;
}

export interface CycleClock {
  /** Start of the current cycle, ISO. */
  cycleStartIso: string;
  /** Current semantic phase 1-8. */
  position: number;
}

export function cycleClock(segmentIndexAt: (ms: number) => number, nowMs: number): CycleClock {
  return {
    cycleStartIso: new Date(cycleStartFrom(segmentIndexAt, nowMs)).toISOString(),
    position: semanticPosition(segmentIndexAt(nowMs)),
  };
}

// ─── Mutators / readers ────────────────────────────────────────────────

/** add_cycle_entry {kind, text, tag?} */
export async function addCycleEntry(
  admin: SupabaseAdmin,
  userId: string,
  params: {
    kind: JournalKind;
    text: string;
    tag: string | null;
    agentName: string;
    clock: CycleClock;
    dryRun: boolean;
  },
) {
  const { kind, text, tag, agentName, clock, dryRun } = params;
  const row = {
    user_id: userId,
    cycle_start: clock.cycleStartIso,
    phase: clock.position,
    kind,
    text,
    tag,
    created_by: agentName,
  };

  let entryId: string = "dry-run-cycle-entry-id";
  if (!dryRun) {
    const { data, error } = await admin.from(CYCLE_ENTRY_TABLE).insert(row).select("id").single();
    if (error) throw new Error(`Could not add cycle entry: ${error.message}`);
    entryId = data?.id ?? entryId;
  }

  return {
    result: {
      target: CYCLE_ENTRY_TABLE,
      entry_id: entryId,
      kind,
      text,
      tag,
      phase: clock.position,
      cycle_start: clock.cycleStartIso,
    },
    summary: `added ${kind} entry`,
  };
}

/**
 * Best-effort snapshot (focus / strategy / workstream title) for the
 * current cycle, written next to the real save so Past cycles has history
 * for agent writes too. Never throws: the journal is a by-product, and the
 * table may not exist yet. Skips when the latest snapshot for the slot
 * already holds the same text.
 */
export async function recordSnapshot(
  admin: SupabaseAdmin,
  userId: string,
  params: {
    kind: SnapshotKind;
    text: string;
    slot: string | null;
    agentName: string;
    clock: CycleClock;
  },
): Promise<void> {
  try {
    const { kind, slot, agentName, clock } = params;
    const text = params.text.trim().slice(0, MAX_ENTRY_CHARS);
    if (!text) return;

    let query = admin
      .from(CYCLE_ENTRY_TABLE)
      .select("text")
      .eq("user_id", userId)
      .eq("cycle_start", clock.cycleStartIso)
      .eq("kind", kind);
    if (slot !== null) query = query.eq("tag", slot);
    const { data: existing, error: readError } = await query
      .order("created_at", { ascending: false })
      .limit(1);
    if (readError) return;
    if (Array.isArray(existing) && existing[0]?.text === text) return;

    await admin.from(CYCLE_ENTRY_TABLE).insert({
      user_id: userId,
      cycle_start: clock.cycleStartIso,
      phase: clock.position,
      kind,
      text,
      tag: slot,
      created_by: agentName,
    });
  } catch {
    /* snapshots never block a real write */
  }
}

/**
 * This cycle's journal entries for read_state. Tolerant: if the table is
 * missing (migration not applied yet) it reports `available: false` instead
 * of failing the whole read.
 */
export async function readCycleEntries(admin: SupabaseAdmin, userId: string, clock: CycleClock) {
  const empty = { available: false, cycle_start: clock.cycleStartIso, clearing: [], resources: [], celebration: [] };
  try {
    const { data, error } = await admin
      .from(CYCLE_ENTRY_TABLE)
      .select("id, kind, text, tag, phase, created_by, created_at")
      .eq("user_id", userId)
      .eq("cycle_start", clock.cycleStartIso)
      .order("created_at", { ascending: false })
      .limit(MAX_CYCLE_ENTRIES_READ);
    if (error) return empty;
    const rows = Array.isArray(data) ? (data as Record<string, unknown>[]) : [];
    const pick = (kind: JournalKind) =>
      rows
        .filter((r) => r.kind === kind)
        .map((r) => ({
          id: r.id,
          text: r.text,
          tag: r.tag ?? null,
          phase: r.phase,
          created_by: r.created_by,
          created_at: r.created_at,
        }));
    return {
      available: true,
      cycle_start: clock.cycleStartIso,
      clearing: pick("clearing"),
      resources: pick("resource"),
      celebration: pick("celebration"),
    };
  } catch {
    return empty;
  }
}
