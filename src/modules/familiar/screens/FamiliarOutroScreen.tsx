/**
 * Screen 4 · Outro (the after-screen, the deliverable). A stable screen, never a toast: it stays
 * until the player leaves. The naming line, the three gifts as the result, and the possibility
 * map: what the player can do in the village now, with the first open next step as the one button.
 * Your AI lives inside the game, so there is no hand-off to an outside chat app here.
 * Spec: docs/specs/ai-familiar/ai-familiar_tracker.md §1.3.
 */
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import GiftChips from "../GiftChips";
import PossibilityMap from "../PossibilityMap";
import type { FamiliarState } from "../types";
import "@/components/game/ModuleForm.css";

type Props = {
  state: FamiliarState;
};

const FamiliarOutroScreen = ({ state }: Props) => {
  const { t } = useTranslation();

  return (
    <section className="mf mf--outro" aria-label={t("familiar.outro.aria", { defaultValue: "Your AI is ready" })}>
      <Link className="mf__back" to="/village">
        {t("village.backVillage", { defaultValue: "← Village" })}
      </Link>
      <div className="mf__stage" data-place-state="done">
        <p className="mf__eyebrow">{t("familiar.outro.eyebrow", { defaultValue: "Done · Your AI is ready" })}</p>

        <figure className="mf__badge">
          <figcaption className="mf__badge-name">{t("familiar.outro.badge", { defaultValue: "Your AI" })}</figcaption>
          <h1 className="mf__result">
            {t("familiar.outro.naming", {
              defaultValue: "Models have become alike. The difference is how well your AI knows you.",
            })}
          </h1>
        </figure>

        <div className="mf__facts">
          <p className="mf__fact">
            <Link to="/ai-os/benchmark">{t("familiar.outro.why", { defaultValue: "Why this works" })}</Link>
          </p>
        </div>

        <div className="mt-6 flex w-full justify-center">
          <GiftChips gifts={state.gifts} />
        </div>

        <div className="mf__facts">
          <p className="mf__fact">
            {t("familiar.outro.lives", { defaultValue: "Always here, in the village, at Your AI. It grows as you play." })}
          </p>
        </div>

        <PossibilityMap />

        <p className="mf__fact mt-6">
          <Link to="/village">{t("familiar.outro.back", { defaultValue: "Back to the village" })}</Link>
          {" · "}
          <Link to="/ai-os">{t("familiar.outro.skills", { defaultValue: "Skills for your AI" })}</Link>
        </p>
      </div>
    </section>
  );
};

export default FamiliarOutroScreen;
