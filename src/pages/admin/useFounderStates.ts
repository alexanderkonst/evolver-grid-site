import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Shape of a row from the `public.founder_state_v1` view.
 *
 * v1 columns (2026-04-18, founder_state_view migration):
 *   user_id, slug, display_name, email, onboarding_stage, current_step,
 *   latest_zog_snapshot_at, latest_zog_top_talent, latest_qol_snapshot_at,
 *   has_ignition, has_build, revenue_total_usd, last_touch_at.
 *
 * Day 62 (2026-05-05) v2 extension (admin_signals_v2 migration):
 *   has_top_talent, top_talent_resonance, joined_at, has_paid,
 *   days_to_first_paid, nurture_status.
 *
 * Kept in lockstep with the SQL view definition. UBB columns are NOT
 * present (out of scope per Sasha 2026-05-05); when UBB lands on the
 * roadmap, both surfaces extend together.
 */
export type NurtureStatus =
  | "opted_out"
  | "all_sent"
  | "partial"
  | "queued"
  | "never_queued";

export type FounderState = {
  // v1 columns
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
  // v2 columns (Day 62)
  has_top_talent: boolean;
  top_talent_resonance: number | null;
  joined_at: string;
  has_paid: boolean;
  days_to_first_paid: number | null;
  nurture_status: NurtureStatus;
};

type State = {
  loading: boolean;
  error: string | null;
  founders: FounderState[];
};

/**
 * Hook return shape.
 *
 * Day 80 Wave 2.22 (Sasha 2026-05-29): `refetch` exposed so the /admin
 * "Refresh" button can pull a fresh founder list without a full page
 * reload. On error the prior `founders` array is preserved (refresh
 * never blanks the table); only `error` flips. Callers can toast on
 * error without losing the existing snapshot.
 */
export type UseFounderStatesResult = State & {
  refetch: () => Promise<void>;
};

export function useFounderStates(): UseFounderStatesResult {
  const [state, setState] = useState<State>({
    loading: true,
    error: null,
    founders: [],
  });

  const load = useCallback(async (): Promise<void> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const { data, error } = await supabase
      // The view isn't in the generated types yet; cast through `any` at
      // the `.from()` boundary only. The row shape is enforced below.
      .from("founder_state_v1" as never)
      .select("*")
      .order("last_touch_at", { ascending: false });
    if (error) {
      // Day 80 Wave 2.22: preserve previous `founders` on refetch error.
      // The first load lands an empty array (no prior snapshot to keep).
      setState((prev) => ({
        loading: false,
        error: error.message,
        founders: prev.founders,
      }));
      return;
    }
    setState({
      loading: false,
      error: null,
      founders: (data ?? []) as unknown as FounderState[],
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
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

  return { ...state, refetch: load };
}
