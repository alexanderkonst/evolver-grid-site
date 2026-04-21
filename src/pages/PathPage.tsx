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
    <GameShellV2>
      <div
        className="relative text-white"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
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
            {/* ─── The Promise ─── */}
            <section className="mb-14">
              <h1
                className="text-3xl sm:text-4xl md:text-5xl font-medium leading-[1.15] mb-8"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: "rgba(231,233,229,0.98)",
                }}
              >
                The whole path.
              </h1>

              <p
                className="text-xl sm:text-2xl md:text-[28px] leading-snug mb-6"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: "rgba(231,233,229,0.95)",
                }}
              >
                Solid Founder-Market Fit. Early Product-Market Fit,
                traction, and organic demand. In 6–8 weeks.{" "}
                <span
                  style={{
                    color: "rgba(132,96,234,0.95)",
                    fontStyle: "italic",
                  }}
                >
                  Guaranteed.
                </span>
              </p>

              <p
                className="text-sm sm:text-[15px] leading-relaxed"
                style={{ color: "rgba(231,233,229,0.7)" }}
              >
                Provided you do your part, at an average speed.
              </p>
            </section>

            {/* ─── The Ladder ─── */}
            <section
              className="rounded-2xl overflow-hidden"
              style={{
                background:
                  "linear-gradient(180deg, rgba(15,25,45,0.65), rgba(20,15,40,0.55))",
                border: "1px solid rgba(231,233,229,0.08)",
                boxShadow:
                  "0 24px 80px -32px rgba(132,96,234,0.35), inset 0 1px 1px rgba(255,255,255,0.05)",
                backdropFilter: "blur(14px)",
              }}
            >
              <div
                className="px-6 py-4 border-b border-white/[0.06] flex items-baseline justify-between"
              >
                <div
                  className="text-[10px] uppercase tracking-[0.28em]"
                  style={{ color: "rgba(231,233,229,0.55)" }}
                >
                  Pay as you progress
                </div>
                <div
                  className="text-[10px] uppercase tracking-[0.22em]"
                  style={{ color: "rgba(231,233,229,0.4)" }}
                >
                  7 steps · 6–8 weeks
                </div>
              </div>

              <div className="divide-y divide-white/[0.04]">
                {LADDER.map((row) => (
                  <div
                    key={row.step}
                    className="px-6 py-5 grid grid-cols-12 gap-4 items-start"
                  >
                    <div
                      className="col-span-12 sm:col-span-2 text-[10px] uppercase tracking-[0.22em] pt-1"
                      style={{ color: "rgba(132,96,234,0.85)" }}
                    >
                      {row.step}
                    </div>
                    <div className="col-span-12 sm:col-span-6">
                      <h3
                        className="text-base sm:text-lg leading-snug mb-1"
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          color: "rgba(231,233,229,0.95)",
                        }}
                      >
                        {row.title}
                      </h3>
                      <p
                        className="text-[12px]"
                        style={{ color: "rgba(231,233,229,0.55)" }}
                      >
                        {row.duration}
                      </p>
                    </div>
                    <div className="col-span-12 sm:col-span-4 sm:text-right">
                      <div
                        className="text-base font-medium"
                        style={{ color: "rgba(231,233,229,0.98)" }}
                      >
                        {row.price}
                      </div>
                      {row.priceDetail && (
                        <div
                          className="text-[11px] mt-1 leading-relaxed"
                          style={{ color: "rgba(231,233,229,0.6)" }}
                        >
                          {row.priceDetail}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="px-6 py-4 border-t border-white/[0.06]"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, rgba(132,96,234,0.05), rgba(132,96,234,0.02))",
                }}
              >
                <p
                  className="text-[12px] leading-relaxed"
                  style={{ color: "rgba(231,233,229,0.7)" }}
                >
                  The upfront path (Steps 1–5) totals{" "}
                  <span style={{ color: "rgba(231,233,229,0.95)" }}>
                    $1,999
                  </span>
                  . Step 6 adds{" "}
                  <span style={{ color: "rgba(231,233,229,0.95)" }}>
                    $1,111 upfront
                  </span>{" "}
                  and <span style={{ color: "rgba(231,233,229,0.95)" }}>
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
                style={{ color: "rgba(231,233,229,0.55)" }}
              >
                Every step is optional. Every step delivers a complete
                transformation in itself.
              </p>
              <p
                className="text-[11px] leading-relaxed"
                style={{ color: "rgba(231,233,229,0.55)" }}
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
