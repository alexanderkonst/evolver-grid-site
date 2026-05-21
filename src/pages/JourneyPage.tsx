import { useLocation } from "react-router-dom";
import GameShellV2 from "@/components/game/GameShellV2";
import MethodologyLandingPage from "@/pages/MethodologyLandingPage";
import MatchHero from "@/components/landing/MatchHero";

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
 * Day 78 (Sasha 2026-05-21) BUG FIX: previously the hero swap was driven
 * by `useEntryPath()` which falls back to sessionStorage. Side effect:
 * once a user had visited `/?path=match` in a tab, every subsequent
 * visit to `/` in that tab kept rendering MatchHero — even when the URL
 * had no param. The landing decision should be driven by the URL ONLY;
 * sessionStorage stays for the downstream completion-page CTA branching
 * (where the user is mid-flow). Visiting `/` with no param now always
 * shows the build-path landing, regardless of session state.
 *
 * Spec: docs/specs/funnel-v2/funnel-v2_product_spec.md §4.1.
 */
const JourneyPage = () => {
  const location = useLocation();
  const isMatch =
    new URLSearchParams(location.search).get("path") === "match";
  return (
    <GameShellV2>
      {isMatch ? <MatchHero /> : <MethodologyLandingPage />}
    </GameShellV2>
  );
};

export default JourneyPage;
