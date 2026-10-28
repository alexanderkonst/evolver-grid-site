import { useId, useState } from "react";
import GuestSaveCard from "@/components/game/GuestSaveCard";
import { JOURNEY_ITEM_COMPLETED_EVENT } from "@/data/journeySequence";
import { RATING_MAX, RATING_MIN } from "@/data/journeyModules";
import { MASTERMIND_DID_IT, MASTERMIND_ID, MASTERMIND_MODULE, MASTERMIND_ROUTE, MASTERMIND_TASK } from "@/data/mastermindModule";
import { useJourneyVictory } from "@/hooks/useJourneyVictory";
import { useSessionUserId } from "@/hooks/useSessionUserId";
import "./ModuleForm.css";

/**
 * CircleRecord — the end of the Fire Circle's Journey step: «I was in the circle» (WP-10, J9).
 * Design: docs/02-strategy/game_of_being_you.md §14.4, §14.8 row WP-10. Same pattern as the
 * Quest Board's `QuestModule` task screen (WP-11); copied, not reinvented.
 *
 * The circle happens live. «I was in the circle» is the player's own word, recorded as their
 * victory: one row in `journey_victories` (the player's own, RLS), written with the 1–10 «How
 * much did this resonate?» they pick at that moment. The Outro then shows the badge, the real
 * choice and the way back to `/village`.
 *
 * A guest can read the whole Mastermind page. Recording a victory needs a save file, so the
 * button asks for the account right there (`GuestSaveCard`) and the magic link returns here.
 */

type Props = {
  onRecorded: () => void;
};

const RATINGS = Array.from({ length: RATING_MAX - RATING_MIN + 1 }, (_, i) => RATING_MIN + i);

const CircleRecord = ({ onRecorded }: Props) => {
  const userId = useSessionUserId();
  const victory = useJourneyVictory(MASTERMIND_ID);
  const labelId = useId();
  const [said, setSaid] = useState(false);
  const [pending, setPending] = useState<number | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const module = MASTERMIND_MODULE;
  const guest = userId === null;

  const record = async (value: number) => {
    if (pending !== null) return;
    setPending(value);
    setNote(null);
    const res = await victory.rate(value);
    setPending(null);
    if (res.ok === false) {
      setNote(res.message);
      return;
    }
    // The seam: the save re-reads, so the village sees the victory without a reload.
    window.dispatchEvent(new CustomEvent(JOURNEY_ITEM_COMPLETED_EVENT, { detail: { id: module.id } }));
    onRecorded();
  };

  return (
    <section className="mf mf--outro" aria-label={module.headline}>
      <div className="mf__stage" data-place-state="open">
        <p className="mf__eyebrow">{module.eyebrow}</p>
        <h1 className="mf__headline">{module.headline}</h1>
        <p className="mf__silhouette">{MASTERMIND_TASK}</p>

        {said && guest ? (
          <GuestSaveCard next={`${MASTERMIND_ROUTE}?step=record`} />
        ) : said ? (
          <fieldset className="mf__rate" aria-describedby={note ? `${labelId}-note` : undefined}>
            <legend className="mf__rate-q" id={labelId}>
              How much did this resonate, {RATING_MIN}–{RATING_MAX}? Tap a number to record it.
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
                  onClick={() => record(n)}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="mf__rate-note" id={`${labelId}-note`} role="status">
              {note}
            </p>
          </fieldset>
        ) : (
          <button type="button" className="mf__go" disabled={userId === undefined} onClick={() => setSaid(true)}>
            {MASTERMIND_DID_IT} <span aria-hidden="true">→</span>
          </button>
        )}
      </div>
    </section>
  );
};

export default CircleRecord;
