import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Lock, Sparkles, Users, Wrench, FlaskConical, Rocket, Handshake, ArrowRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * MethodologyLandingPage — the 8-button unique business methodology page.
 * Button 1 is unlocked (free gift). Buttons 2-7 are locked but readable.
 * Each button has a "How" dropdown. Button 8 links to other projects.
 *
 * Bio-Light aesthetic: dark background, neon glow, liquid glass panels.
 */

type MethodologyStep = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  howText: string;
  locked: boolean;
  icon: React.ReactNode;
  neonHsl: string;
  neonRgb: string;
  action?: { label: string; path: string };
};

const STEPS: MethodologyStep[] = [
  {
    id: "articulate",
    number: 1,
    title: "Articulate your top talent",
    subtitle: "Without a wording of what you're especially good at, nothing else can grow.",
    howText: "A free Zone of Genius discovery — 15 minutes. You answer questions about what energizes you most, and AI + human insight crystallize your top talent into one precise articulation. You walk away with words that finally sound like you.",
    locked: false,
    icon: <Sparkles className="w-5 h-5" />,
    neonHsl: "hsl(175, 80%, 55%)",
    neonRgb: "0, 210, 190",
    action: { label: "Discover your genius — free", path: "/" },
  },
  {
    id: "business",
    number: 2,
    title: "Turn your top talent into a business",
    subtitle: "From talent articulation to founder-market fit. Your uniqueness IS your product-market fit.",
    howText: "The Ignition Session: 60–90 minutes. We map your top shadow, identify the pain that comes with it, locate your bullseye tribe, derive the transformational promise, and crystallize your methodology. You leave with a Unique Business Canvas — a set of artifacts that makes you say: 'Oh shit, this is real.'",
    locked: true,
    icon: <Wrench className="w-5 h-5" />,
    neonHsl: "hsl(260, 70%, 65%)",
    neonRgb: "140, 100, 234",
  },
  {
    id: "build",
    number: 3,
    title: "Build the product together with purpose entrepreneurs",
    subtitle: "Turn your methodology into a sequence of transformational results.",
    howText: "In a cohort of aligned founders, you take your pain-to-promise methodology and turn it into buttons — each one a concrete outcome your clients walk through. The product IS the user journey, radically simplified. That's why it works, and why it can scale with AI.",
    locked: true,
    icon: <Users className="w-5 h-5" />,
    neonHsl: "hsl(210, 70%, 60%)",
    neonRgb: "70, 140, 220",
  },
  {
    id: "test",
    number: 4,
    title: "Test & iterate through gifting",
    subtitle: "The moment when Excalibur gets taken out of the stone.",
    howText: "Deliver your product to real people from your tribe — through gift and gratitude economy. Two weeks is enough. Confidence builds massively, limiting beliefs fall away, money blocks clear. Provided the person is from your tribe, ignition happens and everybody's very happy.",
    locked: true,
    icon: <FlaskConical className="w-5 h-5" />,
    neonHsl: "hsl(45, 90%, 55%)",
    neonRgb: "230, 190, 30",
  },
  {
    id: "launch",
    number: 5,
    title: "Launch & grow with precision",
    subtitle: "After days of hard work, a solution so elegant emerges — like a lotus in spring.",
    howText: "Package your value ladder, craft a one-sentence USP, and deploy across personalized surfaces optimized for yield. Digital surfaces, physical surfaces, rooms where your tribe already gathers. One clean intro. No link. Energetically as clean as a Michelin restaurant.",
    locked: true,
    icon: <Rocket className="w-5 h-5" />,
    neonHsl: "hsl(330, 70%, 60%)",
    neonRgb: "220, 80, 140",
  },
  {
    id: "checkins",
    number: 6,
    title: "Regular check-ins as you grow",
    subtitle: "First paying client → first milestone → organic demand feeds the torus.",
    howText: "Ongoing sessions during the growth phase. Track your milestones: first paying client, first revenue threshold, second, third. Until the organic demand starts to just feed itself — the torus is spinning.",
    locked: true,
    icon: <Handshake className="w-5 h-5" />,
    neonHsl: "hsl(145, 60%, 50%)",
    neonRgb: "50, 190, 100",
  },
  {
    id: "collective",
    number: 7,
    title: "Join the purpose founder collective",
    subtitle: "Once you're off the hook for food and shelter — play begins.",
    howText: "Map all assets across founders. Find quick win-win collaborations. Share medicine with one another. Universal playbooks, absolutely unique outputs. The whole thing was 'I have to get ready.' But what if you're already ready?",
    locked: true,
    icon: <Users className="w-5 h-5" />,
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
    <div
      className="min-h-dvh text-white relative overflow-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif", background: "#060812" }}
    >
      {/* ─── Ambient glow ─── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, hsl(175, 80%, 55%) 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(circle, hsl(260, 70%, 65%) 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(circle, hsl(330, 70%, 60%) 0%, transparent 70%)" }}
        />
      </div>

      {/* ─── Content ─── */}
      <div className="relative z-10 max-w-[680px] mx-auto px-5 pt-28 pb-20">

        {/* ═══════ HEADER ═══════ */}
        <header className="text-center mb-16">
          <p
            className="text-[11px] font-medium tracking-[0.35em] uppercase mb-6"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            The Unique Business Protocol
          </p>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-medium leading-[1.15] tracking-[-0.03em] mb-5"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: "rgba(255,255,255,0.92)" }}
          >
            Your genius is already there.
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, hsl(175,80%,55%), hsl(260,70%,65%))" }}
            >
              Press the button.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-white/35 max-w-md mx-auto leading-relaxed">
            Eight steps from unnamed talent to thriving business.
            <br />
            Step one is free. The rest unlock as you go.
          </p>
        </header>

        {/* ═══════ BUTTON SEQUENCE ═══════ */}
        <div className="space-y-3">
          {STEPS.map((step) => {
            const isHowOpen = howExpanded[step.id] ?? false;

            return (
              <div key={step.id} className="group">
                {/* Main button */}
                <div
                  className={cn(
                    "relative rounded-2xl transition-all duration-500",
                    step.locked ? "opacity-40" : "opacity-100"
                  )}
                  style={{
                    background: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    boxShadow: step.locked
                      ? "none"
                      : `0 0 30px rgba(${step.neonRgb}, 0.08), inset 0 1px 0 rgba(255,255,255,0.05)`,
                  }}
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start gap-4">
                      {/* Number badge */}
                      <div
                        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mt-0.5"
                        style={
                          step.locked
                            ? { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.2)" }
                            : { background: step.neonHsl, color: "rgba(0,0,0,0.8)" }
                        }
                      >
                        {step.locked ? <Lock className="w-4 h-4" /> : step.number}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <h2
                          className="text-base sm:text-lg font-semibold leading-snug mb-1"
                          style={{ color: step.locked ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.9)" }}
                        >
                          {step.title}
                        </h2>
                        <p
                          className="text-xs sm:text-sm leading-relaxed"
                          style={{ color: step.locked ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.35)" }}
                        >
                          {step.subtitle}
                        </p>

                        {/* How toggle */}
                        <button
                          onClick={() => toggleHow(step.id)}
                          className="mt-3 flex items-center gap-1.5 text-[11px] font-medium transition-all duration-300"
                          style={{
                            color: step.locked ? "rgba(255,255,255,0.15)" : `rgba(${step.neonRgb}, 0.7)`,
                          }}
                        >
                          How
                          <ChevronDown
                            className={cn(
                              "w-3 h-3 transition-transform duration-300",
                              isHowOpen && "rotate-180"
                            )}
                          />
                        </button>

                        {/* How content */}
                        {isHowOpen && (
                          <div
                            className="mt-3 pt-3 animate-in fade-in slide-in-from-top-1 duration-300"
                            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                          >
                            <p
                              className="text-xs leading-relaxed"
                              style={{ color: step.locked ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.45)" }}
                            >
                              {step.howText}
                            </p>

                            {/* CTA on unlocked step */}
                            {step.action && !step.locked && (
                              <button
                                onClick={() => navigate(step.action!.path)}
                                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
                                style={{
                                  background: `linear-gradient(135deg, rgba(${step.neonRgb}, 0.2), rgba(${step.neonRgb}, 0.1))`,
                                  color: step.neonHsl,
                                  border: `1px solid rgba(${step.neonRgb}, 0.3)`,
                                  boxShadow: `0 0 20px rgba(${step.neonRgb}, 0.1)`,
                                }}
                              >
                                {step.action.label}
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Connector */}
                {step.number < 7 && (
                  <div className="flex justify-center py-1.5">
                    <div
                      className="w-px h-5"
                      style={{
                        background: `linear-gradient(to bottom, rgba(${step.neonRgb}, 0.15), transparent)`,
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* ═══════ BUTTON 8: OTHER PROJECTS ═══════ */}
          <div className="pt-4">
            <div className="flex justify-center py-1.5 mb-3">
              <div className="w-8 h-px bg-white/10" />
            </div>
            <a
              href="https://prompts.aleksandrkonstantinov.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:scale-[1.005] group/link"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  <ExternalLink className="w-4 h-4 text-white/30" />
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-semibold text-white/40 group-hover/link:text-white/60 transition-colors">
                    See our other projects
                  </h2>
                  <p className="text-xs text-white/15 mt-0.5">
                    AI prompts, ontological tools, and more
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-white/15 group-hover/link:text-white/30 group-hover/link:translate-x-1 transition-all" />
              </div>
            </a>
          </div>
        </div>

        {/* ═══════ SOCIAL PROOF ═══════ */}
        <div className="mt-20 text-center">
          <div className="flex items-center justify-center gap-8 mb-8">
            {[
              { num: "6", label: "founders" },
              { num: "100%", label: "conversion" },
              { num: "$0", label: "marketing" },
            ].map((s, i) => (
              <div key={i}>
                <p
                  className="text-xl font-medium"
                  style={{ fontFamily: "'Cormorant Garamond', serif", color: "rgba(255,255,255,0.5)" }}
                >
                  {s.num}
                </p>
                <p className="text-[9px] text-white/20 uppercase tracking-[0.15em] mt-0.5">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          <blockquote className="max-w-md mx-auto">
            <p className="text-sm text-white/30 italic leading-relaxed mb-2">
              "This is a miracle of miracles. Other tools come at this half-baked and shallow — they've got no depth. Your approach, though? A tool that just plain works."
            </p>
            <cite className="text-[10px] text-white/15 not-italic">
              — Alexey Utkin, serial founder, Stanford MBA
            </cite>
          </blockquote>
        </div>

        {/* ═══════ FOOTER ═══════ */}
        <footer className="mt-16 pt-8 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.03)" }}>
          <p className="text-[10px] text-white/12">
            Based in Mexico · In-person & remote worldwide
          </p>
          <div className="flex items-center justify-center gap-5 mt-2">
            <a href="/dashboard" className="text-[10px] text-white/15 hover:text-white/30 transition-colors">
              Dashboard
            </a>
            <a href="/ignite" className="text-[10px] text-white/15 hover:text-white/30 transition-colors">
              Ignition
            </a>
            <a href="/game/learn" className="text-[10px] text-white/15 hover:text-white/30 transition-colors">
              Learn
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MethodologyLandingPage;
