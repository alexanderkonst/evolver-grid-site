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
 * Signals consumed:
 *   FROM game_profiles (single fetch):
 *     - last_zog_snapshot_id   → "journey-start-here"
 *                                ("Start by finding your top talent")
 *     - resources_mapped_at    → "journey-asset-mapper"
 *                                ("Map your assets")
 *     - last_qol_snapshot_id   → "journey-qol-assess"
 *                                ("Assess your quality of life")
 *     - mission_discovered_at  → "journey-mission-discovery"
 *                                ("Discover your mission")
 *   FROM user_business_artifacts (second fetch, Day 65 wave 3):
 *     - distinct artifact_keys count === ALL_ARTIFACT_KEYS.length
 *       → "journey-build-business"
 *       ("Build a business off your top talent" — user has
 *        created every UBB artifact at least once)
 *   FROM game_profiles (continued, Day 65 wave 4 — cross-device sync):
 *     - playbook_visited_at    → "journey-the-playbook"
 *     - path_visited_at        → "journey-the-path"
 *     - dashboard_visited_at   → "journey-dashboard"
 *     (Written by markJourneyVisited() on page mount for authed
 *      users. Read here so a fresh-device sign-in shows the same
 *      strikethrough state as the device that first visited the
 *      page. OR'd with the localStorage flags below.)
 *   FROM localStorage:
 *     - journey:visited:journey-the-playbook  → "journey-the-playbook"
 *     - journey:visited:journey-the-path      → "journey-the-path"
 *     - journey:visited:journey-dashboard     → "journey-dashboard"
 *     (Same itemIds as the DB columns; OR'd together — either
 *      source counts. Provides instant pre-auth strikethrough on
 *      a single device; the DB layer above provides cross-device.)
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
import { ALL_ARTIFACT_KEYS } from "@/modules/unique-business-builder/types";

export type JourneyProgress = Record<string, boolean>;

const EMPTY: JourneyProgress = {};

export function useJourneyProgress(): { progress: JourneyProgress; isLoading: boolean } {
  const [state, setState] = useState<{ progress: JourneyProgress; isLoading: boolean }>({
    progress: EMPTY,
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;

    // Read localStorage-backed visit flags up front — works for
    // both authed and unauth users. Each entry is the ISO timestamp
    // of first visit; presence is what matters.
    const readVisitFlags = (): JourneyProgress => {
      if (typeof window === "undefined") return {};
      try {
        return {
          "journey-the-playbook": !!window.localStorage.getItem(
            "journey:visited:journey-the-playbook",
          ),
          "journey-the-path": !!window.localStorage.getItem(
            "journey:visited:journey-the-path",
          ),
          "journey-dashboard": !!window.localStorage.getItem(
            "journey:visited:journey-dashboard",
          ),
        };
      } catch {
        return {};
      }
    };

    (async () => {
      try {
        const visitFlags = readVisitFlags();

        const { data: userRes } = await supabase.auth.getUser();
        const uid = userRes.user?.id;
        if (!uid) {
          // Unauth: only localStorage signals apply.
          if (!cancelled) setState({ progress: visitFlags, isLoading: false });
          return;
        }
        const { data, error } = await (supabase as any)
          .from("game_profiles")
          .select(
            "last_zog_snapshot_id, resources_mapped_at, last_qol_snapshot_id, mission_discovered_at, playbook_visited_at, path_visited_at, dashboard_visited_at",
          )
          .eq("user_id", uid)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          // Defensive: if any field doesn't exist yet (pre-migration), bail
          // silently. Strikethrough is a nice-to-have, not load-blocking.
          console.warn("[useJourneyProgress] read failed:", error.message);
          setState({ progress: visitFlags, isLoading: false });
          return;
        }

        // Day 65 wave 3 (Sasha 2026-05-15): UBB completion check.
        // "Build a business off your top talent" is marked done when
        // every artifact in ALL_ARTIFACT_KEYS has been created at
        // least once (any row exists for that artifact_key under
        // this user_id — locked or not). Strict definition per
        // Sasha's spec: "all artifacts have been created at least
        // once." A row in user_business_artifacts is the proof of
        // creation; is_locked is a separate concern (commit state).
        let ubbAllCreated = false;
        try {
          const { data: artifactRows, error: artErr } = await (supabase as any)
            .from("user_business_artifacts")
            .select("artifact_key")
            .eq("user_id", uid);
          if (!artErr && Array.isArray(artifactRows)) {
            const distinctKeys = new Set<string>(
              artifactRows.map((r: { artifact_key: string }) => r.artifact_key),
            );
            ubbAllCreated = ALL_ARTIFACT_KEYS.every((k) => distinctKeys.has(k));
          }
        } catch {
          // Fall through with ubbAllCreated=false. Same nice-to-have
          // failure mode as the rest of this hook.
        }

        const progress: JourneyProgress = {
          ...visitFlags,
          "journey-start-here": !!data?.last_zog_snapshot_id,
          "journey-asset-mapper": !!data?.resources_mapped_at,
          "journey-qol-assess": !!data?.last_qol_snapshot_id,
          "journey-mission-discovery": !!data?.mission_discovered_at,
          "journey-build-business": ubbAllCreated,
          // Day 65 wave 4 (Sasha 2026-05-15): cross-device sync.
          // OR the DB column with the localStorage flag from
          // `visitFlags` above — either source counts. The DB
          // column will be NULL until the migration runs +
          // markJourneyVisited() fires once with an authed user,
          // so during transition the localStorage path keeps
          // working unaffected.
          "journey-the-playbook":
            !!visitFlags["journey-the-playbook"] || !!data?.playbook_visited_at,
          "journey-the-path":
            !!visitFlags["journey-the-path"] || !!data?.path_visited_at,
          "journey-dashboard":
            !!visitFlags["journey-dashboard"] || !!data?.dashboard_visited_at,
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
