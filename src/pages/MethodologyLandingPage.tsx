import { useNavigate } from "react-router-dom";
import { Lock, ArrowRight, ExternalLink, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useJourneyProgression, type StepState } from "@/hooks/useJourneyProgression";
import { ExpandableTestimonial } from "@/components/ExpandableTestimonial";
import { TESTIMONIALS } from "@/data/testimonials";

/**
 * MethodologyLandingPage — Mini App Store layout with gradual unlock.
 *
 * 4 visual states per tile:
 *   completed → checkmark, muted, clickable to revisit
 *   active    → highlighted, CTA visible, glassmorphism strong
 *   next      → "peek" — visible but locked, dashed border, sparkle
 *   locked    → dimmed, lock icon, no details
 */

type AppStep = {
  id: string;
  number: number;
  appName: string;
  subtitle: string;
  /** Game-style prompt for active tiles */
  prompt?: string;
  /** What the user unlocks at this step */
  unlockPreview?: string;
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
    unlockPreview: "Receive your Zone of Genius profile",
    neonHsl: "hsl(175, 80%, 55%)",
    neonRgb: "0, 210, 190",
    path: "/game/journey/start",
  },
  {
    id: "package",
    number: 2,
    appName: "PACKAGE",
    subtitle: "Turn Your Talent Into a Business",
    prompt: "Begin Ignition",
    unlockPreview: "Build your unique business canvas",
    neonHsl: "hsl(260, 70%, 65%)",
    neonRgb: "140, 100, 234",
    path: "/game/journey/package",
  },
  {
    id: "build",
    number: 3,
    appName: "BUILD",
    subtitle: "Create Your Product",
    prompt: "Start Building",
    unlockPreview: "Design your first product or offer",
    neonHsl: "hsl(210, 70%, 60%)",
    neonRgb: "70, 140, 220",
    path: "/game/journey/build",
  },
  {
    id: "test",
    number: 4,
    appName: "TEST",
    subtitle: "Validate Through Gifting",
    prompt: "Start Testing",
    unlockPreview: "Gift your product and gather feedback",
    neonHsl: "hsl(45, 90%, 55%)",
    neonRgb: "230, 190, 30",
    path: "/game/journey/test",
  },
  {
    id: "launch",
    number: 5,
    appName: "LAUNCH",
    subtitle: "Go Live With Precision",
    prompt: "Go Live",
    unlockPreview: "Launch to your first paying clients",
    neonHsl: "hsl(330, 70%, 60%)",
    neonRgb: "220, 80, 140",
    path: "/game/journey/launch",
  },
  {
    id: "grow",
    number: 6,
    appName: "GROW",
    subtitle: "Scale Your Revenue",
    prompt: "Scale Up",
    unlockPreview: "Systematic growth and revenue scaling",
    neonHsl: "hsl(145, 60%, 50%)",
    neonRgb: "50, 190, 100",
    path: "/game/journey/grow",
  },
  {
    id: "scale",
    number: 7,
    appName: "SCALE",
    subtitle: "Join the Founder Collective",
    prompt: "Join Collective",
    unlockPreview: "Collaborate with other genius founders",
    neonHsl: "hsl(290, 60%, 60%)",
    neonRgb: "180, 100, 220",
    path: "/game/journey/scale",
  },
];

// ─── Tile Icon per state ─────────────────────────────────────────────────────

const TileIcon = ({ step, state }: { step: AppStep; state: StepState }) => {
  if (state === "completed") {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)" }}>
        <Check className="w-7 h-7" style={{ color: step.neonHsl }} strokeWidth={2.5} />
      </div>
    );
  }

  if (state === "active") {
    return step.imageSrc ? (
      <img src={step.imageSrc} alt={step.appName} className="w-full h-full object-cover" loading="lazy" />
    ) : (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25), transparent 60%)` }}
      >
        <ArrowRight className="w-6 h-6 sm:w-7 sm:h-7 group-hover:translate-x-0.5 transition-transform" style={{ color: "rgba(0,0,0,0.6)" }} />
      </div>
    );
  }

  if (state === "next") {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)" }}>
        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: `rgba(${step.neonRgb}, 0.5)` }} />
      </div>
    );
  }

  // locked
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.02)" }}>
      <Lock className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: "rgba(255,255,255,0.4)" }} />
    </div>
  );
};

// ─── Component ──────────────────────────────────────────────────────────────

const MethodologyLandingPage = () => {
  const navigate = useNavigate();
  const { getStepState, currentStep } = useJourneyProgression();

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
          const state = getStepState(step.number);

          return (
            <div key={step.id} id={step.id}>
              <button
                onClick={() => {
                  if (state === "locked") return;
                  if (state === "next") {
                    // Could show a toast — for now just navigate to show what's coming
                    return;
                  }
                  navigate(step.path);
                }}
                className={cn(
                  "w-full flex flex-col items-center text-center rounded-[20px] transition-all duration-500 outline-none focus-visible:ring-2 focus-visible:ring-white/30 group relative min-h-[200px] justify-center",
                  "p-4 sm:p-5",
                  state === "active" && "liquid-glass-strong cursor-pointer hover:scale-[1.03] active:scale-[0.97]",
                  state === "completed" && "liquid-glass-strong cursor-pointer hover:scale-[1.01]",
                  state === "next" && "liquid-glass-strong cursor-default",
                  state === "locked" && "liquid-glass-strong cursor-default",
                )}
                style={{
                  border: state === "active"
                    ? `1px solid rgba(${step.neonRgb}, 0.3)`
                    : state === "next"
                      ? `2px dashed rgba(${step.neonRgb}, 0.25)`
                      : state === "completed"
                        ? `1px solid rgba(${step.neonRgb}, 0.15)`
                        : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: state === "active"
                    ? `0 0 30px rgba(${step.neonRgb}, 0.12), inset 0 1px 1px rgba(255,255,255,0.15)`
                    : state === "next"
                      ? `0 0 15px rgba(${step.neonRgb}, 0.06)`
                      : undefined,
                  opacity: 1,
                }}
                disabled={state === "locked"}
              >
                {/* ─── Step Number Badge (top-left) ─── */}
                <div
                  className="absolute top-2.5 left-2.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-bold"
                  style={{
                    background: state === "active"
                      ? `rgba(${step.neonRgb}, 0.2)`
                      : state === "completed"
                        ? `rgba(${step.neonRgb}, 0.1)`
                        : state === "next"
                          ? `rgba(${step.neonRgb}, 0.08)`
                          : "rgba(255,255,255,0.06)",
                    color: state === "active" || state === "completed"
                      ? "#0a1628"
                      : state === "next"
                        ? `rgba(${step.neonRgb}, 0.85)`
                        : "rgba(255,255,255,0.5)",
                    border: state === "active" || state === "completed"
                      ? `1px solid rgba(${step.neonRgb}, 0.3)`
                      : state === "next"
                        ? `1px solid rgba(${step.neonRgb}, 0.15)`
                        : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {state === "completed" ? <Check className="w-3 h-3" /> : step.number}
                </div>

                {/* ─── App Icon Area ─── */}
                <div
                  className={cn(
                    "rounded-2xl overflow-hidden flex items-center justify-center mb-3 transition-transform duration-500 group-hover:scale-105 relative",
                    "w-16 h-16 sm:w-20 sm:h-20"
                  )}
                  style={{
                    background: state === "active"
                      ? `linear-gradient(135deg, ${step.neonHsl}, rgba(${step.neonRgb}, 0.5))`
                      : state === "completed"
                        ? `rgba(${step.neonRgb}, 0.08)`
                        : "rgba(255,255,255,0.04)",
                    boxShadow: state === "active"
                      ? `0 4px 20px rgba(${step.neonRgb}, 0.25), inset 0 1px 2px rgba(255,255,255,0.15)`
                      : "inset 0 1px 1px rgba(255,255,255,0.05)",
                    border: state === "active"
                      ? `1px solid rgba(${step.neonRgb}, 0.3)`
                      : state === "next"
                        ? `1px solid rgba(${step.neonRgb}, 0.15)`
                        : "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <TileIcon step={step} state={state} />
                </div>

                {/* ─── App Name (ALL CAPS) ─── */}
                <h2
                  className="text-xs sm:text-sm font-bold tracking-[0.12em] leading-tight"
                  style={{
                    color: state === "active"
                      ? "#0a1628"
                      : state === "completed"
                        ? "#1a2a44"
                        : state === "next"
                          ? "rgba(255,255,255,0.7)"
                          : "rgba(255,255,255,0.5)",
                  }}
                >
                  {step.appName}
                </h2>

                {/* ─── Subtitle ─── */}
                <p
                  className="text-[10px] sm:text-[11px] leading-snug mt-1"
                  style={{
                    color: state === "active"
                      ? "#1a2a44"
                      : state === "completed"
                        ? "#2a3a54"
                        : state === "next"
                          ? "rgba(255,255,255,0.5)"
                          : "rgba(255,255,255,0.35)",
                  }}
                >
                  {step.subtitle}
                </p>

                {/* ─── Active CTA ─── */}
                {step.prompt && state === "active" && (
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

                {/* ─── "Next" unlock preview ─── */}
                {state === "next" && step.unlockPreview && (
                  <p
                    className="text-[9px] sm:text-[10px] mt-2 leading-snug"
                    style={{ color: `rgba(${step.neonRgb}, 0.55)` }}
                  >
                    Complete Step {currentStep} to unlock
                  </p>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section className="mt-16" id="testimonials" aria-label="Client testimonials">
        <h2
          className="text-lg font-semibold text-center mb-6"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: "rgba(255,255,255,0.85)" }}
        >
          What Founders Say
        </h2>
        <div className="space-y-3">
          {TESTIMONIALS.map((t, i) => (
            <ExpandableTestimonial key={i} t={t} variant="dark" />
          ))}
        </div>
      </section>

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
      </div>
    </div>
  );
};

export default MethodologyLandingPage;
