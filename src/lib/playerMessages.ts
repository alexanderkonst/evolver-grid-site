/**
 * Player-to-player messages (spec A6, issue #356).
 *
 * Thin data layer over `public.player_messages` (supabase/migrations/20261121190000_player_messages.sql).
 * `types.ts` is generated and does not know the table until the migration is applied, hence
 * the `as any` client cast, the same way PublicProfile.tsx reads the audience columns.
 *
 * Privacy lives in the database (RLS + can_message_player). The UI only mirrors it so a
 * button is not offered where the insert would be refused.
 */
import { supabase } from "@/integrations/supabase/client";

export const MESSAGE_MAX_LENGTH = 2000;

/** Fired on window after a message is sent or a thread is read, so the nav badge refreshes. */
export const MESSAGES_CHANGED_EVENT = "fytt:messages-changed";

export interface PlayerMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
}

export interface MessageThread {
  otherUserId: string;
  last: PlayerMessage;
  unread: number;
}

// Not in the generated types until the migration lands: one documented cast, used everywhere below.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;
const table = () => db.from("player_messages");

export const notifyMessagesChanged = () => {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(MESSAGES_CHANGED_EVENT));
};

/** The other person in a message, from `me`'s point of view. */
export const otherParty = (message: PlayerMessage, me: string) =>
  message.sender_id === me ? message.recipient_id : message.sender_id;

/** Group messages into threads, newest thread first. Input order does not matter. */
export function buildThreads(messages: PlayerMessage[], me: string): MessageThread[] {
  const byOther = new Map<string, MessageThread>();
  for (const message of messages) {
    const other = otherParty(message, me);
    const isUnread = message.recipient_id === me && !message.read_at;
    const existing = byOther.get(other);
    if (!existing) {
      byOther.set(other, { otherUserId: other, last: message, unread: isUnread ? 1 : 0 });
      continue;
    }
    if (isUnread) existing.unread += 1;
    if (message.created_at > existing.last.created_at) existing.last = message;
  }
  return Array.from(byOther.values()).sort((a, b) => (a.last.created_at < b.last.created_at ? 1 : -1));
}

export async function fetchMyMessages(): Promise<PlayerMessage[]> {
  const { data, error } = await table()
    .select("id, sender_id, recipient_id, body, created_at, read_at")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  return (data || []) as PlayerMessage[];
}

export async function fetchUnreadCount(userId: string): Promise<number> {
  const { count, error } = await table()
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", userId)
    .is("read_at", null);
  if (error) return 0; // table not deployed yet: no badge
  return count ?? 0;
}

export async function sendMessage(senderId: string, recipientId: string, body: string): Promise<PlayerMessage> {
  const trimmed = body.trim();
  if (!trimmed) throw new Error("empty");
  const { data, error } = await table()
    .insert({ sender_id: senderId, recipient_id: recipientId, body: trimmed.slice(0, MESSAGE_MAX_LENGTH) })
    .select("id, sender_id, recipient_id, body, created_at, read_at")
    .single();
  if (error) throw error;
  notifyMessagesChanged();
  return data as PlayerMessage;
}

export async function markThreadRead(me: string, otherUserId: string): Promise<void> {
  const { error } = await table()
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", me)
    .eq("sender_id", otherUserId)
    .is("read_at", null);
  if (!error) notifyMessagesChanged();
}

export interface MessagePartner {
  userId: string;
  /** "First Last" trimmed; empty string when the profile has no usable name. */
  name: string;
  avatarUrl: string | null;
}

/** One row of public.get_message_partners(). */
interface MessagePartnerRow {
  user_id: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

export const partnerFromRow = (row: MessagePartnerRow): MessagePartner | null =>
  row.user_id
    ? {
        userId: row.user_id,
        name: `${row.first_name || ""} ${row.last_name || ""}`.trim(),
        avatarUrl: row.avatar_url || null,
      }
    : null;

/**
 * Public name / avatar of the people in the viewer's threads (and of someone they are about to
 * write to). game_profiles is owner-readable only, so this goes through the SECURITY DEFINER
 * function public.get_message_partners (20261124020000_message_partner_names.sql), which
 * returns only public fields and skips hidden profiles. While the function is not deployed the
 * call errors and the caller keeps its fallback name.
 */
export async function fetchMessagePartners(userIds: string[]): Promise<MessagePartner[]> {
  const ids = Array.from(new Set(userIds.filter(Boolean)));
  if (ids.length === 0) return [];
  const { data, error } = await db.rpc("get_message_partners", { p_user_ids: ids });
  if (error) throw error;
  return ((data || []) as MessagePartnerRow[]).map(partnerFromRow).filter((p): p is MessagePartner => !!p);
}

/** Postgres "relation does not exist" / PostgREST "table not in schema cache". */
export const isMissingTableError = (error: unknown) => {
  const e = error as { code?: string; message?: string } | null;
  return !!e && (e.code === "42P01" || e.code === "PGRST205" || /player_messages/.test(e.message || ""));
};

/** Where a thread with one player lives. */
export const threadPath = (otherUserId: string) => `/game/collaborate/messages/${otherUserId}`;
export const INBOX_PATH = "/game/collaborate/messages";

/**
 * Which of `userIds` the viewer may write to, mirroring public.can_message_player() so the
 * Write button is not offered where the insert would be refused (the database still decides).
 * Audience columns are fetched defensively: before the audience migration is applied every
 * profile counts as public, exactly like PublicProfile.tsx.
 */
export async function fetchWritableUserIds(viewerId: string, userIds: string[]): Promise<Set<string>> {
  const candidates = userIds.filter((id) => id && id !== viewerId);
  const writable = new Set(candidates);
  if (candidates.length === 0) return writable;

  let rows: Array<{ user_id: string; profile_visibility: string | null; visible_community_ids: string[] | null }> = [];
  try {
    const { data, error } = await db
      .from("game_profiles")
      .select("user_id, profile_visibility, visible_community_ids")
      .in("user_id", candidates);
    if (error) throw error;
    rows = data || [];
  } catch {
    return writable;
  }

  const restricted = rows.filter((r) => r.profile_visibility === "friends" || r.profile_visibility === "communities");
  if (restricted.length === 0) return writable;

  const friendIds = new Set<string>();
  const myCommunities = new Set<string>();
  try {
    const { data } = await db
      .from("match_intros")
      .select("user_a_id, user_b_id")
      .or(`user_a_id.eq.${viewerId},user_b_id.eq.${viewerId}`);
    (data || []).forEach((r: { user_a_id: string; user_b_id: string }) =>
      friendIds.add(r.user_a_id === viewerId ? r.user_b_id : r.user_a_id),
    );
    const { data: memberships } = await db
      .from("community_members")
      .select("community_id")
      .eq("user_id", viewerId);
    (memberships || []).forEach((r: { community_id: string }) => myCommunities.add(r.community_id));
  } catch {
    // Unknown relationship: treat as not connected (closed by default for restricted profiles).
  }

  for (const row of restricted) {
    const allowed =
      row.profile_visibility === "friends"
        ? friendIds.has(row.user_id)
        : (row.visible_community_ids || []).some((id) => myCommunities.has(id));
    if (!allowed) writable.delete(row.user_id);
  }
  return writable;
}
