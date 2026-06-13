/**
 * useDeeperAccess — Day 95 (Sasha 2026-06-13): the paid-content gate
 * signal for the $37 deeper Top Talent view.
 *
 * Unlike `useDeepProfileActivated` (which is BROAD — true the moment a
 * user completes the free reveal), this is the NARROW, durable, paid
 * signal. A user has deeper access iff:
 *   • game_profiles.activation_unlocked_at is set (paid $37 OR redeemed
 *     an activation coupon — written only by the activation edge
 *     functions), OR
 *   • entitlement_tier !== "tasting" (the $555+/gifted/admin tiers,
 *     which include the deeper view).
 *
 * Completing the free reveal alone does NOT grant access.
 *
 * FAIL-OPEN CONTRACT (critical): if the read errors — most importantly
 * when this code is deployed BEFORE the migration that adds the
 * `activation_unlocked_at` column has been applied to the hosted DB —
 * `hasAccess` resolves to TRUE. This guarantees the deploy can never
 * lock anyone out ahead of the migration; the paywall simply stays
 * dormant until the column + grandfather backfill exist. A NULL value
 * (column present, user not activated) is NOT an error → correctly
 * gated. Only a genuine query failure fails open.
 *
 * Returns:
 *   - `hasAccess` — resolved access decision (defaults true while loading
 *      to avoid a gate flash; the gate component ANDs with isLoading).
 *   - `isLoading` — true until the read resolves.
 *   - `refetch` — re-run the read (used after a coupon/payment unlock).
 */

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type DeeperAccessState = {
  hasAccess: boolean;
  isLoading: boolean;
  refetch: () => void;
};

export function useDeeperAccess(): DeeperAccessState {
  const [hasAccess, setHasAccess] = useState(true); // optimistic; gate ANDs isLoading
  const [isLoading, setIsLoading] = useState(true);
  const [nonce, setNonce] = useState(0);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          // Unauthenticated — not the gate's concern (MeGate handles
          // guests). Treat as no deeper access; the gate only acts on
          // authed users anyway.
          if (!cancelled) {
            setHasAccess(false);
            setIsLoading(false);
          }
          return;
        }

        const { data, error } = await supabase
          .from("game_profiles")
          .select("activation_unlocked_at, entitlement_tier")
          .eq("user_id", user.id)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          // FAIL-OPEN: pre-migration (unknown column) or a transient DB
          // error must never lock a user out. Grant access; the paywall
          // re-engages once the read succeeds against the migrated DB.
          console.warn("[useDeeperAccess] read failed — failing open:", error.message);
          setHasAccess(true);
          setIsLoading(false);
          return;
        }

        const unlockedAt = (data as { activation_unlocked_at?: string | null } | null)
          ?.activation_unlocked_at ?? null;
        const tier = (data as { entitlement_tier?: string | null } | null)
          ?.entitlement_tier ?? "tasting";

        setHasAccess(unlockedAt != null || tier !== "tasting");
        setIsLoading(false);
      } catch (e) {
        // Same fail-open contract on any unexpected throw.
        if (!cancelled) {
          console.warn("[useDeeperAccess] unexpected — failing open:", e);
          setHasAccess(true);
          setIsLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [nonce]);

  return { hasAccess, isLoading, refetch };
}
