// Transition Quiz — ownable result permalink (/quiz/r/:id — Quiz v2.1).
//
// Public, no auth, standalone (no shared layout requirements beyond what
// /quiz itself has). Fetches the saved row from get-quiz-result, then
// reuses the exact same pure engine functions and <ResultScreen> markup
// the live quiz uses — this file never re-implements result rendering,
// only refetches + reconstructs the CoreAnswers the live page would have
// had.

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { ArrowLeft } from "lucide-react";
import {
  type CoreAnswers,
  type Stage,
  computeRouting,
  isNotYetStage,
  notYetVariant,
} from "./engine";
import { ResultScreen, DIRECTION_CALL_HREF } from "./TransitionQuizPage";
import "./TransitionQuizPage.css";

interface FetchedResult {
  id: string;
  stage: number;
  not_yet: boolean;
  uniqueness_category: CoreAnswers["uniqueness"] | null;
  emerging_work_stage: CoreAnswers["emergingWorkStage"] | null;
  result_template: string | null;
}

type LoadState = "loading" | "notFound" | "ready" | "error";

const TransitionQuizResultPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [result, setResult] = useState<FetchedResult | null>(null);
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
  }, [id]);

  return (
    <main className="tq-page">
      <Helmet>
        <title>Where Are You — a saved read</title>
        <meta name="description" content="A saved read of one chapter, from the Where Are You quiz." />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <div className="tq-shell">
        <Link className="tq-back" to="/quiz">
          <ArrowLeft size={14} /> {t("quiz.back") as string}
        </Link>

        {loadState === "loading" && (
          <section className="tq-card tq-loading-card">
            <p className="tq-sub" style={{ textAlign: "center" }}>
              {t("quiz.loading") as string}
            </p>
          </section>
        )}

        {(loadState === "notFound" || loadState === "error") && (
          <section className="tq-card">
            <p className="tq-body-text">This saved read couldn't be found.</p>
            <Link className="tq-link-quiet" to="/quiz">
              Take the quiz
            </Link>
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

  return (
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
    />
  );
}

export default TransitionQuizResultPage;
