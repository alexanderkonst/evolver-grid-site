import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { GOLD_GRADIENT, GOLD_GLOW, Ornament, igniteLogo } from "@/lib/landingDesign";

/**
 * Monetization — public explainer for how Find Your Top Talent / Planetary OS
 * is paid for. Route: /monetization.
 *
 * Standalone (NOT inside GameShellV2): a clean, public transparency surface in
 * the same Liquid Glass editorial register as /1-pager (navy + gold, Cormorant
 * headlines, DM Sans body). Radical-transparency framing per the brand ("built
 * in the open, paid in the open"). Canonical detail lives in
 * docs/02-strategy/monetization_strategies.md. Copy is a v1 draft for Sasha to vet.
 *
 * Day 87 design polish (Sasha 2026-05-29):
 *   - GradientInk swapped from off-brand violet/blue/orange to platform
 *     GOLD_GRADIENT for brand coherence.
 *   - Dedicated CTA cluster added (was buried inside last panel).
 *   - Inline soft CTA under hero body for early-leavers.
 *   - Panel weight differentiation (Three ways = heavy, others standard/light).
 *   - Hero → first card spacing tightened, ornament rule bridges them.
 *   - Empty page tail eliminated via natural-height main (was min-h-screen
 *     plus only 1338px of content = 1500px of cream dead-space below).
 *   - Footer warmer with Cormorant tagline.
 *   - Hero sub-h1 wrap fix (max-width tightened).
 */

// Day 91 (Sasha 2026-06-09): tokenized for Aurum — primary ink reads the
// skin token with the original literal as fallback, so the dark skins
// (aurum / techstars) re-tone this standalone surface correctly.
const NAVY = "var(--skin-text-primary, #0a1628)";

const WAYS: Array<{ n: string; titleKey: string; descKey: string }> = [
  {
    n: "1",
    titleKey: "monetization.way1Title",
    descKey: "monetization.way1Desc",
  },
  {
    n: "2",
    titleKey: "monetization.way2Title",
    descKey: "monetization.way2Desc",
  },
  {
    n: "3",
    titleKey: "monetization.way3Title",
    descKey: "monetization.way3Desc",
  },
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

const Monetization = () => {
  const { t } = useTranslation();
  const headlineHalo = "0 0 26px rgba(255,255,255,0.7), 0 1px 2px rgba(255,255,255,0.85)";
  return (
    <main
      // Day 87 (Sasha): min-h-screen → natural height. The previous setup
      // forced ~2800px of cream gradient below 1338px of actual content,
      // creating an empty-tail visual signature. Natural height + py
      // padding gives the closing footer a clean breath without the
      // dead space.
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
      {/* Ambient glows — lifted from 0.10 → 0.16-0.18 alpha. Gold-warm
          family instead of violet/blue/gold trio for brand coherence. */}
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

      <div className="relative z-10 max-w-[820px] mx-auto px-5 sm:px-8 pt-20 sm:pt-24 pb-12 sm:pb-16">
        {/* HERO — tightened mb (was 14/20, now 8/10), tightened sub-h1 max-width. */}
        <header className="text-center mb-8 sm:mb-10">
          <p className="text-[11px] uppercase tracking-[0.30em] mb-5" style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.5))" }}>
            {t("monetization.heroEyebrow")}
          </p>
          <h1
            className="font-bold leading-[1.04] tracking-[-0.01em]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2.6rem, 8vw, 4.75rem)",
              color: NAVY,
              textShadow: headlineHalo,
            }}
          >
            {t("monetization.heroTitle")}
          </h1>
          <p
            className="mt-5 italic mx-auto max-w-[36ch]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.25rem, 3vw, 1.7rem)",
              color: "var(--skin-text-muted, rgba(26,30,58,0.72))",
              lineHeight: 1.35,
            }}
          >
            {t("monetization.heroSubBefore")}{" "}
            <GradientInk>{t("monetization.heroSubInk")}</GradientInk>{t("monetization.heroSubAfter")}
          </p>
          <p className="mt-8 mx-auto max-w-[56ch] text-[15px] sm:text-base leading-relaxed" style={bodyStyle}>
            {t("monetization.heroBody")}
          </p>

          {/* Inline soft CTA — for early-leavers. */}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 mt-6 text-[13px] font-medium transition-opacity hover:opacity-70"
            style={{
              color: "var(--skin-text-muted, rgba(26,30,58,0.72))",
              borderBottom: "1px solid rgba(160, 109, 8, 0.45)",
              paddingBottom: "2px",
            }}
          >
            {t("monetization.heroSoftCta")}
            <ArrowRight className="w-3.5 h-3.5 opacity-70" />
          </Link>
        </header>

        {/* Connective ornament. */}
        <Ornament className="my-10 sm:my-12" />

        {/* BODY — panel weight gradient: standard / HEAVY / light / standard.
            The "Three ways" is the core argument; "Order it grows" is supporting
            chronology; "Principle" is the closing rationale + carries gravitas. */}
        <div className="space-y-5">
          <Panel eyebrow={t("monetization.seedEyebrow")} weight="standard">
            <p className="text-[15px] sm:text-base leading-relaxed" style={bodyStyle}>
              {t("monetization.seedBody")}
            </p>
          </Panel>

          <Panel eyebrow={t("monetization.waysEyebrow")} weight="heavy">
            <ol className="space-y-4">
              {WAYS.map((w) => (
                <li key={w.n} className="flex gap-4 items-baseline">
                  <span
                    className="font-semibold tabular-nums shrink-0 bg-clip-text text-transparent"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "1.5rem",
                      backgroundImage: GOLD_GRADIENT,
                      filter: GOLD_GLOW,
                    }}
                  >
                    {w.n}
                  </span>
                  <p className="text-[15px] sm:text-base leading-snug" style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.82))" }}>
                    <span className="font-semibold" style={{ color: NAVY }}>{t(w.titleKey)}.</span> {t(w.descKey)}
                  </p>
                </li>
              ))}
            </ol>
          </Panel>

          <Panel eyebrow={t("monetization.orderEyebrow")} weight="light">
            <p className="text-[15px] sm:text-base leading-relaxed" style={bodyStyle}>
              {t("monetization.orderBody")}
            </p>
          </Panel>

          <Panel eyebrow={t("monetization.principleEyebrow")} weight="standard">
            <p className="text-[15px] sm:text-base leading-relaxed" style={bodyStyle}>
              {t("monetization.principleBodyBefore")} <GradientInk>{t("monetization.principleBodyInk")}</GradientInk>{t("monetization.principleBodyAfter")}
            </p>
          </Panel>
        </div>

        {/* DEDICATED CTA CLUSTER — pulled out of the last panel for visual command. */}
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
            {t("monetization.ctaPrimary")}
            <ArrowRight className="w-4 h-4 opacity-70" />
          </Link>
          <p className="mt-4 text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.5))" }}>
            {t("monetization.ctaMeta")}
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px]">
            <Link
              to="/1-pager"
              className="inline-flex items-center gap-1.5 font-medium transition-opacity hover:opacity-70"
              style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.7))" }}
            >
              {t("monetization.ctaReadOnePager")}
              <ArrowRight className="w-3.5 h-3.5 opacity-60" />
            </Link>
            <a
              href="https://t.me/integralevolution"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium transition-opacity hover:opacity-70"
              style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.7))" }}
            >
              {t("monetization.ctaBookChat")}
              <ArrowRight className="w-3.5 h-3.5 opacity-60" />
            </a>
          </div>
        </section>

        {/* CLOSE — italic pull-quote. */}
        <section className="text-center mt-16 sm:mt-20 max-w-[52ch] mx-auto">
          <Eyebrow>{t("monetization.closeEyebrow")}</Eyebrow>
          <p
            className="italic"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.25rem, 3vw, 1.7rem)",
              color: "var(--skin-text-muted, rgba(26,30,58,0.8))",
              lineHeight: 1.4,
            }}
          >
            {t("monetization.closeQuote")}
          </p>
        </section>

        {/* FOOTER — warmer close. */}
        <footer className="text-center mt-20">
          <p
            className="italic mb-2"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "0.95rem",
              color: "var(--skin-text-muted, rgba(26,30,58,0.55))",
            }}
          >
            {t("monetization.footerTagline")}
          </p>
          <p className="text-[10px] uppercase tracking-[0.28em]" style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.4))" }}>
            {t("monetization.footerBrand")}
          </p>
        </footer>
      </div>
    </main>
  );
};

export default Monetization;
