// B2 (docs/02-strategy/game_launch_spec.md): the quiet door from a quiz read into the game.
//
// One secondary link under the result's existing CTAs. It opens the village, which is
// public: a guest lands on the map with Reception, Academy and Fire Circle open (issue
// #354), no account needed. Shown on fresh reads (/quiz) and saved reads (/quiz/r/:id).

import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

/** The public guest entry into the Digital Village. */
export const GAME_ENTRY_PATH = "/village";

export function ContinueInGameLink() {
  const { t } = useTranslation();
  return (
    <div className="tq-continue-game">
      <Link className="tq-link-quiet" to={GAME_ENTRY_PATH}>
        {t("quiz.continueInGame", { defaultValue: "Continue in the game" }) as string}
      </Link>
    </div>
  );
}
