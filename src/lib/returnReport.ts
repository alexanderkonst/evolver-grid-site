/**
 * returnReport — the read side of return metric v0 (#287, #328).
 *
 * Input: rows of public.funnel_events. Output: how many players saw the top-talent reveal,
 * how many of them came back on a later calendar day, and the same by first-reveal day.
 * Same definitions as docs/specs/metrics/return_metric.sql, with two differences:
 *   - no date window: the whole table;
 *   - identity is bridged. An event that carries both `player_id` (device) and `user_id`
 *     (signed in) proves they are one person, so the guest reveal and the signed-in return
 *     of the same player count as one player (the SQL keys by user_id OR player_id and
 *     misses that case).
 *
 * Pure functions, no I/O: the page does the reading.
 */

export interface ReportEvent {
  step: string;
  metadata: unknown;
  timestamp: string | null;
}

export interface ReturnReportRow {
  /** First-reveal day, YYYY-MM-DD (the player's local day when the client sent it). */
  day: string;
  revealed: number;
  returned: number;
  /** Percent with one decimal, or null when nobody revealed. */
  ratePct: number | null;
}

export interface ReturnReport {
  total: Omit<ReturnReportRow, "day">;
  /** One row per first-reveal day, oldest first. */
  days: ReturnReportRow[];
}

const LOCAL_DATE = /^20\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

const asRecord = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};

const asId = (v: unknown): string | null =>
  typeof v === "string" && v.trim() !== "" ? v.trim() : null;

/** The player's local day (metadata.local_date), else the UTC date of the timestamp. */
export function eventDay(event: ReportEvent): string | null {
  const local = asRecord(event.metadata).local_date;
  if (typeof local === "string" && LOCAL_DATE.test(local)) return local;
  if (!event.timestamp) return null;
  const t = new Date(event.timestamp);
  return Number.isNaN(t.getTime()) ? null : t.toISOString().slice(0, 10);
}

export const ratePct = (returned: number, revealed: number): number | null =>
  revealed > 0 ? Math.round((1000 * returned) / revealed) / 10 : null;

/** Union-find over identity keys ("p:<player_id>", "u:<user_id>"). */
class Identities {
  private parent = new Map<string, string>();

  find(key: string): string {
    let root = this.parent.get(key);
    if (root === undefined) {
      this.parent.set(key, key);
      return key;
    }
    while (root !== this.parent.get(root)) root = this.parent.get(root)!;
    // Path compression.
    let cur = key;
    while (cur !== root) {
      const next = this.parent.get(cur)!;
      this.parent.set(cur, root);
      cur = next;
    }
    return root;
  }

  union(a: string, b: string): void {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra !== rb) this.parent.set(ra, rb);
  }
}

const keysOf = (metadata: unknown): { p: string | null; u: string | null } => {
  const m = asRecord(metadata);
  const p = asId(m.player_id);
  const u = asId(m.user_id);
  return { p: p && `p:${p}`, u: u && `u:${u}` };
};

/**
 * @param events  reveal_seen and game_open rows (other steps are ignored)
 * @param linkMetadata  metadata of any other events that carry both ids; they only add
 *                      links between a device and an account, they are never counted
 */
export function computeReturnReport(
  events: ReportEvent[],
  linkMetadata: unknown[] = [],
): ReturnReport {
  const ids = new Identities();

  const link = (metadata: unknown) => {
    const { p, u } = keysOf(metadata);
    if (p && u) ids.union(p, u);
  };
  for (const m of linkMetadata) link(m);
  for (const e of events) link(e.metadata);

  const firstReveal = new Map<string, string>();
  const opens = new Map<string, string[]>();

  for (const e of events) {
    if (e.step !== "reveal_seen" && e.step !== "game_open") continue;
    const { p, u } = keysOf(e.metadata);
    const key = u ?? p;
    if (!key) continue;
    const day = eventDay(e);
    if (!day) continue;
    const player = ids.find(key);
    if (e.step === "reveal_seen") {
      const seen = firstReveal.get(player);
      if (seen === undefined || day < seen) firstReveal.set(player, day);
    } else {
      const list = opens.get(player);
      if (list) list.push(day);
      else opens.set(player, [day]);
    }
  }

  const byDay = new Map<string, { revealed: number; returned: number }>();
  let revealed = 0;
  let returned = 0;
  for (const [player, first] of firstReveal) {
    const back = (opens.get(player) ?? []).some((d) => d > first);
    const row = byDay.get(first) ?? { revealed: 0, returned: 0 };
    row.revealed += 1;
    if (back) row.returned += 1;
    byDay.set(first, row);
    revealed += 1;
    if (back) returned += 1;
  }

  const days = [...byDay.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([day, r]) => ({ day, ...r, ratePct: ratePct(r.returned, r.revealed) }));

  return { total: { revealed, returned, ratePct: ratePct(returned, revealed) }, days };
}
