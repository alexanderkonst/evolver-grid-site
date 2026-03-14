import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FounderCanvas {
  name: string;
  archetype: string;
  tagline: string;
  date: string;
  sessionNumber: string;
  uniqueness: string;
  myth: { lie: string; truth: string; line: string };
  tribe: string;
  pain: string;
  promise: string;
  gradient: string;
  accentColor: string;
  status: "complete" | "in-progress";
  consentGiven: boolean;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const FOUNDERS: FounderCanvas[] = [
  {
    name: "Alexander",
    archetype: "The Focus Lens",
    tagline: "Helps build ventures from who you already are",
    date: "February 19, 2026",
    sessionNumber: "Client Zero",
    uniqueness: "The Evolutionary Mirror — Visionary Architect. Sees the invisible architecture of things: systems, people, civilizations — and focuses genius into form. The polymathic consciousness that couldn't see itself until it turned the mirror outward.",
    myth: {
      lie: "The grind is the path. Push harder, pitch louder, grow faster. Your uniqueness is a liability — standardize it or starve.",
      truth: "Your uniqueness IS your business. The business was always inside you. You don't need to grind — you need to see what's already there.",
      line: "The grind is a lie. Your genius was never lost. It was hiding in plain sight — in the thing you couldn't stop doing for free.",
    },
    tribe: "Founders in transition — corporate escapees, polymaths who can't fit in one box, builders who sense something bigger is coming but can't name it yet.",
    pain: "They've built impressive things for other people's visions. They know they should start their own thing but every path looks like the same grind with a different label. The real pain: they can't name what makes them unique, so they keep packaging themselves as generic.",
    promise: "From hiding your genius to building on it. You walk out with a canvas — your uniqueness named, your myth written, your tribe identified, your business designed around who you already are. Not another pivot. A homecoming.",
    gradient: "from-[#8460ea] to-[#6894d0]",
    accentColor: "#8460ea",
    status: "complete",
    consentGiven: true,
  },
  {
    name: "Oyi",
    archetype: "Lotus Medicine Man",
    tagline: "Restores what growing up took from you",
    date: "March 5–6, 2026",
    sessionNumber: "Session 1",
    uniqueness: "The Lotus Medicine Man who grows lotuses in others. He reinstates the inner child — the original sovereign, dethroned by crisis — through storytelling that hits at the DNA level. Bridges ancient wisdom and modern building.",
    myth: {
      lie: "The world runs on one rule — grow up or get left behind. There's an entire industry built on keeping you lost.",
      truth: "The most powerful version of you already existed — the kid who created without asking, played without planning, led without permission. That wasn't childish. That was your power.",
      line: "The swamp grew the lotus. And the lotus bows to no one.",
    },
    tribe: "Source Path Builders — leaders who carry BOTH ancient wisdom AND cutting-edge technology. Crisis-forged, already transformed, building the path back to source.",
    pain: "Broken high achievers. Joy gone. Peace gone. Light in their eyes fading. They've abandoned their magic. Every step of growing up was a step of growing OUT.",
    promise: "Your magic comes back. Joy, peace, and the light in your eyes — restored. Not by adding something new, but by removing the rust. The inner child leads. You Live Free.",
    gradient: "from-[#6894d0] to-[#a7cbd4]",
    accentColor: "#6894d0",
    status: "complete",
    consentGiven: false,
  },
  {
    name: "Sergey",
    archetype: "The Systems Alchemist",
    tagline: "Sees what your life is trying to become",
    date: "March 10–11, 2026",
    sessionNumber: "Session 2",
    uniqueness: "The Systems Alchemist — sees the finished form in architectural chaos. Two AI models independently named the same archetype. Transforms scattered systems into living, integrated wholes. The vision arrives complete; the craft is in helping others see it too.",
    myth: {
      lie: "Build the system first, find the meaning later. Technology is neutral — just pick a problem and solve it.",
      truth: "The system IS the meaning. When technology serves the invisible architecture of human development, it stops being a tool and becomes alive. The alchemist doesn't just build systems — they transmute them.",
      line: "The finished form is already here. Stop building scaffolding and start seeing the cathedral.",
    },
    tribe: "Technical visionaries trapped in execution — engineers and architects who see the whole but get hired for the parts.",
    pain: "Jumping from one 'almost-working' strategy to another. Each time something is 'about to land.' Each time it doesn't quite. Building systems for OTHER people's problems instead of the system that IS his unique genius.",
    promise: "From scattered building to unified vision. Your systems stop being projects and become expressions of what you were always trying to create.",
    gradient: "from-[#a7cbd4] to-[#b1c9b6]",
    accentColor: "#a7cbd4",
    status: "in-progress",
    consentGiven: false,
  },
  {
    name: "Alexa",
    archetype: "The Invisible Cartographer",
    tagline: "Makes the invisible visible — in systems, in people, in what's coming",
    date: "March 13, 2026",
    sessionNumber: "Session 3",
    uniqueness: "The Invisible Cartographer — sees the hidden architecture beneath everything: code, people, civilizations. Maps what others can't see and translates it so they can act on it. He doesn't just map technical systems — he maps the invisible psychological structures people build around themselves without knowing.",
    myth: {
      lie: "The world only rewards what you can see, touch, and measure. The invisible — patterns, architecture, the structure underneath — is just philosophy. Ship fast, prove it with numbers, or it doesn't count.",
      truth: "Everything that matters starts invisible. Every breakthrough was a pattern someone saw before anyone else did. Those who see the architecture shape the world. Those who see only the output chase it forever.",
      line: "The invisible is the real. Everything else is just its footprint.",
    },
    tribe: "The Hidden Seers — people who've always noticed the meta-layer, the architecture, the pattern beneath the surface. They've been told 'that's not practical' so many times they started believing it.",
    pain: "Trapped in the output chase. They do work that's 'useful' but not the REAL work — the seeing, the mapping, the architecting. They feel undervalued because they can't point to what they actually contributed — the invisible architecture that made everything else possible.",
    promise: "From hiding the sight to living from it. You stop wrapping your gift in tech and start delivering the raw sight — and people pay for it because it's the most valuable thing anyone has ever shown them.",
    gradient: "from-[#b1c9b6] to-[#cec9b0]",
    accentColor: "#b1c9b6",
    status: "complete",
    consentGiven: false,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const FoundersShowcase = () => {
  const [expandedFounder, setExpandedFounder] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#0c1220] text-white font-sans" id="founders-showcase">
      {/* Aurora */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-[#8460ea]/8 rounded-full blur-[130px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-[#a7cbd4]/6 rounded-full blur-[110px] animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 py-12 space-y-12">
        {/* ─── Header ──────────────────────────────────────── */}
        <header className="text-center space-y-3" id="showcase-header">
          <a href="/dashboard" className="text-xs text-[#6894d0] hover:text-[#8460ea] transition-colors inline-flex items-center gap-1.5">
            ← Dashboard
          </a>
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-[#a4a3d0]">
            The Originals
          </p>
          <h1 className="text-3xl md:text-5xl font-display font-medium tracking-tight">
            <span className="bg-gradient-to-r from-[#8460ea] via-[#6894d0] to-[#a7cbd4] bg-clip-text text-transparent">
              Founders Who Found Their Genius
            </span>
          </h1>
          <p className="text-sm text-white/40 max-w-lg mx-auto">
            Each person went through the Unique Business Canvas process.
            Their myth was discovered. Their business was designed around who they already are.
          </p>
          <div className="flex justify-center gap-4 text-xs text-white/20 pt-2">
            <span>{FOUNDERS.length} canvases</span>
            <span className="w-1 h-1 rounded-full bg-white/15 mt-1.5" />
            <span>10 days</span>
            <span className="w-1 h-1 rounded-full bg-white/15 mt-1.5" />
            <span>$0 spent</span>
            <span className="w-1 h-1 rounded-full bg-white/15 mt-1.5" />
            <span>100% conversion</span>
          </div>
        </header>

        {/* ─── Founder Cards ──────────────────────────────── */}
        <div className="space-y-6" id="founders-grid">
          {FOUNDERS.map((f) => {
            const isExpanded = expandedFounder === f.name;
            const isLocked = !f.consentGiven;

            return (
              <div
                key={f.name}
                className={`rounded-2xl border transition-all duration-500 overflow-hidden ${
                  isExpanded
                    ? "border-white/15 bg-white/5"
                    : "border-white/8 bg-white/3 hover:border-white/12"
                }`}
                id={`founder-${f.name.toLowerCase()}`}
              >
                {/* Summary Bar */}
                <div
                  className="p-5 md:p-6 cursor-pointer"
                  onClick={() => setExpandedFounder(isExpanded ? null : f.name)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-display font-bold bg-gradient-to-br"
                          style={{ background: `linear-gradient(135deg, ${f.accentColor}30, ${f.accentColor}10)`, color: f.accentColor }}
                        >
                          {f.name[0]}
                        </div>
                        <div>
                          <h2 className="text-lg font-display font-medium" style={{ color: f.accentColor }}>
                            {f.name}
                          </h2>
                          <p className="text-xs text-white/30">{f.archetype}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                          f.status === "complete"
                            ? "border-green-500/30 text-green-400/70 bg-green-500/5"
                            : "border-amber-500/30 text-amber-400/70 bg-amber-500/5"
                        }`}>
                          {f.status === "complete" ? "Canvas Complete" : "In Progress"}
                        </span>
                        {isLocked && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-white/25">
                            🔒 Consent Pending
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-white/50 italic">"{f.tagline}"</p>
                    </div>
                    <div className="text-white/20 text-xs font-mono flex-shrink-0 text-right">
                      <div>{f.sessionNumber}</div>
                      <div className="text-white/10">{f.date}</div>
                    </div>
                  </div>

                  {/* Myth preview — always visible */}
                  <div className="mt-4 p-4 rounded-xl bg-white/3 border border-white/5">
                    <p className="text-xs text-white/25 uppercase tracking-wider mb-2">The Myth</p>
                    <p className="text-sm text-white/60 leading-relaxed italic">
                      "{f.myth.line}"
                    </p>
                  </div>
                </div>

                {/* ─── Expanded Canvas ─────────────────────── */}
                {isExpanded && (
                  <div className="border-t border-white/8 p-5 md:p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
                    {isLocked ? (
                      <div className="text-center py-8">
                        <p className="text-4xl mb-3">🔒</p>
                        <p className="text-sm text-white/40">Full canvas will be visible once {f.name} gives consent.</p>
                        <p className="text-xs text-white/20 mt-1">The myth preview above is shown for illustration.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Uniqueness */}
                        <div className="p-4 rounded-xl bg-white/3 border border-white/5">
                          <p className="text-[10px] uppercase tracking-wider text-white/25 mb-2">Uniqueness</p>
                          <p className="text-sm text-white/60 leading-relaxed">{f.uniqueness}</p>
                        </div>

                        {/* Full Myth */}
                        <div className="p-4 rounded-xl bg-white/3 border border-white/5">
                          <p className="text-[10px] uppercase tracking-wider text-white/25 mb-2">The Myth</p>
                          <div className="space-y-2">
                            <div>
                              <span className="text-[10px] text-red-400/50 font-mono">LIE</span>
                              <p className="text-sm text-white/40 leading-relaxed">{f.myth.lie}</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-green-400/50 font-mono">TRUTH</span>
                              <p className="text-sm text-white/60 leading-relaxed">{f.myth.truth}</p>
                            </div>
                            <div className="pt-1 border-t border-white/5">
                              <p className="text-sm text-white/70 italic">"{f.myth.line}"</p>
                            </div>
                          </div>
                        </div>

                        {/* Tribe */}
                        <div className="p-4 rounded-xl bg-white/3 border border-white/5">
                          <p className="text-[10px] uppercase tracking-wider text-white/25 mb-2">The Tribe</p>
                          <p className="text-sm text-white/60 leading-relaxed">{f.tribe}</p>
                        </div>

                        {/* Pain */}
                        <div className="p-4 rounded-xl bg-white/3 border border-white/5">
                          <p className="text-[10px] uppercase tracking-wider text-white/25 mb-2">The Pain</p>
                          <p className="text-sm text-white/60 leading-relaxed">{f.pain}</p>
                        </div>

                        {/* Promise */}
                        <div className="md:col-span-2 p-4 rounded-xl border border-white/8 bg-gradient-to-r" style={{ background: `linear-gradient(135deg, ${f.accentColor}08, transparent)` }}>
                          <p className="text-[10px] uppercase tracking-wider text-white/25 mb-2">The Promise</p>
                          <p className="text-sm text-white/70 leading-relaxed">{f.promise}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ─── What This Is ──────────────────────────────── */}
        <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 text-center" id="what-is-this">
          <h2 className="text-lg font-display text-white/70 mb-3">What Is This?</h2>
          <p className="text-sm text-white/40 max-w-lg mx-auto leading-relaxed mb-4">
            Every person here went through the <span className="text-white/60 font-medium">Unique Business Canvas</span> — a
            process that extracts who you already are and designs a business around it.
            No templates. No pivots. Your uniqueness IS your business.
          </p>
          <p className="text-sm text-white/40 max-w-lg mx-auto leading-relaxed">
            Each canvas is published with the founder's consent.
            Their myth, their pain, their promise — out in the open.
            Because the invisible becomes real when it's seen.
          </p>
        </section>

        {/* ─── CTA ──────────────────────────────────────── */}
        <section className="rounded-2xl border border-[#8460ea]/30 bg-[#8460ea]/5 backdrop-blur-xl p-8 text-center alive-card" id="showcase-cta">
          <p className="text-xs uppercase tracking-[0.3em] text-[#a4a3d0] mb-3">
            Ready to Find Your Genius?
          </p>
          <h3 className="text-2xl md:text-3xl font-display font-medium bg-gradient-to-r from-[#8460ea] via-[#6894d0] to-[#a7cbd4] bg-clip-text text-transparent mb-4">
            Your Uniqueness IS Your Business
          </h3>
          <p className="text-white/40 max-w-md mx-auto mb-6 text-sm">
            One session. Your myth discovered. Your canvas complete.
            The business you were always meant to build — revealed.
          </p>
          <a
            href="/ignite"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium bg-[#8460ea] text-white hover:bg-[#7350d8] transition-all duration-300 hover:shadow-lg hover:shadow-[#8460ea]/20"
          >
            Book Your Ignition Session — $277
          </a>
        </section>

        {/* Footer */}
        <footer className="text-center pt-4 pb-10">
          <p className="text-xs text-white/15 italic">
            "The myth IS the marketing. Operational fact, not theory."
          </p>
        </footer>
      </div>
    </div>
  );
};

export default FoundersShowcase;
