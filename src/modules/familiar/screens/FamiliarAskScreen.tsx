/**
 * Screen 2 · Ask: one text box, three tap-to-fill examples, the three gifts lit or dim.
 * Spec: docs/specs/ai-familiar/ai-familiar_tracker.md §1.3, §1.5 (skip path to the Outro).
 */
import { useId, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import GiftChips from "../GiftChips";
import { EXAMPLE_QUESTIONS } from "../exampleQuestions";
import type { FamiliarState } from "../types";
import "@/components/game/ModuleForm.css";

type Props = {
  state: FamiliarState;
  initialQuestion: string;
  onSubmit: (question: string) => void;
  /** «Skip the test, give me my AI»: straight to the Outro. */
  onSkip: () => void;
};

const FamiliarAskScreen = ({ state, initialQuestion, onSubmit, onSkip }: Props) => {
  const { t } = useTranslation();
  const inputId = useId();
  const [question, setQuestion] = useState(initialQuestion);
  const ready = question.trim().length > 0;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (ready) onSubmit(question.trim());
  };

  return (
    <section className="mf mf--outro" aria-label={t("familiar.ask.aria", { defaultValue: "Ask your question" })}>
      <Link className="mf__back" to="/game/your-ai">
        {t("familiar.back", { defaultValue: "← Back" })}
      </Link>
      <div className="mf__stage" data-place-state="open">
        <p className="mf__eyebrow">{t("familiar.ask.eyebrow", { defaultValue: "Your AI" })}</p>
        <form className="mf__choice" onSubmit={submit}>
          <label className="mf__choice-q" htmlFor={inputId}>
            {t("familiar.ask.label", { defaultValue: "Ask something real." })}
          </label>
          <textarea
            id={inputId}
            className="mf__choice-input"
            rows={4}
            maxLength={1000}
            placeholder={t("familiar.ask.placeholder", { defaultValue: "What are you deciding right now?" })}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <ul className="m-0 mt-3 flex w-full list-none flex-col gap-2 p-0" aria-label={t("familiar.ask.examples", { defaultValue: "Examples" })}>
            {EXAMPLE_QUESTIONS.map((ex) => (
              <li key={ex.key}>
                <button
                  type="button"
                  className="mf__choice-btn w-full text-left"
                  style={{ textTransform: "none", letterSpacing: "0.02em", fontSize: 14, padding: "10px 14px", marginTop: 0 }}
                  onClick={() => setQuestion(t(`familiar.ask.example.${ex.key}`, { defaultValue: ex.text }))}
                >
                  {t(`familiar.ask.example.${ex.key}`, { defaultValue: ex.text })}
                </button>
              </li>
            ))}
          </ul>

          <p className="mf__rate-note" style={{ marginTop: 22 }}>
            {t("familiar.ask.brings", { defaultValue: "Your AI will bring:" })}
          </p>
          <GiftChips gifts={state.gifts} />

          <button type="submit" className="mf__go" disabled={!ready}>
            {t("familiar.ask.cta", { defaultValue: "See both answers" })} <span aria-hidden="true">→</span>
          </button>
        </form>
        <button
          type="button"
          className="mf__choice-btn"
          style={{ border: 0, textTransform: "none", letterSpacing: "0.02em", fontSize: 15, textDecoration: "underline" }}
          onClick={onSkip}
        >
          {t("familiar.ask.skip", { defaultValue: "Skip the test, give me my AI" })}
        </button>
      </div>
    </section>
  );
};

export default FamiliarAskScreen;
