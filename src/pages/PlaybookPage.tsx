import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import GameShellV2 from "@/components/game/GameShellV2";
import PlaybookShell from "@/components/playbook/PlaybookShell";
import StepCard from "@/components/playbook/StepCard";
import { getStepBySlug, PLAYBOOK_STEPS } from "@/data/playbookSteps";
import { markJourneyVisited } from "@/lib/journeyVisits";

/**
 * PlaybookPage — the full methodology playbook.
 *
 * Route pattern:
 *   /playbook             → renders Step 1 (discover) — public, no auth
 *   /playbook/:slug       → renders the matching step
 *
 * The "See the exact playbook" CTA on the landing page routes here.
 * PlaybookShell provides top step-nav; StepCard renders the step content
 * with substeps open by default.
 *
 * When :slug doesn't match a known step, we fall back to `discover`.
 */
const PlaybookPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const resolvedSlug = slug ?? "discover";
  const step = getStepBySlug(resolvedSlug);

  // Day 65 wave 4 (Sasha 2026-05-15): cross-device visit tracking.
  // markJourneyVisited writes localStorage (fast, pre-auth-safe)
  // AND, if authed, the matching first-visit timestamp on
  // game_profiles. Either source unlocks the strikethrough — so
  // a sign-in on a fresh device still shows the row as done.
  useEffect(() => {
    markJourneyVisited({
      itemId: "journey-the-playbook",
      dbColumn: "playbook_visited_at",
    });
  }, []);

  if (!step) {
    return <Navigate to={`/playbook/${PLAYBOOK_STEPS[0].slug}`} replace />;
  }

  return (
    <GameShellV2>
      <PlaybookShell currentSlug={step.slug}>
        <StepCard step={step} />
      </PlaybookShell>
    </GameShellV2>
  );
};

export default PlaybookPage;
