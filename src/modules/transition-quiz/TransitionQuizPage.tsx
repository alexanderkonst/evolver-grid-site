// Transition Quiz — "Where Are You" — /quiz. vNext (lean 4-question edition).
//
// Public, no auth, mobile-first. Design source: the GFOA design conversation
// ("ChatGPT-Relational Operating Field.md"), final locked SOW §1-18. That
// SOW supersedes the earlier 17-question design found earlier in the same
// conversation. Spec record: docs/specs/quiz/quiz_product_spec.md.
//
// Screens: S1 Entry -> Q1 stage placement -> branch:
//   stages 1-3: not-yet ending (settled | itch/tremors), no ask, no CTA;
//   stages 4-7: Q2 uniqueness -> Q3 emerging-work stage -> Q4 clarity
//     unlock -> brief loading -> 3-beat result -> (conditionally) the
//     optional Buying Frame qualifier -> Direction Call bridge or a plain,
//     honest ending.
//
// Nothing is withheld: every path gets the complete result for free.
// Persistence to Supabase (save-quiz-result) is fire-and-forget, for the
// dataset only — it never gates or delays the free result.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GOLD_TEXT_STYLE, Ornament } from "@/lib/landingDesign";
import { EditorialCta } from "@/components/ui/editorial-cta";
import {
  type BuyingFrame,
  type ClarityUnlock,
  type CoreAnswers,
  type EmergingWorkStage,
  type Stage,
  type UniquenessCategory,
  chapterKeyForStage,
  clarityClauseKey,
  computeRouting,
  decodeShareState,
  encodeShareState,
  isNotYetStage,
  notYetVariant,
  resultTemplateKey,
  routeAfterBuyingFrame,
  workStageClauseKey,
} from "./engine";
import "./TransitionQuizPage.css";

type Screen =
  | "entry"
  | "q1"
  | "notYet"
  | "q2"
  | "q3"
  | "q4"
  | "loading"
  | "result"
  | "buyingFrame";

const BACK_MAP: Partial<Record<Screen, Screen>> = {
  q1: "entry",
  notYet: "q1",
  q2: "q1",
  q3: "q2",
  q4: "q3",
  result: "q4",
  buyingFrame: "result",
};

const PROGRESS: Partial<Record<Screen, number>> = {
  q1: 0.15,
  q2: 0.4,
  q3: 0.62,
  q4: 0.84,
  loading: 0.95,
};

const STORAGE_KEY = "evolver_transition_quiz_v2";
const DIRECTION_CALL_HREF = "https://cal.com/aleksandrkonstantinov/exploration";

const UNIQUENESS_VALUES: UniquenessCategory[] = [
  "discovery",
  "recognition",
  "integration",
  "vehicle",
  "transmission",
  "scaling",
];
const WORK_STAGE_VALUES: EmergingWorkStage[] = [
  "not_visible",
  "fragments",
  "felt",
  "named",
  "built",
  "working",
];
const CLARITY_VALUES: ClarityUnlock[] = [
  "personal",
  "direction",
  "current_work",
  "emerging_business",
  "near_term_exchange",
];
const BUYING_FRAME_VALUES: BuyingFrame[] = ["open", "mixed", "open_no_history", "closed"];

interface PersistedState {
  screen: Screen;
  stage: Stage | null;
  uniqueness: UniquenessCategory | null;
  emergingWorkStage: EmergingWorkStage | null;
  clarityUnlock: ClarityUnlock | null;
  buyingFrame: BuyingFrame | null;
}

const initialState: PersistedState = {
  screen: "entry",
  stage: null,
  uniqueness: null,
  emergingWorkStage: null,
  clarityUnlock: null,
  buyingFrame: null,
};

function loadInitial(): PersistedState {
  if (typeof window === "undefined") return initialState;

  const params = new URLSearchParams(window.location.search);
  const shared = params.get("r");
  if (shared) {
    const decoded = decodeShareState(shared);
    if (decoded) {
      const hasCore = Boolean(decoded.uniqueness && decoded.emergingWorkStage && decoded.clarityUnlock);
      return {
        screen: hasCore ? "result" : "notYet",
        stage: decoded.stage as Stage,
        uniqueness: decoded.uniqueness ?? null,
        emergingWorkStage: decoded.emergingWorkStage ?? null,
        clarityUnlock: decoded.clarityUnlock ?? null,
        buyingFrame: decoded.buyingFrame ?? null,
      };
    }
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...initialState, ...JSON.parse(raw) };
  } catch {
    /* ignore corrupt storage */
  }
  return initialState;
}

const TransitionQuizPage = () => {
  const { t, i18n } = useTranslation();
  const [state, setState] = useState<PersistedState>(loadInitial);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const loggedRef = useRef<string | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* private mode / storage full — resuming just won't work, non-fatal */
    }
  }, [state]);

  const { screen, stage, uniqueness, emergingWorkStage, clarityUnlock, buyingFrame } = state;
  const stageNames = t("quiz.stageNames", { returnObjects: true }) as Record<string, string>;

  const goTo = useCallback((next: Screen, patch: Partial<PersistedState> = {}) => {
    setState((s) => ({ ...s, ...patch, screen: next }));
  }, []);

  const goBack = useCallback(() => {
    setState((s) => {
      const prev = BACK_MAP[s.screen];
      if (!prev) return s;
      return { ...s, screen: prev };
    });
  }, []);

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setEmail("");
    setEmailSent(false);
    setState(initialState);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.search = "";
      window.history.replaceState(null, "", url.toString());
    }
  }, []);

  const coreAnswers: CoreAnswers | null = useMemo(() => {
    if (!stage || !uniqueness || !emergingWorkStage || !clarityUnlock) return null;
    return { stage, uniqueness, emergingWorkStage, clarityUnlock };
  }, [stage, uniqueness, emergingWorkStage, clarityUnlock]);

  const routing = useMemo(() => (coreAnswers ? computeRouting(coreAnswers) : null), [coreAnswers]);

  const finalRoute = useMemo(() => {
    if (!routing) return "none" as const;
    if (!routing.showBuyingFrame) return routing.route;
    if (!buyingFrame) return routing.route; // not answered yet — provisional
    return routeAfterBuyingFrame(buyingFrame);
  }, [routing, buyingFrame]);

  // ── Fire-and-forget completion logging ──────────────────────────────────
  const logCompletion = useCallback(
    (payload: {
      stage: number;
      not_yet: boolean;
      uniqueness_category?: string | null;
      emerging_work_stage?: string | null;
      clarity_unlock?: string | null;
      buying_frame?: string | null;
      direction_call_shown?: boolean | null;
      result_template?: string | null;
      route_shown?: string | null;
      email?: string | null;
    }) => {
      supabase.functions
        .invoke("save-quiz-result", { body: { ...payload, locale: i18n.language } })
        .catch(() => {
          /* dataset logging is best-effort — never blocks or alters the UI */
        });
    },
    [i18n.language],
  );

  useEffect(() => {
    if (screen === "notYet" && stage && loggedRef.current !== `notyet-${stage}`) {
      loggedRef.current = `notyet-${stage}`;
      logCompletion({ stage, not_yet: true });
    }
    if (screen === "result" && coreAnswers && routing && loggedRef.current !== `result-${stage}`) {
      loggedRef.current = `result-${stage}`;
      logCompletion({
        stage: coreAnswers.stage,
        not_yet: false,
        uniqueness_category: coreAnswers.uniqueness,
        emerging_work_stage: coreAnswers.emergingWorkStage,
        clarity_unlock: coreAnswers.clarityUnlock,
        direction_call_shown: routing.showBuyingFrame,
        result_template: routing.route === "crossedPeer" ? "crossed_peer" : coreAnswers.uniqueness,
        route_shown: routing.showBuyingFrame ? null : routing.route,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, stage, coreAnswers, routing]);

  // Log the Buying Frame answer + final route as its own completion event
  // (additive — doesn't replace the result-completion row above).
  useEffect(() => {
    if (screen === "buyingFrame" && buyingFrame && coreAnswers && loggedRef.current !== `bf-${stage}-${buyingFrame}`) {
      loggedRef.current = `bf-${stage}-${buyingFrame}`;
      logCompletion({
        stage: coreAnswers.stage,
        not_yet: false,
        uniqueness_category: coreAnswers.uniqueness,
        emerging_work_stage: coreAnswers.emergingWorkStage,
        clarity_unlock: coreAnswers.clarityUnlock,
        buying_frame: buyingFrame,
        direction_call_shown: true,
        result_template: coreAnswers.uniqueness,
        route_shown: routeAfterBuyingFrame(buyingFrame),
      });
    }
  }, [screen, buyingFrame, coreAnswers, logCompletion, stage]);

  const submitEmail = useCallback(() => {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@") || !stage) return;
    logCompletion({ stage, not_yet: isNotYetStage(stage), email: trimmed });
    setEmailSent(true);
  }, [email, stage, logCompletion]);

  // ── Share link for the finished result ──────────────────────────────────
  const shareUrl = useMemo(() => {
    if (!stage || typeof window === "undefined") return null;
    const token = encodeShareState({
      stage,
      uniqueness: uniqueness ?? undefined,
      emergingWorkStage: emergingWorkStage ?? undefined,
      clarityUnlock: clarityUnlock ?? undefined,
      buyingFrame: buyingFrame ?? undefined,
    });
    const url = new URL(window.location.href);
    url.search = `?r=${token}`;
    return url.toString();
  }, [stage, uniqueness, emergingWorkStage, clarityUnlock, buyingFrame]);

  useEffect(() => {
    if ((screen === "result" || screen === "notYet" || screen === "buyingFrame") && shareUrl && typeof window !== "undefined") {
      window.history.replaceState(null, "", shareUrl);
    }
  }, [screen, shareUrl]);

  // Brief loading beat between Q4 and the result (§Roast finding: not its
  // own atomic screen conceptually, but a short transition so the result
  // doesn't feel instant/cheap).
  useEffect(() => {
    if (screen !== "loading") return;
    const id = window.setTimeout(() => goTo("result"), 650);
    return () => window.clearTimeout(id);
  }, [screen, goTo]);

  const progress = PROGRESS[screen];
  const canGoBack = Boolean(BACK_MAP[screen]);

  return (
    <main className="tq-page">
      <Helmet>
        <title>Where Are You — a free read of what chapter you're actually in</title>
        <meta
          name="description"
          content="Four questions. A free, honest read of what chapter you're in, why the pieces aren't lining up, and what is trying to happen next."
        />
      </Helmet>
      <div className="tq-shell">
        {typeof progress === "number" && (
          <div className="tq-progress-bar" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
            <div className="tq-progress-bar-fill" style={{ width: `${progress * 100}%` }} />
          </div>
        )}
        {canGoBack && (
          <button type="button" className="tq-back" onClick={goBack}>
            <ArrowLeft size={14} /> {t("quiz.back") as string}
          </button>
        )}

        {screen === "entry" && <EntryScreen t={t} onStart={() => goTo("q1")} />}

        {screen === "q1" && (
          <Q1Screen
            t={t}
            onPick={(index) => {
              const picked = (index + 1) as Stage;
              goTo(isNotYetStage(picked) ? "notYet" : "q2", { stage: picked });
            }}
          />
        )}

        {screen === "notYet" && stage && (
          <NotYetScreen
            t={t}
            stage={stage}
            email={email}
            setEmail={setEmail}
            emailSent={emailSent}
            onSubmitEmail={submitEmail}
            onRetake={reset}
          />
        )}

        {screen === "q2" && (
          <ChoiceScreen
            t={t}
            i18nKey="quiz.q2"
            values={UNIQUENESS_VALUES}
            current={uniqueness}
            onPick={(v) => goTo("q3", { uniqueness: v })}
          />
        )}

        {screen === "q3" && (
          <ChoiceScreen
            t={t}
            i18nKey="quiz.q3"
            values={WORK_STAGE_VALUES}
            current={emergingWorkStage}
            onPick={(v) => goTo("q4", { emergingWorkStage: v })}
          />
        )}

        {screen === "q4" && (
          <ChoiceScreen
            t={t}
            i18nKey="quiz.q4"
            values={CLARITY_VALUES}
            current={clarityUnlock}
            onPick={(v) => goTo("loading", { clarityUnlock: v })}
          />
        )}

        {screen === "loading" && <LoadingScreen t={t} />}

        {screen === "result" && coreAnswers && routing && (
          <ResultScreen
            t={t}
            stageNames={stageNames}
            answers={coreAnswers}
            showBuyingFrame={routing.showBuyingFrame}
            route={routing.route}
            onContinue={() => (routing.showBuyingFrame ? goTo("buyingFrame") : undefined)}
            onRetake={reset}
          />
        )}

        {screen === "buyingFrame" && (
          <BuyingFrameScreen
            t={t}
            current={buyingFrame}
            onPick={(v) => goTo("buyingFrame", { buyingFrame: v })}
            route={buyingFrame ? routeAfterBuyingFrame(buyingFrame) : null}
            onRetake={reset}
          />
        )}
      </div>
    </main>
  );
};

// ── S1 Entry ───────────────────────────────────────────────────────────────

function EntryScreen({ t, onStart }: { t: (k: string, o?: Record<string, unknown>) => unknown; onStart: () => void }) {
  return (
    <section className="tq-card tq-entry-card">
      <p className="tq-eyebrow-gold" style={GOLD_TEXT_STYLE}>
        {t("quiz.entry.eyebrow") as string}
      </p>
      <h1 className="tq-h1">{t("quiz.entry.title") as string}</h1>
      <Ornament className="tq-ornament" />
      <p className="tq-sub">{t("quiz.entry.subtitle") as string}</p>
      <p className="tq-sub tq-quiet-line">{t("quiz.entry.honestyLine") as string}</p>
      <div className="tq-cta-row tq-cta-row-center">
        <EditorialCta label={t("quiz.entry.cta") as string} onClick={onStart} />
      </div>
    </section>
  );
}

// ── Q1 stage placement ──────────────────────────────────────────────────

function Q1Screen({ t, onPick }: { t: (k: string, o?: Record<string, unknown>) => unknown; onPick: (index: number) => void }) {
  const options = t("quiz.q1.options", { returnObjects: true }) as string[];
  const [selected, setSelected] = useState<number | null>(null);

  const handlePick = (index: number) => {
    setSelected(index);
    window.setTimeout(() => onPick(index), 260);
  };

  return (
    <section className="tq-card">
      <p className="tq-question-count">{t("quiz.progressLabel", { current: 1, total: 4 }) as string}</p>
      <p className="tq-question-prompt">{t("quiz.q1.prompt") as string}</p>
      <div className="tq-options">
        {options.map((opt, i) => (
          <button
            key={i}
            type="button"
            className={`tq-option${selected === i ? " is-selected" : ""}`}
            onClick={() => handlePick(i)}
          >
            <span className="tq-option-letter">{selected === i ? <Check size={13} /> : i + 1}</span>
            <span>{opt}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

// ── S3a Not-Yet (stages 1-3 — standing law, carried forward unchanged) ───

function NotYetScreen({
  t,
  stage,
  email,
  setEmail,
  emailSent,
  onSubmitEmail,
  onRetake,
}: {
  t: (k: string, o?: Record<string, unknown>) => unknown;
  stage: Stage;
  email: string;
  setEmail: (v: string) => void;
  emailSent: boolean;
  onSubmitEmail: () => void;
  onRetake: () => void;
}) {
  const variant = notYetVariant(stage);

  if (variant === "settled") {
    return (
      <section className="tq-card">
        <h2 className="tq-h1" style={{ fontSize: "1.7rem" }}>
          {t("quiz.notYet.settled.title") as string}
        </h2>
        <p className="tq-body-text">{t("quiz.notYet.settled.line") as string}</p>
        <p className="tq-sub" style={{ marginTop: 18 }}>
          {t("quiz.notYet.settled.channelsLine") as string}
        </p>
        <a className="tq-link-quiet" href="https://t.me/integralevolution" target="_blank" rel="noreferrer">
          {t("quiz.notYet.settled.channelsLinkLabel") as string} <ArrowUpRight size={13} />
        </a>

        {!emailSent ? (
          <div className="tq-email-row">
            <p className="tq-label" style={{ marginTop: 8 }}>
              {t("quiz.notYet.settled.emailPrompt") as string}
            </p>
            <input
              className="tq-email-input"
              type="email"
              inputMode="email"
              placeholder={t("quiz.notYet.settled.emailPlaceholder") as string}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="button" className="tq-cta tq-cta-ghost" onClick={onSubmitEmail}>
              {t("quiz.notYet.settled.emailCta") as string}
            </button>
          </div>
        ) : (
          <p className="tq-success">{t("quiz.notYet.settled.emailSuccess") as string}</p>
        )}

        <button type="button" className="tq-retake" onClick={onRetake}>
          {t("quiz.notYet.retake") as string}
        </button>
      </section>
    );
  }

  const stageKey = String(stage);
  const content = t(`quiz.notYet.itchTremors.${stageKey}`, { returnObjects: true }) as Record<string, string>;
  const isItch = stage === 2;

  return (
    <section className="tq-card">
      <div className="tq-section" style={{ marginTop: 0 }}>
        <p className="tq-label">
          {(isItch ? t("quiz.notYet.itchTremors.turnsIntoLabel") : t("quiz.notYet.itchTremors.whyLabel")) as string}
        </p>
        <p className="tq-body-text">{isItch ? content.turnsInto : content.why}</p>
      </div>
      <div className="tq-section">
        <p className="tq-label">
          {(isItch ? t("quiz.notYet.itchTremors.signLabel") : t("quiz.notYet.itchTremors.nextLabel")) as string}
        </p>
        <p className="tq-body-text">{isItch ? content.sign : content.next}</p>
      </div>

      {!emailSent ? (
        <div className="tq-email-row">
          <p className="tq-label">{t("quiz.notYet.itchTremors.emailPrompt") as string}</p>
          <input
            className="tq-email-input"
            type="email"
            inputMode="email"
            placeholder={t("quiz.notYet.itchTremors.emailPlaceholder") as string}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="button" className="tq-cta tq-cta-primary" onClick={onSubmitEmail}>
            {t("quiz.notYet.itchTremors.emailCta") as string}
          </button>
          <button type="button" className="tq-skip" onClick={onRetake}>
            {t("quiz.notYet.itchTremors.skip") as string}
          </button>
        </div>
      ) : (
        <p className="tq-success">{t("quiz.notYet.itchTremors.emailSuccess") as string}</p>
      )}

      <button type="button" className="tq-retake" onClick={onRetake}>
        {t("quiz.notYet.retake") as string}
      </button>
    </section>
  );
}

// ── Q2 / Q3 / Q4 — generic single-question, single-select screen ────────

function ChoiceScreen<V extends string>({
  t,
  i18nKey,
  values,
  current,
  onPick,
}: {
  t: (k: string, o?: Record<string, unknown>) => unknown;
  i18nKey: string;
  values: V[];
  current: V | null;
  onPick: (value: V) => void;
}) {
  const data = t(i18nKey, { returnObjects: true }) as {
    order: number;
    prompt: string;
    framing?: string;
    options: Record<string, string>;
  };
  const [selected, setSelected] = useState<V | null>(current);

  const handlePick = (v: V) => {
    setSelected(v);
    window.setTimeout(() => onPick(v), 260);
  };

  return (
    <section className="tq-card">
      <p className="tq-question-count">{t("quiz.progressLabel", { current: data.order, total: 4 }) as string}</p>
      {data.framing && <p className="tq-quiet-line">{data.framing}</p>}
      <p className="tq-question-prompt" style={data.framing ? { marginTop: 14 } : undefined}>{data.prompt}</p>
      <div className="tq-options">
        {values.map((v, i) => (
          <button
            key={v}
            type="button"
            className={`tq-option${selected === v ? " is-selected" : ""}`}
            onClick={() => handlePick(v)}
          >
            <span className="tq-option-letter">{selected === v ? <Check size={13} /> : i + 1}</span>
            <span>{data.options[v]}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

// ── Loading beat ──────────────────────────────────────────────────────────

function LoadingScreen({ t }: { t: (k: string, o?: Record<string, unknown>) => unknown }) {
  return (
    <section className="tq-card tq-loading-card">
      <p className="tq-sub" style={{ textAlign: "center" }}>
        {t("quiz.loading") as string}
      </p>
    </section>
  );
}

// ── Result: the 3-beat lean architecture (§12) ───────────────────────────

function ResultScreen({
  t,
  stageNames,
  answers,
  showBuyingFrame,
  route,
  onContinue,
  onRetake,
}: {
  t: (k: string, o?: Record<string, unknown>) => unknown;
  stageNames: Record<string, string>;
  answers: CoreAnswers;
  showBuyingFrame: boolean;
  route: "directionCall" | "crossedPeer" | "none";
  onContinue: () => void;
  onRetake: () => void;
}) {
  if (route === "crossedPeer") {
    return (
      <section className="tq-card tq-result-card">
        <p className="tq-eyebrow-gold" style={GOLD_TEXT_STYLE}>{t("quiz.result.stageLabel") as string}</p>
        <h2 className="tq-stage-name">{stageNames[String(answers.stage)]}</h2>
        <Ornament className="tq-ornament" />
        <StageArc stage={answers.stage} stageNames={stageNames} crossed />

        <div className="tq-section" style={{ marginTop: 0 }}>
          <h3 className="tq-beat-heading">{t("quiz.result.crossedPeer.heading") as string}</h3>
          <p className="tq-body-text">{t("quiz.result.crossedPeer.body1") as string}</p>
          <p className="tq-body-text">{t("quiz.result.crossedPeer.body2") as string}</p>
        </div>

        <p className="tq-body-text tq-take-what-note">{t("quiz.result.takeWhatNote") as string}</p>

        <div className="tq-cta-block">
          <a className="tq-editorial-link-cta" href={DIRECTION_CALL_HREF} target="_blank" rel="noreferrer">
            {t("quiz.result.crossedPeer.cta") as string} <ArrowUpRight size={16} />
          </a>
        </div>

        <button type="button" className="tq-retake" onClick={onRetake}>
          {t("quiz.notYet.retake") as string}
        </button>
      </section>
    );
  }

  const chapter = t(chapterKeyForStage(answers.stage)) as string;
  const beats = t(resultTemplateKey(answers.uniqueness), { returnObjects: true }) as {
    heading: string;
    body: string;
    nextMove: string;
  };
  const workClause = t(workStageClauseKey(answers.emergingWorkStage)) as string;
  const clarityClause = t(clarityClauseKey(answers.clarityUnlock)) as string;

  return (
    <section className="tq-card tq-result-card">
      <p className="tq-eyebrow-gold" style={GOLD_TEXT_STYLE}>{t("quiz.result.stageLabel") as string}</p>
      <h2 className="tq-stage-name">{stageNames[String(answers.stage)]}</h2>
      <Ornament className="tq-ornament" />
      <StageArc stage={answers.stage} stageNames={stageNames} />
      <p className="tq-body-text tq-measure">{chapter}</p>

      <div className="tq-section">
        <h3 className="tq-beat-heading">{beats.heading}</h3>
        <p className="tq-body-text tq-measure">{beats.body}</p>
        <p className="tq-body-text tq-quiet-line tq-measure">{workClause}</p>
      </div>

      <div className="tq-section">
        <p className="tq-eyebrow-gold" style={GOLD_TEXT_STYLE}>{t("quiz.result.nextLabel") as string}</p>
        <p className="tq-body-text tq-measure">{beats.nextMove}</p>
        <p className="tq-body-text tq-quiet-line tq-measure">
          {t("quiz.result.clarityLead", { clause: clarityClause }) as string}
        </p>
      </div>

      <p className="tq-body-text tq-take-what-note">{t("quiz.result.takeWhatNote") as string}</p>

      <div className="tq-cta-block">
        {showBuyingFrame ? (
          <>
            <p className="tq-body-text tq-quiet-line">
              {t("quiz.result.selectionNote") as string}
            </p>
            <EditorialCta label={t("quiz.result.continueCta") as string} onClick={onContinue} />
          </>
        ) : (
          <p className="tq-cta-sub" style={{ marginTop: 0 }}>
            {t("quiz.result.honestEnding") as string}
          </p>
        )}
      </div>

      <button type="button" className="tq-retake" onClick={onRetake}>
        {t("quiz.notYet.retake") as string}
      </button>
    </section>
  );
}

// ── Trajectory arc marker — small horizontal 7-stage arc under the
// chapter name. The person's stage is marked with a filled gold star;
// only that stage's name is labeled beneath its marker, in gold
// smallcaps, per Sasha's result-ceremony spec. ─────────────────────────

function StageArc({
  stage,
  stageNames,
  crossed = false,
}: {
  stage: Stage;
  stageNames: Record<string, string>;
  crossed?: boolean;
}) {
  const activeStage = crossed ? 7 : stage;
  const stages = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="tq-stage-arc" aria-label={`Stage ${activeStage} of 7`}>
      <div className="tq-stage-arc-track">
        {stages.map((n) => (
          <span
            key={n}
            className={`tq-stage-arc-node${n === activeStage ? " is-active" : ""}${
              crossed && n === 7 ? " is-crossed" : ""
            }`}
          >
            {n === activeStage && <span className="tq-stage-arc-star">✦</span>}
          </span>
        ))}
      </div>
      <div className="tq-stage-arc-labels">
        {stages.map((n) => (
          <span key={n} className="tq-stage-arc-label">
            {n === activeStage ? stageNames[String(activeStage)] : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Optional Buying Frame qualifier + Direction Call bridge (§10, §13) ───

function BuyingFrameScreen({
  t,
  current,
  onPick,
  route,
  onRetake,
}: {
  t: (k: string, o?: Record<string, unknown>) => unknown;
  current: BuyingFrame | null;
  onPick: (v: BuyingFrame) => void;
  route: "directionCall" | "crossedPeer" | "none" | null;
  onRetake: () => void;
}) {
  const options = t("quiz.buyingFrame.options", { returnObjects: true }) as Record<string, string>;

  if (!current) {
    return (
      <section className="tq-card">
        <p className="tq-quiet-line">{t("quiz.buyingFrame.transitionLine") as string}</p>
        <p className="tq-question-prompt" style={{ marginTop: 14 }}>
          {t("quiz.buyingFrame.prompt") as string}
        </p>
        <div className="tq-options">
          {BUYING_FRAME_VALUES.map((v, i) => (
            <button key={v} type="button" className="tq-option" onClick={() => onPick(v)}>
              <span className="tq-option-letter">{i + 1}</span>
              <span>{options[v]}</span>
            </button>
          ))}
        </div>
      </section>
    );
  }

  if (route === "directionCall") {
    return (
      <section className="tq-card">
        <p className="tq-body-text">{t("quiz.directionCall.line1") as string}</p>
        <p className="tq-body-text">{t("quiz.directionCall.line2") as string}</p>
        <div className="tq-cta-block">
          <a className="tq-editorial-link-cta" href={DIRECTION_CALL_HREF} target="_blank" rel="noreferrer">
            {t("quiz.directionCall.cta") as string} <ArrowUpRight size={16} />
          </a>
          <p className="tq-cta-sub">{t("quiz.directionCall.sub") as string}</p>
        </div>
        <button type="button" className="tq-retake" onClick={onRetake}>
          {t("quiz.notYet.retake") as string}
        </button>
      </section>
    );
  }

  return (
    <section className="tq-card">
      <p className="tq-body-text">{t("quiz.buyingFrame.closedEnding") as string}</p>
      <button type="button" className="tq-retake" onClick={onRetake}>
        {t("quiz.notYet.retake") as string}
      </button>
    </section>
  );
}

export default TransitionQuizPage;
