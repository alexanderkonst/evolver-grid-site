import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { checkParticle, cleanFirstName } from "@/lib/particleGuard";

/**
 * Village particles (WP-17): one short line a player leaves at a place for the
 * one who comes next. Design: docs/02-strategy/game_of_being_you.md §15.4.
 *
 * The feature must work with and without the `village_particles` table, so
 * every failure on the read path (missing table, network, RLS) quietly means
 * «no particles, no prompt»: nothing is thrown and nothing is logged.
 */

export type VillageParticle = {
  id: string;
  text: string;
  first_name: string | null;
  created_at: string;
};

export type LeaveResult = { ok: true } | { ok: false; message: string };

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
  leave: (text: string, firstName?: string) => Promise<LeaveResult>;
};

/** Pass null to stay idle (nothing is fetched). */
export function useVillageParticles(placeKey: string | null | undefined): VillageParticlesApi {
  const [particles, setParticles] = useState<VillageParticle[]>([]);
  const [available, setAvailable] = useState(!tableMissing);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasLeft, setHasLeft] = useState(false);

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
          .select("id, text, first_name, created_at")
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

  const leave = useCallback(
    async (rawText: string, rawName = ""): Promise<LeaveResult> => {
      if (!placeKey || !userId || !available) {
        return { ok: false, message: "You can leave something here once you are signed in." };
      }
      const checked = checkParticle(rawText);
      if (checked.ok === false) return { ok: false, message: checked.message };
      const first_name = cleanFirstName(rawName);

      try {
        const { error } = await supabase
          .from("village_particles")
          .insert({ user_id: userId, place_key: placeKey, text: checked.text, first_name });
        if (error) {
          if (isMissingTable(error)) {
            tableMissing = true;
            setAvailable(false);
          } else if (error.code === "23505") {
            setHasLeft(true);
            return { ok: false, message: "You have already left something here. Thank you." };
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
          first_name,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      return { ok: true };
    },
    [placeKey, userId, available],
  );

  return { particles, available, signedIn: !!userId, hasLeft, leave };
}
