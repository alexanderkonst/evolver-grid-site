import { supabase } from "@/integrations/supabase/client";
import { circlePath } from "@/lib/circles";
import type { SinceArtifactKind } from "@/lib/houseSince";

/**
 * Reads and the one write behind «Since you were here» (issue #451).
 *
 * `house_visits` and `mark_house_visit()` come from
 * supabase/migrations/20261125060000_house_visits.sql, held for Sasha's deploy yes. The generated
 * `Database` type does not know them until then, hence the one documented `any` cast (the same
 * move villageFeed.ts and circlesApi.ts make).
 *
 * Every read degrades to «nothing»: a failed read is an empty list, never a line made up from a
 * guess. All reads are the player's own rows (RLS).
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export type HouseVisit =
  /** The player has been here before: when, and the places they had seen open. */
  | { status: "ok"; lastVisitAt: string; seenOpen: string[] }
  /** No row yet: the first visit has no «before», so it only sets the baseline. */
  | { status: "none" }
  /** The table is missing or unreadable: say nothing and write nothing. */
  | { status: "error" };

export async function loadHouseVisit(userId: string): Promise<HouseVisit> {
  try {
    const { data, error } = await db
      .from("house_visits")
      .select("last_visit_at, seen_open")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) return { status: "error" };
    if (!data) return { status: "none" };
    const seenOpen = Array.isArray(data.seen_open)
      ? (data.seen_open as unknown[]).filter((k): k is string => typeof k === "string")
      : [];
    return typeof data.last_visit_at === "string"
      ? { status: "ok", lastVisitAt: data.last_visit_at, seenOpen }
      : { status: "error" };
  } catch {
    return { status: "error" };
  }
}

/** «I was here now», and the places seen open (the database unions them: the list only grows). */
export async function markHouseVisit(open: readonly string[]): Promise<void> {
  try {
    await db.rpc("mark_house_visit", { p_open: [...open] });
  } catch {
    // Cosmetic: a missed mark means the news shows once more, never an error.
  }
}

export type SinceFacts = {
  artifacts: SinceArtifactKind[];
  seers: (string | null)[];
  circle: { id: string; title: string; to: string } | null;
};

const EMPTY: SinceFacts = { artifacts: [], seers: [], circle: null };

/** user_business_artifacts keys → the artifact kind the House names. */
const BUSINESS_KIND: Record<string, SinceArtifactKind> = {
  uniqueness: "uniqueness",
  promise: "stall",
  value_ladder: "stall",
};

const rows = <T>(res: { data?: unknown; error?: unknown } | null | undefined): T[] =>
  res && !res.error && Array.isArray(res.data) ? (res.data as T[]) : [];

async function safe<T>(run: () => PromiseLike<T>, fallback: T): Promise<T> {
  try {
    return await run();
  } catch {
    return fallback;
  }
}

/** What really changed for this player after `since` (an ISO timestamp). */
export async function loadSinceFacts(userId: string, profileId: string | null, since: string): Promise<SinceFacts> {
  const none = { data: null, error: null };
  const [business, mission, talent, taps, came] = await Promise.all([
    safe(
      () =>
        db
          .from("user_business_artifacts")
          .select("artifact_key")
          .eq("user_id", userId)
          .in("artifact_key", Object.keys(BUSINESS_KIND))
          .gt("created_at", since)
          .limit(20),
      none,
    ),
    safe(
      () => db.from("mission_participants").select("id").eq("user_id", userId).gt("created_at", since).limit(1),
      none,
    ),
    profileId
      ? safe(() => db.from("zog_snapshots").select("id").eq("profile_id", profileId).gt("created_at", since).limit(1), none)
      : Promise.resolve(none),
    // The doer reads who tapped on their deeds (RLS); there is no count and none is made.
    safe(
      () =>
        db
          .from("deed_seen")
          .select("seer_name")
          .eq("doer_id", userId)
          .gt("created_at", since)
          .order("created_at", { ascending: false })
          .limit(5),
      none,
    ),
    safe(
      () =>
        db
          .from("event_rsvps")
          .select("event_id, came_marked_at")
          .eq("user_id", userId)
          .eq("came", true)
          .gt("came_marked_at", since)
          .order("came_marked_at", { ascending: false })
          .limit(5),
      none,
    ),
  ]);

  const artifacts = new Set<SinceArtifactKind>();
  if (rows(talent).length > 0) artifacts.add("talent");
  if (rows(mission).length > 0) artifacts.add("mission");
  for (const r of rows<{ artifact_key: string }>(business)) {
    const kind = BUSINESS_KIND[r.artifact_key];
    if (kind) artifacts.add(kind);
  }

  const seers = rows<{ seer_name: string | null }>(taps).map((r) => r.seer_name ?? null);

  // The circle the player came to: newest first; one they host themselves is not «joined».
  let circle: SinceFacts["circle"] = null;
  const eventIds = rows<{ event_id: string }>(came).map((r) => r.event_id);
  if (eventIds.length > 0) {
    const events = rows<{ id: string; title: string | null; host_id: string | null }>(
      await safe(() => db.from("events").select("id, title, host_id").in("id", eventIds), none),
    );
    for (const id of eventIds) {
      const ev = events.find((e) => e.id === id);
      if (ev?.title && ev.host_id !== userId) {
        circle = { id, title: ev.title, to: circlePath(id) };
        break;
      }
    }
  }

  return { ...EMPTY, artifacts: [...artifacts], seers, circle };
}
