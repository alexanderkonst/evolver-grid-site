/**
 * useEntitlement — read the current user's entitlement tier.
 *
 * Day 53 night iter 4 (Sasha 2026-04-27): the entitlement system grants
 * Builder / Locked-in / Founders 50 / Ignition tier to users either via
 * Stripe subscription (later) OR via admin gift (now, via /admin/grants).
 *
 * This hook is the single read-side surface — any component that needs
 * to know "what tier is this user?" calls it. Returns:
 *   - `tier` — the current entitlement_tier value (defaults to "tasting")
 *   - `isGifted` — true for `gifted_*` tiers (gift-given, not subscribed)
 *   - `isCommercial` — true for tiers that grant commercial license rights
 *   - `expiresAt` — Date or null
 *   - `isLoading` — true until first fetch resolves
 *
 * SSR-safe: returns sensible defaults if no auth session.
 *
 * Use cases:
 *   - Show "✦ Locked-in · gifted by Sasha" badge on dashboard/settings
 *   - Gate the commercial-license-required surfaces (e.g. coach mode,
 *     when that ships) on `isCommercial`
 *   - Future credit-cap edge functions consume the same tier value
 *     server-side via auth.uid() → profiles.entitlement_tier
 */

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type EntitlementTier =
  | "tasting"
  | "builder"
  | "locked_in"
  | "gifted_builder"
  | "gifted_locked_in"
  | "founders_50"
  | "ignition";

export type EntitlementState = {
  tier: EntitlementTier;
  isGifted: boolean;
  isCommercial: boolean;
  expiresAt: Date | null;
  note: string | null;
  isLoading: boolean;
};

const DEFAULT_STATE: EntitlementState = {
  tier: "tasting",
  isGifted: false,
  isCommercial: false,
  expiresAt: null,
  note: null,
  isLoading: true,
};

// Tiers that grant commercial license (build canvases for paying clients).
const COMMERCIAL_TIERS = new Set<EntitlementTier>([
  "locked_in",
  "gifted_locked_in",
  "founders_50",
  "ignition",
]);

const GIFTED_TIERS = new Set<EntitlementTier>([
  "gifted_builder",
  "gifted_locked_in",
]);

export function useEntitlement(): EntitlementState {
  const [state, setState] = useState<EntitlementState>(DEFAULT_STATE);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data: userRes } = await supabase.auth.getUser();
        const uid = userRes.user?.id;
        if (!uid) {
          if (!cancelled) setState({ ...DEFAULT_STATE, isLoading: false });
          return;
        }

        const { data, error } = await (supabase as any)
          .from("profiles")
          .select("entitlement_tier, entitlement_expires_at, entitlement_note")
          .eq("id", uid)
          .maybeSingle();

        if (cancelled) return;

        // Defensive: if the column doesn't exist yet (pre-migration), treat
        // as `tasting`. Allows the hook to ship before the DB migration
        // runs without breaking any caller.
        if (error) {
          // Don't toast — this hook is silent. Just log and fall back.
          console.warn("[useEntitlement] read failed:", error.message);
          setState({ ...DEFAULT_STATE, isLoading: false });
          return;
        }

        const tier = (data?.entitlement_tier as EntitlementTier) ?? "tasting";
        setState({
          tier,
          isGifted: GIFTED_TIERS.has(tier),
          isCommercial: COMMERCIAL_TIERS.has(tier),
          expiresAt: data?.entitlement_expires_at ? new Date(data.entitlement_expires_at) : null,
          note: data?.entitlement_note ?? null,
          isLoading: false,
        });
      } catch (e) {
        console.warn("[useEntitlement] unexpected:", e);
        if (!cancelled) setState({ ...DEFAULT_STATE, isLoading: false });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

/** Human-readable label for a tier (matches the admin grants page). */
export function tierLabel(t: EntitlementTier): string {
  switch (t) {
    case "tasting": return "Tasting";
    case "builder": return "Builder";
    case "locked_in": return "Locked-in";
    case "gifted_builder": return "Gifted Builder";
    case "gifted_locked_in": return "Gifted Locked-in";
    case "founders_50": return "Founders 50";
    case "ignition": return "Ignition";
  }
}
