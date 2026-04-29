import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";

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
  step: string;
  title: string;
  duration: string;
  price: string;
  priceDetail?: string;
};

const LADDER: LadderRow[] = [
  {
    step: "Step 1",
    title: "Name Your Top Talent",
    duration: "Minutes",
    price: "Free",
  },
  {
    step: "Step 2 + 3",
    title:
      "Articulate it with Precision · Enhance it with Business Structure",
    duration: "2-hour workshop",
    price: "$555",
  },
  {
    step: "Step 4",
    title: "Build your First Unique Product",
    duration: "3 weeks, alongside other conscious impact entrepreneurs",
    price: "$1,111",
  },
  {
    step: "Step 5",
    title: "Gift it or Sell It To Beta-Test That Everything Works",
    duration: "Estimated 1–3 weeks",
    price: "$333",
  },
  {
    step: "Step 6",
    title: "Laser-Focus Tactically and Go Live",
    duration: "2-week container",
    price: "$1,111",
    priceDetail: "+ $2,222 from your first $10k (1/3 of first $10k)",
  },
  {
    step: "Step 7",
    title: "Turn Organic Growth into Scaling Impact and Revenue",
    duration: "The next octave",
    price: "By invitation",
  },
];

// ─── Component ──────────────────────────────────────────────────────────────

const PathPage = () => {
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
              <h1
                className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-[1.2] tracking-[-0.01em] mb-4"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: "var(--skin-text-primary, #0a1628)",
                  textShadow:
                    "var(--skin-text-halo-strong, 0 0 22px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.8), 0 2px 12px rgba(26,30,58,0.15))",
                }}
              >
                Solid Founder-Market Fit. Early{" "}
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
                  Product-Market Fit
                </span>
                . Traction. Organic Demand.{" "}
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
                  Investors Loving It
                </span>
                .
              </h1>

              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-[1.2] tracking-[-0.01em] mb-2"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: "var(--skin-text-primary, #0a1628)",
                  textShadow:
                    "var(--skin-text-halo-subtle, 0 0 20px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.75))",
                }}
              >
                In 6–8 Weeks.
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
                  Money-Back Guaranteed.
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
                Provided you do your part.
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
                  Pay as you progress
                </div>
                <div
                  className="text-[10px] uppercase tracking-[0.22em]"
                  style={{ color: "var(--skin-text-faint, rgba(26,30,58,0.5))" }}
                >
                  7 steps · 6–8 weeks
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
                    key={row.step}
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
                      {row.step}
                    </div>
                    <div className="col-span-12 sm:col-span-6">
                      <h3
                        className="text-base sm:text-lg leading-snug mb-1"
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          color: "var(--skin-text-primary, #0a1628)",
                        }}
                      >
                        {row.title}
                      </h3>
                      <p
                        className="text-[12px]"
                        style={{
                          color:
                            "var(--skin-text-muted-soft, rgba(26,30,58,0.6))",
                        }}
                      >
                        {row.duration}
                      </p>
                    </div>
                    <div className="col-span-12 sm:col-span-4 sm:text-right">
                      <div
                        className="text-base font-semibold"
                        style={{
                          color: "var(--skin-text-primary, #0a1628)",
                        }}
                      >
                        {row.price}
                      </div>
                      {row.priceDetail && (
                        <div
                          className="text-[11px] mt-1 leading-relaxed"
                          style={{
                            color:
                              "var(--skin-text-muted-soft, rgba(26,30,58,0.6))",
                          }}
                        >
                          {row.priceDetail}
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
                  The upfront path (Steps 1–5) totals{" "}
                  <span
                    className="font-semibold"
                    style={{ color: "var(--skin-text-primary, #0a1628)" }}
                  >
                    $1,999
                  </span>
                  . Step 6 adds{" "}
                  <span
                    className="font-semibold"
                    style={{ color: "var(--skin-text-primary, #0a1628)" }}
                  >
                    $1,111 upfront
                  </span>{" "}
                  and{" "}
                  <span
                    className="font-semibold"
                    style={{ color: "var(--skin-text-primary, #0a1628)" }}
                  >
                    1/3 of your first $10k in revenue
                  </span>
                  {" "}— capped there. After that, 0%. Step 7 is by
                  invitation only, after you have early product-market fit
                  and organic demand.
                </p>
              </div>
            </section>

            {/* ─── CTAs — Day 47 late pass (Sasha): page no longer dead-ends.
                Primary lands Step 1 free (ZoG reveal); secondary lands the
                $555 Ignition Session directly at the /ignite pricing block.
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
                Start free with Step 1
                <ArrowRight className="w-4 h-4 opacity-70" />
              </Link>

              <Link
                to="/ignite#pricing-section"
                className="w-full max-w-[420px] relative rounded-full px-6 py-4 text-sm sm:text-base font-medium tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] liquid-glass inline-flex items-center justify-center gap-3"
                style={{
                  color: "var(--skin-link-secondary, rgba(26,30,58,0.85))",
                  textShadow:
                    "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
                }}
              >
                Book your Productize Yourself Session
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
                Every step is optional. Every step delivers a complete
                transformation in itself.
              </p>
              <p
                className="text-[11px] leading-relaxed"
                style={{
                  color: "var(--skin-text-muted, rgba(26,30,58,0.65))",
                  textShadow:
                    "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
                }}
              >
                Pay as you progress. Money-back guarantee on every step.
              </p>
            </div>
        </div>
      </div>
    </GameShellV2>
  );
};

export default PathPage;
