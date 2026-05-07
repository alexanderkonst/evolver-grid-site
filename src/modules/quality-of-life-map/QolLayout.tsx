import { Outlet } from "react-router-dom";
import { QolAssessmentProvider } from "./QolAssessmentContext";
import GameShellV2 from "@/components/game/GameShellV2";

/**
 * Day 63 (Sasha 2026-05-06): Shell unification. Previously the QoL
 * pages each wrapped their own `<GameShellV2>` (Results, Priorities,
 * GrowthRecipe) while Assessment used a standalone `<Navigation />`
 * top-bar — three different shell treatments inside one module.
 *
 * Now: QolLayout owns the shell. All four QoL pages render their
 * content directly; the GameShellV2 wraps them once at the layout
 * level. The per-page wrappers were removed in this same Day 63
 * commit.
 *
 * Day 63 evening (Sasha 2026-05-06): OnboardingProgress removed from
 * this layout. It was rendering ABOVE GameShellV2's main pane in DOM
 * order, but GameShellV2's brand wordmark sits at the top of pane 3
 * with absolute/fixed positioning — the two collided visually
 * ("Step 1 of 4" rendered at the same Y as "FIND YOUR TOP TALENT").
 * The Assessment page already has its own per-domain progress
 * indicator (1 of 8 dots row), which is the more useful granularity.
 * Removing the outer 4-step indicator: zero UX loss, eliminates the
 * collision. Surfaced via live preview, not code review.
 *
 * Embedded mode (TransformationQolAssessment, TransformationQolResults
 * at /game/learn/qol-*) is unaffected — those routes never mount
 * QolLayout; they wrap the page in their own GameShellV2 directly.
 */
const QolLayout = () => {
  return (
    <QolAssessmentProvider>
      {/* Day 64 (Sasha 2026-05-07): hideLogo passed to GameShellV2.
          The "FIND YOUR TOP TALENT" wordmark in pane 3 was redundant on
          QoL pages — duplicated the SpacesRail brand presence and competed
          with the QoL hero's own visual. Pattern matches Day 58's hideLogo
          treatment on the ME-space Overview hero. */}
      <GameShellV2 hideLogo>
        <Outlet />
      </GameShellV2>
    </QolAssessmentProvider>
  );
};

export default QolLayout;
