import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { checkParticle, type ParticleRejection } from "@/lib/particleGuard";

/**
 * Player reflections (share card, slice 2): a visitor answers «Do you see me this
 * way too?» and the answer comes back to the player as a quest.
 * Design: docs/02-strategy/game_of_being_you.md §14.12a, docs/templates/module-form.md §11.
 * Database (PROPOSED, not applied): docs/specs/share-card/share_card.proposed.sql
 * (`player_reflections` table + `leave_reflection` RPC).
 *
 * No anonymity, no counts, no public list: a reflection carries the visitor's name and
 * is readable only by the player (RLS). Visitors write only through the RPC.
 *
 * The feature must work with and without the database part, exactly like
 * useVillageParticles: every failure on the read path (missing table, missing function,
 * network, RLS) quietly means `available = false`: no answer UI, no quest, nothing thrown
 * and nothing logged.
 */

export const REFLECTION_ANSWERS = ["yes", "partly", "differently"] as const;
export type ReflectionAnswer = (typeof REFLECTION_ANSWERS)[number];

export type PlayerReflection = {
  id: string;
  visitor_name: string;
  answer: ReflectionAnswer;
  line: string | null;
  created_at: string;
};

/** i18n keys (under `shareCard.reflection.error.`) a failed `leave` can map to. */
export type ReflectionErrorKey =
  | "needsName"
  | "alreadyToday"
  | "ownPage"
  | "notPublic"
  | "tooShort"
  | "tooLong"
  | "profanity"
  | "generic";

export type LeaveReflectionInput = {
  username: string;
  answer: ReflectionAnswer;
  /** Optional «What do you see?» line; 3–140 characters when present. */
  line?: string | null;
  /** First name. Only needed for guests: a signed-in visitor is named by the server. */
  visitorName?: string | null;
};

export type LeaveReflectionResult =
  | { ok: true }
  | { ok: false; key: ReflectionErrorKey; message: string };

type DbError = { code?: string; message?: string } | null | undefined;

/** The table or the function is not in the database yet. */
export const isMissingReflectionBackend = (error: DbError) =>
  !!error &&
  (error.code === "42P01" || // undefined_table
    error.code === "PGRST205" || // table not in schema cache
    error.code === "42883" || // undefined_function
    error.code === "PGRST202" || // function not in schema cache
    /does not exist|schema cache|not find the (table|function)/i.test(error.message ?? ""));

/** Maps what the RPC raised (P0001 messages from leave_reflection) to a copy key. */
export function mapReflectionError(error: DbError): ReflectionErrorKey {
  const message = error?.message ?? "";
  if (/reflection_needs_name/.test(message)) return "needsName";
  if (/reflection_already_today/.test(message)) return "alreadyToday";
  if (/reflection_own_page/.test(message)) return "ownPage";
  if (/reflection_profile_not_public/.test(message)) return "notPublic";
  return "generic";
}

const REJECTION_KEY: Record<ParticleRejection, ReflectionErrorKey> = {
  too_short: "tooShort",
  too_long: "tooLong",
  profanity: "profanity",
};

const GUEST_SENT_KEY = "fytt:reflection-sent:";
const DAY_MS = 24 * 60 * 60 * 1000;

/** Guests have no account for the server to rate-limit on, so the browser remembers for a day. */
const guestSentRecently = (username: string): boolean => {
  try {
    const at = Number(window.localStorage.getItem(GUEST_SENT_KEY + username.toLowerCase()));
    return Number.isFinite(at) && at > 0 && Date.now() - at < DAY_MS;
  } catch {
    return false;
  }
};

const rememberGuestSent = (username: string) => {
  try {
    window.localStorage.setItem(GUEST_SENT_KEY + username.toLowerCase(), String(Date.now()));
  } catch {
    // storage unavailable: the server still decides
  }
};

/** Remembered for the session so a missing backend is probed once, not per screen. */
let backendMissing = false;

/** Test hook: forget what a previous probe learned. */
export const resetReflectionsProbe = () => {
  backendMissing = false;
};

export type PlayerReflectionsApi = {
  /** False while the table/RPC is missing or unreadable: show no answer UI, no quest. */
  available: boolean;
  /** The probe has finished (so «not available» is a fact, not «not yet»). */
  ready: boolean;
  /** The viewer's account id, null for guests or until loaded. */
  userId: string | null;
  /** Unread reflections for the signed-in player, newest first. Empty unless `loadUnread`. */
  unread: PlayerReflection[];
  leave: (input: LeaveReflectionInput) => Promise<LeaveReflectionResult>;
  markRead: (id: string) => Promise<void>;
};

type Options = {
  /** Load the signed-in player's unread reflections (the Quest Board). Default false. */
  loadUnread?: boolean;
};

export function usePlayerReflections({ loadUnread = false }: Options = {}): PlayerReflectionsApi {
  const { t } = useTranslation();
  const [available, setAvailable] = useState(false);
  const [ready, setReady] = useState(backendMissing);
  const [userId, setUserId] = useState<string | null>(null);
  const [unread, setUnread] = useState<PlayerReflection[]>([]);

  // Who is looking (guests answer, players answer and read).
  useEffect(() => {
    let live = true;
    supabase.auth
      .getSession()
      .then(({ data }) => live && setUserId(data.session?.user.id ?? null))
      .catch(() => live && setUserId(null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (live) setUserId(session?.user.id ?? null);
    });
    return () => {
      live = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Probe: is the table there? A head select does not depend on who is asking: with RLS on,
  // a guest or a player with nothing gets zero rows and no error; a missing table errors.
  useEffect(() => {
    if (backendMissing) {
      setAvailable(false);
      setReady(true);
      return;
    }
    let live = true;
    (async () => {
      try {
        const { error } = await (supabase as any).from("player_reflections").select("id").limit(1);
        if (!live) return;
        if (error && isMissingReflectionBackend(error)) backendMissing = true;
        // A permission error means the table exists (RLS/grants); anything else is unknown: hide.
        setAvailable(!error || error.code === "42501");
      } catch {
        if (live) setAvailable(false);
      } finally {
        if (live) setReady(true);
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  // The player's unread reflections, newest first.
  useEffect(() => {
    setUnread([]);
    if (!loadUnread || !available || !userId) return;
    let live = true;
    (async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("player_reflections")
          .select("id, visitor_name, answer, line, created_at")
          .is("read_at", null)
          .order("created_at", { ascending: false });
        if (!live) return;
        if (error) {
          if (isMissingReflectionBackend(error)) {
            backendMissing = true;
            setAvailable(false);
          }
          return;
        }
        setUnread((data ?? []) as PlayerReflection[]);
      } catch {
        // stay empty: the Quest Board is unchanged
      }
    })();
    return () => {
      live = false;
    };
  }, [loadUnread, available, userId]);

  const fail = useCallback(
    (key: ReflectionErrorKey): LeaveReflectionResult => ({
      ok: false,
      key,
      message: t(`shareCard.reflection.error.${key}`),
    }),
    [t],
  );

  const leave = useCallback(
    async ({ username, answer, line, visitorName }: LeaveReflectionInput): Promise<LeaveReflectionResult> => {
      if (!available || !username) return fail("generic");
      if (!REFLECTION_ANSWERS.includes(answer)) return fail("generic");

      const name = (visitorName ?? "").trim();
      if (!userId && !name) return fail("needsName");
      if (!userId && guestSentRecently(username)) return fail("alreadyToday");

      // The line is optional; when present it passes the same guard as a village particle.
      let cleanLine: string | null = null;
      if ((line ?? "").trim()) {
        const checked = checkParticle(line as string);
        if (checked.ok === false) return fail(REJECTION_KEY[checked.reason]);
        cleanLine = checked.text;
      }

      try {
        const { error } = await (supabase as any).rpc("leave_reflection", {
          p_username: username,
          p_answer: answer,
          p_line: cleanLine,
          p_visitor_name: name ? name.slice(0, 60) : null,
        });
        if (error) {
          if (isMissingReflectionBackend(error)) {
            backendMissing = true;
            setAvailable(false);
            return fail("generic");
          }
          const key = mapReflectionError(error);
          if (key === "alreadyToday" && !userId) rememberGuestSent(username);
          return fail(key);
        }
      } catch {
        return fail("generic");
      }

      if (!userId) rememberGuestSent(username);
      return { ok: true };
    },
    [available, userId, fail],
  );

  const markRead = useCallback(async (id: string) => {
    // Optimistic: the quest closes at once; a failed write brings it back on the next load.
    setUnread((prev) => prev.filter((r) => r.id !== id));
    try {
      await (supabase as any)
        .from("player_reflections")
        .update({ read_at: new Date().toISOString() })
        .eq("id", id);
    } catch {
      // nothing to do: it is simply unread again next time
    }
  }, []);

  return { available, ready, userId, unread, leave, markRead };
}
