import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";
import { markJourneyVisited } from "@/lib/journeyVisits";

/**
 * PathPage — a one-page view of the full 7-step path, commercial layer included.
 *
 * Route: /path
 *
 * Access (Sasha, 2026-04-21): fully public. Open Blueprint Paradox —
 * the whole path, including the pricing ladder, is visible to anyone
 * who visits the URL. No auth gate, no ZoG prerequisite.
 *
 * Shell (Sasha, 2026-04-21): renders INSIDE GameShellV2 so the spaces
 * rail + sections pane stay present. But intentionally NOT listed in
 * either pane — the page is reachable by URL / share, not by rail nav.
 *
 * Content is locked verbatim from Sasha. Copy updates go through Sasha.
 */

// ─── The Ladder ─────────────────────────────────────────────────────────────
//
// Step titles are VERBATIM from Sasha's vetted playbook. Do not rename into
// short one-word forms. Durations + pricing locked 2026-04-20 (v9.2).

type LadderRow = {
  id: string;
  stepKey: string;
  titleKey: string;
  durationKey: string;
  priceKey: string;
  priceDetailKey?: string;
};

// Copy fields hold i18n keys, resolved with t() at render (see below).
// `id` is a stable React key, independent of translated text.
const LADDER: LadderRow[] = [
  {
    id: "step1",
    stepKey: "pathPage.ladder.step1.step",
    titleKey: "pathPage.ladder.step1.title",
    durationKey: "pathPage.ladder.step1.duration",
    priceKey: "pathPage.ladder.step1.price",
  },
  {
    id: "step23",
    stepKey: "pathPage.ladder.step23.step",
    titleKey: "pathPage.ladder.step23.title",
    durationKey: "pathPage.ladder.step23.duration",
    priceKey: "pathPage.ladder.step23.price",
  },
  {
    id: "step4",
    stepKey: "pathPage.ladder.step4.step",
    titleKey: "pathPage.ladder.step4.title",
    durationKey: "pathPage.ladder.step4.duration",
    priceKey: "pathPage.ladder.step4.price",
  },
  {
    id: "step5",
    stepKey: "pathPage.ladder.step5.step",
    titleKey: "pathPage.ladder.step5.title",
    durationKey: "pathPage.ladder.step5.duration",
    priceKey: "pathPage.ladder.step5.price",
  },
  {
    id: "step6",
    stepKey: "pathPage.ladder.step6.step",
    titleKey: "pathPage.ladder.step6.title",
    durationKey: "pathPage.ladder.step6.duration",
    priceKey: "pathPage.ladder.step6.price",
    priceDetailKey: "pathPage.ladder.step6.priceDetail",
  },
  {
    id: "step7",
    stepKey: "pathPage.ladder.step7.step",
    titleKey: "pathPage.ladder.step7.title",
    durationKey: "pathPage.ladder.step7.duration",
    priceKey: "pathPage.ladder.step7.price",
  },
];

// ─── Component ──────────────────────────────────────────────────────────────

const PathPage = () => {
  const { t } = useTranslation();
  // Day 65 wave 4 (Sasha 2026-05-15): cross-device visit tracking
  // via shared helper. See src/lib/journeyVisits.ts.
  useEffect(() => {
    markJourneyVisited({
      itemId: "journey-the-path",
      dbColumn: "path_visited_at",
    });
  }, []);

  return (
    <GameShellV2 hideLogo>
      <div
        className="relative"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          color: "var(--skin-text-primary, #1a1e3a)",
        }}
      >
        {/* Ambient glows — decoration, layered above the shell's video bg */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-20 -left-20 w-[700px] h-[700px] rounded-full opacity-[0.05]"
            style={{
              background:
                "radial-gradient(circle, #8460ea 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute -bottom-40 -right-20 w-[600px] h-[600px] rounded-full opacity-[0.04]"
            style={{
              background:
                "radial-gradient(circle, #6894d0 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative z-10 max-w-[860px] mx-auto px-5 pt-10 pb-20">
            {/* ─── The Hero — Day 47 very-late-night (Sasha):
                Color scarcity applied (same rule as the landing — "7
                highlights is too much, reduce to 3"). Only 3 beats carry
                gradient ink now: Product-Market Fit (the holy grail),
                Investors Loving It (the newest validation beat), and
                Guaranteed (the promise anchor). The other 4 beats —
                Founder-Market Fit, Traction, Organic Demand, 6-8 Weeks —
                render as neutral dark navy, letting the 3 accents do
                the lifting. Color regains meaning by scarcity. */}
            <section className="mb-14">
              {/* Day 118 (2026-07-08): the shelf line — the category sentence
                  that places this offer on a known shelf, picked in public
                  where strangers meet the price. See marketing_playbook.md,
                  "Category Lines: the Shelf Key". */}
              <p
                className="text-[13px] sm:text-sm font-semibold uppercase tracking-[0.14em] mb-3"
                style={{
                  color: "var(--skin-text-secondary, #33415c)",
                  textShadow:
                    "var(--skin-text-halo-strong, 0 0 20px rgba(255,255,255,0.8), 0 1px 2px rgba(255,255,255,0.9))",
                }}
              >
                {t("pathPage.hero.shelfLine")}
              </p>
              {/* Day 62 (Sasha 2026-05-05): Strong legibility cocktail
                  per ui_playbook.md Part VIII — weight 600→700,
                  halo-strong→halo-deep. Same pattern as landing hero. */}
              <h1
                className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.2] tracking-[-0.01em] mb-4"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: "var(--skin-text-primary, #0a1628)",
                  textShadow:
                    "var(--skin-text-halo-deep, 0 0 28px rgba(255,255,255,0.85), 0 1px 2px rgba(255,255,255,0.95), 0 0 1px rgba(11,42,90,0.65), 0 1px 0 rgba(11,42,90,0.45))",
                }}
              >
                {t("pathPage.hero.h1Before")}{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "var(--skin-accent-2-bg, linear-gradient(135deg, hsl(220, 85%, 28%) 0%, hsl(210, 85%, 24%) 50%, hsl(200, 85%, 26%) 100%))",
                    filter:
                      "var(--skin-accent-2-glow, drop-shadow(0 0 10px hsl(212 95% 52% / 0.38)) drop-shadow(0 0 3px hsl(205 95% 48% / 0.45)))",
                    textShadow: "none",
                  }}
                >
                  {t("pathPage.hero.h1ProductMarketFit")}
                </span>
                {t("pathPage.hero.h1Middle")}{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, hsl(45, 95%, 32%) 0%, hsl(38, 95%, 28%) 50%, hsl(28, 90%, 30%) 100%)",
                    filter:
                      "drop-shadow(0 0 10px hsl(40 100% 50% / 0.4)) drop-shadow(0 0 3px hsl(35 100% 48% / 0.48))",
                    textShadow: "none",
                  }}
                >
                  {t("pathPage.hero.h1InvestorsLovingIt")}
                </span>
                {t("pathPage.hero.h1After")}
              </h1>

              {/* Day 62 (Sasha 2026-05-05): Strong legibility cocktail. */}
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold leading-[1.2] tracking-[-0.01em] mb-2"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: "var(--skin-text-primary, #0a1628)",
                  textShadow:
                    "var(--skin-text-halo-deep, 0 0 28px rgba(255,255,255,0.85), 0 1px 2px rgba(255,255,255,0.95), 0 0 1px rgba(11,42,90,0.65), 0 1px 0 rgba(11,42,90,0.45))",
                }}
              >
                {t("pathPage.hero.h2")}
              </h2>

              <p
                className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-[1.2] tracking-[-0.01em] mb-8 italic"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                }}
              >
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "var(--skin-callout-bg, linear-gradient(135deg, hsl(285, 85%, 28%) 0%, hsl(272, 85%, 24%) 50%, hsl(258, 85%, 26%) 100%))",
                    filter:
                      "var(--skin-callout-glow, drop-shadow(0 0 10px hsl(278 95% 55% / 0.38)) drop-shadow(0 0 3px hsl(268 95% 48% / 0.45)))",
                    textShadow: "none",
                  }}
                >
                  {t("pathPage.hero.guarantee")}
                </span>
              </p>

              <p
                className="text-sm sm:text-[15px] leading-relaxed"
                style={{
                  color: "var(--skin-text-muted, rgba(26,30,58,0.7))",
                  textShadow:
                    "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
                }}
              >
                {t("pathPage.hero.fineprint")}
              </p>
            </section>

            {/* ─── The Ladder — Day 47 late pass (Sasha):
                Flipped from dark-glass-light-text to light-glass-dark-text.
                Now consistent with the light Panel 3 + rest of the journey. */}
            <section
              className="rounded-2xl overflow-hidden liquid-glass"
            >
              <div
                className="px-6 py-4 border-b flex items-baseline justify-between"
                style={{
                  borderColor:
                    "var(--skin-rule-hairline, rgba(26,30,58,0.08))",
                }}
              >
                <div
                  className="text-[10px] uppercase tracking-[0.28em]"
                  style={{
                    color: "var(--skin-text-muted-soft, rgba(26,30,58,0.6))",
                  }}
                >
                  {t("pathPage.ladder.payAsYouProgress")}
                </div>
                <div
                  className="text-[10px] uppercase tracking-[0.22em]"
                  style={{ color: "var(--skin-text-faint, rgba(26,30,58,0.5))" }}
                >
                  {t("pathPage.ladder.stepsWeeks")}
                </div>
              </div>

              <div
                className="divide-y"
                style={{
                  borderColor:
                    "var(--skin-rule-hairline, rgba(26,30,58,0.08))",
                }}
              >
                {LADDER.map((row) => (
                  <div
                    key={row.id}
                    className="px-6 py-5 grid grid-cols-12 gap-4 items-start"
                    style={{
                      borderTop:
                        "1px solid var(--skin-rule-faint, rgba(26,30,58,0.06))",
                    }}
                  >
                    <div
                      className="col-span-12 sm:col-span-2 text-[10px] uppercase tracking-[0.22em] pt-1 font-semibold"
                      style={{
                        color: "var(--skin-selected-text, #5b21b6)",
                      }}
                    >
                      {t(row.stepKey)}
                    </div>
                    <div className="col-span-12 sm:col-span-6">
                      <h3
                        className="text-base sm:text-lg leading-snug mb-1"
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          color: "var(--skin-text-primary, #0a1628)",
                        }}
                      >
                        {t(row.titleKey)}
                      </h3>
                      <p
                        className="text-[12px]"
                        style={{
                          color:
                            "var(--skin-text-muted-soft, rgba(26,30,58,0.6))",
                        }}
                      >
                        {t(row.durationKey)}
                      </p>
                    </div>
                    <div className="col-span-12 sm:col-span-4 sm:text-right">
                      <div
                        className="text-base font-semibold"
                        style={{
                          color: "var(--skin-text-primary, #0a1628)",
                        }}
                      >
                        {t(row.priceKey)}
                      </div>
                      {row.priceDetailKey && (
                        <div
                          className="text-[11px] mt-1 leading-relaxed"
                          style={{
                            color:
                              "var(--skin-text-muted-soft, rgba(26,30,58,0.6))",
                          }}
                        >
                          {t(row.priceDetailKey)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="px-6 py-4"
                style={{
                  borderTop:
                    "1px solid var(--skin-rule-hairline, rgba(26,30,58,0.08))",
                  backgroundImage:
                    "var(--skin-tint-violet-soft, linear-gradient(135deg, rgba(132,96,234,0.06), rgba(132,96,234,0.02)))",
                }}
              >
                <p
                  className="text-[12px] leading-relaxed"
                  style={{
                    color: "var(--skin-text-muted, rgba(26,30,58,0.72))",
                  }}
                >
                  {t("pathPage.totals.beforeTotal")}{" "}
                  <span
                    className="font-semibold"
                    style={{ color: "var(--skin-text-primary, #0a1628)" }}
                  >
                    $1,999
                  </span>
                  {t("pathPage.totals.afterTotal")}{" "}
                  <span
                    className="font-semibold"
                    style={{ color: "var(--skin-text-primary, #0a1628)" }}
                  >
                    {t("pathPage.totals.step6Upfront")}
                  </span>{" "}
                  {t("pathPage.totals.and")}{" "}
                  <span
                    className="font-semibold"
                    style={{ color: "var(--skin-text-primary, #0a1628)" }}
                  >
                    {t("pathPage.totals.step6Share")}
                  </span>
                  {" "}{t("pathPage.totals.tail")}
                </p>
              </div>
            </section>

            {/* ─── CTAs — Day 47 late pass (Sasha): page no longer dead-ends.
                Primary lands Step 1 free (ZoG reveal); secondary lands the
                $555 Productize Yourself Session directly at the /ignite pricing block.
                Skin-aware: both read in Aurora and Navy+Gold. */}
            <div className="mt-10 flex flex-col items-center gap-3">
              <Link
                to="/zone-of-genius"
                className="w-full max-w-[420px] relative rounded-full px-6 py-4 text-sm sm:text-base font-semibold tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] liquid-glass-strong inline-flex items-center justify-center gap-3"
                style={{
                  color: "var(--skin-text-primary, #0a1628)",
                  textShadow:
                    "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.75))",
                }}
              >
                {t("pathPage.cta.primary")}
                <ArrowRight className="w-4 h-4 opacity-70" />
              </Link>

              <Link
                to="/ignite"
                className="w-full max-w-[420px] relative rounded-full px-6 py-4 text-sm sm:text-base font-medium tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] liquid-glass inline-flex items-center justify-center gap-3"
                style={{
                  color: "var(--skin-link-secondary, rgba(26,30,58,0.85))",
                  textShadow:
                    "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
                }}
              >
                {t("pathPage.cta.secondary")}
                <ArrowRight className="w-4 h-4 opacity-60" />
              </Link>
            </div>

            {/* ─── Quiet close ─── */}
            <div className="mt-10 text-center space-y-2">
              <p
                className="text-[11px] leading-relaxed"
                style={{
                  color: "var(--skin-text-muted, rgba(26,30,58,0.65))",
                  textShadow:
                    "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
                }}
              >
                {t("pathPage.close.optional")}
              </p>
              <p
                className="text-[11px] leading-relaxed"
                style={{
                  color: "var(--skin-text-muted, rgba(26,30,58,0.65))",
                  textShadow:
                    "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
                }}
              >
                {t("pathPage.close.guarantee")}
              </p>
            </div>
        </div>
      </div>
    </GameShellV2>
  );
};

export default PathPage;
