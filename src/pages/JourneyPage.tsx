import GameShellV2 from "@/components/game/GameShellV2";
import MethodologyLandingPage from "@/pages/MethodologyLandingPage";
import MatchHero from "@/components/landing/MatchHero";
import { useEntryPath } from "@/contexts/EntryPathContext";

/**
 * JourneyPage — the JOURNEY space main page.
 * Wraps the pane-3 hero in GameShellV2 for the /game/journey route and
 * also serves as the `/` homepage.
 *
 * Funnel v2 (Day 77, Sasha 2026-05-20): when a visitor enters via
 * `?path=match` (Balaji / ecosystem-leader outreach), MatchHero renders
 * in place of MethodologyLandingPage. Shell stays identical — only the
 * hero swaps. Build-path users (no param, `?path=build`, or organic
 * traffic) see MethodologyLandingPage byte-for-byte unchanged.
 *
 * Spec: docs/specs/funnel-v2/funnel-v2_product_spec.md §4.1.
 */
const JourneyPage = () => {
  const { path } = useEntryPath();
  return (
    <GameShellV2>
      {path === "match" ? <MatchHero /> : <MethodologyLandingPage />}
    </GameShellV2>
  );
};

export default JourneyPage;
