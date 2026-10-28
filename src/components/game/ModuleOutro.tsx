import { useEffect, useId, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import LeaveParticle from "@/components/game/LeaveParticle";
import { useCharacterSheet } from "@/hooks/useCharacterSheet";
import { useJourneyVictory } from "@/hooks/useJourneyVictory";
import { useModuleChoice } from "@/hooks/useModuleChoice";
import { markParticleInvite, useVillageParticles } from "@/hooks/useVillageParticles";
import { RATING_MAX, RATING_MIN, moduleResultText, type JourneyModuleDef } from "@/data/journeyModules";
import { CHOICE_MAX, choiceDate, getJourneyChoice } from "@/data/journeyChoices";
import "./ModuleForm.css";

/**
 * ModuleOutro — the After screen of a Journey module (WP-5, WP-19).
 * Design: docs/02-strategy/game_of_being_you.md §14.4, §14.12, §15.5.
 *
 * A stable screen, never a toast: it stays until the player presses the one button.
 *
 *   «Done · …» eyebrow · the badge (the result IS the badge: the player's own words in a
 *   frame, and below them the player's decision with its date) · where it lives (Your House)
 *   · what opened · the real choice (one plain question, the player's own words) ·
 *   «How much did this resonate, 1–10?» · ONE button, «Back to the village» → /village.
 *
 * The real choice (WP-19) goes to `module_choices` (one per player per step), private to the
 * player. It never blocks the button. While that table does not exist, or for a guest, the
 * choice is simply absent and the rest is the same. The prompts live in
 * src/data/journeyChoices.ts.
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
  const prompt = getJourneyChoice(module.id);
  const decision = useModuleChoice(prompt ? module.id : null);
  const labelId = useId();
  const [pending, setPending] = useState<number | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [choiceNote, setChoiceNote] = useState<string | null>(null);

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

  const decide = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setChoiceNote(null);
    const res = await decision.choose(draft);
    setSaving(false);
    if (res.ok === false) setChoiceNote(res.message);
  };

  const showRating = victory.available && victory.signedIn && !victory.loading;
  const showChoice = !!prompt && decision.available && decision.signedIn && !decision.loading;

  return (
    <section className={`mf mf--outro${className ? ` ${className}` : ""}`} aria-label={module.outro.done}>
      <div className="mf__stage" data-place-state="done">
        <p className="mf__eyebrow">{module.outro.done}</p>

        <figure className="mf__badge" aria-label={`Badge: ${module.outro.badge}`}>
          <figcaption className="mf__badge-name">{module.outro.badge}</figcaption>
          <h2 className="mf__result">{shown}</h2>
          {decision.choice ? (
            <p className="mf__badge-choice">
              <span className="mf__badge-choice-text">{decision.choice.choice_text}</span>
              <time className="mf__badge-date" dateTime={decision.choice.created_at}>
                {choiceDate(decision.choice.created_at)}
              </time>
            </p>
          ) : null}
        </figure>

        <div className="mf__facts">
          <p className="mf__fact">
            <Link to={module.outro.livesIn.to}>{module.outro.livesIn.text}</Link>
          </p>
          <p className="mf__fact">{module.outro.opened}</p>
        </div>

        {showChoice && prompt && !decision.choice ? (
          <form className="mf__choice" onSubmit={decide} aria-describedby={choiceNote ? `${labelId}-choice-note` : undefined}>
            <label className="mf__choice-q" htmlFor={`${labelId}-choice`}>
              {prompt.question}
            </label>
            <textarea
              id={`${labelId}-choice`}
              className="mf__choice-input"
              rows={2}
              maxLength={CHOICE_MAX}
              placeholder={prompt.placeholder}
              value={draft}
              disabled={saving}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button type="submit" className="mf__choice-btn" disabled={saving || draft.trim().length === 0}>
              This is my choice
            </button>
            <p className="mf__rate-note" id={`${labelId}-choice-note`} role="status">
              {choiceNote}
            </p>
          </form>
        ) : null}

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
