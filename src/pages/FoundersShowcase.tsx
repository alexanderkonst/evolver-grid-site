import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import GameShellV2 from "@/components/game/GameShellV2";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FounderCanvas {
  name: string;
  archetype: string;
  tagline: string;
  date: string;
  sessionNumber: string;
  sigil: string;
  uniqueness: string;
  myth: { lie: string; truth: string; line: string };
  tribe: string;
  pain: string;
  promise: string;
  colors: { primary: string; glow: string; bg: string; border: string };
  status: "complete" | "in-progress";
  consentGiven: boolean;
}

// ─── Founders ─────────────────────────────────────────────────────────────────

export const FOUNDERS: FounderCanvas[] = [
  {
    name: "Alexander",
    archetype: "The Focus Lens",
    tagline: "Helps build ventures from who you already are",
    date: "February 19, 2026",
    sessionNumber: "Client Zero",
    sigil: "◉",
    uniqueness:
      "The Evolutionary Mirror — Visionary Architect. Sees the invisible architecture of things: systems, people, civilizations — and focuses genius into form. The polymathic consciousness that couldn't see itself until it turned the mirror outward.",
    myth: {
      lie: "The grind is the path. Push harder, pitch louder, grow faster. Your uniqueness is a liability — standardize it or starve.",
      truth:
        "Your uniqueness IS your business. The business was always inside you. You don't need to grind — you need to see what's already there.",
      line: "The grind is a lie. Your genius was never lost. It was hiding in plain sight — in the thing you couldn't stop doing for free.",
    },
    tribe:
      "Founders in transition — corporate escapees, polymaths who can't fit in one box, builders who sense something bigger is coming but can't name it yet.",
    pain: "They've built impressive things for other people's visions. They know they should start their own thing but every path looks like the same grind with a different label. The real pain: they can't name what makes them unique, so they keep packaging themselves as generic.",
    promise:
      "From hiding your genius to building on it. You walk out with a canvas — your uniqueness named, your myth written, your tribe identified, your business designed around who you already are. Not another pivot. A homecoming.",
    colors: {
      primary: "#8460ea",
      glow: "rgba(132,96,234,0.35)",
      bg: "rgba(132,96,234,0.06)",
      border: "rgba(132,96,234,0.25)",
    },
    status: "complete",
    consentGiven: true,
  },
  {
    name: "Oyi",
    archetype: "Lotus Medicine Man",
    tagline: "Restores what growing up took from you",
    date: "March 5–6, 2026",
    sessionNumber: "Session 1",
    sigil: "❋",
    uniqueness:
      "The Lotus Medicine Man who grows lotuses in others. He reinstates the inner child — the original sovereign, dethroned by crisis — through storytelling that hits at the DNA level. Bridges ancient wisdom and modern building.",
    myth: {
      lie: "The world runs on one rule — grow up or get left behind. There's an entire industry built on keeping you lost.",
      truth:
        "The most powerful version of you already existed — the kid who created without asking, played without planning, led without permission. That wasn't childish. That was your power.",
      line: "The swamp grew the lotus. And the lotus bows to no one.",
    },
    tribe:
      "Source Path Builders — leaders who carry BOTH ancient wisdom AND cutting-edge technology. Crisis-forged, already transformed, building the path back to source.",
    pain: "Broken high achievers. Joy gone. Peace gone. Light in their eyes fading. They've abandoned their magic. Every step of growing up was a step of growing OUT.",
    promise:
      "Your magic comes back. Joy, peace, and the light in your eyes — restored. Not by adding something new, but by removing the rust. The inner child leads. You Live Free.",
    colors: {
      primary: "#5eaf8b",
      glow: "rgba(94,175,139,0.35)",
      bg: "rgba(94,175,139,0.06)",
      border: "rgba(94,175,139,0.25)",
    },
    status: "complete",
    consentGiven: true,
  },
  {
    name: "Sergey",
    archetype: "The Systems Alchemist",
    tagline: "Sees what your life is trying to become",
    date: "March 10–11, 2026",
    sessionNumber: "Session 2",
    sigil: "⬡",
    uniqueness:
      "The Systems Alchemist — sees the finished form in architectural chaos. Two AI models independently named the same archetype. Transforms scattered systems into living, integrated wholes.",
    myth: {
      lie: "Build the system first, find the meaning later. Technology is neutral — just pick a problem and solve it.",
      truth:
        "The system IS the meaning. When technology serves the invisible architecture of human development, it stops being a tool and becomes alive.",
      line: "The finished form is already here. Stop building scaffolding and start seeing the cathedral.",
    },
    tribe:
      "Technical visionaries trapped in execution — engineers and architects who see the whole but get hired for the parts.",
    pain: "Jumping from one 'almost-working' strategy to another. Each time something is 'about to land.' Each time it doesn't quite. Building systems for OTHER people's problems.",
    promise:
      "From scattered building to unified vision. Your systems stop being projects and become expressions of what you were always trying to create.",
    colors: {
      primary: "#d49a5e",
      glow: "rgba(212,154,94,0.35)",
      bg: "rgba(212,154,94,0.06)",
      border: "rgba(212,154,94,0.25)",
    },
    status: "in-progress",
    consentGiven: true,
  },
  {
    name: "Alexa",
    archetype: "The Invisible Cartographer",
    tagline:
      "Makes the invisible visible — in systems, in people, in what's coming",
    date: "March 13, 2026",
    sessionNumber: "Session 3",
    sigil: "◈",
    uniqueness:
      "The Invisible Cartographer — sees the hidden architecture beneath everything: code, people, civilizations. Maps what others can't see and translates it so they can act on it.",
    myth: {
      lie: "The world only rewards what you can see, touch, and measure. The invisible is just philosophy. Ship fast or it doesn't count.",
      truth:
        "Everything that matters starts invisible. Every breakthrough was a pattern someone saw before anyone else did. Those who see the architecture shape the world.",
      line: "The invisible is the real. Everything else is just its footprint.",
    },
    tribe:
      "The Hidden Seers — people who've always noticed the meta-layer, the pattern beneath the surface. They've been told 'that's not practical' so many times they started believing it.",
    pain: "Trapped in the output chase. Work that's 'useful' but not the REAL work. They feel undervalued because they can't point to what they actually contributed — the invisible architecture that made everything else possible.",
    promise:
      "From hiding the sight to living from it. You stop wrapping your gift in tech and start delivering the raw sight — and people pay for it because it's the most valuable thing anyone has ever shown them.",
    colors: {
      primary: "#7eb8d4",
      glow: "rgba(126,184,212,0.35)",
      bg: "rgba(126,184,212,0.06)",
      border: "rgba(126,184,212,0.25)",
    },
    status: "complete",
    consentGiven: true,
  },
];

// ─── Starfield ────────────────────────────────────────────────────────────────

const Starfield = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const stars: { x: number; y: number; r: number; a: number; speed: number; hue: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight * 3;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.4 + 0.3,
        a: Math.random(),
        speed: Math.random() * 0.008 + 0.002,
        hue: [260, 160, 30, 200][Math.floor(Math.random() * 4)],
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const t = Date.now() * 0.001;
      stars.forEach((s) => {
        const flicker = Math.sin(t * s.speed * 100 + s.x) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, 60%, 75%, ${s.a * flicker * 0.5})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

// ─── Scroll-reveal hook ───────────────────────────────────────────────────────

export const useReveal = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, visible };
};

// ─── Light-mode tint intensities (darkest → lightest) ─────────────────────────

export const LIGHT_TINT = [0.18, 0.13, 0.09, 0.06]; // Card bg opacity per founder index

// ─── Founder Card ─────────────────────────────────────────────────────────────

export const FounderCard = ({
  founder,
  index,
  isExpanded,
  onToggle,
  lightMode,
}: {
  founder: FounderCanvas;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  lightMode?: boolean;
}) => {
  const { ref, visible } = useReveal();
  const f = founder;
  const isLocked = !f.consentGiven;
  const tint = LIGHT_TINT[index] ?? 0.06;

  return (
    <div
      ref={ref}
      className="transition-all duration-700"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transitionDelay: `${index * 120}ms`,
      }}
    >
      {/* Outer glow wrapper */}
      <div
        className="relative rounded-3xl p-[1px] transition-shadow duration-500 group"
        style={{
          boxShadow: lightMode
            ? (isExpanded ? `0 0 30px ${f.colors.primary}15` : 'none')
            : (isExpanded
              ? `0 0 60px ${f.colors.glow}, 0 0 120px ${f.colors.glow}`
              : `0 0 0px transparent`),
        }}
      >
        {/* Animated border gradient */}
        {!lightMode && (
          <div
            className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{
              background: `linear-gradient(135deg, ${f.colors.primary}40, transparent 40%, transparent 60%, ${f.colors.primary}30)`,
            }}
          />
        )}
        <div
          className="absolute inset-0 rounded-3xl"
          style={{
            background: lightMode
              ? `linear-gradient(135deg, ${f.colors.primary}20, ${f.colors.primary}10)`
              : `linear-gradient(135deg, ${f.colors.border}, transparent 30%, transparent 70%, ${f.colors.border})`,
          }}
        />

        {/* Card body */}
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: lightMode
              ? `rgba(255,255,255,0.95)`
              : "#0e1528",
          }}
        >
          {/* Internal aurora */}
          <div
            className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full blur-[100px] pointer-events-none transition-opacity duration-500"
            style={{
              background: f.colors.primary,
              opacity: lightMode
                ? (isExpanded ? tint * 1.2 : tint)
                : (isExpanded ? 0.08 : 0.03),
            }}
          />

          {/* Click area — Summary */}
          <div
            className="relative z-10 p-6 md:p-8 cursor-pointer"
            onClick={onToggle}
          >
            <div className="flex items-start gap-5">
              {/* Sigil */}
              <div className="flex-shrink-0 relative">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl transition-all duration-500 group-hover:scale-105"
                  style={{
                    background: f.colors.bg,
                    border: `1px solid ${f.colors.border}`,
                    color: f.colors.primary,
                    boxShadow: isExpanded
                      ? `0 0 30px ${f.colors.glow}`
                      : "none",
                  }}
                >
                  {f.sigil}
                </div>
                {/* Orbiting ring */}
                <div
                  className="absolute inset-[-6px] rounded-2xl border border-dashed pointer-events-none transition-opacity duration-500"
                  style={{
                    borderColor: f.colors.border,
                    opacity: isExpanded ? 0.6 : 0,
                    animation: isExpanded
                      ? "spin 20s linear infinite"
                      : "none",
                  }}
                />
              </div>

              {/* Name + Meta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h2
                    className="text-xl md:text-2xl font-display font-medium tracking-tight"
                    style={{ color: f.colors.primary }}
                  >
                    {f.name}
                  </h2>
                  <span
                    className="text-[10px] px-2.5 py-1 rounded-full font-medium tracking-wide uppercase"
                    style={{
                      background: f.colors.bg,
                      color: f.colors.primary,
                      border: `1px solid ${f.colors.border}`,
                    }}
                  >
                    {f.archetype}
                  </span>
                  {f.status === "in-progress" && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-amber-500/30 text-amber-400/60 bg-amber-500/5">
                      In Progress
                    </span>
                  )}
                  {isLocked && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-white/20">
                      🔒
                    </span>
                  )}
                </div>
                <p className={`text-sm italic ${lightMode ? 'text-[#2c3150]/50' : 'text-white/35'}`}>{f.tagline}</p>
                <div className={`text-[10px] mt-1.5 font-mono ${lightMode ? 'text-[#2c3150]/30' : 'text-white/15'}`}>
                  {f.sessionNumber} · {f.date}
                </div>
              </div>

              {/* Expand indicator */}
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300"
                style={{
                  borderColor: isExpanded
                    ? f.colors.border
                    : (lightMode ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)'),
                  color: isExpanded ? f.colors.primary : (lightMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.15)'),
                  transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 4L6 8L10 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* ─── The Myth: Hero Quote ─── */}
            <div className="mt-6">
              <blockquote
                className="relative pl-4 py-2 text-lg md:text-xl font-display italic leading-relaxed transition-colors duration-300"
                style={{
                  color: lightMode ? f.colors.primary : `${f.colors.primary}cc`,
                  borderLeft: `2px solid ${lightMode ? f.colors.primary + '40' : f.colors.border}`,
                }}
              >
                "{f.myth.line}"
              </blockquote>
            </div>
          </div>

          {/* ─── Expanded Canvas ─── */}
          <div
            className="overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              maxHeight: isExpanded ? "2000px" : "0px",
              opacity: isExpanded ? 1 : 0,
            }}
          >
            <div
              className="border-t px-6 md:px-8 pb-8 pt-6"
              style={{ borderColor: f.colors.border }}
              onClick={(e) => e.stopPropagation()}
            >
              {isLocked ? (
                <div className="text-center py-12">
                  <div
                    className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl"
                    style={{
                      background: f.colors.bg,
                      border: `1px solid ${f.colors.border}`,
                    }}
                  >
                    🔒
                  </div>
                  <p className={`text-sm ${lightMode ? 'text-[#2c3150]/50' : 'text-white/35'}`}>
                    Full canvas will be visible once{" "}
                    <span style={{ color: f.colors.primary }}>{f.name}</span>{" "}
                    gives consent.
                  </p>
                  <p className={`text-xs mt-2 ${lightMode ? 'text-[#2c3150]/30' : 'text-white/15'}`}>
                    The myth above is shown for illustration.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Full Myth */}
                  <div
                    className="p-5 rounded-2xl backdrop-blur-md"
                    style={{
                      background: f.colors.bg,
                      border: `1px solid ${f.colors.border}`,
                    }}
                  >
                    <p
                      className="text-[10px] uppercase tracking-[0.2em] mb-3 font-medium"
                      style={{ color: `${f.colors.primary}99` }}
                    >
                      The Myth
                    </p>
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] font-mono text-red-400/50 tracking-wide">
                          LIE
                        </span>
                        <p className={`text-sm leading-relaxed mt-0.5 ${lightMode ? 'text-[#2c3150]/50' : 'text-white/35'}`}>
                          {f.myth.lie}
                        </p>
                      </div>
                      <div className={`h-px ${lightMode ? 'bg-[#2c3150]/8' : 'bg-white/5'}`} />
                      <div>
                        <span className="text-[10px] font-mono text-emerald-400/50 tracking-wide">
                          TRUTH
                        </span>
                        <p className={`text-sm leading-relaxed mt-0.5 ${lightMode ? 'text-[#2c3150]/70' : 'text-white/55'}`}>
                          {f.myth.truth}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Canvas grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "Uniqueness", icon: "◇", content: f.uniqueness },
                      { label: "The Tribe", icon: "⊛", content: f.tribe },
                      { label: "The Pain", icon: "△", content: f.pain },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="p-5 rounded-2xl backdrop-blur-md transition-all duration-300 hover:scale-[1.01]"
                        style={{
                          background: lightMode ? `${f.colors.primary}08` : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${lightMode ? f.colors.primary + '15' : 'rgba(255,255,255,0.06)'}`,
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="text-xs"
                            style={{ color: f.colors.primary }}
                          >
                            {item.icon}
                          </span>
                          <p
                            className="text-[10px] uppercase tracking-[0.2em] font-medium"
                            style={{ color: `${f.colors.primary}80` }}
                          >
                            {item.label}
                          </p>
                        </div>
                        <p className={`text-sm leading-relaxed ${lightMode ? 'text-[#2c3150]/60' : 'text-white/50'}`}>
                          {item.content}
                        </p>
                      </div>
                    ))}

                    {/* Promise — spans full width */}
                    <div
                      className="md:col-span-2 p-5 rounded-2xl backdrop-blur-md transition-all duration-300 hover:scale-[1.005]"
                      style={{
                        background: `linear-gradient(135deg, ${f.colors.bg}, transparent)`,
                        border: `1px solid ${f.colors.border}`,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span style={{ color: f.colors.primary }}>✦</span>
                        <p
                          className="text-[10px] uppercase tracking-[0.2em] font-medium"
                          style={{ color: `${f.colors.primary}80` }}
                        >
                          The Promise
                        </p>
                      </div>
                      <p className={`text-sm leading-relaxed ${lightMode ? 'text-[#2c3150]/70' : 'text-white/60'}`}>
                        {f.promise}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const FoundersShowcase = () => {
  const [expandedFounder, setExpandedFounder] = useState<string | null>(null);
  const heroReveal = useReveal();
  const ctaReveal = useReveal();

  const toggle = useCallback(
    (name: string) =>
      setExpandedFounder((prev) => (prev === name ? null : name)),
    []
  );

  const inShell = useLocation().pathname.startsWith("/game/");

  const content = (
    <div
      className={`min-h-screen font-sans relative ${
        inShell
          ? 'bg-transparent text-[#2c3150]'
          : 'bg-[#0a0e1a] text-white'
      }`}
      id="founders-showcase"
    >
      {!inShell && <Starfield />}

      {/* Aurora blobs — only in dark mode */}
      {!inShell && (
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
        <div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[180px] animate-pulse"
          style={{ background: "rgba(132,96,234,0.04)" }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] rounded-full blur-[160px] animate-pulse"
          style={{
            background: "rgba(94,175,139,0.03)",
            animationDelay: "3s",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full blur-[140px] animate-pulse"
          style={{
            background: "rgba(212,154,94,0.03)",
            animationDelay: "6s",
          }}
        />
      </div>
      )}

      <div
        className={`relative max-w-4xl mx-auto px-4 md:px-6 space-y-10 ${inShell ? 'py-4' : 'py-12'}`}
        style={{ zIndex: 2 }}
      >
        {/* ─── Header ──────────────────────────────────── */}
        <header
          ref={heroReveal.ref}
          className={`text-center space-y-5 transition-all duration-1000 ${inShell ? 'pt-2' : 'pt-6'}`}
          style={{
            opacity: heroReveal.visible ? 1 : 0,
            transform: heroReveal.visible
              ? "translateY(0)"
              : "translateY(30px)",
          }}
          id="showcase-header"
        >
          {!inShell && (
          <nav className="flex justify-between text-xs">
            <a
              href="/dashboard"
              className="text-white/20 hover:text-[#8460ea] transition-colors"
            >
              ← Dashboard
            </a>
            <a
              href="/holomap"
              className="text-white/20 hover:text-[#8460ea] transition-colors"
            >
              Holo Map →
            </a>
          </nav>
          )}

          <p className="text-[11px] font-medium tracking-[0.4em] uppercase text-[#8460ea]/60">
            The Originals
          </p>

          <h1 className="text-4xl md:text-6xl font-display font-medium tracking-tight leading-[1.1]">
            <span className="bg-gradient-to-r from-[#8460ea] via-[#5eaf8b] to-[#d49a5e] bg-clip-text text-transparent">
              Founders Who Found
            </span>
            <br />
            <span className={inShell ? 'text-[#2c3150]/85' : 'text-white/85'}>Their Genius</span>
          </h1>

          <p className={`text-sm max-w-md mx-auto leading-relaxed ${inShell ? 'text-[#2c3150]/40' : 'text-white/30'}`}>
            Each person went through the Unique Business Canvas process.
            Their myth was discovered. Their business was designed
            around who they already are.
          </p>

          {/* Stats ribbon */}
          <div className={`flex justify-center gap-6 text-[11px] pt-2 ${inShell ? 'text-[#2c3150]/25' : 'text-white/15'}`}>
            {[
              { val: "4", label: "canvases" },
              { val: "10", label: "days" },
              { val: "$0", label: "ad spend" },
              { val: "100%", label: "conversion" },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <span
                  className={`text-sm font-display font-medium bg-gradient-to-b bg-clip-text text-transparent ${inShell ? 'from-[#2c3150]/60 to-[#2c3150]/30' : 'from-white/40 to-white/15'}`}
                >
                  {s.val}
                </span>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </header>

        {/* ─── Founder Cards ──────────────────────────── */}
        <div className="space-y-6" id="founders-grid">
          {FOUNDERS.map((f, i) => (
            <FounderCard
              key={f.name}
              founder={f}
              index={i}
              isExpanded={expandedFounder === f.name}
              onToggle={() => toggle(f.name)}
              lightMode={inShell}
            />
          ))}
        </div>

        {/* ─── The Thesis ─────────────────────────────── */}
        <div
          className="text-center py-6"
          style={{
            opacity: 0.6,
          }}
        >
          <p className={`text-xs italic max-w-sm mx-auto leading-relaxed ${inShell ? 'text-[#2c3150]/25' : 'text-white/25'}`}>
            "The myth IS the marketing. Operational fact, not theory."
          </p>
        </div>

        {/* ─── CTA ──────────────────────────────────── */}
        <div
          ref={ctaReveal.ref}
          className="transition-all duration-1000"
          style={{
            opacity: ctaReveal.visible ? 1 : 0,
            transform: ctaReveal.visible
              ? "translateY(0)"
              : "translateY(30px)",
          }}
          id="showcase-cta"
        >
          {/* Rotating border */}
          <div
            className="relative rounded-3xl p-[1px]"
            style={{
              background:
                "linear-gradient(135deg, #8460ea40, #5eaf8b30, #d49a5e30, #7eb8d430, #8460ea40)",
            }}
          >
            <div className={`rounded-3xl p-10 md:p-14 text-center relative overflow-hidden ${inShell ? 'bg-white' : 'bg-[#0e1528]'}`}>
              {/* Internal glow */}
              <div className="absolute inset-0 pointer-events-none">
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[120px] ${inShell ? 'bg-[#8460ea]/8' : 'bg-[#8460ea]/6'}`} />
              </div>

              <div className="relative z-10">
                <p className="text-[11px] tracking-[0.4em] uppercase text-[#8460ea]/50 mb-4">
                  Ready to Find Your Genius?
                </p>

                <h3 className="text-2xl md:text-4xl font-display font-medium mb-3">
                  <span className="bg-gradient-to-r from-[#8460ea] via-[#5eaf8b] to-[#d49a5e] bg-clip-text text-transparent">
                    Your Uniqueness IS
                  </span>
                  <br />
                  <span className={inShell ? 'text-[#2c3150]/80' : 'text-white/80'}>Your Business</span>
                </h3>

                <p className={`text-sm max-w-sm mx-auto mb-8 ${inShell ? 'text-[#2c3150]/40' : 'text-white/30'}`}>
                  One session. Your myth discovered. Your canvas complete.
                  The business you were always meant to build — revealed.
                </p>

                <a
                  href="/ignite"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm font-semibold bg-gradient-to-r from-[#8460ea] to-[#6a4ecf] text-white hover:shadow-xl hover:shadow-[#8460ea]/25 transition-all duration-500 hover:scale-[1.03] active:scale-[0.98]"
                  id="book-session-btn"
                >
                  <span className="text-lg">◉</span>
                  Book Your Ignition Session — $555
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center pb-12">
          <a
            href="/the-originals"
            className={`text-[10px] transition-colors ${inShell ? 'text-[#2c3150]/15 hover:text-[#2c3150]/30' : 'text-white/10 hover:text-white/25'}`}
          >
            Join the community →
          </a>
        </footer>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (inShell) return <GameShellV2>{content}</GameShellV2>;
  return content;
};

export default FoundersShowcase;
