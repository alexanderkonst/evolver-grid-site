/**
 * Circles v1 data layer (issue #384).
 *
 * Thin calls over `events`, `event_rsvps`, `circle_*` tables and the SECURITY DEFINER
 * functions in supabase/migrations/20261122220000_circles_v1.sql. `types.ts` is generated
 * and does not know the new columns until that migration is applied, hence the one
 * documented `any` cast (the same move src/lib/playerMessages.ts makes).
 *
 * Rules enforced by the database, mirrored here only so a button is not offered where the
 * write would be refused: only the host marks came; only the host hands off or cancels;
 * a player cannot confirm their own step; lines only for people marked came.
 */
import { supabase } from "@/integrations/supabase/client";
import {
  canSetAfterPhoto,
  circlePath,
  hostOf,
  seriesDates,
  validWhere,
  visibilityToColumn,
  type CircleKind,
  type CircleLike,
  type CircleVisibility,
  type RepeatRule,
  type RsvpStatus,
} from "@/lib/circles";
import { CAME, WEEKLY } from "@/data/circlesCopy";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export interface Circle extends CircleLike {
  id: string;
  title: string;
  description: string | null;
  photo_url: string | null;
  /** Care of a place only: the place after, set by the host or co-host on Who came. */
  after_photo_url: string | null;
  event_date: string;
  event_time: string;
  end_time: string | null;
  timezone: string | null;
  location: string | null;
  online_url: string | null;
  visibility: string | null;
  community_id: string | null;
  kind: CircleKind | null;
  capacity: number | null;
  requires_approval: boolean | null;
  series_id: string | null;
  repeat_rule: RepeatRule | null;
  cancelled_at: string | null;
  created_by: string | null;
  host_id: string | null;
  cohost_id: string | null;
}

export interface CirclePerson {
  userId: string;
  role: "host" | "cohost" | "guest";
  status: RsvpStatus | string;
  came: boolean;
  name: string;
  avatarUrl: string | null;
  /** False when the profile is not public: the page shows "A villager" and no link. */
  faceVisible: boolean;
}

export interface MyRsvp {
  event_id: string;
  status: RsvpStatus | null;
  came: boolean;
}

export interface CircleLine {
  id: string;
  event_id: string;
  user_id: string;
  body: string;
  created_at: string;
}

export interface Handoff {
  id: string;
  event_id: string;
  from_user: string;
  to_user: string;
  accepted_at: string | null;
}

export interface CircleStep {
  id: string;
  series_id: string;
  user_id: string;
  week_of: string;
  step: string;
  done_when: string;
  witness_id: string | null;
  claimed_done_at: string | null;
  confirmed_at: string | null;
  witness_note: string | null;
}

export interface Notice {
  id: string;
  kind: string;
  audience: string;
  sent_at: string;
}

export const VILLAGER = "A villager";

/** Not deployed yet: the table or function is missing (Supabase / PostgREST codes). */
export const isMissingCircles = (err: unknown): boolean => {
  const e = err as { code?: string; message?: string } | null;
  if (!e) return false;
  return (
    e.code === "42P01" ||
    e.code === "42703" ||
    e.code === "42883" ||
    e.code === "PGRST202" ||
    e.code === "PGRST204" ||
    e.code === "PGRST205" ||
    /does not exist|schema cache/i.test(e.message || "")
  );
};

/** One message for the UI, never a raw database string. */
export const circleErrorMessage = (err: unknown, fallback = "Something went wrong. Try again."): string => {
  if (isMissingCircles(err)) return "Circles are not available yet.";
  const message = (err as { message?: string } | null)?.message || "";
  if (/circle_full/.test(message)) return "This circle is full.";
  if (/ask_to_join/.test(message)) return "The host says yes to each person.";
  if (/only the host/i.test(message)) return "Only the host can do this.";
  return fallback;
};

const personName = (first: string | null, last: string | null) => `${first || ""} ${last || ""}`.trim();

export const currentUserId = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
};

/** The player's own first name, for notes ("{Host} confirmed you came…"). */
export async function myFirstName(userId: string): Promise<string> {
  const { data } = await supabase
    .from("game_profiles")
    .select("first_name, last_name")
    .eq("user_id", userId)
    .maybeSingle();
  return personName(data?.first_name ?? null, data?.last_name ?? null) || "Your host";
}

// ─── reading ───────────────────────────────────────────────────────────────────

/** Circles for the Café list. Guests see public ones; players also see their own and ones they joined. */
export async function fetchCafeCircles(userId: string | null): Promise<{
  circles: Circle[];
  mine: Record<string, MyRsvp>;
  faces: Record<string, { avatarUrl: string | null; name: string; userId: string }[]>;
  goingCounts: Record<string, number>;
}> {
  const since = new Date(Date.now() - 90 * 86400000).toISOString().split("T")[0];
  let mine: Record<string, MyRsvp> = {};
  let joinedIds: string[] = [];
  if (userId) {
    const { data, error } = await db
      .from("event_rsvps")
      .select("event_id, status, came")
      .eq("user_id", userId);
    if (error && !isMissingCircles(error)) throw error;
    const rows = (data || []) as MyRsvp[];
    mine = Object.fromEntries(rows.map((r) => [r.event_id, r]));
    joinedIds = rows.map((r) => r.event_id);
  }

  let query = db.from("events").select("*").gte("event_date", since).order("event_date", { ascending: true });
  if (!userId) {
    query = query.or("visibility.is.null,visibility.eq.public");
  } else {
    const filters = [
      "visibility.is.null",
      "visibility.eq.public",
      "visibility.eq.community",
      `created_by.eq.${userId}`,
      `host_id.eq.${userId}`,
      `cohost_id.eq.${userId}`,
    ];
    if (joinedIds.length > 0) filters.push(`id.in.(${joinedIds.map((id) => `"${id}"`).join(",")})`);
    query = query.or(filters.join(","));
  }
  const { data, error } = await query;
  if (error) throw error;
  const circles = ((data || []) as Circle[]).filter((c) => !c.cancelled_at);

  const faces: Record<string, { avatarUrl: string | null; name: string; userId: string }[]> = {};
  const goingCounts: Record<string, number> = {};
  if (circles.length > 0) {
    const { data: faceRows, error: faceErr } = await db.rpc("circle_going_faces", {
      p_event_ids: circles.map((c) => c.id),
    });
    if (!faceErr) {
      for (const row of (faceRows || []) as Array<{
        event_id: string;
        user_id: string;
        avatar_url: string | null;
        first_name: string | null;
        going_count: number;
      }>) {
        (faces[row.event_id] ||= []).push({
          userId: row.user_id,
          avatarUrl: row.avatar_url,
          name: row.first_name || VILLAGER,
        });
        goingCounts[row.event_id] = Number(row.going_count);
      }
    }
  }
  return { circles, mine, faces, goingCounts };
}

export async function fetchCircle(id: string): Promise<Circle | null> {
  const { data, error } = await db.from("events").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as Circle) || null;
}

export async function fetchPeople(eventId: string): Promise<CirclePerson[]> {
  const { data, error } = await db.rpc("circle_people", { p_event_id: eventId });
  if (error) {
    if (isMissingCircles(error)) return [];
    throw error;
  }
  return ((data || []) as Array<{
    user_id: string;
    role: CirclePerson["role"];
    status: string;
    came: boolean;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    face_visible: boolean;
  }>).map((r) => ({
    userId: r.user_id,
    role: r.role,
    status: r.status,
    came: !!r.came,
    name: r.face_visible ? personName(r.first_name, r.last_name) || VILLAGER : VILLAGER,
    avatarUrl: r.face_visible ? r.avatar_url : null,
    faceVisible: !!r.face_visible,
  }));
}

export async function fetchMyRsvp(eventId: string, userId: string): Promise<MyRsvp | null> {
  const { data } = await db
    .from("event_rsvps")
    .select("event_id, status, came")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .maybeSingle();
  return (data as MyRsvp) || null;
}

export async function fetchLines(eventId: string): Promise<CircleLine[]> {
  const { data, error } = await db
    .from("circle_lines")
    .select("id, event_id, user_id, body, created_at")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });
  if (error) return [];
  return (data || []) as CircleLine[];
}

/** All meetings of a series, soonest first (includes this one). */
export async function fetchSeries(seriesId: string): Promise<Circle[]> {
  const { data, error } = await db
    .from("events")
    .select("*")
    .eq("series_id", seriesId)
    .order("event_date", { ascending: true });
  if (error) return [];
  return (data || []) as Circle[];
}

export async function fetchPendingHandoff(eventId: string): Promise<Handoff | null> {
  const { data, error } = await db
    .from("circle_handoffs")
    .select("id, event_id, from_user, to_user, accepted_at")
    .eq("event_id", eventId)
    .is("accepted_at", null)
    .order("created_at", { ascending: false })
    .limit(1);
  if (error) return null;
  return ((data || [])[0] as Handoff) || null;
}

export async function fetchNotices(eventId: string): Promise<Notice[]> {
  const { data, error } = await db
    .from("circle_notices")
    .select("id, kind, audience, sent_at")
    .eq("event_id", eventId)
    .order("sent_at", { ascending: false });
  if (error) return [];
  return (data || []) as Notice[];
}

/**
 * Came counts per meeting (host not counted), in the order given, for "Keep it going?".
 * Only the host or co-host can read other people's rsvp rows, which is who asks.
 */
export async function fetchCameCounts(meetings: Array<{ id: string; host: string | null }>): Promise<number[]> {
  if (meetings.length === 0) return [];
  const { data, error } = await db
    .from("event_rsvps")
    .select("event_id, user_id, came")
    .in("event_id", meetings.map((m) => m.id))
    .eq("came", true);
  if (error) return meetings.map(() => 1); // cannot tell: never stop a circle on a failed read
  const hostById = Object.fromEntries(meetings.map((m) => [m.id, m.host]));
  const counts: Record<string, number> = {};
  for (const row of (data || []) as Array<{ event_id: string; user_id: string }>) {
    if (row.user_id !== hostById[row.event_id]) counts[row.event_id] = (counts[row.event_id] || 0) + 1;
  }
  return meetings.map((m) => counts[m.id] || 0);
}

export async function searchVillagers(query: string): Promise<Array<{ userId: string; name: string; avatarUrl: string | null }>> {
  const { data, error } = await db.rpc("circle_search_villagers", { p_query: query });
  if (error) return [];
  return ((data || []) as Array<{ user_id: string; first_name: string | null; last_name: string | null; avatar_url: string | null }>).map((r) => ({
    userId: r.user_id,
    name: personName(r.first_name, r.last_name) || VILLAGER,
    avatarUrl: r.avatar_url,
  }));
}

// ─── notes (inbox) ─────────────────────────────────────────────────────────────

/** One inbox note about a circle, from the signed-in host / co-host (or a guest to the host). */
export async function notify(eventId: string, recipients: string[], body: string, kind: "message" | "system" = "system", audience = "going"): Promise<number> {
  if (recipients.length === 0) return 0;
  const { data, error } = await db.rpc("circle_notify", {
    p_event_id: eventId,
    p_recipients: recipients,
    p_body: body,
    p_kind: kind,
    p_audience: audience,
  });
  if (error) throw error;
  return Number(data) || 0;
}

// ─── hosting ───────────────────────────────────────────────────────────────────

export interface CircleDraft {
  title: string;
  description: string;
  kind: CircleKind;
  date: string;
  start: string;
  end: string;
  timezone: string;
  repeat: RepeatRule;
  location: string;
  onlineUrl: string;
  photoUrl: string;
  requiresApproval: boolean;
  capacity: number | null;
  cohostId: string | null;
  visibility: CircleVisibility;
}

const draftToRow = (d: CircleDraft) => {
  // Care of a place is a real place only (no Online); validWhere drops a call link for it.
  const where = validWhere(d.kind, d.location, d.onlineUrl);
  if (!where) throw new Error("A place is required");
  return {
    title: d.title.trim(),
    description: d.description.trim() || null,
    kind: d.kind,
    event_time: `${d.start}:00`,
    end_time: d.end ? `${d.end}:00` : null,
    timezone: d.timezone || "UTC",
    location: where.location,
    online_url: where.onlineUrl,
    photo_url: d.photoUrl.trim() || null,
    requires_approval: d.requiresApproval,
    capacity: d.capacity,
    cohost_id: d.cohostId,
    visibility: visibilityToColumn(d.visibility),
    repeat_rule: d.repeat,
  };
};

/** Host a circle: one row, or the first 4 meetings of a series, each with its own guest list. */
export async function createCircle(draft: CircleDraft): Promise<Circle> {
  const userId = await currentUserId();
  if (!userId) throw new Error("Sign in first");
  const dates = seriesDates(draft.date, draft.repeat);
  const seriesId = dates.length > 1 || draft.kind === "weekly_circle" ? crypto.randomUUID() : null;
  const rows = dates.map((date) => ({
    ...draftToRow(draft),
    event_date: date,
    series_id: seriesId,
    created_by: userId,
    host_id: userId,
  }));
  const { data, error } = await db.from("events").insert(rows).select();
  if (error) throw error;
  const sorted = ((data || []) as Circle[]).sort((a, b) => (a.event_date < b.event_date ? -1 : 1));
  return sorted[0];
}

/** Save an edit to one meeting (S4 Edit). */
export async function updateCircle(id: string, draft: CircleDraft, hadAfterPhoto = false): Promise<void> {
  // Editing one meeting never changes how the series repeats.
  const row: Partial<ReturnType<typeof draftToRow>> & { after_photo_url?: null } = draftToRow(draft);
  delete row.repeat_rule;
  // The "after" photo belongs to Care of a place only: leaving that kind drops it. The column
  // is touched only when there is a photo to drop, so other edits never need the new column.
  if (hadAfterPhoto && draft.kind !== "care") row.after_photo_url = null;
  const { error } = await db
    .from("events")
    .update({ ...row, event_date: draft.date })
    .eq("id", id);
  if (error) throw error;
}

// ─── the "after" photo (Care of a place) ───────────────────────────────────────

const AFTER_PHOTO_MAX_EDGE = 1600;
/** The app's one image bucket (public, one folder per user, see the avatars storage policies). */
const IMAGE_BUCKET = "avatars";

/** Shrink a phone photo before upload: longest edge 1600 px, JPEG. */
async function downscaleToJpeg(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, AFTER_PHOTO_MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not read the photo");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not read the photo"))), "image/jpeg", 0.85),
  );
}

/**
 * Host or co-host of a Care of a place circle: save the one "after" photo. Uploads to the
 * image bucket the app already uses, under the signed-in player's own folder (what its
 * storage policy allows), then writes the URL to the event; the host update policy and the
 * events check decide the rest. Returns the public URL.
 */
export async function setAfterPhoto(circle: Circle, file: File): Promise<string> {
  const userId = await currentUserId();
  if (!userId || !canSetAfterPhoto(circle, userId)) throw new Error("only the host can add the photo");
  if (!file.type.startsWith("image/")) throw new Error("That file is not a photo");
  const blob = await downscaleToJpeg(file);
  const path = `${userId}/circle-after-${circle.id}-${Date.now()}.jpg`;
  const { error: uploadError } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(path, blob, { contentType: "image/jpeg", upsert: true });
  if (uploadError) throw uploadError;
  const url = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
  const { error } = await db.from("events").update({ after_photo_url: url }).eq("id", circle.id);
  if (error) throw error;
  return url;
}

/** Take the "after" photo off (host or co-host). */
export async function removeAfterPhoto(circle: Circle): Promise<void> {
  const userId = await currentUserId();
  if (!userId || !canSetAfterPhoto(circle, userId)) throw new Error("only the host can remove the photo");
  const { error } = await db.from("events").update({ after_photo_url: null }).eq("id", circle.id);
  if (error) throw error;
}

/** "Next meeting": copy everything except guests to a new date. */
export async function copyToNewDate(circle: Circle, date: string): Promise<Circle> {
  const userId = await currentUserId();
  if (!userId) throw new Error("Sign in first");
  const { data, error } = await db
    .from("events")
    .insert({
      title: circle.title,
      description: circle.description,
      photo_url: circle.photo_url,
      kind: circle.kind ?? "gathering",
      event_date: date,
      event_time: circle.event_time,
      end_time: circle.end_time,
      timezone: circle.timezone,
      location: circle.location,
      online_url: circle.online_url,
      community_id: circle.community_id,
      visibility: circle.visibility,
      capacity: circle.capacity,
      requires_approval: circle.requires_approval ?? false,
      repeat_rule: circle.repeat_rule ?? "never",
      series_id: circle.series_id,
      cohost_id: circle.cohost_id,
      created_by: userId,
      host_id: userId,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Circle;
}

/** "Keep it going": the next 4 meetings after the last one, same rule, new guest lists. */
export async function extendSeries(last: Circle, rule: RepeatRule): Promise<void> {
  const dates = seriesDates(last.event_date, rule).slice(1);
  for (const date of dates) {
    await copyToNewDate(last, date);
  }
}

// ─── joining ───────────────────────────────────────────────────────────────────

async function upsertRsvp(eventId: string, status: RsvpStatus, extra: Record<string, unknown> = {}) {
  const userId = await currentUserId();
  if (!userId) throw new Error("Sign in first");
  const { error } = await db
    .from("event_rsvps")
    .upsert({ event_id: eventId, user_id: userId, status, ...extra }, { onConflict: "event_id,user_id" });
  if (error) throw error;
  return userId;
}

export const joinCircle = (eventId: string) => upsertRsvp(eventId, "going");

/** Ask to join, with an optional line for the host (kept as the host's note, then a note in the inbox). */
export async function askToJoin(circle: Circle, line: string, myName: string): Promise<void> {
  await upsertRsvp(circle.id, "asked", { note: line.trim() ? line.trim().slice(0, 200) : null });
  const host = hostOf(circle);
  if (host) {
    const body = `${myName} asks to join ${circle.title}.${line.trim() ? ` "${line.trim().slice(0, 200)}"` : ""} ${circlePath(circle.id)}/manage`;
    await notify(circle.id, [host], body).catch(() => 0);
  }
}

/** "Withdraw" and "Can't make it": the row goes away, so nothing of a sign-up stays. */
export async function leaveCircle(eventId: string): Promise<void> {
  const userId = await currentUserId();
  if (!userId) return;
  const { error } = await db.from("event_rsvps").delete().eq("event_id", eventId).eq("user_id", userId);
  if (error) throw error;
}

/** Host: Yes / Not this time on an Asked row. */
export async function answerAsk(circle: Circle, userId: string, yes: boolean, tellThem: boolean): Promise<void> {
  const { error } = await db
    .from("event_rsvps")
    .update({ status: yes ? "going" : "declined" })
    .eq("event_id", circle.id)
    .eq("user_id", userId);
  if (error) throw error;
  if (tellThem) {
    const body = yes
      ? `You're in: ${circle.title}. ${circlePath(circle.id)}`
      : `${circle.title}: the host said not this time.`;
    await notify(circle.id, [userId], body).catch(() => 0);
  }
}

export async function cancelCircle(circle: Circle, goingIds: string[]): Promise<void> {
  const { error } = await db.from("events").update({ cancelled_at: new Date().toISOString() }).eq("id", circle.id);
  if (error) throw error;
  await notify(circle.id, goingIds, `${circle.title} was cancelled by the host.`).catch(() => 0);
}

export async function setCohost(circle: Circle, userId: string | null): Promise<void> {
  const { error } = await db.from("events").update({ cohost_id: userId }).eq("id", circle.id);
  if (error) throw error;
  if (userId) {
    await notify(circle.id, [userId], `You're co-host of ${circle.title}. ${circlePath(circle.id)}/manage`).catch(() => 0);
  }
}

export async function writeToGoing(circle: Circle, goingIds: string[], body: string): Promise<number> {
  return notify(circle.id, goingIds, `${circle.title}: ${body.trim()} ${circlePath(circle.id)}`, "message", "Going");
}

// ─── hand-off ──────────────────────────────────────────────────────────────────

export async function offerHandoff(circle: Circle, toUser: string, hostName: string): Promise<void> {
  const userId = await currentUserId();
  if (!userId) throw new Error("Sign in first");
  const { error } = await db.from("circle_handoffs").insert({
    event_id: circle.id,
    series_id: circle.series_id,
    from_user: userId,
    to_user: toUser,
  });
  if (error) throw error;
  await notify(circle.id, [toUser], `${hostName} passes ${circle.title} to you. Take the circle: ${circlePath(circle.id)}`).catch(() => 0);
}

export async function withdrawHandoff(handoffId: string): Promise<void> {
  const { error } = await db.from("circle_handoffs").delete().eq("id", handoffId);
  if (error) throw error;
}

export async function acceptHandoff(handoffId: string): Promise<void> {
  const { error } = await db.rpc("accept_circle_handoff", { p_handoff_id: handoffId });
  if (error) throw error;
}

// ─── who came ──────────────────────────────────────────────────────────────────

/**
 * Confirm who came. `cameIds` is the full set of people marked came (host included);
 * `known` is who was already marked, so only newly marked people get the inbox note
 * (one note per person, even if the host confirms twice).
 */
export async function confirmCame(circle: Circle, cameIds: string[], guestIds: string[], alreadyCame: string[], hostName: string): Promise<void> {
  const now = new Date().toISOString();
  const cameSet = new Set(cameIds);
  const hostId = hostOf(circle);

  // People who were on the list: came or not came.
  for (const uid of guestIds) {
    const isCame = cameSet.has(uid);
    const { error } = await db
      .from("event_rsvps")
      .update({ came: isCame, came_marked_at: isCame ? now : null })
      .eq("event_id", circle.id)
      .eq("user_id", uid);
    if (error) throw error;
  }
  // People who came without joining, and the host: a row that says going + came.
  const extras = cameIds.filter((uid) => !guestIds.includes(uid));
  if (extras.length > 0) {
    const { error } = await db.from("event_rsvps").upsert(
      extras.map((uid) => ({ event_id: circle.id, user_id: uid, status: "going", came: true, came_marked_at: now })),
      { onConflict: "event_id,user_id" },
    );
    if (error) throw error;
  }
  const fresh = cameIds.filter((uid) => uid !== hostId && !alreadyCame.includes(uid));
  await notify(circle.id, fresh, `${CAME.note(hostName, circle.title)} ${circlePath(circle.id)}`).catch(() => 0);
}

// ─── one line ──────────────────────────────────────────────────────────────────

export async function saveLine(eventId: string, userId: string, body: string): Promise<void> {
  const { error } = await db
    .from("circle_lines")
    .upsert({ event_id: eventId, user_id: userId, body }, { onConflict: "event_id,user_id" });
  if (error) throw error;
}

export async function deleteLine(eventId: string, userId: string): Promise<void> {
  const { error } = await db.from("circle_lines").delete().eq("event_id", eventId).eq("user_id", userId);
  if (error) throw error;
}

// ─── Weekly circle: step and witness ───────────────────────────────────────────

export async function fetchSteps(seriesId: string): Promise<CircleStep[]> {
  const { data, error } = await db
    .from("circle_steps")
    .select("id, series_id, user_id, week_of, step, done_when, witness_id, claimed_done_at, confirmed_at, witness_note")
    .eq("series_id", seriesId)
    .order("week_of", { ascending: false });
  if (error) return [];
  return (data || []) as CircleStep[];
}

export async function setStep(args: {
  seriesId: string;
  userId: string;
  weekOf: string;
  step: string;
  doneWhen: string;
  witnessId: string | null;
}): Promise<void> {
  const { error } = await db.from("circle_steps").upsert(
    {
      series_id: args.seriesId,
      user_id: args.userId,
      week_of: args.weekOf,
      step: args.step,
      done_when: args.doneWhen,
      witness_id: args.witnessId,
    },
    { onConflict: "series_id,user_id,week_of" },
  );
  if (error) throw error;
}

/** "My step is done": the witness gets "{Name} says their step is done…". */
export async function claimStepDone(step: CircleStep, myName: string): Promise<void> {
  const { error } = await db
    .from("circle_steps")
    .update({ claimed_done_at: new Date().toISOString() })
    .eq("id", step.id);
  if (error) throw error;
  if (step.witness_id) {
    await db.rpc("circle_step_notify", {
      p_step_id: step.id,
      p_to_witness: true,
      p_body: WEEKLY.witnessNote(myName, step.done_when),
    });
  }
}

/** The witness confirms: a stamp. Never scored, never ranked. */
export async function confirmStep(step: CircleStep): Promise<void> {
  const { error } = await db
    .from("circle_steps")
    .update({ confirmed_at: new Date().toISOString(), witness_note: null })
    .eq("id", step.id);
  if (error) throw error;
}

/** The witness says "Not yet" with one line in words. */
export async function stepNotYet(step: CircleStep, note: string, witnessName: string): Promise<void> {
  const line = note.trim().slice(0, 200);
  const { error } = await db
    .from("circle_steps")
    .update({ claimed_done_at: null, witness_note: line || null })
    .eq("id", step.id);
  if (error) throw error;
  await db
    .rpc("circle_step_notify", {
      p_step_id: step.id,
      p_to_witness: false,
      p_body: `${witnessName}: not yet.${line ? ` ${line}` : ""}`,
    })
    .then(() => undefined, () => undefined);
}

