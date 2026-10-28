/**
 * /mastermind — public landing for the Founder-Market Fit Discovery
 * Mastermind (Nov 9–10, 2026).
 *
 * Layout mirrors /ignite (parchment field, GameShellV2 with hideLogo,
 * Cormorant headline, house CTA grammar). Copy below is a DRAFT and will be
 * replaced after Sasha's infographics — all text, price and the CTA target
 * live in the constants block so the swap touches nothing else.
 *
 * No payment provider is wired here. Until MASTERMIND_CTA_URL is set, the
 * CTA opens a mailto waitlist request (never a dead link).
 */
import { ArrowRight } from "lucide-react";
import GameShellV2 from "../components/game/GameShellV2";
import SEO from "@/components/SEO";
import geniusLogo from "@/assets/ignite-logo.png";
import { GOLD_TEXT_STYLE, Ornament } from "@/lib/landingDesign";
import { cn } from "@/lib/utils";

/* ─── Constants: copy, price, CTA (single source of truth) ─── */
const MASTERMIND_PRICE = "$222";
/** Set to the checkout / registration URL once decided. Empty → mailto waitlist. */
const MASTERMIND_CTA_URL = "";
const MASTERMIND_WAITLIST_MAILTO =
  "mailto:sasha@evolver.team?subject=" +
  encodeURIComponent("Founder-Market Fit Discovery Mastermind — reserve my place");
const MASTERMIND_LIVE_SESSION_URL = "https://lu.ma/qpogt17o";

const MASTERMIND_COPY = {
  eyebrow: "Mastermind · Nov 9–10",
  title: "Founder-Market Fit Discovery Mastermind",
  promise:
    "In two live sessions you find where your uniqueness meets the market and leave with a clear offer for your first clients.",
  formatLabel: "Format",
  format: [
    "2 × 90 min live (Nov 9 and Nov 10)",
    "7 days of integration in the group",
    "Recording of both sessions included.",
  ],
  forLabel: "Who it's for",
  forWho: "Founders and solo experts who have a gift but no sharp offer.",
  flowLabel: "How it flows",
  flow: [
    { name: "Uniqueness", text: "Articulate the layers." },
    { name: "Fit", text: "What lights up." },
    { name: "Focus and strategy", text: "" },
    { name: "Action", text: "Offer and first contacts." },
    { name: "Integration", text: "One week in the group." },
  ],
  priceLabel: "Early bird",
  priceNote: "First 10 seats (beta). Regular price later.",
  ctaLabel: "Reserve my place",
  bridgeLead: "Want to meet me first?",
  bridgeLink: "Join the live session on Wed Nov 4, 9:00 CDMX",
  seoTitle: "Founder-Market Fit Discovery Mastermind — Nov 9–10 | Find Your Top Talent",
  seoDescription:
    "Two live 90-minute sessions (Nov 9 and 10) plus a week of integration. Find where your uniqueness meets the market and leave with a clear offer for your first clients.",
} as const;

const MASTERMIND_CTA_HREF = MASTERMIND_CTA_URL || MASTERMIND_WAITLIST_MAILTO;
const CTA_OPENS_NEW_TAB = Boolean(MASTERMIND_CTA_URL);

const SERIF = { fontFamily: "'Cormorant Garamond', serif" } as const;
const BODY_SERIF = {
  fontFamily: "'Source Serif 4', serif",
  color: "var(--text-secondary)",
} as const;

const SectionLabel = ({ children }: { children: string }) => (
  <p
    className="text-[10px] uppercase tracking-[0.28em] text-center font-bold bg-clip-text text-transparent"
    style={GOLD_TEXT_STYLE}
  >
    {children}
  </p>
);

const Mastermind = () => {
  const c = MASTERMIND_COPY;

  return (
    <>
      <SEO
        title={c.seoTitle}
        description={c.seoDescription}
        path="/mastermind"
        ogTitle={c.title}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Event",
          name: c.title,
          description: c.promise,
          startDate: "2026-11-09",
          endDate: "2026-11-10",
          eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
          organizer: { "@type": "Person", name: "Alexander Konstantinov" },
          offers: {
            "@type": "Offer",
            price: MASTERMIND_PRICE.replace(/[^0-9.]/g, ""),
            priceCurrency: "USD",
          },
        }}
      />
      <GameShellV2 hideLogo>
        <div
          // -mt-4 cancels the shell's pane-3 `pt-4` (desktop and mobile <main>)
          // so the card starts flush at the top of the pane, no beige strip.
          className="relative min-h-dvh overflow-x-hidden font-sans -mt-4"
          id="mastermind-page"
          style={{
            background:
              "var(--surface-page)",
          }}
        >
          <div className="relative z-10 max-w-2xl mx-auto px-4 md:px-6 pt-8 pb-16 space-y-12">
            {/* HERO */}
            <header className="text-center space-y-6 pb-2">
              <img src={geniusLogo} alt="" className="skin-emblem w-[140px] h-auto mx-auto opacity-80" />
              <p
                className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.28em] bg-clip-text text-transparent"
                style={GOLD_TEXT_STYLE}
              >
                {c.eyebrow}
              </p>
              <h1
                className="font-serif max-w-2xl mx-auto break-words"
                style={{
                  ...SERIF,
                  fontSize: "clamp(1.95rem, 5vw, 2.9rem)",
                  fontWeight: 700,
                  lineHeight: 1.15,
                  letterSpacing: "-0.018em",
                  color: "var(--skin-text-primary, #0a1628)",
                }}
              >
                {c.title}
              </h1>
              <p
                className="text-base sm:text-lg italic max-w-md mx-auto leading-relaxed"
                style={BODY_SERIF}
              >
                {c.promise}
              </p>
              <Ornament className="my-1" />
              <div className="flex justify-center pt-2">
                <MastermindCta id="mastermind-cta-hero" />
              </div>
            </header>

            {/* FORMAT + AUDIENCE */}
            <section className="space-y-5 max-w-md mx-auto" aria-label={c.formatLabel}>
              <SectionLabel>{c.formatLabel}</SectionLabel>
              <ul className="space-y-2.5 text-left">
                {c.format.map((item) => (
                  <li key={item} className="flex items-baseline gap-2.5">
                    <span className="text-sm bg-clip-text text-transparent" style={GOLD_TEXT_STYLE}>→</span>
                    <span
                      className="text-sm sm:text-base leading-relaxed"
                      style={{ color: "var(--skin-text-primary, #0a1628)" }}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <SectionLabel>{c.forLabel}</SectionLabel>
              <p className="text-sm sm:text-base text-center leading-relaxed" style={BODY_SERIF}>
                {c.forWho}
              </p>
            </section>

            <Ornament />

            {/* FLOW */}
            <section className="space-y-5 max-w-md mx-auto" aria-label={c.flowLabel}>
              <SectionLabel>{c.flowLabel}</SectionLabel>
              <ol className="space-y-3 text-left">
                {c.flow.map((step, i) => (
                  <li key={step.name} className="flex items-baseline gap-3">
                    <span
                      className="text-lg font-bold bg-clip-text text-transparent shrink-0"
                      style={{ ...SERIF, ...GOLD_TEXT_STYLE }}
                    >
                      {i + 1}
                    </span>
                    <span
                      className="text-sm sm:text-base leading-relaxed"
                      style={{ color: "var(--skin-text-primary, #0a1628)" }}
                    >
                      <strong className="font-semibold">{step.name}</strong>
                      {step.text ? `: ${step.text}` : ""}
                    </span>
                  </li>
                ))}
              </ol>
            </section>

            <Ornament />

            {/* PRICE + CTA */}
            <section className="text-center space-y-4" aria-label={c.priceLabel}>
              <SectionLabel>{c.priceLabel}</SectionLabel>
              <p
                className="font-serif"
                style={{
                  ...SERIF,
                  fontSize: "clamp(2.4rem, 8vw, 3.4rem)",
                  fontWeight: 700,
                  color: "var(--skin-text-primary, #0a1628)",
                }}
              >
                {MASTERMIND_PRICE}
              </p>
              <p className="text-sm italic" style={BODY_SERIF}>
                {c.priceNote}
              </p>
              <div className="flex justify-center pt-2">
                <MastermindCta id="mastermind-cta-price" />
              </div>
            </section>

            {/* BRIDGE */}
            <p className="text-center text-sm italic leading-relaxed" style={BODY_SERIF}>
              {c.bridgeLead}{" "}
              <a
                href={MASTERMIND_LIVE_SESSION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4"
              >
                {c.bridgeLink}
              </a>
              .
            </p>
          </div>
        </div>
      </GameShellV2>
    </>
  );
};

/* Same classes/styles as IgniteSession's primary CTA anchor. */
const MastermindCta = ({ id }: { id: string }) => (
  <a
    href={MASTERMIND_CTA_HREF}
    id={id}
    {...(CTA_OPENS_NEW_TAB ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    className={cn(
      "group liquid-glass-dark cta-breath rounded-full",
      "inline-flex items-center justify-center gap-2",
      "px-6 sm:px-7 py-3.5 max-w-full",
      "text-sm sm:text-base font-semibold",
      "transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]",
      "focus-visible:ring-2 focus-visible:ring-white/40 outline-none",
    )}
    style={{
      ...SERIF,
      color: "var(--skin-cta-text, rgba(245,245,250,0.98))",
      backgroundImage:
        "var(--skin-cta-bg, linear-gradient(135deg, rgba(10,22,40,0.72) 0%, rgba(26,30,58,0.62) 50%, rgba(10,22,40,0.72) 100%))",
      boxShadow:
        "var(--skin-cta-shadow, 0 0 18px -4px rgba(240,194,127,0.45), 0 10px 24px -10px rgba(10,22,40,0.5))",
      textShadow:
        "var(--skin-cta-text-shadow, 0 0 16px rgba(240,194,127,0.25), 0 1px 2px rgba(0,0,0,0.35))",
    }}
  >
    <span style={{ textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "0.88em" }}>
      {MASTERMIND_COPY.ctaLabel}
    </span>
    <ArrowRight
      className="w-4 h-4 ml-0.5 transition-transform duration-300 group-hover:translate-x-0.5"
      aria-hidden="true"
    />
  </a>
);

export default Mastermind;
