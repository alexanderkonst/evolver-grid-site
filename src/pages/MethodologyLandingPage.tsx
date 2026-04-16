import { useNavigate } from "react-router-dom";
import { Lock, ArrowRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * MethodologyLandingPage — Mini App Store layout.
 * Each step = app tile: animated image + ALL CAPS name + subtitle (what it does).
 * Unlocked tiles have a game-style prompt ("Claim Your Gift").
 * All tiles navigate to their journey page.
 */

type AppStep = {
  id: string;
  number: number;
  appName: string;
  /** What this step does — plain text under the name */
  subtitle: string;
  /** Game-style prompt for unlocked tiles — "Claim Your Gift" etc */
  prompt?: string;
  locked: boolean;
  neonHsl: string;
  neonRgb: string;
  imageSrc?: string;
  path: string;
};

const STEPS: AppStep[] = [
  {
    id: "discover",
    number: 1,
    appName: "DISCOVER",
    subtitle: "Articulate Your Top Talent",
    prompt: "Claim Your Gift",
    locked: false,
    neonHsl: "hsl(175, 80%, 55%)",
    neonRgb: "0, 210, 190",
    path: "/game/journey/start",
  },
  {
    id: "package",
    number: 2,
    appName: "PACKAGE",
    subtitle: "Turn Your Talent Into a Business",
    locked: true,
    neonHsl: "hsl(260, 70%, 65%)",
    neonRgb: "140, 100, 234",
    path: "/game/journey/package",
  },
  {
    id: "build",
    number: 3,
    appName: "BUILD",
    subtitle: "Create Your Product",
    locked: true,
    neonHsl: "hsl(210, 70%, 60%)",
    neonRgb: "70, 140, 220",
    path: "/game/journey/build",
  },
  {
    id: "test",
    number: 4,
    appName: "TEST",
    subtitle: "Validate Through Gifting",
    locked: true,
    neonHsl: "hsl(45, 90%, 55%)",
    neonRgb: "230, 190, 30",
    path: "/game/journey/test",
  },
  {
    id: "launch",
    number: 5,
    appName: "LAUNCH",
    subtitle: "Go Live With Precision",
    locked: true,
    neonHsl: "hsl(330, 70%, 60%)",
    neonRgb: "220, 80, 140",
    path: "/game/journey/launch",
  },
  {
    id: "grow",
    number: 6,
    appName: "GROW",
    subtitle: "Scale Your Revenue",
    locked: true,
    neonHsl: "hsl(145, 60%, 50%)",
    neonRgb: "50, 190, 100",
    path: "/game/journey/grow",
  },
  {
    id: "scale",
    number: 7,
    appName: "SCALE",
    subtitle: "Join the Founder Collective",
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
            color: "#0a1628",
            textShadow: "0 0 30px rgba(255,255,255,0.15), 0 0 60px rgba(132,96,234,0.1)",
          }}
        >
           <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(135deg, hsl(175,80%,40%), hsl(260,70%,50%))" }}
          >
            Name Your Top Talent.
          </span>
          <br />
          Monetize it.{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(135deg, hsl(45,90%,50%), hsl(330,70%,50%))" }}
          >
            Scale it
          </span>
          {" "}Alongside Other Purpose Entrepreneurs.
        </h1>
        <p className="text-sm max-w-md mx-auto leading-relaxed" style={{ color: "#1a2a44" }}>
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
            >
              {/* ─── APP TILE ─── */}
              <button
                onClick={() => navigate(step.path)}
                className={cn(
                  "w-full flex flex-col items-center text-center rounded-[20px] transition-all duration-500 outline-none focus-visible:ring-2 focus-visible:ring-white/30 group relative min-h-[200px] justify-center",
                  "p-4 sm:p-5",
                  isUnlocked
                    ? "liquid-glass-strong cursor-pointer hover:scale-[1.03] active:scale-[0.97]"
                    : "liquid-glass cursor-pointer hover:scale-[1.01]"
                )}
                style={{
                  border: isUnlocked
                    ? `1px solid rgba(${step.neonRgb}, 0.3)`
                    : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: isUnlocked
                    ? `0 0 30px rgba(${step.neonRgb}, 0.12), inset 0 1px 1px rgba(255,255,255,0.15)`
                    : undefined,
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
                      ? "#0a1628"
                      : "rgba(0,10,30,0.3)",
                    border: isUnlocked
                      ? `1px solid rgba(${step.neonRgb}, 0.3)`
                      : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {step.number}
                </div>

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
                    <img
                      src={step.imageSrc}
                      alt={step.appName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : step.locked ? (
                    <Lock
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      style={{ color: "rgba(0,10,30,0.25)" }}
                    />
                  ) : (
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
                  className="text-xs sm:text-sm font-bold tracking-[0.12em] leading-tight"
                  style={{
                    color: isUnlocked
                      ? "#0a1628"
                      : "rgba(0,10,30,0.35)",
                  }}
                >
                  {step.appName}
                </h2>

                {/* ─── Subtitle: what this step does (plain text, no button) ─── */}
                <p
                  className="text-[10px] sm:text-[11px] leading-snug mt-1"
                  style={{
                    color: isUnlocked
                      ? "#1a2a44"
                      : "rgba(0,10,30,0.2)",
                  }}
                >
                  {step.subtitle}
                </p>

                {/* ─── Game-style prompt for unlocked tiles ─── */}
                {step.prompt && isUnlocked && (
                  <p
                    className="text-[10px] sm:text-[11px] font-semibold mt-2.5 tracking-wide group-hover:tracking-wider transition-all duration-300"
                    style={{
                      color: step.neonHsl,
                      textShadow: `0 0 12px rgba(${step.neonRgb}, 0.4)`,
                    }}
                  >
                    ✦ {step.prompt}
                  </p>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* ═══════ OTHER PROJECTS LINK ═══════ */}
      <div className="pt-8">
        <div className="flex justify-center py-2">
          <div className="w-10 h-px" style={{ background: "rgba(0,10,30,0.1)" }} />
        </div>
        <a
          href="https://prompts.aleksandrkonstantinov.com"
          target="_blank"
          rel="noopener noreferrer"
          className="group liquid-glass flex items-center gap-4 rounded-2xl p-5 transition-all duration-300 hover:scale-[1.01]"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center">
            <ExternalLink className="w-4 h-4" style={{ color: "#1a2a44" }} />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold group-hover:opacity-80 transition-colors" style={{ color: "#0a1628" }}>
              See our other projects
            </h2>
            <p className="text-[11px] mt-0.5" style={{ color: "#1a2a44" }}>AI prompts, ontological tools, and more</p>
          </div>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-all" style={{ color: "#1a2a44" }} />
        </a>
      </div>

      {/* ═══════ SOCIAL PROOF ═══════ */}
      <div className="mt-16 text-center">
        <div className="flex items-center justify-center gap-8 mb-8">
          {[
            { num: "7", label: "founders" },
            { num: "100%", label: "continuation" },
            { num: "$0", label: "marketing" },
          ].map((s, i) => (
            <div key={i}>
              <p
                className="text-xl font-medium"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: "#0a1628" }}
              >
                {s.num}
              </p>
              <p className="text-[9px] uppercase tracking-[0.15em] mt-0.5" style={{ color: "#1a2a44" }}>{s.label}</p>
            </div>
          ))}
        </div>

        <blockquote className="max-w-md mx-auto">
          <p className="text-sm italic leading-relaxed mb-2" style={{ color: "#1a2a44" }}>
            "This is a miracle of miracles. Other tools come at this half-baked and shallow — they've got no depth. Your approach, though? A tool that just plain works."
          </p>
          <cite className="text-[10px] not-italic" style={{ color: "#2a3a54" }}>
            — Alexey Utkin, serial founder, Stanford MBA
          </cite>
        </blockquote>
      </div>
    </div>
  );
};

export default MethodologyLandingPage;
