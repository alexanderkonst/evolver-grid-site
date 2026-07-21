/**
 * /products/evolution-portal — Client Evolution Portal landing
 * (internal name: Practitioner Node; Day 130, July 20, 2026).
 *
 * Public category: "Client Evolution Portal". Spec + shelf decision:
 * docs/04-products/practitioner_node.md.
 *
 * Register matches /products (ProductsPage.tsx): parchment/Cormorant/
 * gold-eyebrow cocktail with skin-token fallbacks. NOT the dark
 * /aleksandr composition. Renders INSIDE the persistent GameShellV2
 * (rail + panes) via shellRoutes.ts SHELL_EXACT — the member-portal
 * chrome is part of the product's proof (founder call, Day 130).
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
import { DOMAINS } from "@/modules/quality-of-life-map/qolConfig";
import { LIBRARY_CATEGORIES, LIBRARY_ITEMS } from "@/modules/library/libraryContent";

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
  "Your own portal, branded fully to you: your colors, your logo, your fonts.",
  "Every client's Quality of Life history, snapshot after snapshot: evolution they can see.",
  "The Transformation Library with your practices loaded.",
  "Personal practice recommendations, drawn from each client's own numbers.",
  "A free self-knowledge layer where they articulate their top talent and build a profile they can use anywhere.",
];

const LOVE_DOMAIN = DOMAINS.find((d) => d.id === "love");
const QOL_PREVIEW_STAGES = (LOVE_DOMAIN?.stages ?? []).slice(0, 3);

const LIBRARY_PREVIEW_CATEGORIES = LIBRARY_CATEGORIES.slice(0, 4);

const LIBRARY_PREVIEW_ITEM_IDS = [
  "heart-coherence-breathing",
  "use-breath-relax-energize",
  "feel-better-fast-energy-boost",
];
const LIBRARY_PREVIEW_ITEMS = LIBRARY_PREVIEW_ITEM_IDS.map((id) =>
  LIBRARY_ITEMS.find((item) => item.id === id)
).filter((item): item is (typeof LIBRARY_ITEMS)[number] => Boolean(item));

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
        className="min-h-full"
        style={{ background: "var(--skin-page-bg, #f7f3ea)" }}
      >
        <div className="mx-auto px-4 md:px-6 py-16 md:py-20 space-y-14">
          {/* HERO */}
          <header className="max-w-3xl mx-auto text-center space-y-5">
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

          {/* THE INTAKE OF A SERIOUS PRACTICE */}
          <section className="max-w-3xl mx-auto rounded-2xl overflow-hidden" style={parchmentCard}>
            <div className="p-6 md:p-8 space-y-3">
              <p style={sectionEyebrow}>Clarity from day one</p>
              <p style={{ ...sourceSerifBody, fontSize: "15.5px" }}>
                Real life coaching starts with seeing where life actually is.
                The Quality of Life snapshot does exactly that: eight domains
                of life, one honest self-assessment, a clear picture of where
                the work wants to go. Your client feels the care and the
                structure behind your process from the first session. And it
                calls in the ones who are ready: grounded people, open to
                change, carrying their own quiet fire.
              </p>
            </div>
          </section>

          {/* PREVIEW A — QOL SNAPSHOT MINIATURE */}
          <section className="max-w-[640px] mx-auto space-y-3" aria-hidden="true">
            <div
              className="rounded-2xl overflow-hidden pointer-events-none"
              style={parchmentCard}
            >
              <div
                className="px-8 py-6 md:py-8"
                style={{ transform: "scale(0.75)", transformOrigin: "top center" }}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p style={eyebrowGold}>Step 4 of 8</p>
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <span
                          key={i}
                          className="rounded-full"
                          style={{
                            width: i === 3 ? "16px" : "6px",
                            height: "6px",
                            background:
                              i <= 3
                                ? "var(--skin-accent-gold, #b8860b)"
                                : "rgba(11, 42, 90, 0.18)",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <h3 style={{ ...cormorantTitle, fontSize: "24px", lineHeight: 1.2 }}>
                    Love &amp; Relationships
                  </h3>
                  <p
                    style={{
                      ...sourceSerifBody,
                      fontSize: "14px",
                      fontStyle: "italic",
                      opacity: 0.85,
                    }}
                  >
                    Select the stage that best represents your current state
                    in this domain.
                  </p>
                  <div className="space-y-2.5 pt-1">
                    {QOL_PREVIEW_STAGES.map((stage) => (
                      <div
                        key={stage.id}
                        className="flex items-start gap-3 rounded-xl p-3"
                        style={{
                          border: "0.5px solid rgba(212, 175, 55, 0.35)",
                          background: "rgba(255, 255, 255, 0.4)",
                        }}
                      >
                        <span
                          className="rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            ...cormorantTitle,
                            width: "26px",
                            height: "26px",
                            fontSize: "13px",
                            color: "var(--skin-accent-gold, #b8860b)",
                            border: "0.5px solid rgba(212, 175, 55, 0.55)",
                          }}
                        >
                          {stage.id}
                        </span>
                        <div>
                          <p style={{ ...cormorantTitle, fontSize: "15px", lineHeight: 1.3 }}>
                            {stage.title}
                          </p>
                          <p
                            style={{
                              ...sourceSerifBody,
                              fontSize: "12.5px",
                              opacity: 0.8,
                              lineHeight: 1.4,
                            }}
                          >
                            {stage.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <p
              className="text-center"
              style={{ ...sourceSerifBody, fontSize: "13px", fontStyle: "italic", opacity: 0.7 }}
            >
              The Quality of Life snapshot, as your clients see it.
            </p>
          </section>

          {/* MEASURED, NOT GUESSED */}
          <section className="max-w-3xl mx-auto rounded-2xl overflow-hidden" style={parchmentCard}>
            <div className="p-6 md:p-8 space-y-3">
              <p style={sectionEyebrow}>The hidden secret of the industry</p>
              <p style={{ ...sourceSerifBody, fontSize: "15.5px" }}>
                Almost nobody in this field measures progress. So the decision
                to continue rides on a feeling, and the work quietly bends
                toward keeping clients comfortable. Comfort is not
                transformation. When progress is measured, a different kind
                of client stays with you: people who are in it for real, who
                honor their time, who keep investing because they can see the
                work working.
              </p>
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section className="max-w-3xl mx-auto space-y-5">
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
          <section className="max-w-3xl mx-auto space-y-5">
            <p className="text-center" style={sectionEyebrow}>
              What your clients receive
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

          {/* PREVIEW B — TRANSFORMATION LIBRARY MINIATURE */}
          <section className="max-w-[880px] mx-auto space-y-3" aria-hidden="true">
            <div
              className="rounded-2xl overflow-hidden pointer-events-none"
              style={parchmentCard}
            >
              <div className="p-6 md:p-9 space-y-5">
                <div className="flex flex-wrap justify-center gap-2">
                  {LIBRARY_PREVIEW_CATEGORIES.map((cat) => (
                    <span
                      key={cat.id}
                      className="rounded-full px-3.5 py-1.5"
                      style={{
                        ...eyebrowGold,
                        fontSize: "9.5px",
                        border: "0.5px solid rgba(212, 175, 55, 0.5)",
                      }}
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {LIBRARY_PREVIEW_ITEMS.map((item) => (
                    <div key={item.id} className="space-y-2">
                      <div
                        className="rounded-xl overflow-hidden aspect-video"
                        style={{ border: "0.5px solid rgba(212, 175, 55, 0.4)" }}
                      >
                        <img
                          src={`https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`}
                          alt=""
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p style={{ ...cormorantTitle, fontSize: "15px", lineHeight: 1.3 }}>
                        {item.title}
                      </p>
                      <p
                        style={{
                          ...sourceSerifBody,
                          fontSize: "12.5px",
                          fontStyle: "italic",
                          opacity: 0.8,
                        }}
                      >
                        {item.teacher} &middot; {item.durationLabel}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <p
              className="text-center"
              style={{ ...sourceSerifBody, fontSize: "13px", fontStyle: "italic", opacity: 0.7 }}
            >
              The Transformation Library, as your clients see it.
            </p>
          </section>

          {/* A TWO-WAY PARTNERSHIP */}
          <section className="max-w-3xl mx-auto rounded-2xl overflow-hidden" style={parchmentCard}>
            <div className="p-6 md:p-8 space-y-3">
              <p style={sectionEyebrow}>Revenue share</p>
              <p style={{ ...sourceSerifBody, fontSize: "15.5px" }}>
                Inside the portal your clients find one quiet doorway: an
                invitation to discover their top talent, free. If they choose
                to go further, the revenue share is simple: 90% of digital
                products they buy is yours, and 33% of the containers we
                facilitate is yours. We do the work. You share the fruit.
              </p>
              <p
                style={{
                  ...sourceSerifBody,
                  fontSize: "13.5px",
                  opacity: 0.85,
                }}
              >
                Your clients remain your clients. From our side: one
                invitation a month at most, nothing pushy, and you always see
                what they buy.
              </p>
              <p style={{ ...sourceSerifBody, fontSize: "15.5px" }}>
                And it flows both ways. When our people need what you do, we
                send them to you. Nobody keeps score. Every configuration
                wins.
              </p>
            </div>
          </section>

          {/* PRICING */}
          <section className="max-w-[560px] mx-auto text-center">
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                border: "0.5px solid rgba(212, 175, 55, 0.55)",
                background: "var(--skin-card-fill, rgba(255, 252, 245, 0.92))",
              }}
            >
              <div className="p-6 md:p-8 space-y-3">
                <p style={sectionEyebrow}>Pricing</p>
                <p style={{ ...sourceSerifBody, fontSize: "15.5px" }}>
                  Setup: $555, including branding the portal to your
                  identity. Then one dollar per active client per month.{" "}
                  <span
                    style={{
                      ...cormorantTitle,
                      color: "var(--skin-accent-gold, #b8860b)",
                      fontSize: "17px",
                    }}
                  >
                    Ten clients, ten dollars.
                  </span>{" "}
                  It never becomes a burden. It just keeps showing your work
                  working.
                </p>
              </div>
            </div>
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
