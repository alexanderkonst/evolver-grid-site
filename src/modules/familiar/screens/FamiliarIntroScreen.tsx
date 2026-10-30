/**
 * Screen 1 · Intro (the before-screen): the Master Result as the headline, one button.
 * Spec: docs/specs/ai-familiar/ai-familiar_tracker.md §1.3. Same shape as ModuleIntro, but the
 * place is open to everyone, guests included, so there is no save to wait for.
 */
import { useId } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PlaceState from "@/components/game/PlaceState";
import { getVillagePlace, sceneObjectPosition } from "@/data/villagePlaces";
import { placeAlt, tr } from "@/lib/villageCopy";
import "@/components/game/ModuleForm.css";

const FamiliarIntroScreen = ({ onStart }: { onStart: () => void }) => {
  const { t } = useTranslation();
  const headingId = useId();
  const place = getVillagePlace("oracle");

  return (
    <section className="mf mf--intro" aria-labelledby={headingId}>
      <Link className="mf__back" to="/village">
        {tr(t, "village.backVillage", "← Village")}
      </Link>
      <PlaceState
        state="open"
        className="mf__state"
        bodyClassName="mf__copy"
        scene={
          place ? (
            <img
              className="mf__img"
              src={place.image}
              alt={placeAlt(place, t)}
              decoding="async"
              style={{ objectPosition: sceneObjectPosition(place) }}
            />
          ) : undefined
        }
        action={
          <button type="button" className="mf__go" onClick={onStart}>
            {t("familiar.intro.cta", { defaultValue: "Ask my question" })} <span aria-hidden="true">→</span>
          </button>
        }
      >
        <p className="mf__eyebrow">{t("familiar.intro.eyebrow", { defaultValue: "Your AI" })}</p>
        <h1 id={headingId} className="mf__headline">
          {t("familiar.intro.headline", {
            defaultValue: "Same question. Two answers. See what happens when your AI knows you.",
          })}
        </h1>
        <p className="mf__silhouette">
          {t("familiar.intro.silhouette", {
            defaultValue:
              "Ask something real. You'll get a plain chat's answer and your own AI's answer, side by side, in the chat app you already use. Same model underneath.",
          })}
        </p>
      </PlaceState>
    </section>
  );
};

export default FamiliarIntroScreen;
