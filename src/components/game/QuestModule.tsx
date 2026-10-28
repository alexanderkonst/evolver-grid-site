import { useEffect, useId, useState } from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import GuestSaveCard from "@/components/game/GuestSaveCard";
import ModuleIntro from "@/components/game/ModuleIntro";
import ModuleOutro from "@/components/game/ModuleOutro";
import { JOURNEY_ITEM_COMPLETED_EVENT } from "@/data/journeySequence";
import { RATING_MAX, RATING_MIN, getJourneyModule, isQuestStep, type JourneyModuleDef } from "@/data/journeyModules";
import { useJourneyVictory } from "@/hooks/useJourneyVictory";
import { useSessionUserId } from "@/hooks/useSessionUserId";
import { questRoute } from "@/lib/questBoard";
import "./ModuleForm.css";

/**
 * QuestModule — a real-world quest of the Quest Board as a Journey module (WP-11, J10–J12).
 * Design: docs/02-strategy/game_of_being_you.md §14.2, §14.4, §14.8 row WP-11, §14.12.
 *
 *   ModuleIntro (one button) → the task in the world → «I did it» → ModuleOutro → /village
 *
 * The task happens outside the game. «I did it» is the player's own word, and it is recorded
 * as their victory: one row in `journey_victories` (the player's own, RLS), written with the
 * 1–10 «How much did this resonate?» they pick at that moment. The Outro then shows the badge,
 * the real choice and the way back. `sales_events` is never written from here: a first sale is
 * a self-report (§14.2 J12), checkout data comes later.
 *
 * A guest can read the board, the Intro and the task. Recording a victory needs a save file,
 * so «I did it» asks for the account right there (`GuestSaveCard`, the Reception «Save your
 * character» pattern) and the magic link returns to the task.
 *
 * A quest already recorded opens straight on its Outro.
 */

type Stage = "pending" | "intro" | "task" | "outro";

const RATINGS = Array.from({ length: RATING_MAX - RATING_MIN + 1 }, (_, i) => RATING_MIN + i);

type TaskProps = {
  module: JourneyModuleDef;
  onRecorded: () => void;
};

const QuestTask = ({ module, onRecorded }: TaskProps) => {
  const userId = useSessionUserId();
  const victory = useJourneyVictory(module.id);
  const labelId = useId();
  const [said, setSaid] = useState(false);
  const [pending, setPending] = useState<number | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const quest = module.quest;
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
    // The seam: the save re-reads, so the village sees the victory (Town Hall) without a reload.
    window.dispatchEvent(new CustomEvent(JOURNEY_ITEM_COMPLETED_EVENT, { detail: { id: module.id } }));
    onRecorded();
  };

  return (
    <section className="mf mf--outro" aria-label={module.headline}>
      <Link className="mf__back" to="/game/journey">
        ← Quest Board
      </Link>
      <div className="mf__stage" data-place-state="open">
        <p className="mf__eyebrow">
          {module.eyebrow}
          {quest ? ` · ${quest.journey}` : ""}
        </p>
        <h1 className="mf__headline">{module.headline}</h1>
        <p className="mf__silhouette">{quest?.task}</p>

        {said && guest ? (
          <GuestSaveCard next={`${questRoute(module.id)}?step=task`} />
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
            {quest?.didIt ?? "I did it"} <span aria-hidden="true">→</span>
          </button>
        )}
      </div>
    </section>
  );
};

const QuestFlow = ({ module }: { module: JourneyModuleDef }) => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const victory = useJourneyVictory(module.id);
  const [stage, setStage] = useState<Stage>("pending");

  // Decide once, when the saved victory (if any) has been read.
  useEffect(() => {
    if (stage !== "pending" || victory.loading) return;
    if (victory.rating !== null) setStage("outro");
    else setStage(params.get("step") === "task" ? "task" : "intro");
  }, [stage, victory.loading, victory.rating, params]);

  if (stage === "pending") return null;
  if (stage === "intro") return <ModuleIntro module={module} onStart={() => setStage("task")} />;
  if (stage === "task") {
    return (
      <QuestTask
        module={module}
        onRecorded={() => {
          setStage("outro");
          // Drop «?step=task» from the address: a reload now lands on the Outro.
          navigate(questRoute(module.id), { replace: true });
        }}
      />
    );
  }
  return <ModuleOutro module={module} />;
};

const QuestModule = () => {
  const { questId } = useParams();
  const module = isQuestStep(questId) ? getJourneyModule(questId) : undefined;
  if (!module) return <Navigate to="/game/journey" replace />;
  return <QuestFlow key={module.id} module={module} />;
};

export default QuestModule;
