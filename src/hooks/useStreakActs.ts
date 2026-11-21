import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  cleanActText,
  computeStreak,
  localDateKey,
  type StreakSource,
  type StreakState,
} from "@/lib/streak";
import { useSessionUserId } from "@/hooks/useSessionUserId";

/**
 * The named real acts of the signed-in player and the streak derived from them (spec row A13,
 * issue #368). Owner-only: reads and writes the player's own `streak_acts` rows (RLS).
 *
 * The table arrives with a migration that is applied after this UI merges
 * (supabase/migrations/20261121210000_streak_acts.sql), so every failure on the read path
 * (missing table, network, RLS) quietly means `available: false`: no input, no card. Nothing is
 * thrown and nothing is logged. The table is absent from the generated `Database` type, so it is
 * reached through a loose, local client type, as in useJourneyVictory.
 */

type QueryError = { code?: string; message?: string } | null;

type ActsTable = {
  select: (columns: string) => {
    eq: (column: string, value: string) => {
      order: (column: string, opts: { ascending: boolean }) => {
        limit: (n: number) => PromiseLike<{
          data: { act_date: string; text: string }[] | null;
          error: QueryError;
        }>;
      };
    };
  };
  insert: (row: { user_id: string; act_date: string; source: StreakSource; text: string }) => PromiseLike<{
    error: QueryError;
  }>;
};

const acts = () => supabase.from("streak_acts" as never) as unknown as ActsTable;

/** Fired after an act is named, so a mounted streak card refreshes without a reload. */
export const STREAK_ACT_NAMED_EVENT = "streak:act-named";

/** Remembered for the session so a missing table is probed once, not per screen. */
let tableMissing = false;

const isMissingTable = (error: QueryError) =>
  !!error &&
  (error.code === "42P01" ||
    error.code === "PGRST205" ||
    /does not exist|schema cache|not find the table/i.test(error.message ?? ""));

export type NameActResult = { ok: true } | { ok: false; message: string };

export type StreakActsApi = {
  /** The table answered for a signed-in player. False for a guest, while the table is missing, or on error. */
  available: boolean;
  /** Still finding out. */
  loading: boolean;
  /** Dates of the player's named acts, newest first. */
  dates: string[];
  /** Text of today's named act, if there is one. */
  todayText: string | null;
  /** The streak as of today. Meaningful only once `available`. */
  streak: StreakState;
  nameAct: (source: StreakSource, text: string) => Promise<NameActResult>;
};

const NO_ROWS: { act_date: string; text: string }[] = [];

export function useStreakActs(): StreakActsApi {
  const userId = useSessionUserId();
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState(NO_ROWS);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const bump = () => setVersion((v) => v + 1);
    window.addEventListener(STREAK_ACT_NAMED_EVENT, bump);
    return () => window.removeEventListener(STREAK_ACT_NAMED_EVENT, bump);
  }, []);

  useEffect(() => {
    if (userId === undefined) return;
    if (!userId || tableMissing) {
      setAvailable(false);
      setRows(NO_ROWS);
      setLoading(false);
      return;
    }
    let live = true;
    (async () => {
      try {
        const { data, error } = await acts()
          .select("act_date, text")
          .eq("user_id", userId)
          .order("act_date", { ascending: false })
          .limit(1000);
        if (!live) return;
        if (error || !data) {
          if (isMissingTable(error)) tableMissing = true;
          setAvailable(false);
          setRows(NO_ROWS);
          return;
        }
        setAvailable(true);
        setRows(data);
      } catch {
        if (live) {
          setAvailable(false);
          setRows(NO_ROWS);
        }
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, [userId, version]);

  const today = localDateKey();
  const dates = useMemo(() => rows.map((r) => r.act_date), [rows]);
  const streak = useMemo(() => computeStreak(dates, today), [dates, today]);
  const todayText = useMemo(() => rows.find((r) => r.act_date === today)?.text ?? null, [rows, today]);

  const nameAct = useCallback(
    async (source: StreakSource, raw: string): Promise<NameActResult> => {
      const text = cleanActText(raw);
      if (!text) return { ok: false, message: "Say it in a few words, up to 140 characters." };
      if (!userId || !available) return { ok: false, message: "Your act can be saved once you are signed in." };
      try {
        const { error } = await acts().insert({ user_id: userId, act_date: localDateKey(), source, text });
        if (error && error.code !== "23505") {
          if (isMissingTable(error)) {
            tableMissing = true;
            setAvailable(false);
          }
          return { ok: false, message: "It did not go through just now. Try again in a moment." };
        }
      } catch {
        return { ok: false, message: "It did not go through just now. Try again in a moment." };
      }
      window.dispatchEvent(new CustomEvent(STREAK_ACT_NAMED_EVENT));
      return { ok: true };
    },
    [userId, available],
  );

  return { available, loading, dates, todayText, streak, nameAct };
}
