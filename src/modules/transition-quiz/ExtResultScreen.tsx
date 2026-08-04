// Result Experience EXT — Day 142. The three-macro-act result for the
// representative pattern (stage 5, uniqueness in {integration, vehicle},
// emergingWorkStage in {named, built}) — see
// docs/specs/quiz/ext_implementation_brief.md §6-14 and
// docs/specs/quiz/ext_prototype_copy.md.
//
// This is a sibling to (not a replacement of) ResultScreen in
// TransitionQuizPage.tsx — v1 stays fully intact. Rendered only when
// isExtEligible(answers) is true and the route isn't crossedPeer (see the
// gate in TransitionQuizPage.tsx and TransitionQuizResultPage.tsx).
//
// EXT's internal navigation never routes to the legacy buyingFrame screen —
// Act III (below) fully replaces that flow for EXT users.

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowUpRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GOLD_TEXT_STYLE, Ornament } from "@/lib/landingDesign";
import { trackCTAClick, trackPageView } from "@/lib/funnelAnalytics";
import { type CoreAnswers, type ResultVersion, synthesisFamilyFor } from "./engine";
import { DIRECTION_CALL_HREF, StageArc } from "./TransitionQuizPage";

const PREP_OPTION_KEYS = ["explainFit", "knowDecision", "haveTest", "wantPerspective"] as const;
const DISAGREEMENT_OPTION_KEYS = [
  "chapterRightProblemNot",
  "workFurtherAlong",
  "projectsDontBelong",
  "somethingMissing",
  "cannotTellYet",
] as const;

type Tx = (k: string, o?: Record<string, unknown>) => unknown;
const str = (t: Tx, k: string, o?: Record<string, unknown>) => t(k, o) as string;

export interface ExtResultScreenProps {
  t: Tx;
  stageNames: Record<string, string>;
  answers: CoreAnswers;
  resultVersion: ResultVersion;
  resultId: string | null;
  onRetake: () => void;
  /** When rendered from the saved-result permalink (/quiz/r/:id), the
   *  §12.3 saved-return framing renders above Act I. Omit for the live
   *  quiz result. Preformatted date string, already localized by the
   *  caller (Intl.DateTimeFormat on created_at) — this component never
   *  reformats it, just displays it inside the {{date}} interpolation. */
  savedOnDate?: string | null;
  /** "live" (default) or "saved" — only changes the analytics `source`
   *  suffix on the booking-click event (brief §21: "booking from live
   *  result" vs "booking from saved result"). */
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
  const locale = i18n.language;

  const family = synthesisFamilyFor(answers);
  const workStageKey = answers.emergingWorkStage === "built" ? "built" : "named";
  const uniquenessKey = answers.uniqueness === "vehicle" ? "vehicle" : "integration";
  const detourIds =
    family === "coherence"
      ? (["workingDownstream", "mistakingFocusForAmputation"] as const)
      : (["workingDownstream", "buildingBeforeNaming"] as const);
  const forkId = family === "coherence" ? "visibleLayer" : "evidence";

  const [doorATest, setDoorATest] = useState(false);
  const [prepOutcome, setPrepOutcome] = useState<string | null>(null);
  const [prepOtherText, setPrepOtherText] = useState("");
  const [disagreement, setDisagreement] = useState<string | null>(null);
  const [disagreementThanks, setDisagreementThanks] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveEmail, setSaveEmail] = useState("");
  const [saveSent, setSaveSent] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const offerRef = useRef<HTMLDivElement | null>(null);
  const loggedMountRef = useRef(false);

  // ── Analytics: fire-and-forget mount events (brief §21) ────────────────
  useEffect(() => {
    if (loggedMountRef.current) return;
    loggedMountRef.current = true;
    trackPageView("quiz_result_version_viewed", `${resultVersion}_${family}`);
    trackPageView("quiz_detours_displayed", detourIds.join(","));
    trackPageView("quiz_experiment_displayed", family);
    if (savedOnDate) trackPageView("quiz_saved_result_revisited", resultVersion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Persistence: forward-compatible ext metadata (spec item F) ─────────
  // The save-quiz-result update branch (supabase/functions/save-quiz-result/
  // index.ts) whitelists a fixed set of known fields and ignores anything
  // else on the payload — it is never modified here. `result_version` and
  // `ext` are additive/unknown fields today; they are sent anyway so the
  // client contract is forward-compatible once the backend catches up
  // (adds a result_version column + an ext_metadata jsonb column per
  // ext_change_map.md §3/§6). Fire-and-forget, same contract as the rest
  // of this module.
  const persistExt = (ext: Record<string, unknown>) => {
    if (!resultId) return;
    supabase.functions
      .invoke("save-quiz-result", {
        body: { id: resultId, result_version: resultVersion, ext: { synthesis_family: family, ...ext } },
      })
      .catch(() => null);
  };

  const handleDoorA = () => {
    setDoorATest(true);
    trackCTAClick("quiz_experiment_selected", `experiment_${family}`);
    persistExt({ experiment_selected: family });
  };

  const handlePrepPick = (key: string) => {
    setPrepOutcome(key);
    trackCTAClick("quiz_prep_outcome_selected", key);
    persistExt({ prep_outcome: key });
  };

  const handleBooking = () => {
    trackCTAClick("quiz_cta_click", bookingContext === "saved" ? "ext_map_book_saved" : "ext_map_book_live");
  };

  const handleDisagree = (key: string) => {
    setDisagreement(key);
    setDisagreementThanks(true); // optimistic — shown regardless of persistence success
    trackCTAClick("quiz_disagreement_reason", key);
    persistExt({ disagreement_reason: key });
  };

  const handleSaveOpen = () => {
    setSaveOpen(true);
    trackCTAClick("quiz_save_opened", "ext_save_opened");
  };

  const handleSaveSend = () => {
    const trimmed = saveEmail.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@") || !resultId) return;
    supabase.functions
      .invoke("save-quiz-email", {
        body: { email: trimmed, stage: answers.stage, locale, source: `save_read:${resultId}` },
      })
      .catch(() => {});
    setSaveSent(true);
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

  const examineList = t("quiz.ext.offer.explanation.examineList", { returnObjects: true }) as string[];
  const leaveWithList = t("quiz.ext.offer.explanation.leaveWithList", { returnObjects: true }) as string[];

  return (
    <section className="tq-card tq-result-card tq-ext-result" data-result-version={resultVersion}>
      {savedOnDate && (
        <div className="tq-ext-saved-return">
          <p className="tq-quiet-line">
            {str(t, "quiz.ext.savedReturn.savedOnLine", { date: savedOnDate })}
          </p>
          <p className="tq-quiet-line">{str(t, "quiz.ext.savedReturn.readFromNowLine")}</p>
          <div className="tq-ext-saved-return-options">
            <button
              type="button"
              className="tq-ext-chip"
              onClick={() => trackCTAClick("quiz_saved_still_accurate", "saved_return")}
            >
              {str(t, "quiz.ext.savedReturn.options.stillAccurate")}
            </button>
            <button
              type="button"
              className="tq-ext-chip"
              onClick={() => trackCTAClick("quiz_saved_something_shifted", "saved_return")}
            >
              {str(t, "quiz.ext.savedReturn.options.somethingShifted")}
            </button>
            <button type="button" className="tq-ext-chip" onClick={scrollToOffer}>
              {str(t, "quiz.ext.savedReturn.options.readyToTalk")}
            </button>
          </div>
        </div>
      )}

      {/* ── ACT I — THE READ ─────────────────────────────────────────── */}
      <div className="tq-reveal tq-ext-act tq-ext-act-read">
        <p className="tq-eyebrow-gold" style={GOLD_TEXT_STYLE}>
          {str(t, "quiz.ext.chapter.eyebrow")}
        </p>
        <h2 className="tq-stage-name">{stageNames[String(answers.stage)]}</h2>
        <Ornament className="tq-ornament" />
        <StageArc stage={answers.stage} stageNames={stageNames} />
        <p className="tq-body-text tq-measure tq-ext-bullseye">
          {str(t, `quiz.ext.chapter.bullseye.${answers.stage}`)}
        </p>
        <p className="tq-quiet-line tq-ext-arc-note">{str(t, "quiz.ext.chapter.arcNote")}</p>
      </div>

      <div className="tq-ext-act tq-ext-act-evidence">
        <p className="tq-eyebrow-gold" style={GOLD_TEXT_STYLE}>
          {str(t, "quiz.ext.evidence.heading")}
        </p>
        <div className="tq-ext-evidence-firm">
          <p className="tq-body-text">{str(t, `quiz.ext.evidence.youSaid.${answers.stage}`)}</p>
          <p className="tq-body-text">{str(t, `quiz.ext.evidence.youAlsoSaid.${workStageKey}`)}</p>
          <p className="tq-body-text">{str(t, `quiz.ext.evidence.and.${uniquenessKey}`)}</p>
        </div>
        <p className="tq-ext-evidence-editorial">
          {str(t, `quiz.ext.evidence.takenTogether.${family}`)}
        </p>
      </div>

      {/* Synthesis — visually isolated center of the whole page. No glow,
          no pulse (brief §14.3/§14.9): breathing room + restrained frame
          only. */}
      <div className="tq-ext-synthesis">
        <p className="tq-ext-synthesis-body">{str(t, `quiz.ext.synthesis.${family}`)}</p>
      </div>

      <div className="tq-ext-act tq-ext-upgraded-question">
        <p className="tq-ext-question-text">{str(t, `quiz.ext.upgradedQuestion.${family}.${answers.stage}`)}</p>
      </div>

      <p className="tq-ext-completion-marker">{str(t, `quiz.ext.completionMarker.${family}`)}</p>

      {/* ── ACT II — THE CONSEQUENCE ─────────────────────────────────── */}
      <div className="tq-ext-act tq-ext-act-consequence">
        <div className="tq-ext-detours">
          {detourIds.map((id) => {
            const detour = t(`quiz.ext.detour.${id}`, { returnObjects: true }) as { heading: string; body: string };
            return (
              <div className="tq-ext-detour" key={id}>
                <p className="tq-ext-detour-heading">{detour.heading}</p>
                <p className="tq-ext-detour-body">{detour.body}</p>
              </div>
            );
          })}
        </div>

        <div className="tq-ext-fork">
          <p className="tq-ext-fork-body">{str(t, `quiz.ext.fork.${forkId}`)}</p>
        </div>

        <div className="tq-ext-experiment">
          <p className="tq-ext-experiment-body">{str(t, `quiz.ext.experiment.${family}`)}</p>
          <button
            type="button"
            className="tq-cta tq-cta-ghost tq-ext-door-a"
            onClick={handleDoorA}
            aria-pressed={doorATest}
          >
            {str(t, "quiz.ext.experiment.doorACta")}
          </button>
        </div>
      </div>

      {/* ── ACT III — THE DOOR ───────────────────────────────────────── */}
      <div className="tq-ext-act tq-ext-act-door" ref={offerRef}>
        <div className="tq-ext-result-complete">
          <p className="tq-ext-result-complete-line">{str(t, "quiz.ext.resultComplete.line")}</p>
          <div className="tq-ext-divider" role="presentation" />
          <p className="tq-quiet-line">{str(t, "quiz.ext.resultComplete.divider")}</p>
        </div>

        <div className="tq-ext-offer">
          <h3 className="tq-beat-heading">{str(t, "quiz.ext.offer.name")}</h3>
          <p className="tq-body-text tq-ext-offer-master">{str(t, "quiz.ext.offer.masterResult")}</p>
          <p className="tq-body-text">
            {doorATest
              ? str(t, "quiz.ext.offer.explanation.testFirstIntro")
              : str(t, "quiz.ext.offer.explanation.intro")}
          </p>

          <ul className="tq-ext-offer-list">
            {examineList.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <p className="tq-label">{/* "you should leave with" implied by the list below */}</p>
          <ul className="tq-ext-offer-list tq-ext-offer-list--leave">
            {leaveWithList.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <p className="tq-quiet-line">{str(t, "quiz.ext.offer.collaborativeStance")}</p>
          <p className="tq-quiet-line">{str(t, "quiz.ext.offer.methodAuthority")}</p>
          <p className="tq-quiet-line">{str(t, "quiz.ext.offer.transparency")}</p>

          <div className="tq-ext-preparation">
            <p className="tq-label">{str(t, "quiz.ext.preparation.heading")}</p>
            <div className="tq-ext-preparation-options">
              {PREP_OPTION_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`tq-ext-chip${prepOutcome === key ? " is-selected" : ""}`}
                  aria-pressed={prepOutcome === key}
                  onClick={() => handlePrepPick(key)}
                >
                  {str(t, `quiz.ext.preparation.options.${key}`)}
                </button>
              ))}
              <button
                key="somethingElse"
                type="button"
                className={`tq-ext-chip${prepOutcome === "somethingElse" ? " is-selected" : ""}`}
                aria-pressed={prepOutcome === "somethingElse"}
                onClick={() => handlePrepPick("somethingElse")}
              >
                {str(t, "quiz.ext.preparation.options.somethingElse")}
              </button>
            </div>
            {prepOutcome === "somethingElse" && (
              <input
                type="text"
                className="tq-email-input"
                placeholder={str(t, "quiz.ext.preparation.somethingElsePlaceholder")}
                value={prepOtherText}
                onChange={(e) => setPrepOtherText(e.target.value)}
                onBlur={() => prepOtherText.trim() && persistExt({ prep_outcome_other: prepOtherText.trim() })}
              />
            )}
          </div>

          <div className="tq-cta-block tq-ext-cta-block">
            <a
              className="tq-editorial-link-cta tq-door-cta"
              href={DIRECTION_CALL_HREF}
              target="_blank"
              rel="noreferrer"
              onClick={handleBooking}
            >
              {str(t, "quiz.ext.offer.ctaPrimary")} <ArrowUpRight size={16} />
            </a>
            <p className="tq-cta-sub">{str(t, "quiz.ext.offer.ctaMicrocopy")}</p>
            <p className="tq-cta-sub">{str(t, "quiz.ext.offer.ctaNote")}</p>
          </div>

          <div className="tq-ext-save">
            {!saveOpen && !saveSent && (
              <button type="button" className="tq-link-quiet tq-ext-save-toggle" onClick={handleSaveOpen}>
                {str(t, "quiz.ext.save.secondaryLabel")}
              </button>
            )}
            {saveOpen && !saveSent && (
              <div className="tq-ext-save-form">
                <p className="tq-label">{str(t, "quiz.ext.save.heading")}</p>
                <p className="tq-quiet-line">{str(t, "quiz.ext.save.body")}</p>
                <div className="tq-email-row">
                  <input
                    type="email"
                    className="tq-email-input"
                    value={saveEmail}
                    onChange={(e) => setSaveEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveSend()}
                  />
                  <button type="button" className="tq-email-cta" onClick={handleSaveSend}>
                    {str(t, "quiz.ext.save.sendCta")}
                  </button>
                </div>
                <p className="tq-cta-sub">{str(t, "quiz.ext.save.microcopy")}</p>
              </div>
            )}
            {saveSent && <p className="tq-success">{str(t, "quiz.ext.save.confirmation")}</p>}
          </div>
        </div>

        <div className="tq-ext-disagreement">
          <p className="tq-label">{str(t, "quiz.ext.disagreement.prompt")}</p>
          {!disagreementThanks ? (
            <div className="tq-ext-disagreement-options">
              {DISAGREEMENT_OPTION_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`tq-ext-chip${disagreement === key ? " is-selected" : ""}`}
                  onClick={() => handleDisagree(key)}
                >
                  {str(t, `quiz.ext.disagreement.options.${key}`)}
                </button>
              ))}
            </div>
          ) : (
            <p className="tq-quiet-line">{str(t, "quiz.ext.disagreement.thanks")}</p>
          )}
        </div>

        <div className="tq-ext-utility">
          <button type="button" className="tq-link-quiet" onClick={handleShare}>
            {shareCopied ? str(t, "quiz.ext.utility.shareCopied") : str(t, "quiz.ext.utility.shareLabel")}
          </button>
          <button type="button" className="tq-link-quiet" onClick={handleRetake}>
            {str(t, "quiz.ext.utility.retakeLabel")}
          </button>
          <p className="tq-ext-utility-explainer">{str(t, "quiz.ext.utility.retakeExplainer")}</p>
        </div>

        <Ornament className="tq-ornament tq-closing-seal" />
      </div>
    </section>
  );
}

export default ExtResultScreen;
