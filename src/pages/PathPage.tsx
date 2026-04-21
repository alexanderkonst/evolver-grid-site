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
    duration: "3 weeks, part-time",
    price: "$1,111",
  },
  {
    step: "Step 5",
    title: "Gift it or Sell It To Beta-Test That Everything Works",
    duration: "1–2 weeks (capped 1 month)",
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
        style={{ fontFamily: "'DM Sans', sans-serif", color: "#1a1e3a" }}
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
            {/* ─── The Hero — Day 47 late pass (Sasha):
                "THE PATH" title removed. Starts straight with the promise,
                key phrases highlighted with same neon-gradient + dark-core
                treatment as the landing page (Find Your Top Talent). */}
            <section className="mb-14">
              <h1
                className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-[1.2] tracking-[-0.01em] mb-4"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: "#0a1628",
                  textShadow:
                    "0 0 22px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.8), 0 2px 12px rgba(26,30,58,0.15)",
                }}
              >
                Solid{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, hsl(285, 90%, 30%) 0%, hsl(265, 95%, 24%) 50%, hsl(245, 90%, 28%) 100%)",
                    filter:
                      "drop-shadow(0 0 14px hsl(275 100% 55% / 0.55)) drop-shadow(0 0 3px hsl(260 100% 50% / 0.6))",
                    textShadow: "none",
                  }}
                >
                  Founder-Market Fit
                </span>
                . Early{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, hsl(225, 90%, 28%) 0%, hsl(210, 95%, 24%) 50%, hsl(200, 95%, 22%) 100%)",
                    filter:
                      "drop-shadow(0 0 14px hsl(212 100% 52% / 0.55)) drop-shadow(0 0 3px hsl(205 100% 48% / 0.6))",
                    textShadow: "none",
                  }}
                >
                  Product-Market Fit
                </span>
                ,{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, hsl(188, 95%, 24%) 0%, hsl(178, 95%, 20%) 50%, hsl(168, 90%, 22%) 100%)",
                    filter:
                      "drop-shadow(0 0 14px hsl(180 100% 45% / 0.6)) drop-shadow(0 0 3px hsl(175 100% 42% / 0.65))",
                    textShadow: "none",
                  }}
                >
                  traction
                </span>
                , and{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, hsl(138, 85%, 22%) 0%, hsl(128, 90%, 18%) 50%, hsl(115, 85%, 20%) 100%)",
                    filter:
                      "drop-shadow(0 0 14px hsl(130 100% 42% / 0.6)) drop-shadow(0 0 3px hsl(122 100% 38% / 0.65))",
                    textShadow: "none",
                  }}
                >
                  organic demand
                </span>
                .
              </h1>

              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-[1.2] tracking-[-0.01em] mb-2"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: "#0a1628",
                  textShadow:
                    "0 0 20px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.75)",
                }}
              >
                In{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, hsl(28, 95%, 32%) 0%, hsl(15, 95%, 28%) 50%, hsl(2, 90%, 30%) 100%)",
                    filter:
                      "drop-shadow(0 0 14px hsl(15 100% 50% / 0.6)) drop-shadow(0 0 3px hsl(8 100% 48% / 0.65))",
                    textShadow: "none",
                  }}
                >
                  6–8 weeks
                </span>
                .
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
                      "linear-gradient(135deg, hsl(265, 90%, 24%) 0%, hsl(280, 95%, 22%) 50%, hsl(295, 90%, 24%) 100%)",
                    filter:
                      "drop-shadow(0 0 14px hsl(275 100% 55% / 0.55)) drop-shadow(0 0 3px hsl(285 100% 50% / 0.6))",
                    textShadow: "none",
                  }}
                >
                  Guaranteed.
                </span>
              </p>

              <p
                className="text-sm sm:text-[15px] leading-relaxed"
                style={{
                  color: "rgba(26,30,58,0.7)",
                  textShadow: "0 1px 2px rgba(255,255,255,0.6)",
                }}
              >
                Provided you do your part, at an average speed.
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
                style={{ borderColor: "rgba(26,30,58,0.08)" }}
              >
                <div
                  className="text-[10px] uppercase tracking-[0.28em]"
                  style={{ color: "rgba(26,30,58,0.6)" }}
                >
                  Pay as you progress
                </div>
                <div
                  className="text-[10px] uppercase tracking-[0.22em]"
                  style={{ color: "rgba(26,30,58,0.5)" }}
                >
                  7 steps · 6–8 weeks
                </div>
              </div>

              <div
                className="divide-y"
                style={{ borderColor: "rgba(26,30,58,0.08)" }}
              >
                {LADDER.map((row) => (
                  <div
                    key={row.step}
                    className="px-6 py-5 grid grid-cols-12 gap-4 items-start"
                    style={{ borderTop: "1px solid rgba(26,30,58,0.06)" }}
                  >
                    <div
                      className="col-span-12 sm:col-span-2 text-[10px] uppercase tracking-[0.22em] pt-1 font-semibold"
                      style={{ color: "#5b21b6" }}
                    >
                      {row.step}
                    </div>
                    <div className="col-span-12 sm:col-span-6">
                      <h3
                        className="text-base sm:text-lg leading-snug mb-1"
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          color: "#0a1628",
                        }}
                      >
                        {row.title}
                      </h3>
                      <p
                        className="text-[12px]"
                        style={{ color: "rgba(26,30,58,0.6)" }}
                      >
                        {row.duration}
                      </p>
                    </div>
                    <div className="col-span-12 sm:col-span-4 sm:text-right">
                      <div
                        className="text-base font-semibold"
                        style={{ color: "#0a1628" }}
                      >
                        {row.price}
                      </div>
                      {row.priceDetail && (
                        <div
                          className="text-[11px] mt-1 leading-relaxed"
                          style={{ color: "rgba(26,30,58,0.6)" }}
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
                  borderTop: "1px solid rgba(26,30,58,0.08)",
                  backgroundImage:
                    "linear-gradient(135deg, rgba(132,96,234,0.06), rgba(132,96,234,0.02))",
                }}
              >
                <p
                  className="text-[12px] leading-relaxed"
                  style={{ color: "rgba(26,30,58,0.72)" }}
                >
                  The upfront path (Steps 1–5) totals{" "}
                  <span className="font-semibold" style={{ color: "#0a1628" }}>
                    $1,999
                  </span>
                  . Step 6 adds{" "}
                  <span className="font-semibold" style={{ color: "#0a1628" }}>
                    $1,111 upfront
                  </span>{" "}
                  and{" "}
                  <span className="font-semibold" style={{ color: "#0a1628" }}>
                    1/3 of your first $10k in revenue
                  </span>
                  {" "}— capped there. After that, 0%. Step 7 is by
                  invitation only, after you have early product-market fit
                  and organic demand.
                </p>
              </div>
            </section>

            {/* ─── Quiet close ─── */}
            <div className="mt-10 text-center space-y-2">
              <p
                className="text-[11px] leading-relaxed"
                style={{
                  color: "rgba(26,30,58,0.65)",
                  textShadow: "0 1px 2px rgba(255,255,255,0.6)",
                }}
              >
                Every step is optional. Every step delivers a complete
                transformation in itself.
              </p>
              <p
                className="text-[11px] leading-relaxed"
                style={{
                  color: "rgba(26,30,58,0.65)",
                  textShadow: "0 1px 2px rgba(255,255,255,0.6)",
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
