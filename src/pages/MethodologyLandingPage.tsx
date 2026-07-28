import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GOLD_TEXT_STYLE, Ornament } from "@/lib/landingDesign";
import { EditorialCta } from "@/components/ui/editorial-cta";
import { ExpandableTestimonial } from "@/components/ExpandableTestimonial";
import { TESTIMONIALS } from "@/data/testimonials";
import SEO from "@/components/SEO";

/**
 * MethodologyLandingPage — the pane-3 content of the JOURNEY space on `/`
 * (and on `/game/journey`, via `JourneyPage`).
 *
 * Rebuilt Day 137 (2026-07-28) around the Ceiling Law, with the Transition
 * Quiz (`/quiz`) as the primary door. Diagnosis-first: the axiom names the
 * law, the map lets a stranger locate themselves before clicking anything,
 * and the quiz is the one action the whole page points at. The Direction
 * Call / Productize Yourself Session / BUILT ladder is the second door,
 * for people the quiz places further along the arc.
 *
 * Structure (see docs/holomaps/transition_holomap.md for the seven-stage
 * source and docs/02-strategy/unique-businesses/alexanders_unique_business.md
 * for the ladder naming — "Direction Call", "Productize Yourself Session",
 * "BUILT", never "Ignition Session"):
 *   1. Hero — the law, the primary CTA to /quiz
 *   2. The map — all seven stages, one line each
 *   3. The deeper read — recognition list
 *   4. Who is holding the mirror
 *   5. Proof — real testimonials from src/data/testimonials.ts
 *   6. The ladder — Direction Call -> Productize Yourself Session -> BUILT
 *   7. Close — back to the quiz CTA
 *
 * Design system: reuses GOLD_TEXT_STYLE / Ornament (landingDesign),
 * EditorialCta (the site's one CTA grammar), ExpandableTestimonial
 * (compact, light variant), and the same Cormorant Garamond / Source
 * Serif 4 / liquid-glass vocabulary used everywhere else on `/`, `/path`,
 * and `/ignite`. No new visual language introduced.
 */

const STAGE_KEYS = [1, 2, 3, 4, 5, 6, 7] as const;

const CALCOM_CLARITY_LINK =
  "https://cal.com/aleksandrkonstantinov/direction-choice-call";

const PROOF_TESTIMONIALS = TESTIMONIALS.filter((t) =>
  ["Sergey Jay Makarov", "Oyi Sun", "Karime Kuri"].includes(t.name),
);

const MethodologyLandingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const goToQuiz = () => navigate("/quiz");

  return (
    <>
      <SEO
        title={t("methodology.seoTitle")}
        description={t("methodology.seoDescription")}
        path="/"
        ogTitle={t("methodology.seoTitle")}
      />
      <div className="max-w-[720px] mx-auto px-5 py-6 sm:py-7 md:py-8">
        {/* ═══════ 1. HERO — THE LAW FIRST ═══════ */}
        <header className="text-center">
          <p
            className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.28em] mb-3"
            style={{
              color: "var(--skin-text-secondary, #33415c)",
              textShadow:
                "var(--skin-text-halo-strong, 0 0 20px rgba(255,255,255,0.8), 0 1px 2px rgba(255,255,255,0.9))",
            }}
          >
            {t("methodology.hero.eyebrow")}
          </p>

          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-bold leading-[1.2] tracking-[-0.018em] mb-3 sm:mb-4"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "var(--skin-text-primary, #0a1628)",
              textShadow:
                "var(--skin-text-halo-deep, 0 0 22px rgba(255,255,255,0.7), 0 1px 2px rgba(255,255,255,0.9), 0 0 1px rgba(11,42,90,0.45), 0 1px 0 rgba(11,42,90,0.25))",
            }}
          >
            {t("methodology.hero.headline")}
          </h1>

          <p
            className="text-base sm:text-lg leading-[1.4] max-w-[560px] mx-auto"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 600,
              color: "var(--skin-text-primary, #0a1628)",
              textShadow:
                "var(--skin-text-halo-deep, 0 0 28px rgba(255,255,255,0.85), 0 1px 2px rgba(255,255,255,0.95), 0 0 1px rgba(11,42,90,0.65), 0 1px 0 rgba(11,42,90,0.45))",
            }}
          >
            {t("methodology.hero.sub")}
          </p>

          <Ornament className="my-5 sm:my-6" />

          <div className="flex flex-col items-center gap-3">
            <EditorialCta
              label={t("methodology.hero.ctaLabel")}
              onClick={goToQuiz}
            />
            <p
              className="max-w-[420px]"
              style={{
                color: "var(--skin-text-muted-soft, rgba(26,30,58,0.6))",
                textShadow:
                  "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
                fontSize: "0.72rem",
                letterSpacing: "0.04em",
                fontWeight: 500,
              }}
            >
              {t("methodology.hero.ctaMicro")}
            </p>
          </div>
        </header>

        {/* ═══════ 2. THE MAP — ALL SEVEN STAGES ═══════ */}
        <section className="mt-10 sm:mt-12" aria-label={t("methodology.map.eyebrow")}>
          <p
            className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.28em] mb-3 text-center"
            style={{
              color: "var(--skin-text-secondary, #33415c)",
              textShadow:
                "var(--skin-text-halo-strong, 0 0 20px rgba(255,255,255,0.8), 0 1px 2px rgba(255,255,255,0.9))",
            }}
          >
            {t("methodology.map.eyebrow")}
          </p>

          <p
            className="text-sm sm:text-base leading-relaxed text-center max-w-[540px] mx-auto mb-6"
            style={{
              fontFamily: "'Source Serif 4', serif",
              fontStyle: "italic",
              color: "var(--skin-text-secondary, #33415c)",
            }}
          >
            {t("methodology.map.orientingLine")}
          </p>

          <div className="space-y-2.5">
            {STAGE_KEYS.map((n) => (
              <div
                key={n}
                className="liquid-glass rounded-2xl px-4 py-3 flex items-baseline gap-3"
              >
                <span
                  className="flex-shrink-0 text-xs font-semibold w-5 text-right"
                  style={{
                    color: "var(--skin-text-muted-soft, rgba(26,30,58,0.4))",
                  }}
                >
                  {n}
                </span>
                <div className="min-w-0">
                  <span
                    className="font-semibold mr-1.5"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "1.05em",
                      color: "var(--skin-text-primary, #0a1628)",
                    }}
                  >
                    {t(`methodology.map.stage${n}Name`)}
                  </span>
                  <span
                    className="text-sm"
                    style={{
                      fontFamily: "'Source Serif 4', serif",
                      color: "var(--skin-text-secondary, #33415c)",
                    }}
                  >
                    {t(`methodology.map.stage${n}Line`)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════ 3. THE DEEPER READ ═══════ */}
        <section className="mt-10 sm:mt-12 text-center">
          <p
            className="text-lg sm:text-xl leading-[1.4]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 700,
              color: "var(--skin-text-primary, #0a1628)",
            }}
          >
            {t("methodology.deeperRead.line1")}
            <br />
            {t("methodology.deeperRead.line2")}
          </p>

          <ul className="mt-6 space-y-3 max-w-[480px] mx-auto text-left">
            {[1, 2, 3, 4].map((n) => (
              <li
                key={n}
                className="text-sm sm:text-base leading-relaxed pl-4 relative"
                style={{
                  fontFamily: "'Source Serif 4', serif",
                  color: "var(--skin-text-secondary, #33415c)",
                }}
              >
                <span
                  className="absolute left-0"
                  style={{ color: "var(--skin-text-muted-soft, rgba(26,30,58,0.4))" }}
                  aria-hidden="true"
                >
                  &middot;
                </span>
                {t(`methodology.deeperRead.recognition${n}`)}
              </li>
            ))}
          </ul>

          <p
            className="mt-7 text-xl sm:text-2xl font-bold"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "var(--skin-text-primary, #0a1628)",
            }}
          >
            {t("methodology.deeperRead.closingLine")}
          </p>
        </section>

        {/* ═══════ 4. WHO IS HOLDING THE MIRROR ═══════ */}
        <section className="mt-10 sm:mt-12 text-center max-w-[540px] mx-auto">
          <p
            className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.28em] mb-3"
            style={{
              color: "var(--skin-text-secondary, #33415c)",
              textShadow:
                "var(--skin-text-halo-strong, 0 0 20px rgba(255,255,255,0.8), 0 1px 2px rgba(255,255,255,0.9))",
            }}
          >
            {t("methodology.mirror.eyebrow")}
          </p>
          <p
            className="text-sm sm:text-base leading-relaxed"
            style={{
              fontFamily: "'Source Serif 4', serif",
              color: "var(--skin-text-secondary, #33415c)",
            }}
          >
            {t("methodology.mirror.text")}
          </p>
        </section>

        {/* ═══════ 5. PROOF ═══════ */}
        <section className="mt-10 sm:mt-12">
          <p
            className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.28em] mb-3 text-center"
            style={{
              color: "var(--skin-text-secondary, #33415c)",
              textShadow:
                "var(--skin-text-halo-strong, 0 0 20px rgba(255,255,255,0.8), 0 1px 2px rgba(255,255,255,0.9))",
            }}
          >
            {t("methodology.proof.eyebrow")}
          </p>
          <div className="space-y-1 max-w-[560px] mx-auto">
            {PROOF_TESTIMONIALS.map((testimonial) => (
              <ExpandableTestimonial
                key={testimonial.name}
                t={testimonial}
                variant="light"
                compact
              />
            ))}
          </div>
        </section>

        {/* ═══════ 6. THE LADDER ═══════ */}
        <section className="mt-10 sm:mt-12">
          <p
            className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.28em] mb-4 text-center"
            style={{
              color: "var(--skin-text-secondary, #33415c)",
              textShadow:
                "var(--skin-text-halo-strong, 0 0 20px rgba(255,255,255,0.8), 0 1px 2px rgba(255,255,255,0.9))",
            }}
          >
            {t("methodology.ladder.eyebrow")}
          </p>

          <div className="space-y-3 max-w-[560px] mx-auto">
            {/* Direction Call */}
            <a
              href={CALCOM_CLARITY_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="liquid-glass rounded-2xl px-4 py-3.5 flex items-center justify-between gap-3 transition-transform hover:scale-[1.01] active:scale-[0.99]"
            >
              <div className="min-w-0">
                <p
                  className="font-semibold"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "1.1em",
                    color: "var(--skin-text-primary, #0a1628)",
                  }}
                >
                  {t("methodology.ladder.call.name")}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--skin-text-muted-soft, rgba(26,30,58,0.55))" }}
                >
                  {t("methodology.ladder.call.meta")}
                </p>
                <p
                  className="text-sm mt-1.5 leading-relaxed"
                  style={{
                    fontFamily: "'Source Serif 4', serif",
                    color: "var(--skin-text-secondary, #33415c)",
                  }}
                >
                  {t("methodology.ladder.call.desc")}
                </p>
              </div>
            </a>

            {/* Productize Yourself Session */}
            <a
              href="/ignite"
              className="liquid-glass rounded-2xl px-4 py-3.5 flex items-center justify-between gap-3 transition-transform hover:scale-[1.01] active:scale-[0.99]"
            >
              <div className="min-w-0">
                <p
                  className="font-semibold"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "1.1em",
                    color: "var(--skin-text-primary, #0a1628)",
                  }}
                >
                  {t("methodology.ladder.session.name")}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--skin-text-muted-soft, rgba(26,30,58,0.55))" }}
                >
                  {t("methodology.ladder.session.meta")}
                </p>
                <p
                  className="text-sm mt-1.5 leading-relaxed"
                  style={{
                    fontFamily: "'Source Serif 4', serif",
                    color: "var(--skin-text-secondary, #33415c)",
                  }}
                >
                  {t("methodology.ladder.session.desc")}
                </p>
              </div>
            </a>

            {/* BUILT */}
            <a
              href="/products/built"
              className="liquid-glass rounded-2xl px-4 py-3.5 flex items-center justify-between gap-3 transition-transform hover:scale-[1.01] active:scale-[0.99]"
            >
              <div className="min-w-0">
                <p
                  className="font-semibold"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "1.1em",
                    color: "var(--skin-text-primary, #0a1628)",
                  }}
                >
                  {t("methodology.ladder.built.name")}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--skin-text-muted-soft, rgba(26,30,58,0.55))" }}
                >
                  {t("methodology.ladder.built.meta")}
                </p>
                <p
                  className="text-sm mt-1.5 leading-relaxed"
                  style={{
                    fontFamily: "'Source Serif 4', serif",
                    color: "var(--skin-text-secondary, #33415c)",
                  }}
                >
                  {t("methodology.ladder.built.desc")}
                </p>
              </div>
            </a>
          </div>
        </section>

        {/* ═══════ 7. CLOSE — BACK TO THE QUIZ ═══════ */}
        <section className="mt-12 sm:mt-14 text-center">
          <Ornament className="mb-6" />
          <p
            className="text-lg sm:text-xl leading-[1.4] mb-2"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 700,
              color: "var(--skin-text-primary, #0a1628)",
            }}
          >
            {t("methodology.close.headline")}
          </p>
          <p
            className="text-sm sm:text-base mb-6"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              color: "var(--skin-text-secondary, #33415c)",
            }}
          >
            <span
              className="not-italic font-semibold bg-clip-text text-transparent"
              style={GOLD_TEXT_STYLE}
            >
              {t("methodology.close.sub")}
            </span>
          </p>

          <div className="flex flex-col items-center gap-3 pb-4">
            <EditorialCta
              label={t("methodology.hero.ctaLabel")}
              onClick={goToQuiz}
            />
            <p
              className="max-w-[420px]"
              style={{
                color: "var(--skin-text-muted-soft, rgba(26,30,58,0.6))",
                textShadow:
                  "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
                fontSize: "0.72rem",
                letterSpacing: "0.04em",
                fontWeight: 500,
              }}
            >
              {t("methodology.hero.ctaMicro")}
            </p>
          </div>
        </section>
      </div>
    </>
  );
};

export default MethodologyLandingPage;
