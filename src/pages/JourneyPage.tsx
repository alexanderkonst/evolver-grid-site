import GameShellV2 from "@/components/game/GameShellV2";
import MethodologyLandingPage from "@/pages/MethodologyLandingPage";

/**
 * JourneyPage — the JOURNEY space main page.
 * Wraps MethodologyLandingPage in GameShellV2 for the /game/journey route
 * and also serves as the `/` homepage.
 */
const JourneyPage = () => (
  <GameShellV2>
    <MethodologyLandingPage />
  </GameShellV2>
);

export default JourneyPage;
