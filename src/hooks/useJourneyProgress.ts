/**
 * useJourneyProgress — returns which JOURNEY pane items the
 * current user has "accomplished," for rendering a gentle-but-
 * very-visible strikethrough on completed rows.
 *
 * Day 65 (Sasha 2026-05-15): user wants visible progression
 * feedback in the JOURNEY rail. Items that have a clear
 * completion signal in `game_profiles` get marked done. Items
 * without instrumentation (Playbook, Path, Dashboard view-only
 * pages, UBB module's 18-artifact completion arc) are skipped
 * for v1 — they require either page-visit tracking or a richer
 * progress-aggregation hook, both flagged as follow-ups.
 *
 * Signals consumed (all from `game_profiles`, single fetch):
 *   - last_zog_snapshot_id   → item "journey-start-here"
 *                              ("Start by finding your top talent")
 *   - resources_mapped_at    → item "journey-asset-mapper"
 *                              ("Map your assets")
 *   - last_qol_snapshot_id   → item "journey-qol-assess"
 *                              ("Assess your quality of life")
 *   - mission_discovered_at  → item "journey-mission-discovery"
 *                              ("Discover your mission")
 *
 * Returns a record keyed on the section `id` used inside
 * `buildJourneySections`. Lookup is `progress[itemId] === true`
 * → render strikethrough.
 *
 * Defensive defaults during load: all false. Items just don't
 * show strikethrough until the fetch resolves — no flicker risk
 * because the rail's resting state is "not yet done."
 */

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type JourneyProgress = Record<string, boolean>;

const EMPTY: JourneyProgress = {};

export function useJourneyProgress(): { progress: JourneyProgress; isLoading: boolean } {
  const [state, setState] = useState<{ progress: JourneyProgress; isLoading: boolean }>({
    progress: EMPTY,
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: userRes } = await supabase.auth.getUser();
        const uid = userRes.user?.id;
        if (!uid) {
          if (!cancelled) setState({ progress: EMPTY, isLoading: false });
          return;
        }
        const { data, error } = await (supabase as any)
          .from("game_profiles")
          .select(
            "last_zog_snapshot_id, resources_mapped_at, last_qol_snapshot_id, mission_discovered_at",
          )
          .eq("user_id", uid)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          // Defensive: if any field doesn't exist yet (pre-migration), bail
          // silently. Strikethrough is a nice-to-have, not load-blocking.
          console.warn("[useJourneyProgress] read failed:", error.message);
          setState({ progress: EMPTY, isLoading: false });
          return;
        }

        const progress: JourneyProgress = {
          "journey-start-here": !!data?.last_zog_snapshot_id,
          "journey-asset-mapper": !!data?.resources_mapped_at,
          "journey-qol-assess": !!data?.last_qol_snapshot_id,
          "journey-mission-discovery": !!data?.mission_discovered_at,
        };

        setState({ progress, isLoading: false });
      } catch (e) {
        console.warn("[useJourneyProgress] unexpected:", e);
        if (!cancelled) setState({ progress: EMPTY, isLoading: false });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
