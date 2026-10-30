/**
 * Screen 3 · Reveal, `mode: "self"` (the guided self-experiment, no backend):
 *   1. ask the question in a plain chat
 *   2. ask the same question with your prompt
 *   3. notice the difference, rate it 1–10 (optional)
 * Spec: docs/specs/ai-familiar/ai-familiar_tracker.md §1.3, §1 «Honest split». The rating goes to
 * `resonance_events` with `message_seen = "familiar reveal"`. «Hear why →» appears once the player
 * has rated, or says they would rather not.
 */
import { useId, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AskMyAiButton from "../AskMyAiButton";
import ChatAppPicker from "../ChatAppPicker";
import GiftChips from "../GiftChips";
import { chatAppName, chatAppUrl } from "../chatApps";
import { copyText } from "../copyText";
import { recordRating } from "../recordRating";
import { getRating, setRating } from "../storage";
import type { ChatApp, CompareResult, FamiliarState } from "../types";
import "@/components/game/ModuleForm.css";

const MODE: CompareResult["mode"] = "self";
const RATINGS = Array.from({ length: 10 }, (_, i) => i + 1);

type Props = {
  state: FamiliarState;
  question: string;
  app: ChatApp;
  onApp: (app: ChatApp) => void;
  onNext: () => void;
};

const Step = ({ n, text, children }: { n: number; text: string; children?: ReactNode }) => (
  <li className="flex w-full flex-col items-center gap-3">
    <p className="mf__fact m-0">
      <span className="mf__badge-date" style={{ marginRight: 8 }}>
        {n}
      </span>
      {text}
    </p>
    {children}
  </li>
);

const FamiliarRevealScreen = ({ state, question, app, onApp, onNext }: Props) => {
  const { t } = useTranslation();
  const labelId = useId();
  const [questionCopied, setQuestionCopied] = useState(false);
  const [rating, setRatingState] = useState<number | null>(() => getRating());
  const [pending, setPending] = useState<number | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [skipped, setSkipped] = useState(false);
  const name = chatAppName(app);

  const copyQuestion = async () => {
    const ok = await copyText(question);
    setQuestionCopied(ok);
  };

  const rate = async (value: number) => {
    if (pending !== null) return;
    setPending(value);
    setNote(null);
    const res = await recordRating(value, state, MODE);
    setPending(null);
    // Soft-fail like /ai-os: the player still moves on, the data point is what is lost.
    setRating(value);
    setRatingState(value);
    if (!res.ok) setNote(t("familiar.reveal.notSaved", { defaultValue: "Could not save your rating, but you can go on." }));
  };

  const canContinue = rating !== null || skipped;

  return (
    <section className="mf mf--outro" aria-label={t("familiar.reveal.aria", { defaultValue: "Compare the two answers" })}>
      <Link className="mf__back" to="/game/your-ai?step=ask">
        {t("familiar.back", { defaultValue: "← Back" })}
      </Link>
      <div className="mf__stage" data-place-state="open">
        <p className="mf__eyebrow">{t("familiar.reveal.eyebrow", { defaultValue: "Your AI · the test" })}</p>
        <figure className="mf__badge" style={{ margin: 0 }}>
          <figcaption className="mf__badge-name">{t("familiar.reveal.yourQuestion", { defaultValue: "Your question" })}</figcaption>
          <blockquote className="mf__result m-0" style={{ fontSize: "clamp(18px, 2.6vw, 26px)", overflowWrap: "anywhere" }}>
            {question}
          </blockquote>
        </figure>
        <p className="mf__fact" style={{ marginTop: 18, maxWidth: "40ch" }}>
          {t("familiar.reveal.sameModel", {
            defaultValue: "Same model on both sides. The only difference is what your AI carries.",
          })}
        </p>

        <ChatAppPicker
          value={app}
          onChange={onApp}
          legend={t("familiar.reveal.whichApp", { defaultValue: "Which chat app do you use?" })}
        />

        <ol className="m-0 mt-6 flex w-full max-w-md list-none flex-col gap-6 p-0">
          <Step
            n={1}
            text={t("familiar.reveal.step1", {
              app: name,
              defaultValue: "Open a plain {{app}} chat and ask your question. Read the answer.",
            })}
          >
            <span className="flex flex-wrap justify-center gap-2">
              <button type="button" className="mf__choice-btn" style={{ marginTop: 0 }} onClick={copyQuestion}>
                {questionCopied
                  ? t("familiar.reveal.copied", { defaultValue: "Copied" })
                  : t("familiar.reveal.copyQuestion", { defaultValue: "Copy my question" })}
              </button>
              <a
                className="mf__choice-btn inline-flex items-center"
                style={{ marginTop: 0 }}
                href={chatAppUrl(app)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("familiar.reveal.open", { app: name, defaultValue: "Open {{app}}" })} <span aria-hidden="true">↗</span>
              </a>
            </span>
          </Step>

          <Step
            n={2}
            text={t("familiar.reveal.step2", {
              defaultValue: "Open a new chat with your AI, then ask the same question.",
            })}
          >
            <AskMyAiButton state={state} app={app} />
          </Step>

          <Step n={3} text={t("familiar.reveal.step3", { defaultValue: "Notice the difference." })} />
        </ol>

        {rating !== null ? (
          <p className="mf__rate-note" role="status">
            {t("familiar.reveal.thanks", { rating, defaultValue: "Thank you. You gave it {{rating}} of 10." })}
            {note ? ` ${note}` : ""}
          </p>
        ) : (
          <fieldset className="mf__rate" aria-describedby={note ? `${labelId}-note` : undefined}>
            <legend className="mf__rate-q" id={labelId}>
              {t("familiar.reveal.rateQ", { defaultValue: "How different is this, 1 to 10?" })}
            </legend>
            <div className="mf__rate-row" role="group" aria-labelledby={labelId}>
              {RATINGS.map((n) => (
                <button
                  key={n}
                  type="button"
                  className="mf__rate-btn"
                  aria-label={t("familiar.reveal.rateOf", { n, defaultValue: "{{n}} of 10" })}
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
        )}

        {canContinue ? (
          <button type="button" className="mf__go" onClick={onNext}>
            {t("familiar.reveal.cta", { defaultValue: "Hear why" })} <span aria-hidden="true">→</span>
          </button>
        ) : (
          <button
            type="button"
            className="mf__choice-btn"
            style={{ border: 0, textTransform: "none", letterSpacing: "0.02em", fontSize: 15, textDecoration: "underline" }}
            onClick={() => setSkipped(true)}
          >
            {t("familiar.reveal.skipRating", { defaultValue: "Skip rating" })}
          </button>
        )}

        <div className="mt-8 w-full">
          <GiftChips gifts={state.gifts} />
        </div>
      </div>
    </section>
  );
};

export default FamiliarRevealScreen;
