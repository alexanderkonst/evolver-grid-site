import MoonNotice from "@/components/game/MoonNotice";
import { ZOG_ENTRY_PATH } from "@/lib/shellRoutes";

/**
 * /zone-of-genius/mission, /mission, /discover-mission (issue #270): old and guessed URLs of
 * the mission step used to 404. They show the same closed door as /village/house instead:
 * every closed place waits on the top talent first.
 */
const MissionLocked = () => (
  <MoonNotice
    eyebrow="Locked"
    title="Find your top talent first"
    line="Your mission opens once you know your top talent."
    primary={{ to: ZOG_ENTRY_PATH, label: "Find your top talent" }}
    secondary={{ to: "/village", label: "Back to the village" }}
  />
);

export default MissionLocked;
