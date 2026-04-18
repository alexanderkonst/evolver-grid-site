import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Step progression state — drives visual treatment of journey tiles.
 *
 * completed → user has finished this step (muted, checkmark, clickable to revisit)
 * active    → user's current step (highlighted, CTA visible)
 * next      → the step that unlocks after completing the active step ("peek" state)
 * locked    → not yet visible in detail (dimmed, lock icon)
 */
export type StepState = "completed" | "active" | "next" | "locked";

/**
 * Maps onboarding_stage → methodology step number (1–7).
 *
 * Step 1: DISCOVER (Name Your Top Talent — free ZoG reveal)
 * Step 2: PACKAGE  (Articulate it with Precision — Ignition, bundled with 3)
 * Step 3: BUILD    (Enhance it with Business Structure — Ignition, bundled with 2)
 * Step 4: PRODUCT  (Build your First Unique Product — Build cohort, bundled with 5)
 * Step 5: TEST     (Gift it or Sell it to Beta-Test — Build cohort, bundled with 4)
 * Step 6: LAUNCH   (Laser-Focus Tactically and Go Live)
 * Step 7: SCALE    (Grow & Scale with Others, in Flow)
 *
 * Container model (2026-04-17 — final): steps are methodological stages,
 * containers are commercial packaging. Two bundles:
 *   - Ignition ($555)            → Steps 2 + 3
 *   - Build ($1,111 + rev share) → Steps 4 + 5 (cohort, not 1:1)
 *
 * Stage semantics:
 *   - offer_complete / recipe_complete = Ignition delivered → Step 4 active
 *   - a future `build_complete` stage would advance to Step 6
 */
function stageToStep(stage: string): number {
  switch (stage) {
    case "new":
    case "started":
    case "zog_started":
    case "tour_complete":
      return 1; // Hasn't completed ZoG yet
    case "zog_complete":
    case "qol_started":
    case "qol_complete":
      return 2; // ZoG done → Ignition (Step 2) active
    case "offer_complete":
    case "recipe_complete":
      return 4; // Ignition bundle done → Build cohort (Step 4) active
    case "unlocked":
    case "complete":
      return 4; // Full unlock — Step 4+ active (future expansion)
    default:
      return 1;
  }
}

/**
 * Reusable hook for journey step progression.
 *
 * Returns:
 * - `currentStep`: the step number the user is currently on (1–7)
 * - `getStepState(n)`: returns the visual state for step n
 * - `loading`: whether the profile is still being fetched
 *
 * Usage:
 *   const { getStepState, loading } = useJourneyProgression();
 *   const state = getStepState(step.number); // "completed" | "active" | "next" | "locked"
 */
export function useJourneyProgression() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchStage = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || cancelled) {
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from("game_profiles")
          .select("onboarding_stage")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!cancelled) {
          const stage = profile?.onboarding_stage || "new";
          setCurrentStep(stageToStep(stage));
        }
      } catch {
        // Fallback to step 1 on error
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchStage();
    return () => { cancelled = true; };
  }, []);

  /**
   * Get the visual state for a given step number.
   *
   * - Steps before currentStep → "completed"
   * - Step at currentStep      → "active"
   * - Step at currentStep + 1  → "next" (preview / teased)
   * - Steps beyond that        → "locked"
   */
  const getStepState = (stepNumber: number): StepState => {
    if (stepNumber < currentStep) return "completed";
    if (stepNumber === currentStep) return "active";
    if (stepNumber === currentStep + 1) return "next";
    return "locked";
  };

  return { currentStep, getStepState, loading };
}
