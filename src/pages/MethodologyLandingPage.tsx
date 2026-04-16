import { ArrowRight, ExternalLink } from "lucide-react";
import { ExpandableTestimonial } from "@/components/ExpandableTestimonial";
import { TESTIMONIALS } from "@/data/testimonials";
import PlaybookHero from "@/components/playbook/PlaybookHero";

/**
 * MethodologyLandingPage — the `/` landing (and `/game/journey`, via
 * JourneyPage). Replaces the old App-Store tile grid with the new hero:
 * headline, circular Mux video, "Claim your gift" CTA (magic-link funnel).
 *
 * Hero + CTA wiring lives in `PlaybookHero` — that component owns the HLS
 * video and the navigation to `/auth?claim=true&next=/zone-of-genius`.
 */
const MethodologyLandingPage = () => {
  return (
    <div className="max-w-[740px] mx-auto px-5 py-10 md:py-16">
      {/* ═══════ HEADLINE ═══════ */}
      <header className="text-center mb-10 px-4">
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-[1.15] tracking-[-0.01em] mb-3"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: "#0a1628" }}
        >
          Unnamed talent{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(135deg, #8460ea, #29549f)" }}
          >
            →
          </span>{" "}
          thriving biz in flow.
        </h1>
        <p
          className="text-xs sm:text-sm uppercase tracking-[0.28em]"
          style={{ color: "#1a2a44", fontWeight: 500 }}
        >
          In seven steps
        </p>
      </header>

      {/* ═══════ HERO: circular Mux video + Claim your gift CTA ═══════ */}
      <PlaybookHero />

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
