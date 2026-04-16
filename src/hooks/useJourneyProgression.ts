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
 * Step 1: DISCOVER (Articulate Your Top Talent — ZoG quiz)
 * Step 2: PACKAGE  (Turn Your Talent Into a Business — Ignition session)
 * Step 3: BUILD    (Create Your Product)
 * Step 4: TEST     (Validate Through Gifting)
 * Step 5: LAUNCH   (Go Live With Precision)
 * Step 6: GROW     (Scale Your Revenue)
 * Step 7: SCALE    (Join the Founder Collective)
 */
function stageToStep(stage: string): number {
  switch (stage) {
    case "new":
    case "started":
    case "zog_started":
    case "tour_complete":
      return 1; // On step 1 — hasn't completed ZoG yet
    case "zog_complete":
    case "qol_started":
    case "qol_complete":
      return 2; // ZoG done → step 1 completed, step 2 is active
    case "offer_complete":
    case "recipe_complete":
      return 3; // Ignition done → step 2 completed, step 3 is active
    case "unlocked":
    case "complete":
      return 4; // Full unlock — step 3+ active (future expansion)
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
          .from("profiles")
          .select("onboarding_stage")
          .eq("id", user.id)
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
