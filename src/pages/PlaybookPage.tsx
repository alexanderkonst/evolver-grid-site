import { Navigate, useParams } from "react-router-dom";
import GameShellV2 from "@/components/game/GameShellV2";
import PlaybookShell from "@/components/playbook/PlaybookShell";
import StepCard from "@/components/playbook/StepCard";
import { getStepBySlug, PLAYBOOK_STEPS } from "@/data/playbookSteps";

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
