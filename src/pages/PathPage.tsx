import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useJourneyProgression } from "@/hooks/useJourneyProgression";
import { cn } from "@/lib/utils";

/**
 * PathPage — a one-page view of the full 7-step path, commercial layer included.
 *
 * Route: /path
 *
 * Access gate (per Sasha, 2026-04-20):
 *   - Visible to users who are authenticated OR have taken the Zone of
 *     Genius quiz (the step-1 free reveal). Everyone else sees a soft
 *     "take the first step to unlock" nudge that routes them back to `/`.
 *
 * Content is locked verbatim from Sasha. Copy updates go through Sasha.
 *
 * The page is intentionally NOT linked from the marketing landing. It
 * appears in the JOURNEY space's second pane (SectionsPanel) once the
 * user is logged in, and is shareable as a direct link — so Sasha can
 * send it to collaborators / curious prospects who've asked about the
 * pricing / ladder.
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

// ─── Access gating ──────────────────────────────────────────────────────────

const PathPage = () => {
  const navigate = useNavigate();
  const { currentStep, loading: journeyLoading } = useJourneyProgression();
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthed(!!user);
    });
  }, []);

  const loading = isAuthed === null || journeyLoading;
  // Access: authenticated OR has taken ZoG (currentStep ≥ 2 = ZoG done).
  const hasAccess = isAuthed === true || currentStep >= 2;

  return (
    <div
      className="min-h-screen bg-[#0a0e1a] text-white"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ─── Ambient background ─────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-20 -left-20 w-[700px] h-[700px] rounded-full opacity-[0.04]"
          style={{
            background:
              "radial-gradient(circle, #8460ea 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-40 -right-20 w-[600px] h-[600px] rounded-full opacity-[0.03]"
          style={{
            background:
              "radial-gradient(circle, #6894d0 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-[860px] mx-auto px-5 pt-10 pb-20">
        {/* ─── Back link ──────────────────────────────────────────── */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className={cn(
            "inline-flex items-center gap-2 py-1.5 px-3 rounded-full",
            "text-[10px] sm:text-[11px] uppercase tracking-[0.22em] font-medium",
            "transition-all duration-300 hover:scale-[1.02] mb-8",
            "focus-visible:ring-2 focus-visible:ring-white/40 outline-none",
          )}
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(231,233,229,0.08), rgba(231,233,229,0.02))",
            border: "1px solid rgba(231,233,229,0.18)",
            color: "rgba(231,233,229,0.75)",
          }}
          aria-label="Back to landing"
        >
          <ArrowLeft className="w-3 h-3" aria-hidden="true" />
          <span>Back to landing</span>
        </button>

        {loading ? (
          <div className="py-32 text-center text-white/50 text-sm">
            Loading…
          </div>
        ) : !hasAccess ? (
          /* ─── Soft gate for unauthenticated, non-ZoG users ─── */
          <div
            className="rounded-3xl p-10 text-center"
            style={{
              background:
                "linear-gradient(180deg, rgba(15,25,45,0.65), rgba(20,15,40,0.55))",
              border: "1px solid rgba(231,233,229,0.08)",
              boxShadow:
                "0 24px 80px -32px rgba(132,96,234,0.35), inset 0 1px 1px rgba(255,255,255,0.05)",
              backdropFilter: "blur(14px)",
            }}
          >
            <Lock className="w-5 h-5 mx-auto mb-4 text-white/40" />
            <h1
              className="text-2xl sm:text-3xl font-medium mb-4"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Take the first step to see the whole path
            </h1>
            <p className="text-[15px] text-white/70 mb-8 max-w-md mx-auto leading-relaxed">
              The path opens once you've named your top talent. Start with
              Step 1 — it's free and takes a few minutes.
            </p>
            <button
              type="button"
              onClick={() => navigate("/")}
              className={cn(
                "px-7 py-3 rounded-full text-xs font-semibold",
                "uppercase tracking-[0.22em] transition-all",
                "hover:scale-[1.03]",
              )}
              style={{
                color: "rgba(231,233,229,0.98)",
                backgroundImage:
                  "linear-gradient(135deg, rgba(132,96,234,0.9), rgba(41,84,159,0.9))",
                border: "1px solid rgba(231,233,229,0.4)",
                boxShadow: "0 20px 60px -18px rgba(132,96,234,0.7)",
              }}
            >
              Find Your Top Talent
            </button>
          </div>
        ) : (
          <>
            {/* ─── The Promise (LOCKED COPY — verbatim from Sasha) ─── */}
            <section className="mb-14">
              <div
                className="text-[10px] uppercase tracking-[0.32em] mb-4"
                style={{ color: "rgba(132,96,234,0.85)" }}
              >
                The Path
              </div>
              <h1
                className="text-3xl sm:text-4xl md:text-5xl font-medium leading-[1.15] mb-8"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: "rgba(231,233,229,0.98)",
                }}
              >
                The whole path:
              </h1>

              <p
                className="text-xl sm:text-2xl md:text-[28px] leading-snug mb-6"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: "rgba(231,233,229,0.95)",
                }}
              >
                Solid FMF, early PMF, early traction, early organic demand.
                <br />
                in 6–8 weeks.
              </p>

              <p
                className="text-sm sm:text-[15px] leading-relaxed mb-3"
                style={{ color: "rgba(231,233,229,0.7)" }}
              >
                Provided 1) you do your part of the work, 2) at an average
                speed.
              </p>

              <p
                className="text-[11px] uppercase tracking-[0.22em]"
                style={{ color: "rgba(231,233,229,0.4)" }}
              >
                FMF · Founder-Market Fit &nbsp;&middot;&nbsp; PMF ·
                Product-Market Fit
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
            <p
              className="text-[11px] text-center mt-10 leading-relaxed"
              style={{ color: "rgba(231,233,229,0.4)" }}
            >
              Every step is optional. Every step delivers a complete
              transformation in itself. You climb as far as you want.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default PathPage;
