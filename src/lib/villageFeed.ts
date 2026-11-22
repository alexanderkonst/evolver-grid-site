/**
 * Feed of real deeds on the Quest Board (spec A16, GoBY §24 #23, issue #394).
 *
 * «What happened»: one chronological, finite list of real events, newest first, ending with
 * «You're up to date». No ranking, no filler, no infinite scroll, no counts.
 *
 * Database (ONE migration, held for Sasha's deploy yes):
 * supabase/migrations/20261122230000_village_deeds_feed.sql
 *   - `get_village_feed(p_limit)`: the events, already filtered by each doer's profile
 *     visibility ('hidden' never appears; audience gate; content only where the profile
 *     itself shows it). Reached by RPC, never by reading another player's rows.
 *   - `deed_seen`: «I see you» (one tap + optional line). The doer reads who tapped; the one
 *     who tapped reads their own tap; there is no count anywhere, so none is built here.
 *
 * The generated `Database` type does not know either until the migration is applied, hence
 * the one documented `as any` cast below (same as playerMessages.ts).
 *
 * Extension points (not built; they plug in when quests #21 and Circles #384 land):
 * add the kind to `DEED_KINDS`, its two strings under `deeds.event.<kind>` / `deeds.own.<kind>`,
 * a UNION ALL branch to `get_village_feed()` and a key shape to `deed_seen_fill()`.
 * Candidates: `quest_closed` (confirmed by the one who posted it) and `circle_happened`
 * (host confirmed who came: faces, not numbers). Nothing here counts or ranks, so nothing
 * has to change when they arrive.
 */
import { supabase } from "@/integrations/supabase/client";
import { checkParticle } from "@/lib/particleGuard";

/** The event types of v1: only those whose data already exists. */
export const DEED_KINDS = [
  "resident",
  "top_talent",
  "mission",
  "uniqueness",
  "stall",
  "first_price",
  "first_sale",
] as const;
export type DeedKind = (typeof DEED_KINDS)[number];

export const isDeedKind = (value: unknown): value is DeedKind =>
  typeof value === "string" && (DEED_KINDS as readonly string[]).includes(value);

/** One row of `get_village_feed()`. */
export interface DeedEvent {
  event_key: string;
  kind: DeedKind;
  doer_id: string;
  doer_name: string;
  occurred_at: string;
  /** The content (talent, mission, tagline), present only if the doer made it public. */
  detail: string | null;
  is_own: boolean;
}

/** One row of `deed_seen`, as the doer or the one who tapped can read it. */
export interface DeedTap {
  id: string;
  event_key: string;
  doer_id: string;
  seer_id: string;
  seer_name: string | null;
  line: string | null;
  created_at: string;
}

/** What the screen needs for one event: my own tap, and (on my deeds) who tapped. */
export interface DeedTaps {
  mine: DeedTap | null;
  /** Taps on my own deed, oldest first: faces, never a number. */
  from: DeedTap[];
}

export const DEED_LINE_MAX = 140;
const FEED_LIMIT = 40;

// Not in the generated types until the migration lands.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

type DbError = { code?: string; message?: string } | null | undefined;

/** The function or the table is not in the database yet (the migration is not deployed). */
export const isMissingDeedsBackend = (error: DbError) =>
  !!error &&
  (error.code === "42P01" || // undefined_table
    error.code === "PGRST205" || // table not in schema cache
    error.code === "42883" || // undefined_function
    error.code === "PGRST202" || // function not in schema cache
    /does not exist|schema cache|not find the (table|function)/i.test(error.message ?? ""));

/** Keeps only rows the screen can draw: a known kind, a name, a time. Order is the server's. */
export function cleanFeed(rows: unknown): DeedEvent[] {
  if (!Array.isArray(rows)) return [];
  const out: DeedEvent[] = [];
  const seen = new Set<string>();
  for (const row of rows as Partial<DeedEvent>[]) {
    if (!row || !isDeedKind(row.kind) || !row.event_key || !row.doer_name || !row.occurred_at) continue;
    if (seen.has(row.event_key)) continue;
    seen.add(row.event_key);
    out.push({
      event_key: row.event_key,
      kind: row.kind,
      doer_id: String(row.doer_id ?? ""),
      doer_name: row.doer_name,
      occurred_at: row.occurred_at,
      detail: row.detail?.trim() ? row.detail.trim() : null,
      is_own: row.is_own === true,
    });
  }
  // The server already sorts; sort again so a cached or merged list can never show an older deed first.
  return out.sort((a, b) => (a.occurred_at < b.occurred_at ? 1 : a.occurred_at > b.occurred_at ? -1 : 0));
}

/** Index taps by event: my own tap on each, and who tapped on each of my deeds. */
export function groupTaps(taps: DeedTap[], me: string | null): Map<string, DeedTaps> {
  const byEvent = new Map<string, DeedTaps>();
  if (!me) return byEvent;
  const slot = (key: string) => {
    let entry = byEvent.get(key);
    if (!entry) {
      entry = { mine: null, from: [] };
      byEvent.set(key, entry);
    }
    return entry;
  };
  for (const tap of taps) {
    if (tap.seer_id === me) slot(tap.event_key).mine = tap;
    else if (tap.doer_id === me) slot(tap.event_key).from.push(tap);
  }
  for (const entry of byEvent.values()) {
    entry.from.sort((a, b) => (a.created_at < b.created_at ? -1 : a.created_at > b.created_at ? 1 : 0));
  }
  return byEvent;
}

/** An optional line: empty is fine (null); otherwise the same kind words as everywhere (particleGuard). */
export type DeedLineCheck =
  | { ok: true; line: string | null }
  | { ok: false; reason: "too_long" | "profanity" | "too_short" };

export function checkDeedLine(raw: string): DeedLineCheck {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: true, line: null };
  if (Array.from(trimmed).length > DEED_LINE_MAX) return { ok: false, reason: "too_long" };
  const checked = checkParticle(trimmed);
  if (checked.ok === false) return { ok: false, reason: checked.reason };
  return { ok: true, line: checked.text };
}

export type FeedResult =
  | { available: true; events: DeedEvent[]; taps: DeedTap[] }
  | { available: false };

/** Remembered for the session so a missing backend is probed once, not per visit to the board. */
let backendMissing = false;

/** Test hook. */
export const resetDeedsProbe = () => {
  backendMissing = false;
};

export async function fetchFeed(): Promise<FeedResult> {
  if (backendMissing) return { available: false };
  try {
    const { data, error } = await db.rpc("get_village_feed", { p_limit: FEED_LIMIT });
    if (error) {
      if (isMissingDeedsBackend(error)) backendMissing = true;
      return { available: false };
    }
    const events = cleanFeed(data);
    // The taps the viewer may read: their own, and those on their own deeds (RLS decides).
    const tapsRes = await db
      .from("deed_seen")
      .select("id, event_key, doer_id, seer_id, seer_name, line, created_at")
      .order("created_at", { ascending: true })
      .limit(500);
    if (tapsRes.error) {
      if (isMissingDeedsBackend(tapsRes.error)) backendMissing = true;
      return { available: false };
    }
    return { available: true, events, taps: (tapsRes.data ?? []) as DeedTap[] };
  } catch {
    return { available: false };
  }
}

export type TapResult = { ok: true; tap: DeedTap } | { ok: false };

const TAP_COLUMNS = "id, event_key, doer_id, seer_id, seer_name, line, created_at";

/** «I see you»: one tap, no line needed. Tapping again is a no-op that returns the existing tap. */
export async function sendSeen(eventKey: string, me: string): Promise<TapResult> {
  try {
    const { data, error } = await db.from("deed_seen").insert({ event_key: eventKey }).select(TAP_COLUMNS).single();
    if (error) {
      if (error.code === "23505") {
        // Tapped before (another tab, a retry): the first tap stands.
        const existing = await db
          .from("deed_seen")
          .select(TAP_COLUMNS)
          .eq("event_key", eventKey)
          .eq("seer_id", me)
          .maybeSingle();
        return existing.data ? { ok: true, tap: existing.data as DeedTap } : { ok: false };
      }
      return { ok: false };
    }
    return { ok: true, tap: data as DeedTap };
  } catch {
    return { ok: false };
  }
}

/** The optional written line, added after the tap. */
export async function setSeenLine(tapId: string, line: string | null): Promise<TapResult> {
  try {
    const { data, error } = await db.from("deed_seen").update({ line }).eq("id", tapId).select(TAP_COLUMNS).single();
    if (error) return { ok: false };
    return { ok: true, tap: data as DeedTap };
  } catch {
    return { ok: false };
  }
}
