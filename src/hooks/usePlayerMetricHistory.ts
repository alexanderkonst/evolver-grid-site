import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  PLAYER_METRICS,
  isMonthMeasured,
  monthlySeries,
  type MetricPoint,
  type PlayerMetricKey,
  type QolSnapshotRow,
} from "@/lib/playerMetrics";

/** How many QoL rows to read: plenty for a few years of monthly measuring. */
const HISTORY_ROWS = 120;

/**
 * The signed-in player's own monthly history of every player metric (issue #241).
 * Owner-only: it reads the current session's rows and must never be called for another player.
 * `signedIn` is false for a guest; `failed` is true when the read failed (then nothing is claimed,
 * not even «missing this month»).
 */
export function usePlayerMetricHistory(): {
  series: Record<PlayerMetricKey, MetricPoint[]>;
  measuredThisMonth: boolean;
  signedIn: boolean;
  isLoading: boolean;
  failed: boolean;
} {
  const empty = Object.fromEntries(Object.keys(PLAYER_METRICS).map((k) => [k, []])) as Record<PlayerMetricKey, MetricPoint[]>;
  const [series, setSeries] = useState(empty);
  const [signedIn, setSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        if (live) setSignedIn(true);
        const { data: profile, error: profileError } = await supabase
          .from("game_profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        if (profileError) throw profileError;
        if (!profile) return;
        const { data: rows, error } = await supabase
          .from("qol_snapshots")
          .select("*")
          .eq("profile_id", profile.id)
          .order("created_at", { ascending: false })
          .limit(HISTORY_ROWS);
        if (error) throw error;
        const list = (rows ?? []) as unknown as QolSnapshotRow[];
        const next = { ...empty };
        for (const key of Object.keys(PLAYER_METRICS) as PlayerMetricKey[]) next[key] = monthlySeries(key, list);
        if (live) setSeries(next);
      } catch {
        if (live) setFailed(true);
      } finally {
        if (live) setIsLoading(false);
      }
    })();
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { series, measuredThisMonth: isMonthMeasured(series.level), signedIn, isLoading, failed };
}
