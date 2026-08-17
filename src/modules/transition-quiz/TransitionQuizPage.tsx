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
import { markDoorSeen } from "@/lib/doorRouter";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { rememberLocalQuizResult } from "@/lib/quizOwnership";
import { GOLD_TEXT_STYLE, Ornament } from "@/lib/landingDesign";
import { EditorialCta } from "@/components/ui/editorial-cta";
import brandLogo from "@/assets/you-be-original-main-lockup.webp";
import glowStar from "@/assets/mc-glow-star.png";
import lapisField from "@/assets/lapis-still-background.webp";
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
  isExtEligible,
  isNotSeeking,
  isNotYetStage,
  notYetVariant,
  resultTemplateKey,
  routeAfterBuyingFrame,
  workStageClauseKey,
} from "./engine";
import { ExtResultScreen } from "./ExtResultScreen";
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
  notYet: "q2",
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
  // The thread completes when the read arrives — the ritual closes at 100%,
  // it doesn't die at 95%.
  notYet: 1,
  result: 1,
  buyingFrame: 1,
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
// Display order = developmental formedness of the next chapter, low to high
// (Sasha, Day 148): a formless felt pull ("felt") is earlier than a
// content-bearing hypothesis about the thread among existing work
// ("suspected"), so "felt" precedes "suspected". Copy is looked up by value
// (ChoiceScreen: data.options[v]) and all routing keys off the value string,
// so this order only changes what the person sees — never a value↔copy or
// value↔routing pair.
const WORK_STAGE_VALUES: EmergingWorkStage[] = [
  "current_chapter",
  "not_visible",
  "felt",
  "suspected",
  "named",
  "built",
  "working",
  "delivering",
];
// Display order: history → openness → conditional → solo. One soft
// threshold question (Day 142) replaced the two blunt pay/means screens.
const BUYING_FRAME_VALUES: BuyingFrame[] = ["open", "open_no_history", "mixed", "closed"];
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

  // First-visit door (see src/lib/doorRouter.ts): visiting /quiz directly
  // counts as "seen" so a subsequent visit to `/` shows the real homepage.
  useEffect(() => {
    markDoorSeen();
  }, []);

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
        .invoke("save-quiz-result", {
          body: { ...payload, locale: i18n.language },
        })
        .catch(() => {
          /* dataset logging is best-effort — never blocks or alters the UI */
          return null;
        });
    },
    [i18n.language],
  );

  // Ownership is a separate authenticated action. The public logging
  // endpoint never accepts a user id; after it returns a row id, this
  // auth-gated claim attaches it to the caller's own account. Anonymous
  // completion remains fully useful and is remembered on this browser.
  const rememberAndClaim = useCallback(async (id?: string) => {
    rememberLocalQuizResult(id);
    if (!id) return;
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return;
      await supabase.functions.invoke("claim-quiz-result", {
        body: { id },
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Claiming is best-effort here. The result and its explicit save CTA
      // remain available even if the network drops at this exact moment.
    }
  }, []);

  useEffect(() => {
    if (screen === "notYet" && stage && loggedRef.current !== `notyet-${stage}`) {
      loggedRef.current = `notyet-${stage}`;
      rememberLocalQuizResult();
      logCompletion({
        stage,
        not_yet: true,
        uniqueness_category: uniqueness ?? null,
        // Early endings are a door too — without this the dataset can't tell
        // "no route recorded" from "not-yet ending shown" (2026-08-17 audit).
        route_shown: "notYet",
      }).then((res) => {
        const id = res && "data" in res ? (res.data as { id?: string } | null)?.id : undefined;
        if (id) {
          setResultId(id);
          void rememberAndClaim(id);
        }
      });
    }
    if (screen === "result" && coreAnswers && routing && loggedRef.current !== `result-${stage}`) {
      loggedRef.current = `result-${stage}`;
      rememberLocalQuizResult();
      const resultTemplate = routing.route === "crossedPeer" ? "crossed_peer" : coreAnswers.uniqueness;
      logCompletion({
        stage: coreAnswers.stage,
        not_yet: false,
        uniqueness_category: coreAnswers.uniqueness,
        emerging_work_stage: coreAnswers.emergingWorkStage,
        direction_call_shown: routing.showBuyingFrame,
        result_template: resultTemplate,
        // Always record the route actually rendered. When the Buying Frame
        // screen follows, the update branch below refines it to the
        // post-answer route on the SAME row.
        route_shown: routing.route,
      }).then((res) => {
        const id = res && "data" in res ? (res.data as { id?: string } | null)?.id : undefined;
        if (id) {
          setResultId(id);
          void rememberAndClaim(id);
        }
      });
      trackPageView("quiz_result", `quiz_result_${resultTemplate}`);
    }
  }, [screen, stage, coreAnswers, routing, logCompletion, rememberAndClaim, uniqueness]);


  // Log the Buying Frame answer + final route onto the SAME row as the
  // result completion above (data hygiene #22, 2026-07-30): one person's
  // passage should be one row, not fragments across additive inserts.
  // Update-in-place when resultId is already known; fall back to the old
  // additive insert only for the pre-deploy grace window (resultId not
  // yet returned, or the deployed edge function doesn't support updates).
  useEffect(() => {
    if (screen === "buyingFrame" && buyingFrame && coreAnswers && loggedRef.current !== `bf-${stage}-${buyingFrame}`) {
      loggedRef.current = `bf-${stage}-${buyingFrame}`;
      if (resultId) {
        supabase.functions
          .invoke("save-quiz-result", {
            body: {
              id: resultId,
              buying_frame: buyingFrame,
              direction_call_shown: true,
              route_shown: routeAfterBuyingFrame(buyingFrame),
            },
          })
          .catch(() => null);
      } else {
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
    }
  }, [screen, buyingFrame, coreAnswers, logCompletion, stage, resultId]);

  // Log the Means answer onto the same row too (data hygiene #22). Only
  // ever reached on ripe routes after a non-"closed" Buying Frame answer.
  useEffect(() => {
    if (
      screen === "buyingFrame" &&
      means &&
      buyingFrame &&
      coreAnswers &&
      loggedRef.current !== `means-${stage}-${means}`
    ) {
      loggedRef.current = `means-${stage}-${means}`;
      if (resultId) {
        supabase.functions
          .invoke("save-quiz-result", {
            body: {
              id: resultId,
              means,
              direction_call_shown: true,
              route_shown: routeAfterBuyingFrame(buyingFrame),
            },
          })
          .catch(() => null);
      } else {
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
    }
  }, [screen, means, buyingFrame, coreAnswers, logCompletion, stage, resultId]);


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
      {/* The lapis field — the same watercolor + gold-constellation ground
          the person just left on "/". The funnel is one continuous space;
          the quiz corridor keeps the field, with its calm ivory center
          carrying the reading. Sits under the paper grain and the phase
          vignette (see .tq-field / isolation in the CSS). */}
      <img className="tq-field" src={lapisField} alt="" aria-hidden="true" draggable={false} />
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
                // Everyone answers Q2: for stages 1-3 it primes monetizing
                // your uniqueness, which is exactly why the Top Talent
                // reveal on their ending reads as a logical free gift and
                // not a random link (Sasha, Day 144). Q3 stays
                // transition-only: asking a person with no next chapter
                // about their next chapter makes no sense.
                goTo("q2", { stage: picked });
              }}
            />
          )}

          {screen === "notYet" && stage && (
            <NotYetScreen
              t={t}
              stage={stage}
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
              onPick={(v) =>
                goTo(stage && isNotYetStage(stage) ? "notYet" : "q3", { uniqueness: v })
              }
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
            // Not-seeking gate: Q3 = "current_chapter" mirrors the stage-1
            // no-ask branch — no next-chapter read, no Direction Call, no
            // EXT/crossed-peer machinery. Checked before every other branch.
            isNotSeeking(coreAnswers) ? (
              <CurrentChapterScreen
                t={t}
                stage={coreAnswers.stage}
                stageNames={stageNames}
                resultId={resultId}
                onRetake={reset}
              />
            ) : // Result Experience EXT (Day 142) gate — change-map §5. Crossed
            // peers and every other combination fall through to v1's
            // ResultScreen, unmodified.
            routing.route !== "crossedPeer" && isExtEligible(coreAnswers) ? (
              <ExtResultScreen
                t={t}
                stageNames={stageNames}
                answers={coreAnswers}
                resultVersion="ext-a"
                resultId={resultId}
                onRetake={reset}
              />
            ) : (
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
            )
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

// ── Save my read (permalink) ────────────────────────────────────────────
// Lives in ./SaveMyRead so ExtResultScreen can use it without a cycle.




// Recognition Delta widget removed (Sasha, Day 142): the reflection ask ate
// prime real estate on the read and hedged it ("a halfway excuse"). The
// recognition_delta column and quiz.recognitionDelta keys remain for the
// dataset's history; nothing renders it anymore.

// ── Top Talent continuity layer (add-on) ─────────────────────────────────
// Three shared modules, reused across the live quiz AND the saved-result
// permalink so the hierarchy brief §12 requires never has to be
// reimplemented per surface. Stages 1-3 get the PRIMARY bridge (§5);
// stages 4-7 (both ResultScreen and ExtResultScreen) and crossed-peer get
// a visually quiet secondary/peer panel (§7/§13).

/** Stages 1-3 — the recommended primary next step after a complete
 *  not-yet result. `saved` only changes the analytics label suffix. */
export function TopTalentBridge({
  t,
  stage,
  saved = false,
}: {
  t: (k: string, o?: Record<string, unknown>) => unknown;
  stage: 1 | 2 | 3;
  saved?: boolean;
}) {
  return (
    <div className="tq-toptalent-bridge">
      <p className="tq-eyebrow-gold tq-toptalent-bridge-label" style={GOLD_TEXT_STYLE}>
        {t(`quiz.ext.topTalent.notYet.${stage}.label`) as string}
      </p>
      <p className="tq-toptalent-bridge-body">
        {t(`quiz.ext.topTalent.notYet.${stage}.body`) as string}
      </p>
      <Link
        className="tq-editorial-link-cta tq-door-cta tq-toptalent-bridge-cta"
        to="/zone-of-genius"
        onClick={() =>
          trackCTAClick("quiz_cta_click", `top_talent_notyet_${stage}`, { stage, saved })
        }
      >
        {t(`quiz.ext.topTalent.notYet.${stage}.cta`) as string}
      </Link>
      <p className="tq-toptalent-bridge-microcopy">
        {t("quiz.ext.topTalent.notYet.microcopy") as string}
      </p>
    </div>
  );
}

/** Stages 4-7 — quiet complementary layer, shown after the Next Chapter
 *  Map invitation (v1 ResultScreen and ExtResultScreen both use this). */
export function TopTalentSecondary({
  t,
  resultVersion,
  saved = false,
}: {
  t: (k: string, o?: Record<string, unknown>) => unknown;
  resultVersion?: string;
  saved?: boolean;
}) {
  // Stages 4-7 get exactly one call to action: the Direction Call. This
  // used to be a bordered five-part panel that outweighed the button it
  // sat next to, which is precisely what the add-on brief §11 forbids
  // ("visible editorial treatment, clearly subordinate"). It is now one
  // quiet line. The full framing still exists where Top Talent is the
  // primary route — the stages 1-3 bridge — and the longer copy stays in
  // the locale files, unused rather than deleted.
  return (
    <p className="tq-toptalent-quiet">
      <span className="tq-toptalent-quiet-label">
        {t("quiz.ext.topTalent.secondary.label") as string}:
      </span>{" "}
      <Link
        className="tq-toptalent-quiet-cta"
        to="/zone-of-genius"
        onClick={() =>
          trackCTAClick("quiz_cta_click", "top_talent_secondary", { resultVersion, saved })
        }
      >
        {t("quiz.ext.topTalent.secondary.cta") as string} <ArrowUpRight size={12} />
      </Link>
    </p>
  );
}

/** Crossed-peer — deeper-language framing, never "discover who you are". */
export function TopTalentPeer({
  t,
  saved = false,
}: {
  t: (k: string, o?: Record<string, unknown>) => unknown;
  saved?: boolean;
}) {
  return (
    <div className="tq-toptalent-secondary">
      <span className="tq-toptalent-secondary-label">
        {t("quiz.ext.topTalent.peer.label") as string}
      </span>
      <p className="tq-toptalent-secondary-body" style={{ marginTop: 2 }}>
        {t("quiz.ext.topTalent.peer.body") as string}
      </p>
      <Link
        className="tq-toptalent-secondary-cta"
        to="/zone-of-genius"
        onClick={() => trackCTAClick("quiz_cta_click", "top_talent_peer", { saved })}
      >
        {t("quiz.ext.topTalent.peer.cta") as string} <ArrowUpRight size={13} />
      </Link>
    </div>
  );
}

// ── S3a Not-Yet (stages 1-3 — standing law, carried forward unchanged) ───

function NotYetScreen({
  t,
  stage,
  onRetake,
  resultId,
}: {
  t: (k: string, o?: Record<string, unknown>) => unknown;
  stage: Stage;
  onRetake: () => void;
  resultId: string | null;
}) {
  const variant = notYetVariant(stage);
  const stageNames = t("quiz.stageNames", { returnObjects: true }) as Record<string, string>;

  // Stages 1-3 get the same chapter ceremony as the full read — eyebrow,
  // chapter name, arc. Three of seven entry answers land here; they deserve
  // to see the name of the chapter they were just placed in. All copy
  // below the ceremony is unchanged.
  const ceremony = (
    <div className="tq-notyet-reveal">
      <p className="tq-eyebrow-gold" style={GOLD_TEXT_STYLE}>{t("quiz.ext.chapter.eyebrow") as string}</p>
      <h2 className="tq-stage-name tq-stage-name--compact">{stageNames[String(stage)]}</h2>
      <StageArc stage={stage} stageNames={stageNames} />
    </div>
  );

  if (variant === "settled") {
    return (
      <section className="tq-card">
        {ceremony}
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

        <TopTalentBridge t={t} stage={stage as 1 | 2 | 3} />

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
      {ceremony}
      <div className="tq-section">
        <p className="tq-eyebrow-gold" style={GOLD_TEXT_STYLE}>
          {(isItch ? t("quiz.notYet.itchTremors.turnsIntoLabel") : t("quiz.notYet.itchTremors.whyLabel")) as string}
        </p>
        <p className="tq-body-text tq-notyet-body">{isItch ? content.turnsInto : content.why}</p>
      </div>
      <div className="tq-section">
        <p className="tq-eyebrow-gold" style={GOLD_TEXT_STYLE}>
          {(isItch ? t("quiz.notYet.itchTremors.signLabel") : t("quiz.notYet.itchTremors.nextLabel")) as string}
        </p>
        <p className="tq-body-text tq-notyet-body">{isItch ? content.sign : content.next}</p>
      </div>

      <TopTalentBridge t={t} stage={stage as 1 | 2 | 3} />

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
  const [pending, setPending] = useState(false);

  const handlePick = (v: V) => {
    if (pending) return;
    setSelected(v);
    setPending(true);
    window.setTimeout(() => onPick(v), 260);
  };


  return (
    <section className="tq-card tq-inscribed">
      <p className="tq-question-count">{t("quiz.progressLabel", { current: data.order, total: 3 }) as string}</p>
      <p className="tq-question-prompt">{data.prompt}</p>
      {data.framing && <p className="tq-quiet-line" style={{ marginTop: 10 }}>{data.framing}</p>}
      <div className={`tq-options${values.length >= 6 ? " tq-options--dense" : ""}`}>
        {values.map((v, i) => (
          <button
            key={v}
            type="button"
            className={`tq-option${selected === v ? " is-selected" : ""}`}
            onClick={() => handlePick(v)}
            aria-pressed={selected === v}
            disabled={pending}

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
// Result Experience v1 — Day 142 (historical, retained for rollback;
// superseded by ExtResultScreen for the representative pattern). Do not
// modify beyond this comment — see docs/specs/quiz/ext_implementation_brief.md
// §2 and docs/specs/quiz/result_experience_v1.md.

export function ResultScreen({
  t,
  stageNames,
  answers,
  showBuyingFrame,
  route,
  onContinue,
  onRetake,
  resultId = null,
  saved = false,
}: {
  t: (k: string, o?: Record<string, unknown>) => unknown;
  stageNames: Record<string, string>;
  answers: CoreAnswers;
  showBuyingFrame: boolean;
  route: "directionCall" | "crossedPeer" | "none";
  onContinue: () => void;
  onRetake: () => void;
  resultId?: string | null;
  /** True when rendered from the saved-result permalink — only changes the
   *  analytics `saved` property on the Top Talent CTA click (brief §14). */
  saved?: boolean;
}) {
  if (route === "crossedPeer") {
    return (
      <section className="tq-card tq-result-card">
        <div className="tq-reveal">
          <p className="tq-eyebrow-gold" style={GOLD_TEXT_STYLE}>{t("quiz.ext.chapter.eyebrow") as string}</p>
          <h2 className="tq-stage-name">{stageNames[String(answers.stage)]}</h2>
          <StageArc stage={answers.stage} stageNames={stageNames} crossed />
        </div>

        <div className="tq-integration">
          <div className="tq-section tq-central-read" style={{ marginTop: 0 }}>
            <h3 className="tq-beat-heading">{t("quiz.result.crossedPeer.heading") as string}</h3>
            <p className="tq-body-text">{t("quiz.result.crossedPeer.body1") as string}</p>
            <p className="tq-body-text">{t("quiz.result.crossedPeer.body2") as string}</p>
          </div>

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

          <TopTalentPeer t={t} saved={saved} />

          <button type="button" className="tq-retake" onClick={onRetake}>
            {t("quiz.notYet.retake") as string}
          </button>

          <Ornament className="tq-ornament tq-closing-seal" />
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
        <div className="tq-section tq-central-read">
          <h3 className="tq-beat-heading">{beats.heading}</h3>
          <p className="tq-body-text tq-measure">{beats.body}</p>
          <p className="tq-body-text tq-quiet-line tq-measure">{workClause}</p>
        </div>

        <BelievabilityQuote t={t} stage={answers.stage} />

        <div className="tq-section tq-next-door">
          <p className="tq-eyebrow-gold" style={GOLD_TEXT_STYLE}>{t("quiz.result.nextLabel") as string}</p>
          <p className="tq-body-text tq-measure">{beats.nextMove}</p>
        </div>

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

        <TopTalentSecondary t={t} resultVersion="v1" saved={saved} />

        <SaveMyRead t={t} resultId={resultId} stage={answers.stage} />

        <button type="button" className="tq-retake" onClick={onRetake}>
          {t("quiz.notYet.retake") as string}
        </button>

        <Ornament className="tq-ornament tq-closing-seal" />
      </div>
    </section>
  );
}

// ── Not-seeking ending (Q3 = "current_chapter") ──────────────────────────
// Mirrors the stage-1 no-ask branch in spirit: the chapter ceremony still
// shows (they did answer Q1, so their chapter is real information), but no
// next-chapter read, no Direction Call, no detours, no experiment — a
// short, no-pressure close instead.

export function CurrentChapterScreen({
  t,
  stage,
  stageNames,
  resultId,
  onRetake,
}: {
  t: (k: string, o?: Record<string, unknown>) => unknown;
  stage: Stage;
  stageNames: Record<string, string>;
  resultId: string | null;
  onRetake: () => void;
}) {
  return (
    <section className="tq-card tq-result-card">
      <div className="tq-reveal">
        <p className="tq-eyebrow-gold" style={GOLD_TEXT_STYLE}>{t("quiz.ext.chapter.eyebrow") as string}</p>
        <h2 className="tq-stage-name">{stageNames[String(stage)]}</h2>
        <StageArc stage={stage} stageNames={stageNames} />
      </div>

      <div className="tq-integration">
        <div className="tq-section tq-central-read" style={{ marginTop: 0 }}>
          <p className="tq-body-text tq-measure tq-notyet-body">{t("quiz.currentChapter.line") as string}</p>
        </div>

        {/* Same logic as the not-yet endings (Sasha, Day 144): this person
            is not seeking a next chapter, so Top Talent is the one primary
            next step, framed as the free way to make the current chapter
            work even better. */}
        <div className="tq-toptalent-bridge">
          <p className="tq-eyebrow-gold tq-toptalent-bridge-label" style={GOLD_TEXT_STYLE}>
            {t("quiz.ext.topTalent.currentChapter.label") as string}
          </p>
          <p className="tq-toptalent-bridge-body">
            {t("quiz.ext.topTalent.currentChapter.body") as string}
          </p>
          <Link
            className="tq-editorial-link-cta tq-door-cta tq-toptalent-bridge-cta"
            to="/zone-of-genius"
            onClick={() => trackCTAClick("quiz_cta_click", "top_talent_current_chapter")}
          >
            {t("quiz.ext.topTalent.currentChapter.cta") as string}
          </Link>
          <p className="tq-toptalent-bridge-microcopy">
            {t("quiz.ext.topTalent.notYet.microcopy") as string}
          </p>
        </div>

        <button type="button" className="tq-retake" onClick={onRetake}>
          {t("quiz.notYet.retake") as string}
        </button>

        <Ornament className="tq-ornament tq-closing-seal" />
      </div>
    </section>
  );
}

// ── Trajectory arc marker — small horizontal 7-stage arc under the
// chapter name. The person's stage is marked with a filled gold star;
// only that stage's name is labeled beneath its marker, in gold
// smallcaps, per Sasha's result-ceremony spec. ─────────────────────────

export function StageArc({
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

  // Vertical stepper. Seven chapter names never fit legibly on one
  // horizontal line (Day 148 — Sasha: "the names are crammed"); the modern
  // pattern for a named multi-stage journey with long labels is a vertical
  // timeline (one row per stage, position marked). It stays legible at any
  // width, names all seven, and places the person between a named past and
  // a named next.
  return (
    <div
      className="tq-stage-steps"
      role="list"
      aria-label={`The seven chapters, you are at stage ${activeStage} of 7`}
    >
      {stages.map((n) => {
        const state = n < activeStage ? "past" : n === activeStage ? "current" : "future";
        return (
          <div
            key={n}
            role="listitem"
            aria-current={n === activeStage ? "step" : undefined}
            className={`tq-stage-step is-${state}`}
          >
            <span className="tq-stage-step-marker">
              {n === activeStage && (
                <img
                  className="tq-stage-step-star"
                  src={glowStar}
                  alt=""
                  aria-hidden={true}
                  draggable={false}
                />
              )}
            </span>
            <span className="tq-stage-step-name">{stageNames[String(n)]}</span>
          </div>
        );
      })}
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

  // One soft threshold question (Day 142). The former two-screen sequence
  // (paid-help history, then "is investing realistic?") read as "will you
  // pay me?" twice. History, openness, and means now read from a single
  // choice; the Means screen no longer renders (quiz.means keys and the
  // means column stay for the dataset's history).
  if (!current) {
    return (
      <section className="tq-card">
        <p className="tq-question-prompt">
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
