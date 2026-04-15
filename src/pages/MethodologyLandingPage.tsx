import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Lock, ArrowRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * MethodologyLandingPage — 7-button unique business methodology page.
 * Lives inside GameShellV2 (wrapped by the route).
 * Button 1 is unlocked (free gift). Buttons 2-7 are locked.
 * Each button has a "How" dropdown and an image placeholder for animated AI art.
 */

type MethodologyStep = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  howText: string;
  locked: boolean;
  neonHsl: string;
  neonRgb: string;
  /** Path to AI-generated animated image (WebP/MP4) — populated as images are produced */
  imageSrc?: string;
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
    neonHsl: "hsl(175, 80%, 55%)",
    neonRgb: "0, 210, 190",
    action: { label: "Discover your genius — free", path: "/start" },
  },
  {
    id: "business",
    number: 2,
    title: "Turn your top talent into a business",
    subtitle: "From talent articulation to founder-market fit. Your uniqueness IS your product-market fit.",
    howText: "The Ignition Session: 60–90 minutes. We map your top shadow, identify the pain that comes with it, locate your bullseye tribe, derive the transformational promise, and crystallize your methodology. You leave with a Unique Business Canvas — a set of artifacts that makes you say: 'Oh shit, this is real.'",
    locked: true,
    neonHsl: "hsl(260, 70%, 65%)",
    neonRgb: "140, 100, 234",
  },
  {
    id: "build",
    number: 3,
    title: "Build the product with purpose entrepreneurs",
    subtitle: "Turn your methodology into a sequence of transformational results.",
    howText: "In a cohort of aligned founders, you take your pain-to-promise methodology and turn it into buttons — each one a concrete outcome your clients walk through. The product IS the user journey, radically simplified. That's why it works, and why it can scale with AI.",
    locked: true,
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
        <p
          className="text-[11px] font-medium tracking-[0.35em] uppercase mb-5"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          The Unique Business Protocol
        </p>
        <h1
          className="text-3xl sm:text-4xl md:text-[2.8rem] font-medium leading-[1.15] tracking-[-0.03em] mb-5"
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
        <p className="text-sm text-white/30 max-w-md mx-auto leading-relaxed">
          Seven steps from unnamed talent to thriving business.
          <br />
          Step one is free. The rest unlock as you go.
        </p>
      </header>

      {/* ═══════ BUTTON CASCADE ═══════ */}
      <div className="space-y-4">
        {STEPS.map((step) => {
          const isHowOpen = howExpanded[step.id] ?? false;
          const isFirst = step.number === 1;

          return (
            <div key={step.id} id={step.id}>

              {/* ─── THE BUTTON ─── */}
              <button
                onClick={() => {
                  if (step.action && !step.locked) {
                    navigate(step.action.path);
                  } else {
                    toggleHow(step.id);
                  }
                }}
                className={cn(
                  "w-full text-left rounded-2xl transition-all duration-500 outline-none focus-visible:ring-2 focus-visible:ring-white/30",
                  step.locked
                    ? "opacity-[0.35] hover:opacity-[0.5] cursor-default"
                    : "cursor-pointer hover:scale-[1.008] active:scale-[0.998]"
                )}
                style={{
                  background: step.locked
                    ? "rgba(255,255,255,0.02)"
                    : `linear-gradient(135deg, rgba(${step.neonRgb}, 0.06), rgba(${step.neonRgb}, 0.015))`,
                  border: step.locked
                    ? "1px solid rgba(255,255,255,0.04)"
                    : `1px solid rgba(${step.neonRgb}, 0.2)`,
                  boxShadow: step.locked
                    ? "none"
                    : `0 0 40px rgba(${step.neonRgb}, 0.06), 0 0 80px rgba(${step.neonRgb}, 0.03), inset 0 1px 0 rgba(255,255,255,0.05)`,
                }}
              >
                <div className={cn("p-5 sm:p-6", isFirst && "sm:p-8")}>
                  <div className="flex items-start gap-4">

                    {/* ─── Image / Number Badge ─── */}
                    <div className="flex-shrink-0">
                      {step.imageSrc ? (
                        /* AI-generated animated image */
                        <div
                          className={cn(
                            "rounded-xl overflow-hidden",
                            isFirst ? "w-20 h-20 sm:w-24 sm:h-24" : "w-14 h-14 sm:w-16 sm:h-16"
                          )}
                          style={{
                            border: step.locked
                              ? "1px solid rgba(255,255,255,0.05)"
                              : `1px solid rgba(${step.neonRgb}, 0.25)`,
                            boxShadow: step.locked
                              ? "none"
                              : `0 0 20px rgba(${step.neonRgb}, 0.1)`,
                          }}
                        >
                          <img
                            src={step.imageSrc}
                            alt={step.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        /* Number badge fallback */
                        <div
                          className={cn(
                            "rounded-full flex items-center justify-center font-bold",
                            isFirst
                              ? "w-14 h-14 sm:w-16 sm:h-16 text-lg"
                              : "w-10 h-10 sm:w-12 sm:h-12 text-sm"
                          )}
                          style={
                            step.locked
                              ? { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.15)" }
                              : {
                                  background: `linear-gradient(135deg, ${step.neonHsl}, rgba(${step.neonRgb}, 0.7))`,
                                  color: "rgba(0,0,0,0.85)",
                                  boxShadow: `0 0 25px rgba(${step.neonRgb}, 0.3)`,
                                }
                          }
                        >
                          {step.locked ? <Lock className="w-4 h-4" /> : step.number}
                        </div>
                      )}
                    </div>

                    {/* ─── Text ─── */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <h2
                        className={cn(
                          "font-semibold leading-snug mb-1.5",
                          isFirst ? "text-lg sm:text-xl" : "text-base sm:text-lg"
                        )}
                        style={{ color: step.locked ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.92)" }}
                      >
                        {step.title}
                      </h2>
                      <p
                        className="text-xs sm:text-sm leading-relaxed"
                        style={{ color: step.locked ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.35)" }}
                      >
                        {step.subtitle}
                      </p>

                      {/* CTA for unlocked — looks like a real button */}
                      {step.action && !step.locked && (
                        <div
                          className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300"
                          style={{
                            background: `linear-gradient(135deg, rgba(${step.neonRgb}, 0.25), rgba(${step.neonRgb}, 0.12))`,
                            color: step.neonHsl,
                            border: `1px solid rgba(${step.neonRgb}, 0.35)`,
                            boxShadow: `0 0 20px rgba(${step.neonRgb}, 0.12)`,
                          }}
                        >
                          {step.action.label}
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      )}

                      {/* How toggle */}
                      <div className="mt-3 flex items-center gap-1.5">
                        <span
                          className="text-[11px] font-medium"
                          style={{ color: step.locked ? "rgba(255,255,255,0.1)" : `rgba(${step.neonRgb}, 0.6)` }}
                        >
                          How it works
                        </span>
                        <ChevronDown
                          className={cn(
                            "w-3 h-3 transition-transform duration-300",
                            isHowOpen && "rotate-180"
                          )}
                          style={{ color: step.locked ? "rgba(255,255,255,0.1)" : `rgba(${step.neonRgb}, 0.5)` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </button>

              {/* ─── How content (outside the button for a11y) ─── */}
              {isHowOpen && (
                <div
                  className="mx-5 sm:mx-6 pb-5 animate-in fade-in slide-in-from-top-1 duration-300"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <p
                    className="text-xs sm:text-sm leading-relaxed pt-4"
                    style={{ color: step.locked ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.45)" }}
                  >
                    {step.howText}
                  </p>
                </div>
              )}

              {/* ─── Connector thread ─── */}
              {step.number < 7 && (
                <div className="flex justify-center py-1">
                  <div
                    className="w-px h-6"
                    style={{
                      background: `linear-gradient(to bottom, rgba(${step.neonRgb}, 0.12), transparent)`,
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* ═══════ OTHER PROJECTS LINK ═══════ */}
        <div className="pt-6">
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
