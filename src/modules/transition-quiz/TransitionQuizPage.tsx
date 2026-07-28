// Transition Quiz — "Where Are You" — /quiz.
//
// Public, no auth, mobile-first. Spec: docs/specs/quiz/quiz_product_spec.md.
// Nothing is withheld: every stage gets the complete diagnosis for free.
// Persistence to Supabase (save-quiz-result) is fire-and-forget, for the
// Ripeness Vector dataset only — it never gates or delays the free result.
//
// Screens: S1 Entry -> S2 Placement -> S3 Stage Read -> branch:
//   stages 1-3: S3a (Settled | Itch/Tremors "not yet")
//   stages 4-7: S4a/b/c (Identity/Economy/Fit) -> S5 Spread -> S6 Zoom -> S7 Path

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { ArrowUpRight, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  ASPECTS,
  type Aspect,
  type AspectAnswers,
  type Stage,
  decodeShareState,
  diagnose,
  encodeShareState,
  isNotYetStage,
  notYetVariant,
  scoreAllAspects,
  type Route,
} from "./engine";
import "./TransitionQuizPage.css";

type Screen =
  | "entry"
  | "placement"
  | "stageRead"
  | "notYet"
  | "identity"
  | "economy"
  | "fit"
  | "spread"
  | "zoom"
  | "path";

const STORAGE_KEY = "evolver_transition_quiz_v1";

interface PersistedState {
  screen: Screen;
  stage: Stage | null;
  identity: (number | null)[];
  economy: (number | null)[];
  fit: (number | null)[];
}

const emptyAnswers = (): (number | null)[] => [null, null, null];

const initialState: PersistedState = {
  screen: "entry",
  stage: null,
  identity: emptyAnswers(),
  economy: emptyAnswers(),
  fit: emptyAnswers(),
};

const ROUTE_HREFS: Record<Route, string> = {
  directionCall: "https://cal.com/aleksandrkonstantinov/exploration",
  session: "/ignite",
  built: "/products/built",
  node: "https://t.me/integralevolution",
  none: "#",
};

const EXTERNAL_ROUTES: Route[] = ["directionCall", "node"];

interface QuestionShape {
  prompt: string;
  options: string[];
}

function loadInitial(): PersistedState {
  if (typeof window === "undefined") return initialState;

  const params = new URLSearchParams(window.location.search);
  const shared = params.get("r");
  if (shared) {
    const decoded = decodeShareState(shared);
    if (decoded) {
      return {
        screen: decoded.identity && decoded.economy && decoded.fit ? "path" : "notYet",
        stage: decoded.stage as Stage,
        identity: decoded.identity ? [...decoded.identity] : emptyAnswers(),
        economy: decoded.economy ? [...decoded.economy] : emptyAnswers(),
        fit: decoded.fit ? [...decoded.fit] : emptyAnswers(),
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
  const loggedRef = useRef<string | null>(null); // guards double-fire of the completion log

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* private mode / storage full — resuming just won't work, non-fatal */
    }
  }, [state]);

  const { screen, stage } = state;

  const stageNames = t("quiz.stageNames", { returnObjects: true }) as Record<string, string>;

  const goTo = useCallback((next: Screen, patch: Partial<PersistedState> = {}) => {
    setState((s) => ({ ...s, ...patch, screen: next }));
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

  // ── Diagnosis (only meaningful once all three aspects are answered) ────
  const allAnswered = (arr: (number | null)[]): arr is number[] => arr.every((v) => v !== null);

  const diagnosis = useMemo(() => {
    if (!allAnswered(state.identity) || !allAnswered(state.economy) || !allAnswered(state.fit)) {
      return null;
    }
    const answers: AspectAnswers = {
      identity: state.identity as [number, number, number],
      economy: state.economy as [number, number, number],
      fit: state.fit as [number, number, number],
    };
    return diagnose(scoreAllAspects(answers));
  }, [state.identity, state.economy, state.fit]);

  // ── Fire-and-forget completion logging ──────────────────────────────────
  const logCompletion = useCallback(
    (payload: {
      stage: number;
      identity_score?: number | null;
      economy_score?: number | null;
      fit_score?: number | null;
      bottleneck_aspect?: Aspect | null;
      driver_aspect?: Aspect | null;
      pattern?: string | null;
      route_shown?: string | null;
      email?: string | null;
      not_yet: boolean;
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
    if (screen === "path" && stage && diagnosis && loggedRef.current !== `path-${stage}`) {
      loggedRef.current = `path-${stage}`;
      logCompletion({
        stage,
        identity_score: diagnosis.scores.identity,
        economy_score: diagnosis.scores.economy,
        fit_score: diagnosis.scores.fit,
        bottleneck_aspect: diagnosis.bottleneck,
        driver_aspect: diagnosis.driver,
        pattern: diagnosis.pattern,
        route_shown: diagnosis.route,
        not_yet: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, stage, diagnosis]);

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
      identity: allAnswered(state.identity) ? (state.identity as [number, number, number]) : undefined,
      economy: allAnswered(state.economy) ? (state.economy as [number, number, number]) : undefined,
      fit: allAnswered(state.fit) ? (state.fit as [number, number, number]) : undefined,
    });
    const url = new URL(window.location.href);
    url.search = `?r=${token}`;
    return url.toString();
  }, [stage, state.identity, state.economy, state.fit]);

  useEffect(() => {
    if ((screen === "path" || screen === "notYet") && shareUrl && typeof window !== "undefined") {
      window.history.replaceState(null, "", shareUrl);
    }
  }, [screen, shareUrl]);

  return (
    <main className="tq-page">
      <Helmet>
        <title>Where Are You — a free diagnostic of your professional transition</title>
        <meta
          name="description"
          content="A free, three-minute read of exactly where you are in your professional transition: your stage, your bottleneck, and what happens next."
        />
      </Helmet>
      <div className="tq-shell">
        {screen === "entry" && <EntryScreen t={t} onStart={() => goTo("placement")} />}

        {screen === "placement" && (
          <PlacementScreen
            t={t}
            onPick={(value) => {
              const picked = (value + 1) as Stage;
              goTo("stageRead", { stage: picked });
            }}
          />
        )}

        {screen === "stageRead" && stage && (
          <StageReadScreen
            t={t}
            stage={stage}
            stageNames={stageNames}
            onContinue={() => goTo(isNotYetStage(stage) ? "notYet" : "identity")}
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

        {screen === "identity" && (
          <AspectScreen
            t={t}
            aspect="identity"
            answers={state.identity}
            onAnswer={(i, v) => {
              const next = [...state.identity];
              next[i] = v;
              setState((s) => ({ ...s, identity: next }));
            }}
            onContinue={() => goTo("economy")}
          />
        )}

        {screen === "economy" && (
          <AspectScreen
            t={t}
            aspect="economy"
            answers={state.economy}
            onAnswer={(i, v) => {
              const next = [...state.economy];
              next[i] = v;
              setState((s) => ({ ...s, economy: next }));
            }}
            onContinue={() => goTo("fit")}
          />
        )}

        {screen === "fit" && (
          <AspectScreen
            t={t}
            aspect="fit"
            answers={state.fit}
            onAnswer={(i, v) => {
              const next = [...state.fit];
              next[i] = v;
              setState((s) => ({ ...s, fit: next }));
            }}
            onContinue={() => goTo("spread")}
          />
        )}

        {screen === "spread" && diagnosis && (
          <SpreadScreen t={t} diagnosis={diagnosis} onContinue={() => goTo("zoom")} />
        )}

        {screen === "zoom" && diagnosis && stage && (
          <ZoomScreen t={t} stage={stage} bottleneck={diagnosis.bottleneck} onContinue={() => goTo("path")} />
        )}

        {screen === "path" && diagnosis && stage && (
          <PathScreen t={t} stage={stage} stageNames={stageNames} diagnosis={diagnosis} onRetake={reset} />
        )}
      </div>
    </main>
  );
};

// ── S1 Entry ───────────────────────────────────────────────────────────────

function EntryScreen({ t, onStart }: { t: (k: string, o?: Record<string, unknown>) => unknown; onStart: () => void }) {
  return (
    <section className="tq-card">
      <p className="tq-eyebrow">{t("quiz.entry.eyebrow") as string}</p>
      <h1 className="tq-h1">{t("quiz.entry.title") as string}</h1>
      <p className="tq-sub">{t("quiz.entry.subtitle") as string}</p>
      <div className="tq-cta-row">
        <button type="button" className="tq-cta tq-cta-primary" onClick={onStart}>
          {t("quiz.entry.cta") as string}
        </button>
      </div>
    </section>
  );
}

// ── S2 Placement ─────────────────────────────────────────────────────────

function PlacementScreen({ t, onPick }: { t: (k: string, o?: Record<string, unknown>) => unknown; onPick: (index: number) => void }) {
  const options = t("quiz.placement.options", { returnObjects: true }) as string[];
  const [selected, setSelected] = useState<number | null>(null);

  const handlePick = (index: number) => {
    setSelected(index);
    window.setTimeout(() => onPick(index), 260);
  };

  return (
    <section className="tq-card">
      <p className="tq-label">{t("quiz.placement.prompt") as string}</p>
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

// ── S3 Stage Read ────────────────────────────────────────────────────────

function StageReadScreen({
  t,
  stage,
  stageNames,
  onContinue,
}: {
  t: (k: string, o?: Record<string, unknown>) => unknown;
  stage: Stage;
  stageNames: Record<string, string>;
  onContinue: () => void;
}) {
  const descriptions = t("quiz.stageRead.descriptions", { returnObjects: true }) as Record<string, string>;
  const notYet = isNotYetStage(stage);
  return (
    <section className="tq-card">
      <p className="tq-label">{t("quiz.stageRead.stageLabel") as string}</p>
      <h2 className="tq-stage-name">{stageNames[String(stage)]}</h2>
      <div className="tq-section">
        <p className="tq-label">{t("quiz.stageRead.trueNowLabel") as string}</p>
        <p className="tq-body-text">{descriptions[String(stage)]}</p>
      </div>
      <div className="tq-cta-row">
        <button type="button" className="tq-cta tq-cta-primary" onClick={onContinue}>
          {(notYet ? t("quiz.stageRead.ctaStages1to3") : t("quiz.stageRead.ctaStages4to7")) as string}
        </button>
      </div>
    </section>
  );
}

// ── S3a Not-Yet (two variants) ───────────────────────────────────────────

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
        <a
          className="tq-link-quiet"
          href="https://t.me/integralevolution"
          target="_blank"
          rel="noreferrer"
        >
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

  // itch (stage 2) / tremors (stage 3)
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

// ── S4a/b/c Aspect Questions ─────────────────────────────────────────────

function AspectScreen({
  t,
  aspect,
  answers,
  onAnswer,
  onContinue,
}: {
  t: (k: string, o?: Record<string, unknown>) => unknown;
  aspect: Aspect;
  answers: (number | null)[];
  onAnswer: (questionIndex: number, value: number) => void;
  onContinue: () => void;
}) {
  const data = t(`quiz.aspects.${aspect}`, { returnObjects: true }) as {
    title: string;
    cta: string;
    questions: QuestionShape[];
  };
  const aspectIndex = ASPECTS.indexOf(aspect);
  const allAnswered = answers.every((v) => v !== null);

  return (
    <section className="tq-card">
      <div className="tq-progress">
        {ASPECTS.map((a, i) => (
          <span key={a} className={`tq-progress-dot${i <= aspectIndex ? " is-filled" : ""}`} />
        ))}
      </div>
      <p className="tq-label">{data.title}</p>

      {data.questions.map((q, qi) => (
        <div className="tq-section" key={qi}>
          <p className="tq-body-text" style={{ marginTop: 0, fontWeight: 600 }}>
            {q.prompt}
          </p>
          <div className="tq-options">
            {q.options.map((opt, oi) => {
              const value = oi + 1;
              const selected = answers[qi] === value;
              return (
                <button
                  key={oi}
                  type="button"
                  className={`tq-option${selected ? " is-selected" : ""}`}
                  onClick={() => onAnswer(qi, value)}
                >
                  <span className="tq-option-letter">{selected ? <Check size={13} /> : value}</span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="tq-cta-row">
        <button type="button" className="tq-cta tq-cta-primary" disabled={!allAnswered} onClick={onContinue}>
          {data.cta}
        </button>
      </div>
    </section>
  );
}

// ── S5 The Spread ────────────────────────────────────────────────────────

function SpreadScreen({
  t,
  diagnosis,
  onContinue,
}: {
  t: (k: string, o?: Record<string, unknown>) => unknown;
  diagnosis: ReturnType<typeof diagnose>;
  onContinue: () => void;
}) {
  const names = t("quiz.aspects.names", { returnObjects: true }) as Record<Aspect, string>;
  const { scores, bottleneck, driver } = diagnosis;

  return (
    <section className="tq-card">
      <h2 className="tq-h1" style={{ fontSize: "1.6rem" }}>
        {t("quiz.spread.title") as string}
      </h2>
      <p className="tq-sub">{t("quiz.spread.subtitle") as string}</p>

      <div className="tq-spread-row">
        {ASPECTS.map((aspect) => {
          const isBottleneck = aspect === bottleneck;
          const isDriver = aspect === driver && driver !== bottleneck;
          return (
            <div className="tq-spread-aspect" key={aspect}>
              <div className="tq-spread-aspect-head">
                <span>{names[aspect]}</span>
                {isBottleneck && (
                  <span className="tq-spread-tag is-bottleneck">{t("quiz.spread.bottleneckLabel") as string}</span>
                )}
                {isDriver && (
                  <span className="tq-spread-tag is-driver">{t("quiz.spread.driverLabel") as string}</span>
                )}
              </div>
              <div className="tq-arc-track">
                <div
                  className={`tq-arc-fill${isBottleneck ? " is-bottleneck" : ""}${isDriver ? " is-driver" : ""}`}
                  style={{ width: `${(scores[aspect] / 7) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
        <div className="tq-arc-scale">
          <span>1</span>
          <span>7</span>
        </div>
      </div>

      <div className="tq-cta-row">
        <button type="button" className="tq-cta tq-cta-primary" onClick={onContinue}>
          {t("quiz.spread.cta") as string}
        </button>
      </div>
    </section>
  );
}

// ── S6 The Zoom ──────────────────────────────────────────────────────────

function ZoomScreen({
  t,
  stage,
  bottleneck,
  onContinue,
}: {
  t: (k: string, o?: Record<string, unknown>) => unknown;
  stage: Stage;
  bottleneck: Aspect;
  onContinue: () => void;
}) {
  const reads = t(`quiz.zoom.reads.${bottleneck}`, { returnObjects: true }) as Record<string, string>;
  const stageKey = String(Math.max(4, Math.min(7, stage)));

  return (
    <section className="tq-card">
      <h2 className="tq-h1" style={{ fontSize: "1.6rem" }}>
        {t("quiz.zoom.title") as string}
      </h2>
      <p className="tq-body-text">{reads[stageKey]}</p>
      <div className="tq-cta-row">
        <button type="button" className="tq-cta tq-cta-primary" onClick={onContinue}>
          {t("quiz.zoom.cta") as string}
        </button>
      </div>
    </section>
  );
}

// ── S7 The Path ──────────────────────────────────────────────────────────

function PathScreen({
  t,
  stage,
  stageNames,
  diagnosis,
  onRetake,
}: {
  t: (k: string, o?: Record<string, unknown>) => unknown;
  stage: Stage;
  stageNames: Record<string, string>;
  diagnosis: ReturnType<typeof diagnose>;
  onRetake: () => void;
}) {
  const names = t("quiz.aspects.names", { returnObjects: true }) as Record<Aspect, string>;
  const nextMove = t("quiz.path.nextMove", { returnObjects: true }) as Record<string, string>;
  const trap = t("quiz.path.trap", { returnObjects: true }) as Record<string, string>;
  const stageKey = String(Math.max(4, Math.min(7, stage)));
  const { bottleneck, route } = diagnosis;
  const routeData = t(`quiz.path.routes.${route}`, { returnObjects: true }) as { label: string; sub: string };
  const isExternal = EXTERNAL_ROUTES.includes(route);

  return (
    <section className="tq-card">
      <p className="tq-label">{t("quiz.path.title") as string}</p>

      <div className="tq-section" style={{ marginTop: 10 }}>
        <p className="tq-label">{t("quiz.path.stageLabel") as string}</p>
        <h2 className="tq-stage-name" style={{ fontSize: "1.9rem" }}>
          {stageNames[String(stage)]}
        </h2>
      </div>

      <div className="tq-section">
        <p className="tq-label">{t("quiz.path.bottleneckLabel") as string}</p>
        <p className="tq-body-text" style={{ marginTop: 4, fontWeight: 600 }}>
          {names[bottleneck]}
        </p>
      </div>

      <div className="tq-section">
        <p className="tq-label">{t("quiz.path.nextMoveLabel") as string}</p>
        <p className="tq-body-text">{nextMove[stageKey]}</p>
      </div>

      <div className="tq-section">
        <p className="tq-label">{t("quiz.path.trapLabel") as string}</p>
        <p className="tq-body-text">{trap[stageKey]}</p>
      </div>

      <div className="tq-route-block">
        {route !== "none" && (
          <>
            {isExternal ? (
              <a
                className="tq-cta tq-cta-primary"
                href={ROUTE_HREFS[route]}
                target="_blank"
                rel="noreferrer"
              >
                {routeData.label} <ArrowUpRight size={16} />
              </a>
            ) : (
              <a className="tq-cta tq-cta-primary" href={ROUTE_HREFS[route]}>
                {routeData.label}
              </a>
            )}
            <p className="tq-cta-sub">{routeData.sub}</p>
          </>
        )}
      </div>

      <button type="button" className="tq-retake" onClick={onRetake}>
        {t("quiz.path.retake") as string}
      </button>
    </section>
  );
}

export default TransitionQuizPage;
