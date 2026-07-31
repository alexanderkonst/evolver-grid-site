import { useEffect, useState } from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";
import GameShellV2 from "@/components/game/GameShellV2";
import MethodologyLandingPage from "@/pages/MethodologyLandingPage";
import MatchHero from "@/components/landing/MatchHero";
import { useEntryPath } from "@/contexts/EntryPathContext";
import { shouldRouteToQuiz, markDoorSeen } from "@/lib/doorRouter";
import { supabase } from "@/integrations/supabase/client";

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
 * had no param.
 *
 * Day 80 (Sasha 2026-05-22) FOLLOW-UP: the Day 78 fix overcorrected.
 * On SPA navigation INSIDE the platform (e.g., clicking the JOURNEY
 * space chip in the rail), a match-path user landed on MethodologyLanding
 * — losing the match-path context they'd been working in. The right
 * answer is to distinguish:
 *   - Fresh page load (POP) → URL is authoritative, sessionStorage
 *     does NOT influence. Address-bar visits to `/` always show build
 *     landing, even if a prior match session left state behind.
 *   - SPA navigation (PUSH/REPLACE) → URL still wins when present, but
 *     if no `?path` param is in the URL, fall back to sessionStorage so
 *     the user mid-flow keeps their match context across in-app clicks.
 *
 * Spec: docs/specs/funnel-v2/funnel-v2_product_spec.md §4.1.
 */
const JourneyPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const { path: entryPath } = useEntryPath();
  const urlPath = new URLSearchParams(location.search).get("path");

  // First-visit door (Sasha 2026-07-30, see src/lib/doorRouter.ts): a
  // first-time anonymous visitor landing on `/` meets the quiz instead
  // of the homepage. Flip QUIZ_FIRST_DOOR to false there to roll back.
  // `checking` guards the homepage from flashing before the redirect
  // (or before we've confirmed there's no redirect) fires.
  const [checkingDoor, setCheckingDoor] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      let isAuthed = false;
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        isAuthed = !!session?.user?.id;
      } catch {
        isAuthed = false;
      }

      if (cancelled) return;

      if (shouldRouteToQuiz(location.search, isAuthed)) {
        markDoorSeen();
        navigate("/quiz", { replace: true });
        return;
      }

      setCheckingDoor(false);
    })();

    return () => {
      cancelled = true;
    };
    // Only run once per mount of `/` — location.search only matters at
    // the moment of the check, re-checking on every render would risk
    // re-firing after the redirect flag is already set.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // URL is always authoritative when it carries an explicit `?path=` value.
  // Without it, behavior depends on how we arrived: fresh load = URL only
  // (so build); SPA nav = honor the in-session match context.
  const isMatch =
    urlPath === "match" ||
    (urlPath === null &&
      navigationType !== "POP" &&
      entryPath === "match");

  if (checkingDoor) return null;

  return (
    <GameShellV2>
      {isMatch ? <MatchHero /> : <MethodologyLandingPage />}
    </GameShellV2>
  );
};

export default JourneyPage;
