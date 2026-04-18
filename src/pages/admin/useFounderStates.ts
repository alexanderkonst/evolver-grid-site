import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Shape of a row from the `public.founder_state_v1` view.
 * Kept in lockstep with the SQL migration (20260418022508_founder_state_view.sql).
 */
export type FounderState = {
  user_id: string;
  slug: string;
  display_name: string;
  email: string;
  onboarding_stage: string;
  current_step: number;
  latest_zog_snapshot_at: string | null;
  latest_zog_top_talent: string | null;
  latest_qol_snapshot_at: string | null;
  has_ignition: boolean;
  has_build: boolean;
  revenue_total_usd: number;
  last_touch_at: string;
};

type State = {
  loading: boolean;
  error: string | null;
  founders: FounderState[];
};

export function useFounderStates(): State {
  const [state, setState] = useState<State>({
    loading: true,
    error: null,
    founders: [],
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        // The view isn't in the generated types yet; cast through `any` at
        // the `.from()` boundary only. The row shape is enforced below.
        .from("founder_state_v1" as never)
        .select("*")
        .order("last_touch_at", { ascending: false });
      if (cancelled) return;
      if (error) {
        setState({ loading: false, error: error.message, founders: [] });
        return;
      }
      setState({
        loading: false,
        error: null,
        founders: (data ?? []) as unknown as FounderState[],
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
