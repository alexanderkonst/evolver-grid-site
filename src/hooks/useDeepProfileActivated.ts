/**
 * useDeepProfileActivated — single source of truth for the
 * "deeper Top Talent view is active" gate.
 *
 * Day 64 (Sasha 2026-05-07): the JOURNEY rail item #5
 * ("Build a business off your top talent") and the BUILD space
 * itself unlock on the same signal — the user has activated their
 * deeper Top Talent view, either by paying (entitlement_tier other
 * than "tasting") or by entering an activation code (sessionStorage
 * `coupon_activated=true`). Any new surface gated on the same
 * boundary should consume this hook rather than re-implementing
 * the OR.
 *
 * Returns:
 *   - `activated` — true once the gate has resolved AND the user
 *      meets either condition. Stays false during initial load to
 *      avoid lock→unlock flicker.
 *   - `isLoading` — true until the underlying entitlement read
 *      resolves. Callers that gate visibility (e.g. hide-don't-show
 *      space chips) should AND this with their other loading
 *      signals before computing `unlockStatus`.
 */

import { useEntitlement } from "@/hooks/useEntitlement";

export type DeepProfileState = {
  activated: boolean;
  isLoading: boolean;
};

export function useDeepProfileActivated(): DeepProfileState {
  const { tier, isLoading } = useEntitlement();

  // sessionStorage is read on every render — cheap, synchronous,
  // and matches the freshness contract of the coupon flow (the
  // flag is set/cleared on a tab; we want every render to see
  // the latest value rather than caching it once on mount).
  const couponActivated =
    typeof window !== "undefined" &&
    window.sessionStorage.getItem("coupon_activated") === "true";

  return {
    activated: !isLoading && (tier !== "tasting" || couponActivated),
    isLoading,
  };
}
