import { useEffect, useId, useState } from "react";
import { Link } from "react-router-dom";
import LeaveParticle from "@/components/game/LeaveParticle";
import { useCharacterSheet } from "@/hooks/useCharacterSheet";
import { useJourneyVictory } from "@/hooks/useJourneyVictory";
import { markParticleInvite, useVillageParticles } from "@/hooks/useVillageParticles";
import { RATING_MAX, RATING_MIN, moduleResultText, type JourneyModuleDef } from "@/data/journeyModules";
import "./ModuleForm.css";

/**
 * ModuleOutro — the After screen of a Journey module (WP-5).
 * Design: docs/02-strategy/game_of_being_you.md §14.4, §14.12.
 *
 * A stable screen, never a toast: it stays until the player presses the one button.
 *
 *   «Done · …» eyebrow · the badge (the result IS the badge: the player's own words in a
 *   frame) · where it lives (Your House) · what opened · «How much did this resonate, 1–10?»
 *   · ONE button, «Back to the village» → /village.
 *
 * The 1–10 answer goes to `journey_victories` (one per player per step). While that table
 * does not exist, or for a guest, the rating row is simply absent and the rest is the same.
 * After the button, WP-17's LeaveParticle sits quietly beside the way back; it renders
 * nothing when it cannot be used.
 *
 * `result` is the fresh result when the module has it in hand (a just-typed mission); it
 * wins over what the save says, which may not have caught up yet.
 */

type Props = {
  module: JourneyModuleDef;
  result?: string | null;
  className?: string;
};

const RATINGS = Array.from({ length: RATING_MAX - RATING_MIN + 1 }, (_, i) => RATING_MIN + i);

const ModuleOutro = ({ module, result, className }: Props) => {
  const sheet = useCharacterSheet();
  const victory = useJourneyVictory(module.id);
  const particles = useVillageParticles(module.place);
  const labelId = useId();
  const [pending, setPending] = useState<number | null>(null);
  const [note, setNote] = useState<string | null>(null);

  // If the particle prompt is skipped here, the place screen offers it once more.
  useEffect(() => {
    markParticleInvite(module.place);
  }, [module.place]);

  const shown = result?.trim() || moduleResultText(module.id, sheet) || module.outro.fallbackResult;

  const rate = async (value: number) => {
    if (pending !== null) return;
    setPending(value);
    setNote(null);
    const res = await victory.rate(value);
    setPending(null);
    if (res.ok === false) setNote(res.message);
  };

  const showRating = victory.available && victory.signedIn && !victory.loading;

  return (
    <section className={`mf mf--outro${className ? ` ${className}` : ""}`} aria-label={module.outro.done}>
      <div className="mf__stage" data-place-state="done">
        <p className="mf__eyebrow">{module.outro.done}</p>

        <figure className="mf__badge" aria-label={`Badge: ${module.outro.badge}`}>
          <figcaption className="mf__badge-name">{module.outro.badge}</figcaption>
          <h2 className="mf__result">{shown}</h2>
        </figure>

        <div className="mf__facts">
          <p className="mf__fact">
            <Link to={module.outro.livesIn.to}>{module.outro.livesIn.text}</Link>
          </p>
          <p className="mf__fact">{module.outro.opened}</p>
        </div>

        {showRating ? (
          victory.rating !== null ? (
            <p className="mf__rate-note" role="status">
              Thank you. You gave it {victory.rating} of {RATING_MAX}.
            </p>
          ) : (
            <fieldset className="mf__rate" aria-describedby={note ? `${labelId}-note` : undefined}>
              <legend className="mf__rate-q" id={labelId}>
                How much did this resonate, {RATING_MIN}–{RATING_MAX}?
              </legend>
              <div className="mf__rate-row" role="group" aria-labelledby={labelId}>
                {RATINGS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    className="mf__rate-btn"
                    aria-label={`${n} of ${RATING_MAX}`}
                    aria-pressed={pending === n}
                    disabled={pending !== null}
                    onClick={() => rate(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <p className="mf__rate-note" id={`${labelId}-note`} role="status">
                {note}
              </p>
            </fieldset>
          )
        ) : null}

        <div className="mf__after">
          <Link className="mf__go" to="/village">
            Back to the village
          </Link>
          <LeaveParticle placeKey={module.place} api={particles} variant="scene" />
        </div>
      </div>
    </section>
  );
};

export default ModuleOutro;
