// Transition Quiz — ownable result permalink (/quiz/r/:id — Quiz v2.1).
//
// Public, no auth, standalone (no shared layout requirements beyond what
// /quiz itself has). Fetches the saved row from get-quiz-result, then
// reuses the exact same pure engine functions and <ResultScreen> markup
// the live quiz uses — this file never re-implements result rendering,
// only refetches + reconstructs the CoreAnswers the live page would have
// had.

import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { buildQuizClaimPath, rememberLocalQuizResult } from "@/lib/quizOwnership";
import {
  type CoreAnswers,
  type Stage,
  computeRouting,
  isExtEligible,
  isNotYetStage,
  notYetVariant,
} from "./engine";
import { ResultScreen, DIRECTION_CALL_HREF, QuizCorridorHeader, TopTalentBridge } from "./TransitionQuizPage";
import { ExtResultScreen } from "./ExtResultScreen";
import "./TransitionQuizPage.css";

interface FetchedResult {
  id: string;
  stage: number;
  not_yet: boolean;
  uniqueness_category: CoreAnswers["uniqueness"] | null;
  emerging_work_stage: CoreAnswers["emergingWorkStage"] | null;
  result_template: string | null;
  // get-quiz-result returns this as a boolean (never the raw user_id, to
  // avoid leaking an auth uid on a public/no-auth endpoint) — used only to
  // decide whether to show the claim line (already-owned rows never show it).
  owned?: boolean;
  /** Result Experience EXT (Day 142) — for the saved-return framing (brief
   *  §12.3), "You saved this result on [date]". Absent gracefully omits
   *  that line rather than throwing. */
  created_at?: string | null;
}

// Claim path (2026-07-30, JOURNEY Step 0 batch): a quiet line + button
// shown only when the viewer is logged in AND the fetched row has no
// user_id yet. Kept as its own component so the loading/notFound/error
// branches above stay untouched.
type ClaimState = "idle" | "checking" | "guest" | "eligible" | "ineligible" | "claiming" | "claimed" | "error";

function ClaimReadLine({ resultId, alreadyOwned }: { resultId: string; alreadyOwned: boolean }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<ClaimState>("idle");

  useEffect(() => {
    rememberLocalQuizResult(resultId);
    if (alreadyOwned) {
      setState("ineligible");
      return;
    }
    let cancelled = false;
    setState("checking");
    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      setState(data.user ? "eligible" : "guest");
    });
    return () => {
      cancelled = true;
    };
  }, [alreadyOwned, resultId]);

  const handleClaim = useCallback(async () => {
    setState("claiming");
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        setState("guest");
        return;
      }
      const { error } = await supabase.functions.invoke("claim-quiz-result", {
        body: { id: resultId },
        headers: { Authorization: `Bearer ${token}` },
      });
      setState(error ? "error" : "claimed");
    } catch {
      setState("error");
    }
  }, [resultId]);

  // Auth returns to this same public permalink with ?claim=1. Complete the
  // save automatically so cross-device ownership is one coherent action,
  // not a second button the person has to rediscover.
  useEffect(() => {
    if (state !== "eligible" || searchParams.get("claim") !== "1") return;
    void handleClaim();
  }, [handleClaim, searchParams, state]);

  if (state === "idle" || state === "ineligible") return null;
  if (state === "checking") {
    return (
      <div className="tq-claim-read" aria-live="polite" aria-busy="true">
        <span className="tq-claim-read-placeholder" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="tq-claim-read" aria-live="polite">
      {state === "claimed" ? (
        <p className="tq-claim-read-line">{t("quiz.claimRead.saved") as string}</p>
      ) : state === "guest" ? (
        <>
          <p className="tq-claim-read-line">{t("quiz.claimRead.prompt") as string}</p>
          <button
            type="button"
            className="tq-link-quiet"
            onClick={() =>
              navigate(
                `/auth?mode=signup&redirect=${encodeURIComponent(buildQuizClaimPath(resultId))}`,
              )
            }
          >
            {t("quiz.claimRead.cta") as string}
          </button>
        </>
      ) : (
        <>
          <p className="tq-claim-read-line">{t("quiz.claimRead.prompt") as string}</p>
          <button
            type="button"
            className="tq-link-quiet"
            onClick={handleClaim}
            disabled={state === "claiming"}
          >
            {state === "claiming"
              ? (t("quiz.claimRead.saving") as string)
              : (t("quiz.claimRead.cta") as string)}
          </button>
          {state === "error" && (
            <p className="tq-claim-read-line tq-claim-read-error">{t("quiz.claimRead.error") as string}</p>
          )}
        </>
      )}
    </div>
  );
}

type LoadState = "loading" | "notFound" | "ready" | "error";

const TransitionQuizResultPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [result, setResult] = useState<FetchedResult | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const stageNames = t("quiz.stageNames", { returnObjects: true }) as Record<string, string>;

  useEffect(() => {
    let cancelled = false;
    if (!id) {
      setLoadState("notFound");
      return;
    }

    (async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
        const endpoint = `${supabaseUrl}/functions/v1/get-quiz-result?id=${encodeURIComponent(id)}`;
        const res = await fetch(endpoint, {
          method: "GET",
          headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
        });
        if (cancelled) return;
        if (res.status === 404) {
          setLoadState("notFound");
          return;
        }
        if (!res.ok) {
          console.warn("quiz permalink: get-quiz-result returned", res.status);
          setLoadState("error");
          return;
        }
        const body = (await res.json()) as { ok?: boolean; result?: FetchedResult };
        if (!body.ok || !body.result) {
          setLoadState("error");
          return;
        }
        setResult(body.result);
        setLoadState("ready");
      } catch (err) {
        console.warn("quiz permalink: fetch failed (non-fatal)", err);
        if (!cancelled) setLoadState("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, retryKey]);

  return (
    <main className="tq-page tq-phase-reveal">
      <Helmet>
        <title>Where Are You — a saved read</title>
        <meta name="description" content="A saved read of one chapter, from the Where Are You quiz." />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <div className="tq-shell">
        <QuizCorridorHeader />
        <Link className="tq-back" to="/quiz">
          <ArrowLeft size={14} /> {t("quiz.back") as string}
        </Link>

        {loadState === "loading" && (
          <section className="tq-card tq-loading-card" aria-live="polite" aria-busy="true">
            <span className="tq-loading-orbit" aria-hidden="true" />
            <p className="tq-sub tq-status-copy">{t("quiz.loading") as string}</p>
          </section>
        )}

        {loadState === "notFound" && (
          <section className="tq-card tq-status-card">
            <p className="tq-body-text">This saved read couldn't be found.</p>
            <Link className="tq-link-quiet" to="/quiz">
              Take the quiz
            </Link>
          </section>
        )}

        {loadState === "error" && (
          <section className="tq-card tq-status-card" role="alert">
            <p className="tq-body-text">This saved read couldn't load right now.</p>
            <button
              type="button"
              className="tq-link-quiet"
              onClick={() => {
                setLoadState("loading");
                setRetryKey((value) => value + 1);
              }}
            >
              Try again
            </button>
          </section>
        )}

        {loadState === "ready" && result && <ReconstructedResult t={t} stageNames={stageNames} result={result} />}
      </div>
    </main>
  );
};

function ReconstructedResult({
  t,
  stageNames,
  result,
}: {
  t: (k: string, o?: Record<string, unknown>) => unknown;
  stageNames: Record<string, string>;
  result: FetchedResult;
}) {
  const stage = result.stage as Stage;

  if (result.not_yet || isNotYetStage(stage)) {
    // Not-yet completions (stages 1-3) carry no core answers to recompute
    // a routed result from — render the same quiet, no-ask gift copy the
    // live quiz shows, keyed only by stage.
    const variant = notYetVariant(stage);
    const line =
      variant === "settled"
        ? (t("quiz.notYet.settled.line") as string)
        : ((t(`quiz.notYet.itchTremors.${stage}`, { returnObjects: true }) as Record<string, string>)?.why ??
          (t(`quiz.notYet.itchTremors.${stage}`, { returnObjects: true }) as Record<string, string>)?.turnsInto ??
          "");
    return (
      <section className="tq-card">
        <p className="tq-body-text">{line}</p>
        {/* Add-on §12: on a saved stage 1-3 result Top Talent stays the
            primary route (the bridge above), with return/retake quiet and
            secondary beneath it. Retake was missing here while every other
            saved branch carried it. */}
        <TopTalentBridge t={t} stage={stage as 1 | 2 | 3} saved />
        <button
          type="button"
          className="tq-retake"
          onClick={() => {
            window.location.href = "/quiz";
          }}
        >
          {t("quiz.notYet.retake") as string}
        </button>
        <p className="tq-ext-utility-explainer">{t("quiz.ext.utility.retakeExplainer") as string}</p>
      </section>
    );
  }

  if (!result.uniqueness_category || !result.emerging_work_stage) {
    return (
      <section className="tq-card">
        <p className="tq-body-text">This saved read is incomplete.</p>
      </section>
    );
  }

  const answers: CoreAnswers = {
    stage,
    uniqueness: result.uniqueness_category,
    emergingWorkStage: result.emerging_work_stage,
  };
  const routing = computeRouting(answers);

  // Result Experience EXT gate (Day 142) — mirrors the live-quiz gate in
  // TransitionQuizPage.tsx. The saved result must never bypass the EXT
  // decision environment and jump directly to booking (brief §12.3) — it
  // renders the full ExtResultScreen, same as live, with the saved-return
  // framing layered on top.
  if (routing.route !== "crossedPeer" && isExtEligible(answers)) {
    let savedOnDate: string | null = null;
    if (result.created_at) {
      try {
        savedOnDate = new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(
          new Date(result.created_at),
        );
      } catch {
        savedOnDate = null;
      }
    }
    return (
      <>
        <ExtResultScreen
          t={t}
          stageNames={stageNames}
          answers={answers}
          resultVersion="ext-a"
          resultId={result.id}
          onRetake={() => {
            window.location.href = "/quiz";
          }}
          savedOnDate={savedOnDate}
          bookingContext="saved"
        />
        <ClaimReadLine resultId={result.id} alreadyOwned={!!result.owned} />
      </>
    );
  }

  return (
    <>
      <ResultScreen
        t={t}
        stageNames={stageNames}
        answers={answers}
        // A saved read keeps its door: the same Direction Call CTA the live
        // result earned. On the permalink there is no interactive qualifier
        // flow, so the button opens the booking page directly.
        showBuyingFrame={routing.showBuyingFrame}
        route={routing.route}
        onContinue={() => {
          window.open(DIRECTION_CALL_HREF, "_blank", "noopener");
        }}
        onRetake={() => {
          window.location.href = "/quiz";
        }}
        resultId={result.id}
        saved
      />
      <ClaimReadLine resultId={result.id} alreadyOwned={!!result.owned} />
    </>
  );
}

export default TransitionQuizResultPage;
