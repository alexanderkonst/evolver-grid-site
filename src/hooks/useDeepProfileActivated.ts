/**
 * useDeepProfileActivated — single source of truth for the
 * "deeper Top Talent view is active" gate.
 *
 * Day 64 (Sasha 2026-05-07): the JOURNEY rail item #7
 * ("Build a business off your top talent") and the BUILD space
 * chip unlock on the same signal. Any new surface gated on the
 * same boundary should consume this hook rather than re-implementing
 * the OR.
 *
 * Day 65 (Sasha 2026-05-15): gate broadened. The original gate
 * required a paid tier OR a coupon — but tasting-tier users who
 * had completed the Top Talent reveal were still hitting the lock,
 * even though they'd already seen the deeper view. New rule:
 * having a saved zog_snapshot (i.e., having completed the reveal)
 * also passes the gate. Paid tier and coupon paths remain as
 * additional unlockers for the edge cases (paid before reveal;
 * coupon-only guests).
 *
 * Returns:
 *   - `activated` — true once the gate has resolved AND the user
 *      meets any of the three conditions. Stays false during
 *      initial load to avoid lock→unlock flicker.
 *   - `isLoading` — true until BOTH the entitlement read AND
 *      the reveal-completion read resolve. Callers that gate
 *      visibility (e.g. hide-don't-show space chips) should AND
 *      this with their own loading signals before computing
 *      `unlockStatus`.
 */

import { useEffect, useState } from "react";
import { useEntitlement } from "@/hooks/useEntitlement";
import { supabase } from "@/integrations/supabase/client";

export type DeepProfileState = {
  activated: boolean;
  isLoading: boolean;
};

export function useDeepProfileActivated(): DeepProfileState {
  const { tier, isLoading: entitlementLoading } = useEntitlement();
  const [revealState, setRevealState] = useState<{ hasReveal: boolean; loading: boolean }>({
    hasReveal: false,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: userRes } = await supabase.auth.getUser();
        const uid = userRes.user?.id;
        if (!uid) {
          if (!cancelled) setRevealState({ hasReveal: false, loading: false });
          return;
        }
        const { data } = await (supabase as any)
          .from("game_profiles")
          .select("last_zog_snapshot_id")
          .eq("user_id", uid)
          .maybeSingle();
        if (cancelled) return;
        setRevealState({
          hasReveal: !!data?.last_zog_snapshot_id,
          loading: false,
        });
      } catch (e) {
        console.warn("[useDeepProfileActivated] reveal read failed:", e);
        if (!cancelled) setRevealState({ hasReveal: false, loading: false });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // sessionStorage is read on every render — cheap, synchronous,
  // and matches the freshness contract of the coupon flow (the
  // flag is set/cleared on a tab; we want every render to see
  // the latest value rather than caching it once on mount).
  const couponActivated =
    typeof window !== "undefined" &&
    window.sessionStorage.getItem("coupon_activated") === "true";

  const isLoading = entitlementLoading || revealState.loading;
  const activated =
    !isLoading &&
    (revealState.hasReveal || tier !== "tasting" || couponActivated);

  return { activated, isLoading };
}
