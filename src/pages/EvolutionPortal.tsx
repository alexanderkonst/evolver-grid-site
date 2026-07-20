/**
 * /products/evolution-portal — Client Evolution Portal landing
 * (internal name: Practitioner Node; Day 130, July 20, 2026).
 *
 * Public category: "Client Evolution Portal". Spec + shelf decision:
 * docs/04-products/practitioner_node.md.
 *
 * Register matches /products (ProductsPage.tsx): standalone editorial
 * page, parchment/Cormorant/gold-eyebrow cocktail with skin-token
 * fallbacks. NOT the dark /aleksandr composition.
 *
 * ONE CTA throughout: "Claim your portal" → cal.com 15-minute
 * conversation (same booking mechanism as the products shelf and the
 * Ignite funnel's cal.com pattern), tracked via trackCTAClick.
 *
 * Copy is founder-approved verbatim — do not rewrite.
 */
import { ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import { trackPageView, trackCTAClick } from "@/lib/funnelAnalytics";
import { useEffect } from "react";

const CALCOM_15MIN = "https://cal.com/aleksandrkonstantinov/15min";

const eyebrowGold: React.CSSProperties = {
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontWeight: 500,
  fontSize: "10.5px",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "var(--skin-accent-gold, #b8860b)",
};

const cormorantTitle: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontWeight: 700,
  letterSpacing: "-0.005em",
  color: "var(--skin-text-primary, #0b2a5a)",
};

const sourceSerifBody: React.CSSProperties = {
  fontFamily: "'Source Serif 4', serif",
  fontWeight: 500,
  color: "var(--skin-text-primary, #0b2a5a)",
  lineHeight: 1.6,
};

const parchmentCard: React.CSSProperties = {
  background: "var(--skin-card-fill, rgba(255, 252, 245, 0.92))",
  border: "0.5px solid rgba(212, 175, 55, 0.55)",
  boxShadow:
    "0 0 22px -8px rgba(212, 175, 55, 0.30), 0 16px 40px -20px rgba(10, 22, 40, 0.22)",
};

const ceremonialCta: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontWeight: 600,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  fontSize: "12px",
  background:
    "var(--skin-cta-bg, linear-gradient(135deg, rgba(10,22,40,0.92) 0%, rgba(18,28,56,0.85) 50%, rgba(10,22,40,0.92) 100%))",
  color: "var(--skin-cta-text, rgba(245, 245, 250, 0.98))",
  border: "0.5px solid var(--skin-cta-border, rgba(255, 255, 255, 0.14))",
  boxShadow:
    "var(--skin-cta-shadow, 0 0 0 1px rgba(212, 175, 55, 0.28), 0 0 18px -4px rgba(240, 194, 127, 0.45), 0 0 40px -8px rgba(212, 175, 55, 0.28))",
};

const sectionEyebrow: React.CSSProperties = {
  ...eyebrowGold,
  fontSize: "10px",
  letterSpacing: "0.22em",
};

const ClaimCta = ({ ctaId }: { ctaId: string }) => (
  <a
    href={CALCOM_15MIN}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-2 rounded-full px-6 py-3 transition-all duration-300 hover:translate-y-[-1px]"
    style={ceremonialCta}
    onClick={() => trackCTAClick("booking_click", ctaId)}
  >
    Claim your portal
    <ArrowRight className="w-3.5 h-3.5" />
  </a>
);

const HOW_IT_WORKS = [
  "Assess. Your client takes a Quality of Life snapshot when they begin with you.",
  "Practice. They get your practices inside: your meditations, your recordings, your links. The portal recommends the right one at the right time.",
  "Evolve. They retake the snapshot as they go and literally watch themselves change. Your work is what moves the lines.",
];

const WHATS_INSIDE = [
  "Your own corner of the platform, in your colors.",
  "A living evolution graph for every client.",
  "The Transformation Library with your practices loaded.",
  "Personal practice recommendations, driven by each client's own numbers.",
];

const EvolutionPortal = () => {
  useEffect(() => {
    trackPageView("evolution_portal_view");
  }, []);

  return (
    <>
      <SEO
        title="Client Evolution Portal — for Practitioners | Find Your Top Talent"
        description="Your clients watch themselves change: Quality of Life tracking over time, your practices inside, and revenue share back to you."
        path="/products/evolution-portal"
      />
      <div
        className="min-h-dvh"
        style={{ background: "var(--skin-page-bg, #f7f3ea)" }}
      >
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-16 md:py-20 space-y-12">
          {/* HERO */}
          <header className="text-center space-y-5">
            <p style={eyebrowGold}>For practitioners of transformation</p>
            <h1
              style={{
                ...cormorantTitle,
                fontSize: "clamp(2rem, 5vw, 3rem)",
                lineHeight: 1.15,
              }}
            >
              Your own Client Evolution Portal.
            </h1>
            <p
              className="max-w-xl mx-auto"
              style={{ ...sourceSerifBody, fontSize: "16.5px" }}
            >
              This is your client evolution portal. Not an app, not a course
              platform. It&apos;s where your people watch themselves change,
              with your practices inside, and it pays you.
            </p>
            <div className="pt-2">
              <ClaimCta ctaId="hero-cta" />
            </div>
          </header>

          {/* THE INVISIBLE PROBLEM */}
          <section className="rounded-2xl overflow-hidden" style={parchmentCard}>
            <div className="p-6 md:p-8 space-y-3">
              <p style={sectionEyebrow}>The invisible problem</p>
              <p style={{ ...sourceSerifBody, fontSize: "15.5px" }}>
                You sell transformation. The problem: transformation is
                invisible. Clients feel something after a session, then drift.
                The portal makes your results visible. Clients who see their
                own lines move, stay. You are not selling sessions anymore.
                You are showing proof.
              </p>
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section className="space-y-5">
            <p className="text-center" style={sectionEyebrow}>
              How it works
            </p>
            <div className="space-y-4">
              {HOW_IT_WORKS.map((step, i) => (
                <div
                  key={i}
                  className="rounded-2xl overflow-hidden"
                  style={parchmentCard}
                >
                  <div className="p-5 md:p-6 flex items-start gap-4">
                    <span
                      style={{
                        ...cormorantTitle,
                        fontSize: "26px",
                        color: "var(--skin-accent-gold, #b8860b)",
                        lineHeight: 1,
                      }}
                    >
                      {i + 1}
                    </span>
                    <p style={{ ...sourceSerifBody, fontSize: "15px" }}>{step}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* WHAT'S INSIDE */}
          <section className="space-y-5">
            <p className="text-center" style={sectionEyebrow}>
              What&apos;s inside
            </p>
            <div className="rounded-2xl overflow-hidden" style={parchmentCard}>
              <div className="p-6 md:p-8 space-y-3">
                {WHATS_INSIDE.map((row, i) => (
                  <div key={i} className="flex items-baseline gap-3">
                    <span
                      style={{
                        color: "var(--skin-accent-gold, #b8860b)",
                        fontSize: "14px",
                      }}
                    >
                      &rarr;
                    </span>
                    <p style={{ ...sourceSerifBody, fontSize: "15px" }}>{row}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* YOUR PORTAL CAN PAY YOU */}
          <section className="rounded-2xl overflow-hidden" style={parchmentCard}>
            <div className="p-6 md:p-8 space-y-3">
              <p style={sectionEyebrow}>Your portal can pay you</p>
              <p style={{ ...sourceSerifBody, fontSize: "15.5px" }}>
                You keep 90% on your digital products sold through your portal.
                You earn 33% on anything of ours your people buy where we
                facilitate. Terms first, in writing, before anything starts.
                Your content stays yours. You can leave anytime and take it
                with you.
              </p>
            </div>
          </section>

          {/* PRICING */}
          <section className="text-center space-y-3">
            <p style={sectionEyebrow}>Pricing</p>
            <p
              className="max-w-xl mx-auto"
              style={{ ...sourceSerifBody, fontSize: "15.5px" }}
            >
              Setup: $555. Then $5 per active client per month. Only clients
              who actually use it that month count, minimum $25. No seats
              wasted on dormant clients.
            </p>
          </section>

          {/* CLOSING CTA */}
          <section className="text-center space-y-4 pt-2">
            <ClaimCta ctaId="closing-cta" />
            <p
              style={{
                ...sourceSerifBody,
                fontSize: "14px",
                fontStyle: "italic",
              }}
            >
              One conversation. Your portal can be live within a week.
            </p>
          </section>
        </div>
      </div>
    </>
  );
};

export default EvolutionPortal;
