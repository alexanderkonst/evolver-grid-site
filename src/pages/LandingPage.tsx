import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { ExpandableTestimonial } from "@/components/ExpandableTestimonial";

/**
 * Story-based landing page — the funnel entry point.
 * Two paths: free ZoG test (curious) or direct Ignite booking (ready).
 * Wabi-sabi + Apple aesthetic with existing design tokens.
 */

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh font-['Inter',sans-serif] relative bg-[#f8f7f5]">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(132,96,234,0.06)_0%,transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(104,148,208,0.04)_0%,transparent_50%)]" />

      {/* Grain texture */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative min-h-dvh flex flex-col">
        {/* Content */}
        <main className="flex-1 flex flex-col justify-center items-center px-6 md:px-12 py-16 md:py-24">
          <div className="max-w-[720px] w-full space-y-12 md:space-y-16">

            {/* Eyebrow */}
            <div className="text-center">
              <p className="text-xs font-medium tracking-[0.3em] uppercase text-[#8460ea]/60">
                The Unique Business Protocol
              </p>
            </div>

            {/* The Story */}
            <section className="space-y-6 text-center">
              <h1
                className="text-3xl sm:text-4xl md:text-5xl font-display font-semibold leading-[1.15] tracking-tight text-[#2c3150]"
                style={{ textShadow: "0 0 80px rgba(132,96,234,0.08)" }}
              >
                Your genius is already there.<br />
                <span className="bg-gradient-to-r from-[#8460ea] to-[#6894d0] bg-clip-text text-transparent">
                  It just hasn't been named.
                </span>
              </h1>

              <p className="text-base md:text-lg text-[#2c3150]/60 leading-relaxed max-w-xl mx-auto">
                Oyi teaches sovereignty through storytelling. Sergey shows tech leaders how Pull&nbsp;+&nbsp;AI replaces the grind.
                Sandra crystallizes missions into one sentence. Alexa maps invisible architecture. Karime transmits love that alleviates.
              </p>

              <p className="text-sm text-[#2c3150]/40 italic">
                Each came in unable to explain what they do. Each left with a named gift and a clear business.
              </p>
            </section>

            {/* Two Paths */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Path A: Curious */}
              <button
                onClick={() => navigate("/start")}
                className="group p-6 rounded-2xl border border-[#2c3150]/10 bg-white/60 backdrop-blur-sm hover:border-[#8460ea]/30 hover:bg-white/80 transition-all duration-300 text-left hover:shadow-lg hover:shadow-[#8460ea]/5 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <div className="w-10 h-10 rounded-xl bg-[#8460ea]/8 flex items-center justify-center mb-4">
                  <Sparkles className="w-5 h-5 text-[#8460ea]" />
                </div>
                <h3 className="text-lg font-semibold text-[#2c3150] mb-1">
                  Discover your genius first
                </h3>
                <p className="text-sm text-[#2c3150]/50 leading-relaxed mb-3">
                  Free Zone of Genius test. 15 minutes. One page that finally sounds like you.
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-[#8460ea] group-hover:gap-2 transition-all">
                  Start free assessment <ArrowRight className="w-4 h-4" />
                </span>
              </button>

              {/* Path B: Ready */}
              <button
                onClick={() => navigate("/ignite")}
                className="group p-6 rounded-2xl border border-[#8460ea]/20 bg-gradient-to-br from-[#8460ea]/5 to-transparent backdrop-blur-sm hover:border-[#8460ea]/40 hover:from-[#8460ea]/10 transition-all duration-300 text-left hover:shadow-lg hover:shadow-[#8460ea]/10 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <div className="w-10 h-10 rounded-xl bg-[#8460ea]/15 flex items-center justify-center mb-4">
                  <Zap className="w-5 h-5 text-[#8460ea]" />
                </div>
                <h3 className="text-lg font-semibold text-[#2c3150] mb-1">
                  Build your unique business
                </h3>
                <p className="text-sm text-[#2c3150]/50 leading-relaxed mb-3">
                  The Productize Yourself Session. 60–90 minutes. Walk out with your entire business on one page. $555.
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-[#8460ea] group-hover:gap-2 transition-all">
                  Book Productize Yourself Session <ArrowRight className="w-4 h-4" />
                </span>
              </button>
            </section>

            {/* Social Proof */}
            <section className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {([
                  {
                    shortQuote: "This is a miracle of miracles. A tool that just plain works.",
                    fullQuote: "This is a miracle of miracles. Other tools come at this half-baked and shallow — they've got no depth. Your approach, though? A tool that just plain works.",
                    name: "Alexey Utkin, serial founder, Stanford MBA",
                  },
                  {
                    shortQuote: "Wow, wow, wow, wow, wow. My guides, they like you.",
                    fullQuote: "Wow, wow, wow, wow, wow. I never had the words to say that ... I've been working on this since 2011 - change my age, make small edits. You've changed the dynamic ... This is a major breakthrough ... I physically feel chills, and I feel unfolding ... I see this as life changing.",
                    name: "Oyi Sun, Medicine Man, Ye Ming Zhu keeper",
                    after: "teaches sovereignty through storytelling — helping creative builders reclaim their inner authority.",
                  },
                ] as import("@/components/ExpandableTestimonial").TestimonialData[]).map((t, i) => (
                  <ExpandableTestimonial key={i} t={t} variant="light" />
                ))}
              </div>

              {/* Stats bar */}
              <div className="flex items-center justify-center gap-6 md:gap-10 py-3">
                {[
                  { num: "10", label: "sessions" },
                  { num: "100%", label: "conversion" },
                  { num: "250+", label: "geniuses mapped" },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <p className="text-lg font-display font-semibold bg-gradient-to-br from-[#8460ea] to-[#6894d0] bg-clip-text text-transparent">
                      {s.num}
                    </p>
                    <p className="text-[10px] text-[#2c3150]/30 uppercase tracking-wide">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* The Copernican Inversion */}
            <section className="text-center space-y-3 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8460ea]/50">The Copernican Inversion</p>
              <p className="text-base md:text-lg text-[#2c3150]/70 max-w-lg mx-auto leading-relaxed">
                You don't need a better funnel. You need a lens correction.
                <br />
                <span className="text-[#2c3150]/40 text-sm">
                  Your uniqueness IS your product-market fit. We just name it.
                </span>
              </p>
            </section>

          </div>
        </main>

        {/* Footer */}
        <footer className="text-center py-6 px-6">
          <p className="text-xs text-[#2c3150]/25">
            Based in Mexico City · In-person & Zoom worldwide
          </p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <a href="/zone-of-genius" className="text-[10px] text-[#8460ea]/40 hover:text-[#8460ea]/70 transition-colors">
              Zone of Genius
            </a>
            <a href="/ignite" className="text-[10px] text-[#8460ea]/40 hover:text-[#8460ea]/70 transition-colors">
              Productize Yourself Session
            </a>
            <a href="/founders" className="text-[10px] text-[#8460ea]/40 hover:text-[#8460ea]/70 transition-colors">
              Founders
            </a>
          </div>
        </footer>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#8460ea]/[0.04]"
            style={{
              width: `${4 + (i % 3) * 3}px`,
              height: `${4 + (i % 3) * 3}px`,
              left: `${15 + i * 13}%`,
              top: `${20 + (i % 3) * 25}%`,
              animation: `float-${i % 3} ${20 + i * 3}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes float-0 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(20px, -20px); } }
        @keyframes float-1 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-15px, 15px); } }
        @keyframes float-2 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(10px, 25px); } }
      `}</style>
    </div>
  );
};

export default LandingPage;
