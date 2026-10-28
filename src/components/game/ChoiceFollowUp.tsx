import { useState } from "react";
import { useParams } from "react-router-dom";
import { useModuleChoices } from "@/hooks/useModuleChoice";
import {
  FOLLOWUPS,
  FOLLOWUP_LABELS,
  followupDue,
  followupLine,
  type Followup,
} from "@/data/journeyChoices";
import "./ChoiceFollowUp.css";

/**
 * ChoiceFollowUp — one quiet line on the village map (WP-19).
 * Design: docs/02-strategy/game_of_being_you.md §15.5.
 *
 * «Last week you chose “…”. How did it go?» with three plain answers: Yes · Partly · Not yet.
 * Never a score, never a streak. One choice at a time (the oldest not yet answered), shown
 * only to the player whose choice it is, only a few days after they made it, and only on the
 * map (`/village`, not inside a place). «Not now» hides it for a few days; it never nags.
 *
 * It renders nothing for a guest, while loading, when the table is missing or when no choice
 * is due, so it can sit next to <Village /> without that page knowing about it.
 */

const SNOOZE_KEY = "fytt:choice-followup-snooze:";
const SNOOZE_DAYS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

const snoozed = (stepId: string): boolean => {
  try {
    const until = Number(window.localStorage.getItem(SNOOZE_KEY + stepId));
    return Number.isFinite(until) && until > Date.now();
  } catch {
    return false;
  }
};

const snooze = (stepId: string) => {
  try {
    window.localStorage.setItem(SNOOZE_KEY + stepId, String(Date.now() + SNOOZE_DAYS * DAY_MS));
  } catch {
    // storage unavailable: it hides for this visit only
  }
};

const ChoiceFollowUp = () => {
  const { place } = useParams();
  const mine = useModuleChoices();
  const [hidden, setHidden] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [thanks, setThanks] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);

  if (place) return null;
  if (!mine.available || !mine.signedIn || mine.loading) return null;

  const now = new Date();
  const due = mine.choices.find((c) => followupDue(c, now) && !hidden.includes(c.step_id) && !snoozed(c.step_id));

  if (thanks && !due) {
    return (
      <p className="cfu" role="status">
        Thank you.
      </p>
    );
  }
  if (!due) return null;

  const reply = async (value: Followup) => {
    if (busy) return;
    setBusy(true);
    setFailed(null);
    const res = await mine.answer(due.step_id, value);
    setBusy(false);
    if (res.ok === false) {
      setFailed(res.message);
      return;
    }
    setThanks(true);
    window.setTimeout(() => setThanks(false), 4000);
  };

  const dismiss = () => {
    snooze(due.step_id);
    setHidden((prev) => [...prev, due.step_id]);
  };

  return (
    <aside className="cfu" aria-label="A choice you made">
      <p className="cfu__line">{followupLine(due, now)}</p>
      <div className="cfu__row">
        {FOLLOWUPS.map((value) => (
          <button key={value} type="button" className="cfu__btn" disabled={busy} onClick={() => reply(value)}>
            {FOLLOWUP_LABELS[value]}
          </button>
        ))}
        <button type="button" className="cfu__btn cfu__btn--quiet" onClick={dismiss}>
          Not now
        </button>
      </div>
      <p className="cfu__note" role="status">
        {failed}
      </p>
    </aside>
  );
};

export default ChoiceFollowUp;
