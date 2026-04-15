import { useNavigate } from "react-router-dom";
import { Lock, ArrowRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * MethodologyLandingPage — Mini App Store layout.
 * Lives inside GameShellV2 (wrapped by the route).
 * Each step = a numbered app tile with animated image placeholder + ALL CAPS name.
 * All tiles are clickable and navigate to their journey page.
 * Locked tiles show lock overlay but still navigate (page shows locked state).
 */

type AppStep = {
  id: string;
  number: number;
  /** Short ALL-CAPS name — describes what this step DOES */
  appName: string;
  /** CTA label for unlocked tile — describes the specific action */
  ctaLabel?: string;
  locked: boolean;
  neonHsl: string;
  neonRgb: string;
  /** Path to AI-generated animated image (WebP/MP4) */
  imageSrc?: string;
  /** Route path for this step's page */
  path: string;
};

const STEPS: AppStep[] = [
  {
    id: "discover",
    number: 1,
    appName: "DISCOVER",
    ctaLabel: "Articulate your top talent — it's a gift",
    locked: false,
    neonHsl: "hsl(175, 80%, 55%)",
    neonRgb: "0, 210, 190",
    path: "/game/journey/start",
  },
  {
    id: "name",
    number: 2,
    appName: "CRYSTALLIZE",
    locked: true,
    neonHsl: "hsl(260, 70%, 65%)",
    neonRgb: "140, 100, 234",
    path: "/game/journey/name",
  },
  {
    id: "build",
    number: 3,
    appName: "BUILD",
    locked: true,
    neonHsl: "hsl(210, 70%, 60%)",
    neonRgb: "70, 140, 220",
    path: "/game/journey/build",
  },
  {
    id: "test",
    number: 4,
    appName: "TEST",
    locked: true,
    neonHsl: "hsl(45, 90%, 55%)",
    neonRgb: "230, 190, 30",
    path: "/game/journey/test",
  },
  {
    id: "launch",
    number: 5,
    appName: "LAUNCH",
    locked: true,
    neonHsl: "hsl(330, 70%, 60%)",
    neonRgb: "220, 80, 140",
    path: "/game/journey/launch",
  },
  {
    id: "grow",
    number: 6,
    appName: "GROW",
    locked: true,
    neonHsl: "hsl(145, 60%, 50%)",
    neonRgb: "50, 190, 100",
    path: "/game/journey/grow",
  },
  {
    id: "scale",
    number: 7,
    appName: "SCALE",
    locked: true,
    neonHsl: "hsl(290, 60%, 60%)",
    neonRgb: "180, 100, 220",
    path: "/game/journey/scale",
  },
];

const MethodologyLandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-[740px] mx-auto px-5 py-10 md:py-16">

      {/* ═══════ HEADER ═══════ */}
      <header className="text-center mb-14">
        <h1
          className="text-2xl sm:text-3xl md:text-[2.4rem] font-semibold leading-[1.3] tracking-[-0.02em] mb-5 uppercase"
          style={{
            fontFamily: "'Poppins', sans-serif",
            color: "rgba(255,255,255,0.92)",
            textShadow: "0 0 30px rgba(255,255,255,0.15), 0 0 60px rgba(132,96,234,0.1)",
          }}
        >
           <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(135deg, hsl(175,80%,55%), hsl(260,70%,65%))" }}
          >
            Name Your Top Talent.
          </span>
          <br />
          Monetize it.{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(135deg, hsl(45,90%,65%), hsl(330,70%,60%))" }}
          >
            Scale it
          </span>
          {" "}Alongside Other Purpose Entrepreneurs.
        </h1>
        <p className="text-sm text-white/30 max-w-md mx-auto leading-relaxed">
          Seven steps from unnamed talent to thriving business.
          <br />
          Step one is free. The rest unlock as you go.
        </p>
      </header>

      {/* ═══════ APP STORE GRID ═══════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {STEPS.map((step) => {
          const isUnlocked = !step.locked;

          return (
            <div
              key={step.id}
              id={step.id}
              className={cn(
                step.number === 1 && "col-span-2 sm:col-span-1"
              )}
            >
              {/* ─── APP TILE ─── */}
              <button
                onClick={() => navigate(step.path)}
                className={cn(
                  "w-full flex flex-col items-center text-center rounded-[20px] transition-all duration-500 outline-none focus-visible:ring-2 focus-visible:ring-white/30 group relative",
                  "p-4 sm:p-5",
                  isUnlocked
                    ? "cursor-pointer hover:scale-[1.03] active:scale-[0.97]"
                    : "cursor-pointer hover:bg-white/[0.02]"
                )}
                style={{
                  background: isUnlocked
                    ? `linear-gradient(160deg, rgba(${step.neonRgb}, 0.08), rgba(${step.neonRgb}, 0.02))`
                    : "rgba(255,255,255,0.02)",
                  border: isUnlocked
                    ? `1px solid rgba(${step.neonRgb}, 0.25)`
                    : "1px solid rgba(255,255,255,0.06)",
                  boxShadow: isUnlocked
                    ? `0 0 30px rgba(${step.neonRgb}, 0.08), inset 0 1px 1px rgba(255,255,255,0.08)`
                    : "inset 0 1px 1px rgba(255,255,255,0.05)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
              >
                {/* ─── Step Number Badge (top-left) ─── */}
                <div
                  className="absolute top-2.5 left-2.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-bold"
                  style={{
                    background: isUnlocked
                      ? `rgba(${step.neonRgb}, 0.2)`
                      : "rgba(255,255,255,0.06)",
                    color: isUnlocked
                      ? step.neonHsl
                      : "rgba(255,255,255,0.25)",
                    border: isUnlocked
                      ? `1px solid rgba(${step.neonRgb}, 0.3)`
                      : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {step.number}
                </div>

                {/* ─── Connector Line (sequence indicator) ─── */}
                {step.number < 7 && (
                  <div
                    className="absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 w-4 sm:w-6 h-px hidden sm:block"
                    style={{
                      background: `linear-gradient(to right, rgba(${step.neonRgb}, 0.15), transparent)`,
                    }}
                  />
                )}

                {/* ─── App Icon Area ─── */}
                <div
                  className={cn(
                    "rounded-2xl overflow-hidden flex items-center justify-center mb-3 transition-transform duration-500 group-hover:scale-105 relative",
                    "w-16 h-16 sm:w-20 sm:h-20"
                  )}
                  style={{
                    background: isUnlocked
                      ? `linear-gradient(135deg, ${step.neonHsl}, rgba(${step.neonRgb}, 0.5))`
                      : "rgba(255,255,255,0.04)",
                    boxShadow: isUnlocked
                      ? `0 4px 20px rgba(${step.neonRgb}, 0.25), inset 0 1px 2px rgba(255,255,255,0.15)`
                      : "inset 0 1px 1px rgba(255,255,255,0.05)",
                    border: isUnlocked
                      ? `1px solid rgba(${step.neonRgb}, 0.3)`
                      : "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {step.imageSrc ? (
                    /* AI-generated animated image placeholder */
                    <img
                      src={step.imageSrc}
                      alt={step.appName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : step.locked ? (
                    /* Locked: lock icon with subtle gradient */
                    <Lock
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      style={{ color: "rgba(255,255,255,0.2)" }}
                    />
                  ) : (
                    /* Unlocked: decorative animated gradient shimmer */
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25), transparent 60%)`,
                      }}
                    >
                      <ArrowRight
                        className="w-6 h-6 sm:w-7 sm:h-7 group-hover:translate-x-0.5 transition-transform"
                        style={{ color: "rgba(0,0,0,0.6)" }}
                      />
                    </div>
                  )}
                </div>

                {/* ─── App Name (ALL CAPS) ─── */}
                <h2
                  className="text-xs sm:text-sm font-bold tracking-[0.12em] leading-tight mb-1"
                  style={{
                    color: isUnlocked
                      ? "rgba(255,255,255,0.92)"
                      : "rgba(255,255,255,0.4)",
                  }}
                >
                  {step.appName}
                </h2>

                {/* ─── CTA for unlocked tile — describes the action ─── */}
                {step.ctaLabel && isUnlocked && (
                  <div
                    className="flex items-center gap-1.5 mt-1.5 px-3.5 py-1.5 rounded-full text-[10px] sm:text-[11px] font-semibold tracking-wide transition-all duration-300 group-hover:scale-105"
                    style={{
                      background: `rgba(${step.neonRgb}, 0.15)`,
                      color: step.neonHsl,
                      border: `1px solid rgba(${step.neonRgb}, 0.25)`,
                    }}
                  >
                    {step.ctaLabel}
                    <ArrowRight className="w-3 h-3" />
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* ═══════ OTHER PROJECTS LINK ═══════ */}
      <div className="pt-8">
        <div className="flex justify-center py-2">
          <div className="w-10 h-px bg-white/6" />
        </div>
        <a
          href="https://prompts.aleksandrkonstantinov.com"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-4 rounded-2xl p-5 transition-all duration-300 hover:bg-white/[0.02]"
          style={{ border: "1px solid rgba(255,255,255,0.03)" }}
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/[0.03] flex items-center justify-center">
            <ExternalLink className="w-4 h-4 text-white/20" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-white/30 group-hover:text-white/50 transition-colors">
              See our other projects
            </h2>
            <p className="text-[11px] text-white/12 mt-0.5">AI prompts, ontological tools, and more</p>
          </div>
          <ArrowRight className="w-4 h-4 text-white/10 group-hover:text-white/25 group-hover:translate-x-1 transition-all" />
        </a>
      </div>

      {/* ═══════ SOCIAL PROOF ═══════ */}
      <div className="mt-16 text-center">
        <div className="flex items-center justify-center gap-8 mb-8">
          {[
            { num: "6", label: "founders" },
            { num: "100%", label: "conversion" },
            { num: "$0", label: "marketing" },
          ].map((s, i) => (
            <div key={i}>
              <p
                className="text-xl font-medium"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: "rgba(255,255,255,0.45)" }}
              >
                {s.num}
              </p>
              <p className="text-[9px] text-white/15 uppercase tracking-[0.15em] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <blockquote className="max-w-md mx-auto">
          <p className="text-sm text-white/25 italic leading-relaxed mb-2">
            "This is a miracle of miracles. Other tools come at this half-baked and shallow — they've got no depth. Your approach, though? A tool that just plain works."
          </p>
          <cite className="text-[10px] text-white/12 not-italic">
            — Alexey Utkin, serial founder, Stanford MBA
          </cite>
        </blockquote>
      </div>
    </div>
  );
};

export default MethodologyLandingPage;
