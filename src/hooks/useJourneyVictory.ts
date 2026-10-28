import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isValidRating } from "@/data/journeyModules";

/**
 * The victory of one Journey step: the 1–10 «How much did this resonate?» a player gave
 * at the Outro (WP-5). Design: docs/02-strategy/game_of_being_you.md §13.4, §14.4.
 *
 * One row per player per step in `journey_victories` (supabase/migrations/
 * 20261028010000_journey_victories.sql). The first answer stands: no update, no delete.
 *
 * The Outro must work with and without that table (it is applied after the UI merges),
 * so every failure on the read path (missing table, network, RLS) quietly means
 * `available: false`: the Outro shows the same screen without the rating row. Nothing is
 * thrown and nothing is logged.
 */

export type RateResult = { ok: true } | { ok: false; message: string };

export type JourneyVictoryApi = {
  /** The table answered. False while it is missing or unreadable: hide the rating row. */
  available: boolean;
  /** A signed-in player. Guests have no save file to record in. */
  signedIn: boolean;
  /** Still finding out whether a rating exists. */
  loading: boolean;
  /** The player's rating of this step, once given. */
  rating: number | null;
  rate: (value: number) => Promise<RateResult>;
};

/** Remembered for the session so a missing table is probed once, not per Outro. */
let tableMissing = false;

const isMissingTable = (error: { code?: string; message?: string } | null) =>
  !!error &&
  (error.code === "42P01" ||
    error.code === "PGRST205" ||
    /does not exist|schema cache|not find the table/i.test(error.message ?? ""));

/** Pass null to stay idle (nothing is fetched). */
export function useJourneyVictory(stepId: string | null | undefined): JourneyVictoryApi {
  const [userId, setUserId] = useState<string | null>(null);
  const [authKnown, setAuthKnown] = useState(false);
  const [available, setAvailable] = useState(!tableMissing);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState<number | null>(null);

  useEffect(() => {
    let live = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!live) return;
        setUserId(data.session?.user.id ?? null);
        setAuthKnown(true);
      })
      .catch(() => {
        if (!live) return;
        setUserId(null);
        setAuthKnown(true);
      });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (live) setUserId(session?.user.id ?? null);
    });
    return () => {
      live = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Has this player already answered for this step?
  useEffect(() => {
    setRating(null);
    if (!stepId || !authKnown) return;
    if (tableMissing) {
      setAvailable(false);
      setLoading(false);
      return;
    }
    if (!userId) {
      setLoading(false);
      return;
    }
    let live = true;
    setLoading(true);
    (async () => {
      try {
        const { data, error } = await supabase
          .from("journey_victories")
          .select("rating")
          .eq("user_id", userId)
          .eq("step_id", stepId)
          .limit(1);
        if (!live) return;
        if (error) {
          if (isMissingTable(error)) tableMissing = true;
          setAvailable(false);
          return;
        }
        setAvailable(true);
        setRating(data?.[0]?.rating ?? null);
      } catch {
        if (live) setAvailable(false);
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, [stepId, userId, authKnown]);

  const rate = useCallback(
    async (value: number): Promise<RateResult> => {
      if (!stepId || !userId || !available) {
        return { ok: false, message: "Your answer can be saved once you are signed in." };
      }
      if (!isValidRating(value)) return { ok: false, message: "Pick a number from 1 to 10." };
      try {
        const { error } = await supabase
          .from("journey_victories")
          .insert({ user_id: userId, step_id: stepId, rating: value });
        if (error) {
          if (isMissingTable(error)) {
            tableMissing = true;
            setAvailable(false);
          } else if (error.code === "23505") {
            // Answered before (another tab, a retry): the first answer stands.
            const { data } = await supabase
              .from("journey_victories")
              .select("rating")
              .eq("user_id", userId)
              .eq("step_id", stepId)
              .limit(1);
            setRating(data?.[0]?.rating ?? value);
            return { ok: true };
          }
          return { ok: false, message: "It did not go through just now. Try again in a moment." };
        }
      } catch {
        return { ok: false, message: "It did not go through just now. Try again in a moment." };
      }
      setRating(value);
      return { ok: true };
    },
    [stepId, userId, available],
  );

  return { available, signedIn: !!userId, loading, rating, rate };
}
