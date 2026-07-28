import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GOLD_TEXT_STYLE, Ornament } from "@/lib/landingDesign";
import { EditorialCta } from "@/components/ui/editorial-cta";
import { ExpandableTestimonial } from "@/components/ExpandableTestimonial";
import { TESTIMONIALS } from "@/data/testimonials";
import SEO from "@/components/SEO";

/**
 * HomeLandingPage — `/home`, a private review surface for the proposed
 * landing rebuild (added July 28, 2026).
 *
 * Context: this component was briefly and mistakenly deployed as the
 * live homepage at `/`, then reverted (commit 6355a908) back to the
 * original `MethodologyLandingPage` / `JourneyPage`. The copy itself
 * (Ceiling Law hero, seven-stage map, recognition list, mirror-holder
 * section, testimonials, offer ladder, quiz CTA) was worth preserving
 * so Sasha can review it without it being live to strangers — hence
 * this standalone, noindex `/home` route. It is NOT wired into any
 * nav, sitemap, or shellRoutes indexing path; it renders in the same
 * shell chrome as `/` only because `/home` is listed in shellRoutes'
 * SHELL_EXACT set, purely for a faithful side-by-side review.
 *
 * Copy lives under the `homeLanding` i18n namespace (src/locales/
 * {en,ru,es}/common.json) — a byte-identical duplicate of the
 * `methodology` namespace taken at the moment of the incident, kept
 * separate so the live `methodology` namespace stays untouched.
 *
 * Do not treat this as the live homepage. Do not link to it publicly.
 * `MethodologyLandingPage.tsx` / `JourneyPage.tsx` remain the live `/`.
 */

const STAGE_KEYS = [1, 2, 3, 4, 5, 6, 7] as const;

const CALCOM_CLARITY_LINK =
  "https://cal.com/aleksandrkonstantinov/direction-choice-call";

const PROOF_TESTIMONIALS = TESTIMONIALS.filter((t) =>
  ["Sergey Jay Makarov", "Oyi Sun", "Karime Kuri"].includes(t.name),
);

const HomeLandingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const goToQuiz = () => navigate("/quiz");

  return (
    <>
      <SEO
        title={t("homeLanding.seoTitle")}
        description={t("homeLanding.seoDescription")}
        path="/home"
        ogTitle={t("homeLanding.seoTitle")}
        noIndex
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
            {t("homeLanding.hero.eyebrow")}
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
            {t("homeLanding.hero.headline")}
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
            {t("homeLanding.hero.sub")}
          </p>

          <Ornament className="my-5 sm:my-6" />

          <div className="flex flex-col items-center gap-3">
            <EditorialCta
              label={t("homeLanding.hero.ctaLabel")}
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
              {t("homeLanding.hero.ctaMicro")}
            </p>
          </div>
        </header>

        {/* ═══════ 2. THE MAP — ALL SEVEN STAGES ═══════ */}
        <section className="mt-10 sm:mt-12" aria-label={t("homeLanding.map.eyebrow")}>
          <p
            className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.28em] mb-3 text-center"
            style={{
              color: "var(--skin-text-secondary, #33415c)",
              textShadow:
                "var(--skin-text-halo-strong, 0 0 20px rgba(255,255,255,0.8), 0 1px 2px rgba(255,255,255,0.9))",
            }}
          >
            {t("homeLanding.map.eyebrow")}
          </p>

          <p
            className="text-sm sm:text-base leading-relaxed text-center max-w-[540px] mx-auto mb-6"
            style={{
              fontFamily: "'Source Serif 4', serif",
              fontStyle: "italic",
              color: "var(--skin-text-secondary, #33415c)",
            }}
          >
            {t("homeLanding.map.orientingLine")}
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
                    {t(`homeLanding.map.stage${n}Name`)}
                  </span>
                  <span
                    className="text-sm"
                    style={{
                      fontFamily: "'Source Serif 4', serif",
                      color: "var(--skin-text-secondary, #33415c)",
                    }}
                  >
                    {t(`homeLanding.map.stage${n}Line`)}
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
            {t("homeLanding.deeperRead.line1")}
            <br />
            {t("homeLanding.deeperRead.line2")}
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
                {t(`homeLanding.deeperRead.recognition${n}`)}
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
            {t("homeLanding.deeperRead.closingLine")}
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
            {t("homeLanding.mirror.eyebrow")}
          </p>
          <p
            className="text-sm sm:text-base leading-relaxed"
            style={{
              fontFamily: "'Source Serif 4', serif",
              color: "var(--skin-text-secondary, #33415c)",
            }}
          >
            {t("homeLanding.mirror.text")}
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
            {t("homeLanding.proof.eyebrow")}
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
            {t("homeLanding.ladder.eyebrow")}
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
                  {t("homeLanding.ladder.call.name")}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--skin-text-muted-soft, rgba(26,30,58,0.55))" }}
                >
                  {t("homeLanding.ladder.call.meta")}
                </p>
                <p
                  className="text-sm mt-1.5 leading-relaxed"
                  style={{
                    fontFamily: "'Source Serif 4', serif",
                    color: "var(--skin-text-secondary, #33415c)",
                  }}
                >
                  {t("homeLanding.ladder.call.desc")}
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
                  {t("homeLanding.ladder.session.name")}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--skin-text-muted-soft, rgba(26,30,58,0.55))" }}
                >
                  {t("homeLanding.ladder.session.meta")}
                </p>
                <p
                  className="text-sm mt-1.5 leading-relaxed"
                  style={{
                    fontFamily: "'Source Serif 4', serif",
                    color: "var(--skin-text-secondary, #33415c)",
                  }}
                >
                  {t("homeLanding.ladder.session.desc")}
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
                  {t("homeLanding.ladder.built.name")}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--skin-text-muted-soft, rgba(26,30,58,0.55))" }}
                >
                  {t("homeLanding.ladder.built.meta")}
                </p>
                <p
                  className="text-sm mt-1.5 leading-relaxed"
                  style={{
                    fontFamily: "'Source Serif 4', serif",
                    color: "var(--skin-text-secondary, #33415c)",
                  }}
                >
                  {t("homeLanding.ladder.built.desc")}
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
            {t("homeLanding.close.headline")}
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
              {t("homeLanding.close.sub")}
            </span>
          </p>

          <div className="flex flex-col items-center gap-3 pb-4">
            <EditorialCta
              label={t("homeLanding.hero.ctaLabel")}
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
              {t("homeLanding.hero.ctaMicro")}
            </p>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomeLandingPage;
