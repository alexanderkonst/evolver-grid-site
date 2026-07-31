/**
 * useLinkedQuizResult — JOURNEY Step 0's completion signal.
 *
 * Day 138 (Sasha 2026-07-30): fetches the current user's most recent
 * `transition_quiz_results` row (via the `transition_quiz_results_select_own`
 * RLS policy added alongside this hook — `auth.uid() = user_id`). Returns
 * null while loading, while anonymous, or when the user has no linked
 * result yet — in every one of those cases Step 0 renders as the natural
 * next action (unlocked, not done) rather than erroring.
 *
 * Rows get linked to an account two ways: at completion time, if a
 * session already existed (TransitionQuizPage's logCompletion threads
 * user_id); or after the fact via the claim-quiz-result edge function
 * from a permalink page (/quiz/r/:id).
 */

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface LinkedQuizResult {
  id: string;
  stage: number;
  not_yet: boolean;
}

export function useLinkedQuizResult(): { result: LinkedQuizResult | null; isLoading: boolean } {
  const [state, setState] = useState<{ result: LinkedQuizResult | null; isLoading: boolean }>({
    result: null,
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data: userRes } = await supabase.auth.getUser();
        const uid = userRes.user?.id;
        if (!uid) {
          if (!cancelled) setState({ result: null, isLoading: false });
          return;
        }

        const { data, error } = await supabase
          .from("transition_quiz_results")
          .select("id, stage, not_yet")
          .eq("user_id", uid)
          .order("completed_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          // Defensive: pre-migration environments (column/policy not yet
          // deployed) shouldn't break the JOURNEY pane — just show Step 0
          // as not-yet-done.
          console.warn("[useLinkedQuizResult] read failed:", error.message);
          setState({ result: null, isLoading: false });
          return;
        }

        setState({ result: (data as LinkedQuizResult | null) ?? null, isLoading: false });
      } catch (e) {
        console.warn("[useLinkedQuizResult] unexpected:", e);
        if (!cancelled) setState({ result: null, isLoading: false });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
