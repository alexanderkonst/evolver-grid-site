import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { checkParticle } from "@/lib/particleGuard";

/**
 * Village particles (WP-17): one short line a player leaves at a place for the
 * one who comes next. Design: docs/02-strategy/game_of_being_you.md §15.4.
 *
 * No anonymity (Sasha, 2026-10-27): every particle shows the player's real
 * name, real profile photo and uniqueness, to everyone, guests included. The
 * database copies those three from the player's profile at insert time; the
 * client only sends the text. A player with no name or no photo is asked to
 * add one first (`identity.missing`).
 *
 * The feature must work with and without the `village_particles` table, so
 * every failure on the read path (missing table, network, RLS) quietly means
 * «no particles, no prompt»: nothing is thrown and nothing is logged.
 */

export type VillageParticle = {
  id: string;
  text: string;
  display_name: string;
  avatar_url: string;
  uniqueness: string | null;
  created_at: string;
};

export type LeaveResult = { ok: true } | { ok: false; message: string };

/** What the signed-in player will appear as. `missing` lists what to add first. */
export type ParticleIdentity = {
  name: string;
  avatarUrl: string | null;
  missing: "name" | "photo" | "both" | null;
};

/** Where name and photo are edited. */
export const PROFILE_SETTINGS_PATH = "/game/settings?tab=profile";

const READ_LIMIT = 60;
const INVITE_KEY = "fytt:particle-invite:";

/** Remembered for the session so a missing table is probed once, not per place. */
let tableMissing = false;

const isMissingTable = (error: { code?: string; message?: string } | null) =>
  !!error &&
  (error.code === "42P01" ||
    error.code === "PGRST205" ||
    /does not exist|schema cache|not find the table/i.test(error.message ?? ""));

// ------------------------------------------------------------- invitation
// An Outro (CelebrationModal today, ModuleOutro with WP-5) marks the place;
// the place screen then opens the prompt once instead of waiting quietly.

export function markParticleInvite(placeKey: string) {
  try {
    window.sessionStorage.setItem(INVITE_KEY + placeKey, "1");
  } catch {
    // storage unavailable: the quiet link on the place still works
  }
}

export function hasParticleInvite(placeKey: string): boolean {
  try {
    return window.sessionStorage.getItem(INVITE_KEY + placeKey) === "1";
  } catch {
    return false;
  }
}

export function clearParticleInvite(placeKey: string) {
  try {
    window.sessionStorage.removeItem(INVITE_KEY + placeKey);
  } catch {
    // nothing to clear
  }
}

// ------------------------------------------------------------------- hook

export type VillageParticlesApi = {
  /** Visible particles at this place, newest first. */
  particles: VillageParticle[];
  /** False while the table is missing or unreadable: show nothing, hide the prompt. */
  available: boolean;
  /** A signed-in player. */
  signedIn: boolean;
  /** The signed-in player already left a (visible) particle here. */
  hasLeft: boolean;
  /** The signed-in player's real name and photo; null for guests or until loaded. */
  identity: ParticleIdentity | null;
  leave: (text: string) => Promise<LeaveResult>;
};

/** Pass null to stay idle (nothing is fetched). */
export function useVillageParticles(placeKey: string | null | undefined): VillageParticlesApi {
  const [particles, setParticles] = useState<VillageParticle[]>([]);
  const [available, setAvailable] = useState(!tableMissing);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasLeft, setHasLeft] = useState(false);
  const [identity, setIdentity] = useState<ParticleIdentity | null>(null);

  // Who is playing (guests can read, only players can leave).
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

  // Particles at this place.
  useEffect(() => {
    setParticles([]);
    if (tableMissing) {
      setAvailable(false);
      return;
    }
    if (!placeKey) return;
    let live = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("village_particles")
          .select("id, text, display_name, avatar_url, uniqueness, created_at")
          .eq("place_key", placeKey)
          .eq("status", "visible")
          .order("created_at", { ascending: false })
          .limit(READ_LIMIT);
        if (!live) return;
        if (error) {
          if (isMissingTable(error)) tableMissing = true;
          setAvailable(false);
          return;
        }
        setAvailable(true);
        setParticles(data ?? []);
      } catch {
        if (live) setAvailable(false);
      }
    })();
    return () => {
      live = false;
    };
  }, [placeKey]);

  // Did this player already leave one here? (One per player per place.)
  useEffect(() => {
    setHasLeft(false);
    if (!placeKey || !userId || tableMissing) return;
    let live = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("village_particles")
          .select("id")
          .eq("place_key", placeKey)
          .eq("user_id", userId)
          .limit(1);
        if (live && !error) setHasLeft((data?.length ?? 0) > 0);
      } catch {
        // stay false: the unique constraint is the real guard
      }
    })();
    return () => {
      live = false;
    };
  }, [placeKey, userId]);

  // The player's real name and photo: what the particle will show, and the gate
  // that asks them to add one before posting. Read-only; the database copies the
  // same fields from game_profiles on insert.
  useEffect(() => {
    setIdentity(null);
    if (!placeKey || !userId || tableMissing) return;
    let live = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("game_profiles")
          .select("first_name, last_name, avatar_url")
          .eq("user_id", userId)
          .order("created_at", { ascending: true })
          .limit(1);
        if (!live || error) return;
        const row = data?.[0];
        const name = [row?.first_name, row?.last_name]
          .map((part) => part?.trim())
          .filter(Boolean)
          .join(" ");
        const avatarUrl = row?.avatar_url?.trim() || null;
        const noName = !name;
        const noPhoto = !avatarUrl;
        setIdentity({
          name,
          avatarUrl,
          missing: noName && noPhoto ? "both" : noName ? "name" : noPhoto ? "photo" : null,
        });
      } catch {
        // stay null: the prompt stays closed rather than failing loudly
      }
    })();
    return () => {
      live = false;
    };
  }, [placeKey, userId]);

  const leave = useCallback(
    async (rawText: string): Promise<LeaveResult> => {
      if (!placeKey || !userId || !available) {
        return { ok: false, message: "You can leave something here once you are signed in." };
      }
      if (!identity || identity.missing || !identity.avatarUrl) {
        return { ok: false, message: "Add your name and photo to your profile first." };
      }
      const checked = checkParticle(rawText);
      if (checked.ok === false) return { ok: false, message: checked.message };

      try {
        // name, photo and uniqueness are filled in by the database from the profile
        // (the column grant allows only these three), so they are not typed here.
        const row = { user_id: userId, place_key: placeKey, text: checked.text };
        const { error } = await supabase.from("village_particles").insert(row as never);
        if (error) {
          if (isMissingTable(error)) {
            tableMissing = true;
            setAvailable(false);
          } else if (error.code === "23505") {
            setHasLeft(true);
            return { ok: false, message: "You have already left something here. Thank you." };
          } else if (/particle_needs_(name|photo)/.test(error.message ?? "")) {
            return { ok: false, message: "Add your name and photo to your profile first." };
          }
          return { ok: false, message: "It did not go through just now. Try again in a moment." };
        }
      } catch {
        return { ok: false, message: "It did not go through just now. Try again in a moment." };
      }

      setHasLeft(true);
      setParticles((prev) => [
        {
          id: `local-${Date.now()}`,
          text: checked.text,
          display_name: identity.name,
          avatar_url: identity.avatarUrl as string,
          uniqueness: null,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      return { ok: true };
    },
    [placeKey, userId, available, identity],
  );

  return { particles, available, signedIn: !!userId, hasLeft, identity, leave };
}
