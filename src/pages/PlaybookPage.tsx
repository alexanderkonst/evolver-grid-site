import { Navigate, useParams } from "react-router-dom";
import GameShellV2 from "@/components/game/GameShellV2";
import PlaybookShell from "@/components/playbook/PlaybookShell";
import PlaybookHero from "@/components/playbook/PlaybookHero";
import StepCard from "@/components/playbook/StepCard";
import { getStepBySlug, PLAYBOOK_STEPS } from "@/data/playbookSteps";

/**
 * PlaybookPage — the reward surface after magic-link signup.
 *
 * Route pattern:
 *   /playbook            → redirect to /playbook/discover (handled in App.tsx)
 *   /playbook/:slug      → renders the matching step via PlaybookShell + StepCard
 *
 * When the :slug doesn't match a known step, we fall back to `discover`.
 */
const PlaybookPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const resolvedSlug = slug ?? "discover";
  const step = getStepBySlug(resolvedSlug);

  if (!step) {
    // Unknown slug — bounce to the first step
    return <Navigate to={`/playbook/${PLAYBOOK_STEPS[0].slug}`} replace />;
  }

  return (
    <GameShellV2>
      <PlaybookShell currentSlug={step.slug}>
        <PlaybookHero />
        <StepCard step={step} />
      </PlaybookShell>
    </GameShellV2>
  );
};

export default PlaybookPage;
