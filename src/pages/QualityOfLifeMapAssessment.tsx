import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
// Day 63 (Sasha 2026-05-06): Navigation import removed — shell now
// owned by QolLayout (provides GameShellV2 chrome). The standalone
// wrap-in-Navigation pattern from earlier brand era is retired.
import BoldText from "@/components/BoldText";
import { Button } from "@/components/ui/button";
import { useQolAssessment } from "@/modules/quality-of-life-map/QolAssessmentContext";
import { DOMAINS } from "@/modules/quality-of-life-map/qolConfig";
import { cn } from "@/lib/utils";
import { buildQolResultsPath } from "@/lib/onboardingRouting";
import ProgressIndicator from "@/components/ProgressIndicator";

interface QualityOfLifeMapAssessmentProps {
  renderMode?: "standalone" | "embedded";
}

const QualityOfLifeMapAssessment = ({
  renderMode = "standalone",
}: QualityOfLifeMapAssessmentProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("return");
  const { answers, setAnswer } = useQolAssessment();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showIntro, setShowIntro] = useState(true);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Day 63 (Sasha 2026-05-06): scroll-to-top on every domain step,
  // not just on initial mount. Without this, clicking Previous keeps
  // the page scrolled to wherever the user landed last (the auto-
  // advance handler already does its own smooth-scroll on forward
  // motion, but Previous didn't). Skip during the intro screen.
  useEffect(() => {
    if (showIntro) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentIndex, showIntro]);

  const domain = DOMAINS[currentIndex];
  const isLastDomain = currentIndex === DOMAINS.length - 1;
  const hasAnswer = answers[domain.id] !== null;
  const selectedStageId = answers[domain.id];

  const handleStageSelect = (stageId: number) => {
    setAnswer(domain.id, stageId);
    // Auto-advance after brief visual feedback (unless it's the last domain)
    if (!isLastDomain) {
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 400);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setShowIntro(true);
    }
  };

  const handleNext = () => {
    if (isLastDomain) {
      if (renderMode === "embedded") {
        // Day 63 (Sasha 2026-05-06): /game/transformation/* was retired
        // in favor of /game/learn/* (App.tsx:489-490 redirects). The
        // old path bounced embedded-mode users to the Library instead
        // of the Results page when they finished the assessment.
        navigate("/game/learn/qol-results");
      } else {
        navigate(buildQolResultsPath(returnTo));
      }
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Day 63 evening (Sasha 2026-05-06): rebuilt for inside-GameShell
  // rendering. Previous version used `min-h-dvh flex flex-col items-
  // center justify-center` which forced viewport-fill centering inside
  // GameShellV2's main pane — producing the awkward icon-then-big-gap-
  // then-headline layout Sasha screenshotted. The bg-gradient was
  // covering the cinematic background unevenly. Now: natural top-
  // aligned flow with reasonable padding; cream-wash applied via a
  // contained surface (not full viewport); editorial typography
  // matches the rest of QoL (Cormorant H1 + Source Serif 4 italic
  // subhead + Cormorant tracked-uppercase eyebrow).
  const introScreen = (
    <section className="px-6 py-12 sm:py-16 mx-auto max-w-2xl">
      <div className="text-center space-y-6">
        {/* Eyebrow — Day 64 (third pass, Sasha 2026-05-07): full halo-
            deep cocktail (4-layer: 28px white halo + white near-stroke
            + 2× navy under-stroke) per ui_playbook.md Part VIII Master
            Legibility Strong. Matches landing page exactly. The earlier
            single-white-stroke cocktail was the weak version and left
            the eyebrow faint on the cream cinematic sections. Bumped
            fontWeight 600→700 (Cormorant max). */}
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--skin-text-primary, #0a1628)",
            textShadow: "var(--skin-text-halo-deep, 0 0 28px rgba(255,255,255,0.85), 0 1px 2px rgba(255,255,255,0.95), 0 0 1px rgba(11,42,90,0.65), 0 1px 0 rgba(11,42,90,0.45))",
          }}
        >
          Quality of Life Map
        </p>

        {/* Dodecahedron Icon */}
        <div className="flex items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--wabi-aqua)] to-[var(--depth-violet)] flex items-center justify-center shadow-lg">
            <img
              src="/dodecahedron.png"
              alt="Quality of Life"
              className="w-12 h-12 object-contain"
            />
          </div>
        </div>

        {/* Headline — Cormorant editorial. Day 64 (third pass): halo-
            deep cocktail strengthened to the deepest variant (28px
            halo + 0.95 white near-stroke + 0.65/0.45 navy under-strokes)
            matching MethodologyLandingPage.tsx line 79 exactly. */}
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 700,
            fontSize: "clamp(28px, 4vw, 42px)",
            letterSpacing: "-0.005em",
            lineHeight: 1.1,
            color: "var(--skin-text-primary, #0a1628)",
            textShadow: "var(--skin-text-halo-deep, 0 0 28px rgba(255,255,255,0.85), 0 1px 2px rgba(255,255,255,0.95), 0 0 1px rgba(11,42,90,0.65), 0 1px 0 rgba(11,42,90,0.45))",
          }}
        >
          Rate 8 life areas
        </h1>

        {/* Subhead — Day 64 (third pass): muted-alpha lifted from 0.78
            (wabi-text-secondary) to 0.88 + halo-soft for legibility on
            variable-luminance bg. Per ui_playbook.md Part VIII lever 2
            (muted-alpha lift). */}
        <p
          style={{
            fontFamily: "'Source Serif 4', 'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: "16px",
            lineHeight: 1.6,
            color: "rgba(11, 42, 90, 0.88)",
            textShadow: "0 1px 2px rgba(255,255,255,0.7)",
          }}
        >
          See where you're thriving and where to grow.
        </p>

        {/* CTA — Day 64 (Sasha 2026-05-07): editorial gold pattern
            from /ubb GenericArtifactScreen replacing the violet gradient
            wabi-primary. Sasha called out "the colors are not the
            colors that we use in our UI" — landing register uses
            dark-navy CTA with gold halo, not violet→cornflower. */}
        <button
          onClick={() => setShowIntro(false)}
          className="group relative inline-flex items-center justify-center gap-2 w-full max-w-sm h-14 rounded-xl transition-all duration-300 hover:translate-y-[-1px]"
          style={{
            background: "var(--skin-cta-bg, linear-gradient(135deg, rgba(10,22,40,0.92) 0%, rgba(18,28,56,0.85) 50%, rgba(10,22,40,0.92) 100%))",
            color: "var(--skin-cta-text, rgba(245, 245, 250, 0.98))",
            border: "0.5px solid var(--skin-cta-border, rgba(255, 255, 255, 0.14))",
            boxShadow: "var(--skin-cta-shadow, 0 0 0 1px rgba(212, 175, 55, 0.32), 0 0 22px -4px rgba(240, 194, 127, 0.45), 0 0 48px -10px rgba(212, 175, 55, 0.32))",
            backdropFilter: "blur(14px) saturate(160%)",
            WebkitBackdropFilter: "blur(14px) saturate(160%)",
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontSize: "14px",
            textShadow: "var(--skin-cta-text-shadow, 0 0 16px rgba(240,194,127,0.28))",
          }}
        >
          <span aria-hidden="true" style={{ color: "var(--skin-cta-icon, rgba(244, 212, 114, 0.98))", textShadow: "0 0 12px rgba(244,212,114,0.8)", fontSize: "16px" }}>✦</span>
          Map My Life
        </button>
      </div>
    </section>
  );

  // Day 63 evening (Sasha 2026-05-06): stripped `min-h-dvh` and the
  // bg-gradient that was forcing viewport-fill behavior inside
  // GameShellV2's main pane (same fix shape as introScreen above).
  // Natural top-aligned flow with reasonable padding now; the GameShell
  // bg shows through where there's no content.
  const content = (
    <section className="px-6 py-8 sm:py-12">
      <div className="container mx-auto max-w-4xl">
        {/* Progress Indicator */}
        <div className="text-center mb-8">
          <ProgressIndicator
            current={currentIndex + 1}
            total={DOMAINS.length}
            className="text-[var(--wabi-text-muted)]"
          />
          {/* Day 64 (Sasha 2026-05-07): progress dots shifted from
              violet to landing-register gold for visual coherence with
              the rest of the QoL flow. */}
          <div className="flex gap-2 justify-center">
            {DOMAINS.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "h-2 rounded-full transition-all",
                  idx === currentIndex ? "w-8" : "w-2",
                  idx < currentIndex
                    ? "bg-[#b8860b]"
                    : idx === currentIndex
                      ? "bg-[#b8860b]/60"
                      : "bg-[var(--wabi-text-muted)]/20"
                )}
              />
            ))}
          </div>
        </div>

        {/* Domain Heading — Day 64 (third pass, Sasha 2026-05-07):
            comprehensive legibility migration to Master Legibility
            Strong (1.5×) per ui_playbook.md Part VIII. Was using
            Tailwind utility `font-bold text-[var(--wabi-text-primary)]`
            with NO halo cocktail, NO Cormorant, NO surface treatment —
            sat on bare cinematic bg, illegible on cream sections.
            Now: Cormorant 700 + full halo-deep cocktail (4-layer)
            matching MethodologyLandingPage.tsx. Subtitle gets Source
            Serif 4 italic + alpha 0.88 + halo-soft. */}
        <div className="text-center mb-12">
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 700,
              fontSize: "clamp(32px, 5vw, 48px)",
              letterSpacing: "0.04em",
              lineHeight: 1.1,
              color: "var(--skin-text-primary, #0a1628)",
              textShadow: "var(--skin-text-halo-deep, 0 0 28px rgba(255,255,255,0.85), 0 1px 2px rgba(255,255,255,0.95), 0 0 1px rgba(11,42,90,0.65), 0 1px 0 rgba(11,42,90,0.45))",
            }}
            className="mb-4"
          >
            {domain.name.toUpperCase()}
          </h1>
          <p
            style={{
              fontFamily: "'Source Serif 4', 'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontSize: "16px",
              lineHeight: 1.55,
              color: "rgba(11, 42, 90, 0.88)",
              textShadow: "0 1px 2px rgba(255,255,255,0.7)",
            }}
          >
            Select the stage that best represents your current state in this domain.
          </p>
        </div>

        {/* Day 64 (Sasha 2026-05-07): "See Results" button moved ABOVE
            the stage grid on the last domain so the user doesn't have
            to scroll past 10 stages to find it. Sasha's screenshot
            feedback: "the See the Results button has to be on top, not
            at the bottom, so the person doesn't have to look for it." */}
        {isLastDomain && (
          <div className="hidden sm:flex justify-end mb-6">
            <button
              onClick={handleNext}
              disabled={!hasAnswer}
              className="group relative inline-flex items-center gap-2 px-8 py-3 rounded-full transition-all duration-300 hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                background: "var(--skin-cta-bg, linear-gradient(135deg, rgba(10,22,40,0.92) 0%, rgba(18,28,56,0.85) 50%, rgba(10,22,40,0.92) 100%))",
                color: "var(--skin-cta-text, rgba(245, 245, 250, 0.98))",
                border: "0.5px solid var(--skin-cta-border, rgba(255, 255, 255, 0.14))",
                boxShadow: "var(--skin-cta-shadow, 0 0 0 1px rgba(212, 175, 55, 0.32), 0 0 22px -4px rgba(240, 194, 127, 0.45))",
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontSize: "13px",
              }}
            >
              See Results
              <ArrowRight className="ml-1 h-4 w-4" />
            </button>
          </div>
        )}

        {/* Stages Grid
            Day 63: aria-pressed for screen-reader semantics.
            Day 64 (Sasha 2026-05-07): violet→gold register migration.
            "Selected" state was border-violet + bg-violet/10 + violet
            stage-number circle — Sasha called out "selector has purple
            colors which we have to also change because it's not our
            UI." Now: gold accent + warm cream bg, matching landing
            register. */}
        <div className="grid gap-4 mb-12" aria-label={`${domain.name} stages`}>
          {domain.stages.map((stage) => {
            const isSelected = selectedStageId === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => handleStageSelect(stage.id)}
                aria-pressed={isSelected}
                className={cn(
                  "relative p-6 rounded-2xl text-left transition-all duration-200",
                  "border-2 hover:scale-[1.02]",
                  isSelected
                    ? "border-[#b8860b] bg-[#b8860b]/10"
                    : "border-[var(--wabi-text-muted)]/20 bg-white/[0.85] hover:border-[#b8860b]/40"
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Stage Number */}
                  <div
                    className={cn(
                      "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all",
                      isSelected
                        ? "bg-[#b8860b] text-white shadow-[0_0_18px_-4px_rgba(184,134,11,0.55)]"
                        : "bg-[var(--wabi-text-muted)]/10 text-[var(--wabi-text-muted)]"
                    )}
                  >
                    {isSelected ? <Check className="w-6 h-6" /> : stage.id}
                  </div>

                  {/* Stage Content — Day 64 (third pass): halo cocktail
                      + Cormorant on title, Source Serif 4 on description,
                      alpha lift on muted text. Cards already have
                      bg-white/60; halo lifts text cleanly off the
                      semi-transparent surface. */}
                  <div className="flex-1">
                    <h3
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 700,
                        fontSize: "20px",
                        letterSpacing: "-0.005em",
                        lineHeight: 1.2,
                        color: "var(--skin-text-primary, #0a1628)",
                        textShadow: "0 1px 2px rgba(255,255,255,0.85), 0 0 1px rgba(11,42,90,0.4)",
                      }}
                      className="mb-2"
                    >
                      {stage.title}
                    </h3>
                    <p
                      style={{
                        fontFamily: "'Source Serif 4', serif",
                        fontSize: "15px",
                        lineHeight: 1.55,
                        color: "rgba(11, 42, 90, 0.85)",
                      }}
                    >
                      {stage.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Navigation Buttons - Desktop */}
        <div className="hidden sm:flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className={cn(
              "text-[var(--wabi-text-secondary)] border-[var(--wabi-text-muted)]/20",
              currentIndex === 0 && "opacity-0 pointer-events-none"
            )}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {/* Day 64 (Sasha 2026-05-07): bottom "See Results" button
              removed — the same action now lives ABOVE the grid (line
              ~145 area) per Sasha's feedback that the user shouldn't
              have to scroll past 10 stages to find it. */}
        </div>

        {/* Mobile Bottom Bar */}
        {/*
          Day 63 (Sasha 2026-05-06): paddingBottom uses safe-area-inset
          so the bar doesn't sit under the iPhone home indicator /
          notch. max(16px, env(...)) ensures non-iOS browsers still get
          the original 16px padding when env() resolves to 0.
        */}
        <div
          className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-[var(--wabi-text-muted)]/10 px-4 pt-4 shadow-lg z-above"
          style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}
        >
          <div className="flex items-center justify-between gap-3">
            {currentIndex > 0 && (
              <button
                onClick={handlePrevious}
                className="text-xs px-4 py-2 rounded-full border border-[var(--wabi-text-muted)]/20 text-[var(--wabi-text-secondary)] hover:bg-[var(--depth-violet)]/5 transition-colors"
              >
                <ArrowLeft className="inline mr-1 h-3 w-3" />
                Back
              </button>
            )}
            <div className="text-xs text-[var(--wabi-text-muted)] flex-1 text-center">
              {currentIndex + 1} of {DOMAINS.length}
            </div>
            {/* Only show explicit button on last domain */}
            {isLastDomain && (
              <button
                onClick={handleNext}
                disabled={!hasAnswer}
                className={cn(
                  "px-6 py-2 rounded-full font-bold text-sm text-white bg-gradient-to-r from-[var(--depth-violet)] to-[var(--depth-cornflower)] transition-all",
                  !hasAnswer && "opacity-50"
                )}
              >
                See Results
              </button>
            )}
          </div>
        </div>

        {/* Spacer for mobile bottom bar */}
        <div className="sm:hidden h-32" />
      </div>
    </section>
  );

  if (renderMode === "embedded") {
    return <div className="py-8">{showIntro ? introScreen : content}</div>;
  }

  // Day 63 (Sasha 2026-05-06): standalone wrappers removed. Previously
  // this page wrapped itself in `<div className="min-h-dvh"><Navigation
  // />...</div>` — its own top-bar shell that conflicted with the rest
  // of the QoL flow (Results/Priorities/GrowthRecipe used GameShellV2).
  // Now QolLayout owns GameShellV2 for all four pages; Assessment just
  // returns its content (intro or domain steps) directly. The pt-24
  // padding (which compensated for the now-retired fixed Navigation
  // height) was removed; the back button sits inside the new shell's
  // own top spacing.
  if (showIntro) {
    return introScreen;
  }

  return (
    <>
      {/* Back Button */}
      <div className="px-4 sm:px-6 lg:px-8 pt-2">
        <div className="container mx-auto max-w-4xl">
          <button
            onClick={() => currentIndex === 0 ? setShowIntro(true) : handlePrevious()}
            className="inline-flex items-center text-[var(--wabi-text-muted)] hover:text-[var(--wabi-text-secondary)] transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <BoldText>BACK</BoldText>
          </button>
        </div>
      </div>

      {/* Assessment Content */}
      {content}
    </>
  );
};

export default QualityOfLifeMapAssessment;
