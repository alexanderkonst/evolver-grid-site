// Result Experience EXT — lean result (Day 143 rewrite).
//
// Rewritten from the ~700-word, ten-block version down to one screen:
// chapter ceremony, three labelled one-idea blocks (what's going on / the
// question underneath / the trap), and one offer with a single CTA. Every
// block Sasha struck on the Aug 5 read is gone: the answer-replay, the
// second detour, the fork, the experiment, the "test this first" button,
// "your result is complete", the prep selector, the save block, the
// disagreement widget, the "next chapter map" name and its bullet lists.
// Three type voices only (see .tq-ext-* in TransitionQuizPage.css).
//
// Sibling to ResultScreen (v1, TransitionQuizPage.tsx) — rendered only when
// isExtEligible(answers) and the route isn't crossedPeer. Never routes to
// the legacy buyingFrame screen.

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GOLD_TEXT_STYLE, Ornament } from "@/lib/landingDesign";
import { trackCTAClick, trackPageView } from "@/lib/funnelAnalytics";
import { type CoreAnswers, type ResultVersion, synthesisFamilyFor } from "./engine";
import { DIRECTION_CALL_HREF, StageArc, TopTalentSecondary } from "./TransitionQuizPage";

type Tx = (k: string, o?: Record<string, unknown>) => unknown;
const str = (t: Tx, k: string, o?: Record<string, unknown>) => t(k, o) as string;

// One trap per synthesis family — the single most costly move for someone
// in that shape. Named as a trap, not a "detour" (Sasha, Aug 5).
const TRAP_BY_FAMILY = {
  coherence: "mistakingFocusForAmputation",
  form: "workingDownstream",
  release: "prematureCommitment",
  contact: "waitingUpstream",
} as const;

export interface ExtResultScreenProps {
  t: Tx;
  stageNames: Record<string, string>;
  answers: CoreAnswers;
  resultVersion: ResultVersion;
  resultId: string | null;
  onRetake: () => void;
  /** When rendered from the saved-result permalink, the saved-return
   *  framing renders above Act I. Preformatted, already localized. */
  savedOnDate?: string | null;
  /** "live" (default) or "saved" — only changes the analytics source
   *  suffix on the booking-click event. */
  bookingContext?: "live" | "saved";
}

export function ExtResultScreen({
  t,
  stageNames,
  answers,
  resultVersion,
  resultId,
  onRetake,
  savedOnDate = null,
  bookingContext = "live",
}: ExtResultScreenProps) {
  const { i18n } = useTranslation();
  void i18n;

  const family = synthesisFamilyFor(answers);
  const trapId = TRAP_BY_FAMILY[family];
  // The question is keyed by family + stage; the gate already guarantees
  // stage is 4-7, this keeps the lookup total.
  const questionStage = Math.min(7, Math.max(4, answers.stage));

  const [shareCopied, setShareCopied] = useState(false);
  const offerRef = useRef<HTMLDivElement | null>(null);

  // ── Analytics: fire-and-forget mount event ─────────────────────────────
  const loggedMountRef = useRef(false);
  useEffect(() => {
    if (loggedMountRef.current) return;
    loggedMountRef.current = true;
    trackPageView("quiz_result_version_viewed", `${resultVersion}_${family}`);
    if (savedOnDate) trackPageView("quiz_saved_result_revisited", resultVersion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Persistence: record the architecture the person saw, once the row
  // id exists (arrives async). Merged into ext_metadata server-side. ──────
  const loggedVersionRef = useRef(false);
  useEffect(() => {
    if (!resultId || loggedVersionRef.current) return;
    loggedVersionRef.current = true;
    supabase.functions
      .invoke("save-quiz-result", {
        body: { id: resultId, result_version: resultVersion, ext: { synthesis_family: family } },
      })
      .catch(() => null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultId]);

  const handleBooking = () => {
    trackCTAClick("quiz_cta_click", bookingContext === "saved" ? "ext_book_saved" : "ext_book_live");
  };

  const handleShare = () => {
    trackCTAClick("quiz_share", "ext_utility_share");
    if (typeof window === "undefined") return;
    const url = resultId ? `${window.location.origin}/quiz/r/${resultId}` : window.location.href;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => setShareCopied(true)).catch(() => {});
    } else {
      setShareCopied(true);
    }
  };

  const handleRetake = () => {
    trackCTAClick("quiz_retake", "ext_utility_retake");
    onRetake();
  };

  const scrollToOffer = () => {
    offerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="tq-card tq-result-card tq-ext-result" data-result-version={resultVersion}>
      {savedOnDate && (
        <div className="tq-ext-saved-return">
          <p className="tq-quiet-line">{str(t, "quiz.ext.savedReturn.savedOnLine", { date: savedOnDate })}</p>
          <p className="tq-quiet-line">{str(t, "quiz.ext.savedReturn.readFromNowLine")}</p>
          <div className="tq-ext-saved-return-options">
            <button type="button" className="tq-ext-chip" onClick={() => trackCTAClick("quiz_saved_still_accurate", "saved_return")}>
              {str(t, "quiz.ext.savedReturn.options.stillAccurate")}
            </button>
            <button type="button" className="tq-ext-chip" onClick={() => trackCTAClick("quiz_saved_something_shifted", "saved_return")}>
              {str(t, "quiz.ext.savedReturn.options.somethingShifted")}
            </button>
            <button type="button" className="tq-ext-chip" onClick={scrollToOffer}>
              {str(t, "quiz.ext.savedReturn.options.readyToTalk")}
            </button>
          </div>
        </div>
      )}

      {/* ── The chapter ─────────────────────────────────────────────────── */}
      <div className="tq-reveal tq-ext-act tq-ext-act-read">
        <p className="tq-eyebrow-gold" style={GOLD_TEXT_STYLE}>{str(t, "quiz.ext.chapter.eyebrow")}</p>
        <h2 className="tq-stage-name">{stageNames[String(answers.stage)]}</h2>
        <StageArc stage={answers.stage} stageNames={stageNames} />
        <p className="tq-ext-read tq-measure tq-ext-bullseye">{str(t, `quiz.ext.chapter.bullseye.${answers.stage}`)}</p>
      </div>

      {/* ── The read: three labelled one-idea blocks ────────────────────── */}
      <div className="tq-ext-block">
        <p className="tq-ext-label" style={GOLD_TEXT_STYLE}>{str(t, "quiz.ext.labels.whatsGoingOn")}</p>
        <p className="tq-ext-read">{str(t, `quiz.ext.synthesis.${family}`)}</p>
      </div>

      <div className="tq-ext-block">
        <p className="tq-ext-label" style={GOLD_TEXT_STYLE}>{str(t, "quiz.ext.labels.theQuestion")}</p>
        <p className="tq-ext-read">{str(t, `quiz.ext.upgradedQuestion.${family}.${questionStage}`)}</p>
      </div>

      <div className="tq-ext-block tq-ext-trap">
        <p className="tq-ext-label" style={GOLD_TEXT_STYLE}>{str(t, "quiz.ext.labels.theTrap")}</p>
        <p className="tq-ext-read">{str(t, `quiz.ext.detour.${trapId}.body`)}</p>
      </div>

      {/* ── The offer: hook + promise + one CTA ─────────────────────────── */}
      <hr className="tq-take-what-divider" />
      <div className="tq-ext-offer" ref={offerRef}>
        <p className="tq-ext-read tq-ext-offer-hook">{str(t, `quiz.ext.offer.hook.${family}`)}</p>
        <p className="tq-ext-read">{str(t, "quiz.ext.offer.promise")}</p>
        <div className="tq-cta-block tq-ext-cta-block">
          <a
            className="tq-editorial-link-cta tq-door-cta"
            href={DIRECTION_CALL_HREF}
            target="_blank"
            rel="noreferrer"
            onClick={handleBooking}
          >
            {str(t, "quiz.ext.offer.ctaPrimary")} <ArrowRight size={16} />
          </a>
          <p className="tq-cta-sub">{str(t, "quiz.ext.offer.ctaMicrocopy")}</p>
        </div>
      </div>

      {/* ── Quiet footer ────────────────────────────────────────────────── */}
      <div className="tq-ext-footer">
        <TopTalentSecondary t={t} resultVersion={resultVersion} saved={bookingContext === "saved"} />
        <div className="tq-ext-utility">
          <button type="button" className="tq-link-quiet" onClick={handleShare}>
            {shareCopied ? str(t, "quiz.ext.utility.shareCopied") : str(t, "quiz.ext.utility.shareLabel")}
          </button>
          <button type="button" className="tq-retake" onClick={handleRetake}>
            {str(t, "quiz.ext.utility.retakeLabel")}
          </button>
        </div>
      </div>

      <Ornament className="tq-ornament tq-closing-seal" />
    </section>
  );
}

export default ExtResultScreen;
