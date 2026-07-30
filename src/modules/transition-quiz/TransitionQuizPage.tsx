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
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GOLD_TEXT_STYLE, Ornament } from "@/lib/landingDesign";
import { EditorialCta } from "@/components/ui/editorial-cta";
import brandLogo from "@/assets/you-be-original-main-lockup.webp";
import { trackPageView, trackCTAClick } from "@/lib/funnelAnalytics";
import { TESTIMONIALS } from "@/data/testimonials";
import {
  type BuyingFrame,
  type CoreAnswers,
  type EmergingWorkStage,
  type Means,
  type Stage,
  type UniquenessCategory,
  chapterKeyForStage,
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
  | "loading"
  | "result"
  | "buyingFrame"
  | "means";

const BACK_MAP: Partial<Record<Screen, Screen>> = {
  q1: "entry",
  notYet: "q1",
  q2: "q1",
  q3: "q2",
  result: "q3",
  buyingFrame: "result",
  means: "buyingFrame",
};

const PROGRESS: Partial<Record<Screen, number>> = {
  q1: 0.2,
  q2: 0.5,
  q3: 0.82,
  loading: 0.95,
};

// Quiz v2.1 analytics wiring (§5) — per-screen mount events. "notYet",
// "loading", and "buyingFrame" are intentionally left unmapped: loading
// is a transitional beat, buyingFrame's own answer produces the CTA-click
// event below, and notYet's stage is already implied by quiz_q1.
const SCREEN_TO_ANALYTICS_STEP: Partial<Record<Screen, import("@/lib/funnelAnalytics").FunnelStep>> = {
  entry: "quiz_entry",
  q1: "quiz_q1",
  q2: "quiz_q2",
  q3: "quiz_q3",
  means: "quiz_means",
};

const STORAGE_KEY = "evolver_transition_quiz_v2";
export const DIRECTION_CALL_HREF = "https://cal.com/aleksandrkonstantinov/direction-choice-call";

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
  "suspected",
  "felt",
  "named",
  "built",
  "working",
  "delivering",
];
const BUYING_FRAME_VALUES: BuyingFrame[] = ["open", "mixed", "open_no_history", "closed"];
const MEANS_VALUES: Means[] = ["yes_comfortably", "yes_if_fit", "maybe_depending", "not_now"];

interface PersistedState {
  screen: Screen;
  stage: Stage | null;
  uniqueness: UniquenessCategory | null;
  emergingWorkStage: EmergingWorkStage | null;
  buyingFrame: BuyingFrame | null;
  means: Means | null;
}

const initialState: PersistedState = {
  screen: "entry",
  stage: null,
  uniqueness: null,
  emergingWorkStage: null,
  buyingFrame: null,
  means: null,
};

function loadInitial(): PersistedState {
  if (typeof window === "undefined") return initialState;

  const params = new URLSearchParams(window.location.search);
  const shared = params.get("r");
  if (shared) {
    const decoded = decodeShareState(shared);
    if (decoded) {
      const hasCore = Boolean(decoded.uniqueness && decoded.emergingWorkStage);
      return {
        screen: hasCore ? "result" : "notYet",
        stage: decoded.stage as Stage,
        uniqueness: decoded.uniqueness ?? null,
        emergingWorkStage: decoded.emergingWorkStage ?? null,
        buyingFrame: decoded.buyingFrame ?? null,
        means: decoded.means ?? null,
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
  const [resultId, setResultId] = useState<string | null>(null);
  const loggedRef = useRef<string | null>(null);
  const screenRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* private mode / storage full — resuming just won't work, non-fatal */
    }
  }, [state]);

  const { screen, stage, uniqueness, emergingWorkStage, buyingFrame, means } = state;
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
    if (!stage || !uniqueness || !emergingWorkStage) return null;
    return { stage, uniqueness, emergingWorkStage };
  }, [stage, uniqueness, emergingWorkStage]);

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
      buying_frame?: string | null;
      means?: string | null;
      direction_call_shown?: boolean | null;
      result_template?: string | null;
      route_shown?: string | null;
      email?: string | null;
    }) => {
      // Returns the invoke promise so callers that need the inserted row's
      // id (permalink, Recognition Delta) can read it; still fire-and-forget
      // for everyone else — the .catch here means it never rejects upward.
      return supabase.functions
        .invoke("save-quiz-result", { body: { ...payload, locale: i18n.language } })
        .catch(() => {
          /* dataset logging is best-effort — never blocks or alters the UI */
          return null;
        });
    },
    [i18n.language],
  );

  useEffect(() => {
    if (screen === "notYet" && stage && loggedRef.current !== `notyet-${stage}`) {
      loggedRef.current = `notyet-${stage}`;
      logCompletion({ stage, not_yet: true }).then((res) => {
        const id = res && "data" in res ? (res.data as { id?: string } | null)?.id : undefined;
        if (id) setResultId(id);
      });
    }
    if (screen === "result" && coreAnswers && routing && loggedRef.current !== `result-${stage}`) {
      loggedRef.current = `result-${stage}`;
      const resultTemplate = routing.route === "crossedPeer" ? "crossed_peer" : coreAnswers.uniqueness;
      logCompletion({
        stage: coreAnswers.stage,
        not_yet: false,
        uniqueness_category: coreAnswers.uniqueness,
        emerging_work_stage: coreAnswers.emergingWorkStage,
        direction_call_shown: routing.showBuyingFrame,
        result_template: resultTemplate,
        route_shown: routing.showBuyingFrame ? null : routing.route,
      }).then((res) => {
        const id = res && "data" in res ? (res.data as { id?: string } | null)?.id : undefined;
        if (id) setResultId(id);
      });
      trackPageView("quiz_result", `quiz_result_${resultTemplate}`);
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
        buying_frame: buyingFrame,
        direction_call_shown: true,
        result_template: coreAnswers.uniqueness,
        route_shown: routeAfterBuyingFrame(buyingFrame),
      });
    }
  }, [screen, buyingFrame, coreAnswers, logCompletion, stage]);

  // Log the Means answer as its own completion event (additive — doesn't
  // replace the Buying Frame row above). Only ever reached on ripe routes
  // after a non-"closed" Buying Frame answer.
  useEffect(() => {
    if (
      screen === "buyingFrame" &&
      means &&
      buyingFrame &&
      coreAnswers &&
      loggedRef.current !== `means-${stage}-${means}`
    ) {
      loggedRef.current = `means-${stage}-${means}`;
      logCompletion({
        stage: coreAnswers.stage,
        not_yet: false,
        uniqueness_category: coreAnswers.uniqueness,
        emerging_work_stage: coreAnswers.emergingWorkStage,
        buying_frame: buyingFrame,
        means,
        direction_call_shown: true,
        result_template: coreAnswers.uniqueness,
        route_shown: routeAfterBuyingFrame(buyingFrame),
      });
    }
  }, [screen, means, buyingFrame, coreAnswers, logCompletion, stage]);

  const submitEmail = useCallback(() => {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@") || !stage) return;
    logCompletion({ stage, not_yet: isNotYetStage(stage), email: trimmed });
    // Dedicated email-capture table (quiz_email_signups), separate from the
    // per-completion dataset row above. Same fire-and-forget contract: if
    // save-quiz-email isn't deployed yet in this environment, this silently
    // no-ops and the UI still shows success (graceful fallback).
    supabase.functions
      .invoke("save-quiz-email", { body: { email: trimmed, stage, locale: i18n.language } })
      .catch(() => {
        /* best-effort — never blocks or alters the UI */
      });
    setEmailSent(true);
  }, [email, stage, logCompletion, i18n.language]);

  // ── Share link for the finished result ──────────────────────────────────
  const shareUrl = useMemo(() => {
    if (!stage || typeof window === "undefined") return null;
    const token = encodeShareState({
      stage,
      uniqueness: uniqueness ?? undefined,
      emergingWorkStage: emergingWorkStage ?? undefined,
      buyingFrame: buyingFrame ?? undefined,
      means: means ?? undefined,
    });
    const url = new URL(window.location.href);
    url.search = `?r=${token}`;
    return url.toString();
  }, [stage, uniqueness, emergingWorkStage, buyingFrame, means]);

  useEffect(() => {
    if ((screen === "result" || screen === "notYet" || screen === "buyingFrame") && shareUrl && typeof window !== "undefined") {
      window.history.replaceState(null, "", shareUrl);
    }
  }, [screen, shareUrl]);

  // Brief loading beat between Q3 and the result (§Roast finding: not its
  // own atomic screen conceptually, but a short transition so the result
  // doesn't feel instant/cheap).
  useEffect(() => {
    if (screen !== "loading") return;
    const id = window.setTimeout(() => goTo("result"), 650);
    return () => window.clearTimeout(id);
  }, [screen, goTo]);

  // ── Analytics: per-screen mount events (quiz_entry, quiz_q1..quiz_q3) ────
  useEffect(() => {
    const step = SCREEN_TO_ANALYTICS_STEP[screen];
    if (step) trackPageView(step);
  }, [screen]);

  useEffect(() => {
    if (screen === "entry") return;
    const frame = window.requestAnimationFrame(() => {
      screenRef.current?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [screen]);

  const progress = PROGRESS[screen];
  const canGoBack = Boolean(BACK_MAP[screen]);
  const phase =
    screen === "entry"
      ? "threshold"
      : screen === "result" || screen === "notYet" || screen === "loading"
        ? "reveal"
        : screen === "buyingFrame" || screen === "means"
          ? "integration"
          : "concentration";

  return (
    <main className={`tq-page tq-phase-${phase}`}>
      <Helmet>
        <title>Where Are You — a free read of what chapter you're actually in</title>
        <meta
          name="description"
          content="Three questions. A free, honest read of what chapter you're in, why the pieces aren't lining up, and what is trying to happen next."
        />
      </Helmet>
      <div className="tq-shell">
        <QuizCorridorHeader progress={progress} />
        {canGoBack && (
          <button type="button" className="tq-back" onClick={goBack}>
            <ArrowLeft size={14} /> {t("quiz.back") as string}
          </button>
        )}

        <div ref={screenRef} className="tq-screen" tabIndex={-1}>
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
              resultId={resultId}
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
              onPick={(v) => goTo("loading", { emergingWorkStage: v })}
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
              onContinue={() => {
                if (routing.showBuyingFrame) {
                  trackCTAClick("quiz_cta_click", "direction_call_continue");
                  goTo("buyingFrame");
                }
              }}
              onRetake={reset}
              resultId={resultId}
            />
          )}

          {screen === "buyingFrame" && (
            <BuyingFrameScreen
              t={t}
              current={buyingFrame}
              means={means}
              onPick={(v) => goTo("buyingFrame", { buyingFrame: v })}
              onPickMeans={(v) => goTo("buyingFrame", { means: v })}
              route={buyingFrame ? routeAfterBuyingFrame(buyingFrame) : null}
              onRetake={reset}
            />
          )}
        </div>
      </div>
    </main>
  );
};

export function QuizCorridorHeader({ progress }: { progress?: number }) {
  const progressValue = typeof progress === "number" ? Math.round(progress * 100) : null;

  return (
    <header className="tq-corridor-header">
      <Link to="/" className="tq-corridor-logo" aria-label="Find Your Top Talent — home">
        <img src={brandLogo} alt="YOU — be original." draggable={false} />
      </Link>
      <div
        className={`tq-progress-bar${progressValue === null ? " is-idle" : ""}`}
        role={progressValue === null ? undefined : "progressbar"}
        aria-valuenow={progressValue ?? undefined}
        aria-valuemin={progressValue === null ? undefined : 0}
        aria-valuemax={progressValue === null ? undefined : 100}
        aria-valuetext={progressValue === null ? undefined : `${progressValue}% complete`}
      >
        <div className="tq-progress-bar-fill" style={{ width: `${progressValue ?? 0}%` }} />
      </div>
    </header>
  );
}

// ── S1 Entry ───────────────────────────────────────────────────────────────

function EntryScreen({ t, onStart }: { t: (k: string, o?: Record<string, unknown>) => unknown; onStart: () => void }) {
  return (
    <section className="tq-card tq-inscribed tq-entry-card">
      <p className="tq-eyebrow-gold" style={GOLD_TEXT_STYLE}>
        {t("quiz.entry.eyebrow") as string}
      </p>
      <h1 className="tq-h1">{t("quiz.entry.title") as string}</h1>
      <Ornament className="tq-ornament" />
      <p className="tq-sub tq-quiet-line">{t("quiz.entry.honestyLine") as string}</p>
      <div className="tq-cta-row tq-cta-row-center">
        <EditorialCta
          className="tq-primary-cta"
          label={t("quiz.entry.cta") as string}
          onClick={onStart}
        />
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
    <section className="tq-card tq-inscribed">
      <p className="tq-question-count">{t("quiz.progressLabel", { current: 1, total: 3 }) as string}</p>
      <p className="tq-question-prompt">{t("quiz.q1.prompt") as string}</p>
      <div className={`tq-options${options.length >= 6 ? " tq-options--dense" : ""}`}>
        {options.map((opt, i) => (
          <button
            key={i}
            type="button"
            className={`tq-option${selected === i ? " is-selected" : ""}`}
            onClick={() => handlePick(i)}
            aria-pressed={selected === i}
            disabled={selected !== null}
          >
            <span className="tq-option-letter">{selected === i ? <Check size={13} /> : i + 1}</span>
            <span>{opt}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

// ── Save my read (permalink) + Recognition Delta — Quiz v2.1 ────────────
// Shared across every result variant (full read, not-yet, peer ending).
// Both degrade silently: no id yet (save-quiz-result hasn't returned, or
// the environment doesn't have it deployed) means neither widget renders.

function SaveMyRead({
  t,
  resultId,
  stage,
}: {
  t: (k: string, o?: Record<string, unknown>) => unknown;
  resultId: string | null;
  stage: Stage | null;
}) {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  // Day 139 (Sasha 2026-07-30): "Save my read" now asks for an email and
  // sends the permalink there, matching the map-email pattern elsewhere in
  // the quiz. The copy-link path stays as a quiet secondary once sent.
  const [open, setOpen] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const [sent, setSent] = useState(false);

  if (!resultId || typeof window === "undefined") return null;

  const permalink = `${window.location.origin}/quiz/r/${resultId}`;

  const handleSend = () => {
    const trimmed = emailValue.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) return;
    trackCTAClick("quiz_permalink_saved", "save_my_read_email");
    // Fire-and-forget, same graceful contract as the map email capture.
    supabase.functions
      .invoke("save-quiz-email", {
        body: { email: trimmed, stage, locale, source: `save_read:${resultId}` },
      })
      .catch(() => {});
    setSent(true);
  };

  return (
    <div className="tq-save-read" style={{ marginTop: 14 }}>
      {!open && !sent && (
        <button
          type="button"
          className="tq-link-quiet"
          onClick={() => setOpen(true)}
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          {t("quiz.saveRead.label") as string}
        </button>
      )}
      {open && !sent && (
        <div className="tq-email-row">
          <input
            type="email"
            className="tq-email-input"
            value={emailValue}
            placeholder={t("quiz.notYet.settled.emailPlaceholder") as string}
            onChange={(e) => setEmailValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button type="button" className="tq-email-cta" onClick={handleSend}>
            {t("quiz.saveRead.sendCta") as string}
          </button>
        </div>
      )}
      {sent && (
        <p className="tq-sub tq-quiet-line">
          {t("quiz.saveRead.sentConfirmation") as string}{" "}
          <a className="tq-link-quiet" href={permalink}>
            {t("quiz.saveRead.orOpenLink") as string}
          </a>
        </p>
      )}
    </div>
  );
}

const RECOGNITION_DELTA_VALUES = [1, 2, 3, 4, 5] as const;

function RecognitionDelta({ t, resultId }: { t: (k: string, o?: Record<string, unknown>) => unknown; resultId: string | null }) {
  const [answered, setAnswered] = useState(false);

  if (!resultId) return null;

  const options = t("quiz.recognitionDelta.options", { returnObjects: true }) as Record<string, string>;

  const handlePick = (value: number) => {
    setAnswered(true); // optimistic — low-stakes, thank-you shows regardless
    trackCTAClick("quiz_delta_answered", "recognition_delta", { value });
    supabase.functions
      .invoke("save-quiz-result", { body: { id: resultId, recognition_delta: value } })
      .catch((err) => {
        console.warn("recognition_delta: save failed (non-fatal)", err);
      });
  };

  return (
    <div className="tq-section tq-recognition-delta" style={{ marginTop: 18 }}>
      {answered ? (
        <p className="tq-sub tq-quiet-line">{t("quiz.recognitionDelta.thankYou") as string}</p>
      ) : (
        <>
          <p className="tq-sub tq-quiet-line">{t("quiz.recognitionDelta.prompt") as string}</p>
          <div className="tq-options" style={{ marginTop: 8 }}>
            {RECOGNITION_DELTA_VALUES.map((v) => (
              <button key={v} type="button" className="tq-option" onClick={() => handlePick(v)}>
                <span>{options[String(v)]}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
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
  resultId,
}: {
  t: (k: string, o?: Record<string, unknown>) => unknown;
  stage: Stage;
  email: string;
  setEmail: (v: string) => void;
  emailSent: boolean;
  onSubmitEmail: () => void;
  onRetake: () => void;
  resultId: string | null;
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

        <p className="tq-sub tq-quiet-line" style={{ marginTop: 14 }}>
          {t("quiz.notYet.settled.giftLinePre") as string}
          <Link className="tq-link-quiet" to="/zone-of-genius">
            {t("quiz.notYet.settled.giftLinkLabel") as string}
          </Link>
          {t("quiz.notYet.settled.giftLinePost") as string}
        </p>

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

        <RecognitionDelta t={t} resultId={resultId} />
        <SaveMyRead t={t} resultId={resultId} stage={stage} />

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

      <p className="tq-sub tq-quiet-line">
        {content.giftPre}
        <Link className="tq-link-quiet" to="/zone-of-genius">
          {content.giftLinkLabel}
        </Link>
        {content.giftPost}
      </p>

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

      <RecognitionDelta t={t} resultId={resultId} />
      <SaveMyRead t={t} resultId={resultId} stage={stage} />

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
    <section className="tq-card tq-inscribed">
      <p className="tq-question-count">{t("quiz.progressLabel", { current: data.order, total: 3 }) as string}</p>
      {data.framing && <p className="tq-quiet-line">{data.framing}</p>}
      <p className="tq-question-prompt" style={data.framing ? { marginTop: 14 } : undefined}>{data.prompt}</p>
      <div className={`tq-options${values.length >= 6 ? " tq-options--dense" : ""}`}>
        {values.map((v, i) => (
          <button
            key={v}
            type="button"
            className={`tq-option${selected === v ? " is-selected" : ""}`}
            onClick={() => handlePick(v)}
            aria-pressed={selected === v}
            disabled={selected !== null}
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

export function ResultScreen({
  t,
  stageNames,
  answers,
  showBuyingFrame,
  route,
  onContinue,
  onRetake,
  resultId = null,
}: {
  t: (k: string, o?: Record<string, unknown>) => unknown;
  stageNames: Record<string, string>;
  answers: CoreAnswers;
  showBuyingFrame: boolean;
  route: "directionCall" | "crossedPeer" | "none";
  onContinue: () => void;
  onRetake: () => void;
  resultId?: string | null;
}) {
  if (route === "crossedPeer") {
    return (
      <section className="tq-card tq-result-card">
        <div className="tq-reveal">
          <p className="tq-eyebrow-gold" style={GOLD_TEXT_STYLE}>{t("quiz.result.stageLabel") as string}</p>
          <h2 className="tq-stage-name">{stageNames[String(answers.stage)]}</h2>
          <Ornament className="tq-ornament" />
          <StageArc stage={answers.stage} stageNames={stageNames} crossed />
        </div>

        <div className="tq-integration">
          <div className="tq-section" style={{ marginTop: 0 }}>
            <h3 className="tq-beat-heading">{t("quiz.result.crossedPeer.heading") as string}</h3>
            <p className="tq-body-text">{t("quiz.result.crossedPeer.body1") as string}</p>
            <p className="tq-body-text">{t("quiz.result.crossedPeer.body2") as string}</p>
          </div>

          <hr className="tq-take-what-divider" />
          <p className="tq-body-text tq-take-what-note">{t("quiz.result.takeWhatNote") as string}</p>

          <RecognitionDelta t={t} resultId={resultId} />

          <div className="tq-cta-block">
            <a
              className="tq-editorial-link-cta tq-door-cta"
              href={DIRECTION_CALL_HREF}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackCTAClick("quiz_cta_click", "crossed_peer_cta")}
            >
              {t("quiz.result.crossedPeer.cta") as string} <ArrowUpRight size={16} />
            </a>
          </div>

          <SaveMyRead t={t} resultId={resultId} stage={answers.stage} />

          <button type="button" className="tq-retake" onClick={onRetake}>
            {t("quiz.notYet.retake") as string}
          </button>
        </div>
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

  return (
    <section className="tq-card tq-result-card">
      <div className="tq-reveal">
        <p className="tq-eyebrow-gold" style={GOLD_TEXT_STYLE}>{t("quiz.result.stageLabel") as string}</p>
        <h2 className="tq-stage-name">{stageNames[String(answers.stage)]}</h2>
        <Ornament className="tq-ornament" />
        <StageArc stage={answers.stage} stageNames={stageNames} />
        <p className="tq-body-text tq-measure">{chapter}</p>
      </div>

      <div className="tq-integration">
        <div className="tq-section">
          <h3 className="tq-beat-heading">{beats.heading}</h3>
          <p className="tq-body-text tq-measure">{beats.body}</p>
          <p className="tq-body-text tq-quiet-line tq-measure">{workClause}</p>
        </div>

        <BelievabilityQuote t={t} stage={answers.stage} />

        <div className="tq-section">
          <p className="tq-eyebrow-gold" style={GOLD_TEXT_STYLE}>{t("quiz.result.nextLabel") as string}</p>
          <p className="tq-body-text tq-measure">{beats.nextMove}</p>
        </div>

        <hr className="tq-take-what-divider" />
        <p className="tq-body-text tq-take-what-note">{t("quiz.result.takeWhatNote") as string}</p>

        <RecognitionDelta t={t} resultId={resultId} />

        <div className="tq-cta-block">
          {showBuyingFrame ? (
            <>
              <p className="tq-body-text tq-quiet-line">
                {t("quiz.result.selectionNote") as string}
              </p>
              <EditorialCta
                className="tq-door-cta"
                icon={null}
                label={t("quiz.result.continueCta") as string}
                onClick={onContinue}
              />
            </>
          ) : (
            <p className="tq-cta-sub" style={{ marginTop: 0 }}>
              {t("quiz.result.honestEnding") as string}
            </p>
          )}
        </div>

        <SaveMyRead t={t} resultId={resultId} stage={answers.stage} />

        <button type="button" className="tq-retake" onClick={onRetake}>
          {t("quiz.notYet.retake") as string}
        </button>
      </div>
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
      <div className="tq-stage-arc-track" role="list">
        {stages.map((n) => (
          <span
            key={n}
            role="listitem"
            aria-current={n === activeStage ? "step" : undefined}
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

// ── Believability line (SOW item 5, visual harmony pass) ────────────────
// Full-read result only (stages 4-7, non-peer). One real quote from
// src/data/testimonials.ts, chosen per stage range: 4-5 gets the most
// transition-flavored quote (still crossing), 6-7 gets the most
// built-flavored one (something already stood up and working). Quotes are
// rendered verbatim, original language, never machine-translated — only
// the intro line is localized.

function BelievabilityQuote({ t, stage }: { t: (k: string, o?: Record<string, unknown>) => unknown; stage: Stage }) {
  // Sergey Jay Makarov (index 0): "applying force, wrong vector, now
  // everything clicks" — the exact shape of stages 4-5, still crossing.
  // Alexey Utkin (index 5): "a tool that just plain works" — the built,
  // already-working shape of stages 6-7.
  const testimonial = stage <= 5 ? TESTIMONIALS[0] : TESTIMONIALS[5];

  return (
    <div className="tq-section tq-believability">
      <p className="tq-quiet-line">{t("quiz.result.believability.intro") as string}</p>
      <blockquote className="tq-believability-quote">
        “{testimonial.shortQuote}”
        <cite className="tq-believability-name">{testimonial.name}</cite>
      </blockquote>
    </div>
  );
}

// ── Optional Buying Frame qualifier + Direction Call bridge (§10, §13) ───

function BuyingFrameScreen({
  t,
  current,
  means,
  onPick,
  onPickMeans,
  route,
  onRetake,
}: {
  t: (k: string, o?: Record<string, unknown>) => unknown;
  current: BuyingFrame | null;
  means: Means | null;
  onPick: (v: BuyingFrame) => void;
  onPickMeans: (v: Means) => void;
  route: "directionCall" | "crossedPeer" | "none" | null;
  onRetake: () => void;
}) {
  const options = t("quiz.buyingFrame.options", { returnObjects: true }) as Record<string, string>;
  const meansOptions = t("quiz.means.options", { returnObjects: true }) as Record<string, string>;

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

  // The Means companion question (Gate 2), asked once, after any
  // non-"closed" Buying Frame answer and before the Direction Call door.
  if (route === "directionCall" && !means) {
    return (
      <section className="tq-card">
        <p className="tq-question-prompt">{t("quiz.means.prompt") as string}</p>
        <div className="tq-options">
          {MEANS_VALUES.map((v, i) => (
            <button key={v} type="button" className="tq-option" onClick={() => onPickMeans(v)}>
              <span className="tq-option-letter">{i + 1}</span>
              <span>{meansOptions[v]}</span>
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
          <a
            className="tq-editorial-link-cta"
            href={DIRECTION_CALL_HREF}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackCTAClick("quiz_cta_click", "direction_call_book")}
          >
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
