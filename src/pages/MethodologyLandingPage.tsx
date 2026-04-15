import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Lock, ArrowRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * MethodologyLandingPage — Mini App Store layout.
 * Lives inside GameShellV2 (wrapped by the route).
 * Each step = an app tile with animated image placeholder + ALL CAPS name.
 * Button 1 is unlocked (free). Buttons 2-7 locked with fog of war.
 * "How It Works" expandable contains all the descriptive text.
 */

type AppStep = {
  id: string;
  number: number;
  /** Short ALL-CAPS name displayed on the tile */
  appName: string;
  /** What this app does — shown in How It Works */
  howText: string;
  locked: boolean;
  neonHsl: string;
  neonRgb: string;
  /** Path to AI-generated animated image (WebP/MP4) — populated as images are produced */
  imageSrc?: string;
  action?: { label: string; path: string };
};

const STEPS: AppStep[] = [
  {
    id: "articulate",
    number: 1,
    appName: "DISCOVER",
    howText: "A free Zone of Genius discovery — 15 minutes. You answer questions about what energizes you most, and AI + human insight crystallize your top talent into one precise articulation. You walk away with words that finally sound like you.",
    locked: false,
    neonHsl: "hsl(175, 80%, 55%)",
    neonRgb: "0, 210, 190",
    action: { label: "Start free", path: "/game/journey/start" },
  },
  {
    id: "business",
    number: 2,
    appName: "IGNITE",
    howText: "The Ignition Session: 60–90 minutes. We map your top shadow, identify the pain that comes with it, locate your bullseye tribe, derive the transformational promise, and crystallize your methodology. You leave with a Unique Business Canvas — a set of artifacts that makes you say: 'Oh shit, this is real.'",
    locked: true,
    neonHsl: "hsl(260, 70%, 65%)",
    neonRgb: "140, 100, 234",
  },
  {
    id: "build",
    number: 3,
    appName: "BUILD",
    howText: "In a cohort of aligned founders, you take your pain-to-promise methodology and turn it into buttons — each one a concrete outcome your clients walk through. The product IS the user journey, radically simplified. That's why it works, and why it can scale with AI.",
    locked: true,
    neonHsl: "hsl(210, 70%, 60%)",
    neonRgb: "70, 140, 220",
  },
  {
    id: "test",
    number: 4,
    appName: "TEST",
    howText: "Deliver your product to real people from your tribe — through gift and gratitude economy. Two weeks is enough. Confidence builds massively, limiting beliefs fall away, money blocks clear. Provided the person is from your tribe, ignition happens and everybody's very happy.",
    locked: true,
    neonHsl: "hsl(45, 90%, 55%)",
    neonRgb: "230, 190, 30",
  },
  {
    id: "launch",
    number: 5,
    appName: "LAUNCH",
    howText: "Package your value ladder, craft a one-sentence USP, and deploy across personalized surfaces optimized for yield. Digital surfaces, physical surfaces, rooms where your tribe already gathers. One clean intro. No link. Energetically as clean as a Michelin restaurant.",
    locked: true,
    neonHsl: "hsl(330, 70%, 60%)",
    neonRgb: "220, 80, 140",
  },
  {
    id: "checkins",
    number: 6,
    appName: "GROW",
    howText: "Ongoing sessions during the growth phase. Track your milestones: first paying client, first revenue threshold, second, third. Until the organic demand starts to just feed itself — the torus is spinning.",
    locked: true,
    neonHsl: "hsl(145, 60%, 50%)",
    neonRgb: "50, 190, 100",
  },
  {
    id: "collective",
    number: 7,
    appName: "SCALE",
    howText: "Map all assets across founders. Find quick win-win collaborations. Share medicine with one another. Universal playbooks, absolutely unique outputs. The whole thing was 'I have to get ready.' But what if you're already ready?",
    locked: true,
    neonHsl: "hsl(290, 60%, 60%)",
    neonRgb: "180, 100, 220",
  },
];

const MethodologyLandingPage = () => {
  const navigate = useNavigate();
  const [howExpanded, setHowExpanded] = useState<Record<string, boolean>>({});

  const toggleHow = (id: string) => {
    setHowExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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
          const isHowOpen = howExpanded[step.id] ?? false;
          const isUnlocked = !step.locked;

          return (
            <div
              key={step.id}
              id={step.id}
              className={cn(
                /* First tile spans full width on mobile for prominence */
                step.number === 1 && "col-span-2 sm:col-span-1"
              )}
            >
              {/* ─── APP TILE ─── */}
              <button
                onClick={() => {
                  if (step.action && isUnlocked) {
                    navigate(step.action.path);
                  } else {
                    toggleHow(step.id);
                  }
                }}
                className={cn(
                  "w-full flex flex-col items-center text-center rounded-[20px] transition-all duration-500 outline-none focus-visible:ring-2 focus-visible:ring-white/30 group",
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
                {/* ─── App Icon Area ─── */}
                <div
                  className={cn(
                    "rounded-2xl overflow-hidden flex items-center justify-center mb-3 transition-transform duration-500 group-hover:scale-105",
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
                    /* AI-generated animated image — will be added by Alexander */
                    <img
                      src={step.imageSrc}
                      alt={step.appName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    /* Placeholder icon */
                    step.locked ? (
                      <Lock
                        className="w-5 h-5 sm:w-6 sm:h-6"
                        style={{ color: "rgba(255,255,255,0.2)" }}
                      />
                    ) : (
                      <span
                        className="text-xl sm:text-2xl font-bold"
                        style={{ color: "rgba(0,0,0,0.7)" }}
                      >
                        {step.number}
                      </span>
                    )
                  )}
                </div>

                {/* ─── App Name (ALL CAPS) ─── */}
                <h2
                  className="text-xs sm:text-sm font-bold tracking-[0.12em] leading-tight"
                  style={{
                    color: isUnlocked
                      ? "rgba(255,255,255,0.92)"
                      : "rgba(255,255,255,0.4)",
                  }}
                >
                  {step.appName}
                </h2>

                {/* ─── CTA for unlocked tile ─── */}
                {step.action && isUnlocked && (
                  <div
                    className="flex items-center gap-1.5 mt-2.5 px-3.5 py-1.5 rounded-full text-[10px] sm:text-[11px] font-semibold tracking-wide transition-all duration-300 group-hover:scale-105"
                    style={{
                      background: `rgba(${step.neonRgb}, 0.15)`,
                      color: step.neonHsl,
                      border: `1px solid rgba(${step.neonRgb}, 0.25)`,
                    }}
                  >
                    {step.action.label}
                    <ArrowRight className="w-3 h-3" />
                  </div>
                )}

                {/* ─── How It Works toggle hint ─── */}
                {step.locked && (
                  <div className="flex items-center gap-1 mt-2">
                    <span
                      className="text-[9px] sm:text-[10px]"
                      style={{ color: "rgba(255,255,255,0.2)" }}
                    >
                      How it works
                    </span>
                    <ChevronDown
                      className={cn(
                        "w-2.5 h-2.5 transition-transform duration-300",
                        isHowOpen && "rotate-180"
                      )}
                      style={{ color: "rgba(255,255,255,0.15)" }}
                    />
                  </div>
                )}
              </button>

              {/* ─── How It Works expanded content ─── */}
              {isHowOpen && (
                <div
                  className="mt-2 p-4 rounded-xl animate-in fade-in slide-in-from-top-1 duration-300"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <p
                    className="text-[11px] sm:text-xs leading-relaxed"
                    style={{ color: step.locked ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.55)" }}
                  >
                    {step.howText}
                  </p>
                </div>
              )}
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
