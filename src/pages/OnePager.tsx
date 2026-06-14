import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { GOLD_GRADIENT, GOLD_GLOW, Ornament, igniteLogo } from "@/lib/landingDesign";

/**
 * OnePager — public 1-pager for Planetary OS. Route: /1-pager.
 *
 * Standalone (NOT inside GameShellV2): a clean, full-bleed, shareable
 * surface with no rail or nav. Liquid Glass editorial register (navy + gold,
 * Cormorant headlines, DM Sans body) per docs/03-playbooks/glassmorphism_blueprint.md.
 * Copy is locked from docs/02-strategy/planetary_os_1pager.md — Sasha owns copy edits.
 *
 * Day 87 design polish (Sasha 2026-05-29):
 *   - GradientInk swapped from off-brand violet/blue/orange to platform
 *     GOLD_GRADIENT for brand coherence with the landing.
 *   - Dedicated CTA cluster added between panels and closing pull-quote.
 *   - Inline soft CTA under hero body for early-leavers.
 *   - Panel weights differentiated (heavy / standard / light) restoring
 *     hierarchy by argument importance.
 *   - Hero → first card spacing tightened, ornament rule bridges them.
 *   - Footer warmer with Cormorant tagline.
 *   - Hero sub-h1 wrap fix (max-width tightened, soft break inserted).
 *   - Gameplay numerals gold-tinted (was muted navy).
 *   - SiteLogo replaced with Planetary OS Cormorant wordmark on this
 *     surface (this IS the Planetary OS brand surface, not FYTT funnel).
 */

// Day 91 (Sasha 2026-06-09): tokenized for Aurum — primary ink reads the
// skin token with the original literal as fallback, so the dark skins
// (aurum / techstars) re-tone this standalone surface correctly.
const NAVY = "var(--skin-text-primary, #0a1628)";

const GAMEPLAY: Array<{ n: string; titleKey: string; descKey: string }> = [
  { n: "1", titleKey: "onePager.gameplay.step1Title", descKey: "onePager.gameplay.step1Desc" },
  { n: "2", titleKey: "onePager.gameplay.step2Title", descKey: "onePager.gameplay.step2Desc" },
  { n: "3", titleKey: "onePager.gameplay.step3Title", descKey: "onePager.gameplay.step3Desc" },
  { n: "4", titleKey: "onePager.gameplay.step4Title", descKey: "onePager.gameplay.step4Desc" },
  { n: "5", titleKey: "onePager.gameplay.step5Title", descKey: "onePager.gameplay.step5Desc" },
  { n: "6", titleKey: "onePager.gameplay.step6Title", descKey: "onePager.gameplay.step6Desc" },
];

const Eyebrow = ({ children, size = "default" }: { children: ReactNode; size?: "default" | "large" }) => (
  <p
    className={`uppercase mb-3 ${size === "large" ? "text-[12px] tracking-[0.30em]" : "text-[11px] tracking-[0.28em]"}`}
    style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.5))" }}
  >
    {children}
  </p>
);

const GradientInk = ({ children }: { children: ReactNode }) => (
  <span
    className="bg-clip-text text-transparent"
    style={{
      backgroundImage: GOLD_GRADIENT,
      filter: GOLD_GLOW,
      textShadow: "none",
    }}
  >
    {children}
  </span>
);

/**
 * Panel — three weights for argument-importance hierarchy.
 *   - heavy: liquid-glass-strong, larger eyebrow + inner ornament
 *   - standard: current liquid-glass treatment
 *   - light: hairline border only, no glass, more transparent
 */
const Panel = ({
  eyebrow,
  weight = "standard",
  children,
}: {
  eyebrow: string;
  weight?: "heavy" | "standard" | "light";
  children: ReactNode;
}) => {
  if (weight === "heavy") {
    return (
      <section className="liquid-glass-strong rounded-3xl p-8 sm:p-10">
        <Eyebrow size="large">{eyebrow}</Eyebrow>
        {children}
      </section>
    );
  }
  if (weight === "light") {
    return (
      <section
        className="rounded-3xl px-7 py-6 sm:px-9 sm:py-7"
        style={{
          background: "var(--skin-card-fill, rgba(255,255,255,0.35))",
          border: "1px solid var(--skin-hairline, rgba(26,30,58,0.10))",
          boxShadow: "0 1px 2px rgba(26,30,58,0.04)",
        }}
      >
        <Eyebrow>{eyebrow}</Eyebrow>
        {children}
      </section>
    );
  }
  return (
    <section className="liquid-glass rounded-3xl p-7 sm:p-9">
      <Eyebrow>{eyebrow}</Eyebrow>
      {children}
    </section>
  );
};

const bodyStyle = { color: "var(--skin-text-muted, rgba(26,30,58,0.8))" } as const;

/**
 * PlanetaryOSWordmark — replaces the FYTT torus on this surface.
 * /1-pager IS the Planetary OS brand artifact, not the FYTT funnel,
 * so the wordmark should match the page identity.
 */
const PlanetaryOSWordmark = () => {
  const { t } = useTranslation();
  return (
  <Link
    to="/"
    className="fixed top-5 left-1/2 -translate-x-1/2 z-50 group inline-flex items-center gap-2.5 transition-opacity hover:opacity-80"
    aria-label={t("onePager.wordmarkAriaLabel")}
  >
    <img
      src={igniteLogo}
      alt=""
      aria-hidden="true"
      className="h-5 w-auto ornament-spin"
      style={{
        filter: "drop-shadow(0 0 10px rgba(240, 194, 127, 0.45)) drop-shadow(0 0 3px rgba(212, 175, 55, 0.65))",
        animation: "ornament-spin 48s linear infinite",
      }}
      draggable={false}
    />
    <span
      style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontWeight: 600,
        fontSize: "13px",
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: "var(--skin-text-muted, rgba(26,30,58,0.7))",
      }}
    >
      Planetary OS
    </span>
  </Link>
  );
};

const OnePager = () => {
  const { t } = useTranslation();
  const headlineHalo = "0 0 26px rgba(255,255,255,0.7), 0 1px 2px rgba(255,255,255,0.85)";
  return (
    <main
      // Day 87 (Sasha): natural height (was min-h-screen) so the closing
      // footer ends without a 1500px cream-tail empty zone below.
      className="relative overflow-hidden"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        color: NAVY,
        // Day 91 (Sasha 2026-06-09): page wash reads --skin-page-wash (set
        // only by the dark skins) with the exact cream gradient as fallback.
        background: "var(--skin-page-wash, linear-gradient(160deg, #f6f5f1 0%, #eef0f6 55%, #f1ecf6 100%))",
        minHeight: "100vh",
      }}
    >
      <PlanetaryOSWordmark />

      {/* Ambient glows — lifted from 0.10 → 0.18 alpha so they actually
          register against the cream gradient. Gold radial added near the
          bottom-right to land warm light beneath the closing pull-quote. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-32 -left-24 w-[680px] h-[680px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(35 85% 60% / 0.16) 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-1/3 -right-32 w-[620px] h-[620px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(212 85% 55% / 0.14) 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-40 left-1/4 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(40 90% 55% / 0.14) 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative z-10 max-w-[820px] mx-auto px-5 sm:px-8 pt-20 sm:pt-24 pb-16 sm:pb-20">
        {/* HERO — tightened mb (was 14/20, now 8/10), tightened sub-h1 max-width, soft break for clean wrap. */}
        <header className="text-center mb-8 sm:mb-10">
          <p className="text-[11px] uppercase tracking-[0.30em] mb-5" style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.5))" }}>
            {t("onePager.heroEyebrow")}
          </p>
          <h1
            className="font-bold leading-[1.04] tracking-[-0.01em]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(3rem, 9vw, 5.5rem)",
              color: NAVY,
              textShadow: headlineHalo,
            }}
          >
            Planetary OS
          </h1>
          <p
            className="mt-5 italic mx-auto max-w-[44ch]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
              color: "var(--skin-text-muted, rgba(26,30,58,0.72))",
              lineHeight: 1.35,
            }}
          >
            {t("onePager.heroTaglineBefore")}{" "}
            <GradientInk>{t("onePager.heroTaglineEmphasis")}</GradientInk>{t("onePager.heroTaglineAfter")}
          </p>
          <p className="mt-8 mx-auto max-w-[56ch] text-[15px] sm:text-base leading-relaxed" style={bodyStyle}>
            {t("onePager.heroBody")}
          </p>

          {/* Inline soft CTA — for early-leavers who don't scroll to the dedicated cluster. */}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 mt-6 text-[13px] font-medium transition-opacity hover:opacity-70"
            style={{
              color: "var(--skin-text-muted, rgba(26,30,58,0.72))",
              borderBottom: "1px solid rgba(160, 109, 8, 0.45)",
              paddingBottom: "2px",
            }}
          >
            {t("onePager.heroSoftCta")}
            <ArrowRight className="w-3.5 h-3.5 opacity-70" />
          </Link>
        </header>

        {/* Connective ornament — bridges hero to first panel. */}
        <Ornament className="my-10 sm:my-12" />

        {/* BODY — panel weight gradient by argument importance:
            standard / HEAVY / HEAVY / light / light / standard */}
        <div className="space-y-5">
          <Panel eyebrow={t("onePager.shiftEyebrow")} weight="standard">
            <p className="text-[15px] sm:text-base leading-relaxed" style={bodyStyle}>
              {t("onePager.shiftPara1")}
            </p>
            <p className="text-[15px] sm:text-base leading-relaxed mt-4" style={bodyStyle}>
              {t("onePager.shiftPara2")}
            </p>
          </Panel>

          <Panel eyebrow={t("onePager.kernelEyebrow")} weight="heavy">
            <p className="text-[15px] sm:text-base leading-relaxed" style={bodyStyle}>
              {t("onePager.kernelPara1")}
            </p>
            <p className="text-[15px] sm:text-base leading-relaxed mt-4" style={bodyStyle}>
              {t("onePager.kernelPara2Before")} <GradientInk>{t("onePager.kernelPara2Emphasis")}</GradientInk>{t("onePager.kernelPara2After")}
            </p>
          </Panel>

          <Panel eyebrow={t("onePager.gameplayEyebrow")} weight="heavy">
            <p className="text-[15px] sm:text-base leading-relaxed mb-5" style={bodyStyle}>
              {t("onePager.gameplayIntro")}
            </p>
            <ol className="space-y-3">
              {GAMEPLAY.map((g) => (
                <li key={g.n} className="flex gap-4 items-baseline">
                  <span
                    className="font-semibold tabular-nums shrink-0 bg-clip-text text-transparent"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "1.5rem",
                      backgroundImage: GOLD_GRADIENT,
                      filter: GOLD_GLOW,
                    }}
                  >
                    {g.n}
                  </span>
                  <p className="text-[15px] sm:text-base leading-snug" style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.82))" }}>
                    <span className="font-semibold" style={{ color: NAVY }}>{t(g.titleKey)}:</span> {t(g.descKey)}
                  </p>
                </li>
              ))}
            </ol>
            <p className="text-[13px] mt-5 italic" style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.6))" }}>
              {t("onePager.gameplayHolonic")}
            </p>
          </Panel>

          <Panel eyebrow={t("onePager.metricEyebrow")} weight="light">
            <p className="text-[15px] sm:text-base leading-relaxed" style={bodyStyle}>
              {t("onePager.metricPara1Before")} <GradientInk>{t("onePager.metricPara1Emphasis")}</GradientInk>{t("onePager.metricPara1After")}
            </p>
            <p className="text-[15px] sm:text-base leading-relaxed mt-4" style={bodyStyle}>
              {t("onePager.metricPara2")}
            </p>
          </Panel>

          <Panel eyebrow={t("onePager.growsEyebrow")} weight="light">
            <p className="text-[15px] sm:text-base leading-relaxed" style={bodyStyle}>
              {t("onePager.growsPara")}
            </p>
          </Panel>

          <Panel eyebrow={t("onePager.touchEyebrow")} weight="standard">
            <p className="text-[15px] sm:text-base leading-relaxed" style={bodyStyle}>
              {t("onePager.touchPara")}
            </p>
          </Panel>
        </div>

        {/* DEDICATED CTA CLUSTER — primary action gets real visual weight,
            secondary actions sit as small text links below. */}
        <section className="mt-14 sm:mt-16 text-center">
          <Ornament className="mb-10" />
          <Link
            to="/"
            className="liquid-glass-strong inline-flex items-center gap-3 rounded-full px-8 py-4 text-base font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              color: NAVY,
              textShadow: "0 1px 2px rgba(255,255,255,0.7)",
              letterSpacing: "0.04em",
            }}
          >
            <img
              src={igniteLogo}
              alt=""
              aria-hidden="true"
              className="h-4 w-auto"
              style={{
                filter: "drop-shadow(0 0 8px rgba(240, 194, 127, 0.5)) drop-shadow(0 0 2px rgba(212, 175, 55, 0.7))",
              }}
            />
            {t("onePager.primaryCta")}
            <ArrowRight className="w-4 h-4 opacity-70" />
          </Link>
          <p className="mt-4 text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.5))" }}>
            {t("onePager.ctaMeta")}
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px]">
            <Link
              to="/?path=match"
              className="inline-flex items-center gap-1.5 font-medium transition-opacity hover:opacity-70"
              style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.7))" }}
            >
              {t("onePager.secondaryDemo")}
              <ArrowRight className="w-3.5 h-3.5 opacity-60" />
            </Link>
            <a
              href="https://t.me/integralevolution"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium transition-opacity hover:opacity-70"
              style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.7))" }}
            >
              {t("onePager.secondaryBook")}
              <ArrowRight className="w-3.5 h-3.5 opacity-60" />
            </a>
          </div>
        </section>

        {/* STAKE — closing pull-quote */}
        <section className="text-center mt-16 sm:mt-20 max-w-[54ch] mx-auto">
          <Eyebrow>{t("onePager.stakeEyebrow")}</Eyebrow>
          <p
            className="italic"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.25rem, 3vw, 1.7rem)",
              color: "var(--skin-text-muted, rgba(26,30,58,0.8))",
              lineHeight: 1.4,
            }}
          >
            {t("onePager.stakeQuote")}
          </p>
        </section>

        {/* FOOTER — warmer close with italic Cormorant tagline above the wordmark. */}
        <footer className="text-center mt-20">
          <p
            className="italic mb-2"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "0.95rem",
              color: "var(--skin-text-muted, rgba(26,30,58,0.55))",
            }}
          >
            {t("onePager.footerTagline")}
          </p>
          <p className="text-[10px] uppercase tracking-[0.28em]" style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.4))" }}>
            Planetary OS · findyourtoptalent.com
          </p>
        </footer>
      </div>
    </main>
  );
};

export default OnePager;
