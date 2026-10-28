/**
 * /build/mastermind — the Fire Circle's page for the Founder-Market Fit Discovery
 * Mastermind (Nov 9–10, 2026), and the Fire Circle's Journey step in the module form (WP-10).
 * Design: docs/02-strategy/game_of_being_you.md §14.4 (module form), §14.3 (lock rule), §14.8
 * row WP-10, §15.6.
 *
 * The step: ModuleIntro (one button) → this page → «I was in the circle» → ModuleOutro
 * (1–10, real choice, victory in `journey_victories`) → /village. The page is open to guests;
 * only recording the victory asks for the account, at that moment (CircleRecord).
 * `?step=page` goes straight to the page, past the Intro; a victory already recorded opens
 * on the Outro.
 *
 * Layout mirrors /ignite (page field, GameShellV2 with hideLogo, Cormorant headline, house CTA
 * grammar). Colors are the semantic tokens of src/styles/theme-tokens.css (surface, text,
 * accent, cta, live), so the page switches with the skin. Copy below is a DRAFT and will be
 * replaced after Sasha's infographics — all text, price and the CTA target live in the
 * constants block so the swap touches nothing else.
 *
 * No payment provider is wired here. Until SEAT_CHECKOUT_URL is set, the CTA goes to the
 * free Nov 4 live session registration (Luma, the same link as the bridge line) and the
 * price block says "Registration opens soon".
 */
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import GameShellV2 from "../components/game/GameShellV2";
import CircleRecord from "@/components/game/CircleRecord";
import ModuleIntro from "@/components/game/ModuleIntro";
import ModuleOutro from "@/components/game/ModuleOutro";
import SEO from "@/components/SEO";
import geniusLogo from "@/assets/ignite-logo.png";
import { FIRE_CIRCLE_LIVE, mastermindBegun } from "@/data/liveEvents";
import { MASTERMIND_ID, MASTERMIND_MODULE, MASTERMIND_ROUTE } from "@/data/mastermindModule";
import { useJourneyVictory } from "@/hooks/useJourneyVictory";
import { GOLD_TEXT_STYLE, Ornament } from "@/lib/landingDesign";
import { liveWindowNow } from "@/lib/placeState";
import { cn } from "@/lib/utils";

/* ─── Constants: copy, price, CTA (single source of truth) ─── */
/**
 * Where «Reserve my place» goes. Empty → the free live-session registration (the button as it is
 * today). A Stripe payment link for the $222 seat replaces it here, and only here.
 */
// TODO(Sasha): Stripe payment link for the Mastermind $222 seat
const SEAT_CHECKOUT_URL = "";
const MASTERMIND_PRICE = "$222";
const MASTERMIND_LIVE_SESSION_URL = "https://lu.ma/qpogt17o";

const MASTERMIND_COPY = {
  eyebrow: "Group Mastermind · Nov 9–10",
  title: "Founder-Market Fit Discovery Mastermind",
  promise:
    "In two live sessions you find where your uniqueness meets the market and leave with a clear offer for your first clients.",
  formatLabel: "Format",
  format: [
    "Small group, 2 sessions, $222",
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
  priceLabel: "Early bird · group",
  priceNote: "First 10 seats (beta). Regular price later.",
  ctaLabel: "Reserve my place",
  /** Shown on the CTA while SEAT_CHECKOUT_URL is empty. */
  ctaLabelPending: "Join the free live session",
  pendingNote: "Registration opens soon.",
  distinction:
    "This is the group (small group, 2 sessions, $222). Prefer 1:1? The Private Founder-Market Fit Session is 1:1, 2 hours, $555.",
  distinctionLink: "See the Private Session",
  bridgeLead: "Want to meet me first?",
  bridgeLink: "Join the live session on Wed Nov 4, 9:00 CDMX",
  /** The step's own door, once the circle has begun. */
  afterLabel: "Been in the circle?",
  afterLink: "I was in the circle",
  seoTitle: "Founder-Market Fit Discovery Mastermind — Nov 9–10 | Find Your Top Talent",
  seoDescription:
    "Two live 90-minute sessions (Nov 9 and 10) plus a week of integration. Find where your uniqueness meets the market and leave with a clear offer for your first clients.",
} as const;

const MASTERMIND_CTA_HREF = SEAT_CHECKOUT_URL || MASTERMIND_LIVE_SESSION_URL;
const CTA_IS_PENDING = !SEAT_CHECKOUT_URL;
const CTA_OPENS_NEW_TAB = true;

const SERIF = { fontFamily: "'Cormorant Garamond', serif" } as const;
const BODY_SERIF = {
  fontFamily: "'Source Serif 4', serif",
  color: "var(--text-secondary)",
} as const;
const INK = { color: "var(--text-primary)" } as const;

const SectionLabel = ({ children }: { children: string }) => (
  <p
    className="text-[10px] uppercase tracking-[0.28em] text-center font-bold bg-clip-text text-transparent"
    style={GOLD_TEXT_STYLE}
  >
    {children}
  </p>
);

type PageProps = {
  /** «I was in the circle»: on to recording the victory. Shown once the Mastermind has begun. */
  onWasThere: () => void;
};

const MastermindPage = ({ onWasThere }: PageProps) => {
  const c = MASTERMIND_COPY;
  // The webinar (Nov 4) and the Mastermind (Nov 9–10) are the Fire Circle's live windows (§14.3).
  const liveNow = liveWindowNow(FIRE_CIRCLE_LIVE, new Date());

  return (
    <div
      // -mt-4 cancels the shell's pane-3 `pt-4` (desktop and mobile <main>)
      // so the card starts flush at the top of the pane, no beige strip.
      className="relative min-h-dvh overflow-x-hidden font-sans -mt-4"
      id="mastermind-page"
      data-place-state={liveNow ? "live" : undefined}
      style={{ background: "var(--surface-page)" }}
    >
      <div className="relative z-10 max-w-2xl mx-auto px-4 md:px-6 pt-8 pb-16 space-y-12">
        {/* HERO */}
        <header className="text-center space-y-6 pb-2">
          <img src={geniusLogo} alt="" className="skin-emblem w-[140px] h-auto mx-auto opacity-80" />
          {liveNow && (
            <p
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold"
              style={{ color: "var(--live-accent)" }}
              role="status"
            >
              <span
                aria-hidden="true"
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: "var(--live-accent)", boxShadow: "0 0 10px 1px var(--live-accent)" }}
              />
              {liveNow.line}
            </p>
          )}
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
              ...INK,
              fontSize: "clamp(1.95rem, 5vw, 2.9rem)",
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: "-0.018em",
            }}
          >
            {c.title}
          </h1>
          <p className="text-base sm:text-lg italic max-w-md mx-auto leading-relaxed" style={BODY_SERIF}>
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
                <span className="text-sm sm:text-base leading-relaxed" style={INK}>
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
                <span className="text-sm sm:text-base leading-relaxed" style={INK}>
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
              ...INK,
              fontSize: "clamp(2.4rem, 8vw, 3.4rem)",
              fontWeight: 700,
            }}
          >
            {MASTERMIND_PRICE}
          </p>
          <p className="text-sm italic" style={BODY_SERIF}>
            {c.priceNote}
          </p>
          {CTA_IS_PENDING && (
            <p className="text-sm font-semibold" style={INK}>
              {c.pendingNote}
            </p>
          )}
          <div className="flex justify-center pt-2">
            <MastermindCta id="mastermind-cta-price" />
          </div>
        </section>

        {/* PRIVATE vs GROUP */}
        <p className="text-center text-sm leading-relaxed max-w-md mx-auto" style={BODY_SERIF}>
          {c.distinction}{" "}
          <a href="/ignite" className="underline underline-offset-4">
            {c.distinctionLink}
          </a>
          .
        </p>

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

        {/* THE STEP'S END: after the circle has begun, a player can say they were in it */}
        {mastermindBegun() && (
          <p className="text-center text-sm leading-relaxed" style={BODY_SERIF}>
            {c.afterLabel}{" "}
            <button
              type="button"
              id="mastermind-was-there"
              onClick={onWasThere}
              className="underline underline-offset-4 font-semibold"
              style={{ color: "var(--accent-text)" }}
            >
              {c.afterLink}
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

type Stage = "pending" | "intro" | "page" | "record" | "outro";

const Mastermind = () => {
  const c = MASTERMIND_COPY;
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const victory = useJourneyVictory(MASTERMIND_ID);
  const [stage, setStage] = useState<Stage>("pending");

  // Decide once, when the saved victory (if any) has been read.
  useEffect(() => {
    if (stage !== "pending" || victory.loading) return;
    if (victory.rating !== null) {
      setStage("outro");
      return;
    }
    const step = params.get("step");
    setStage(step === "record" ? "record" : step === "page" ? "page" : "intro");
  }, [stage, victory.loading, victory.rating, params]);

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
        {stage === "pending" ? (
          // An empty fragment, not null: the shell renders an <Outlet /> for nullish children.
          <></>
        ) : stage === "page" ? (
          <MastermindPage onWasThere={() => setStage("record")} />
        ) : stage === "intro" ? (
          <div className="px-4 py-8 sm:py-10">
            <ModuleIntro module={MASTERMIND_MODULE} onStart={() => setStage("page")} />
          </div>
        ) : stage === "record" ? (
          <div className="px-4 py-8 sm:py-10">
            <CircleRecord
              onRecorded={() => {
                setStage("outro");
                // Drop «?step=record» from the address: a reload now lands on the Outro.
                navigate(MASTERMIND_ROUTE, { replace: true });
              }}
            />
          </div>
        ) : (
          <div className="px-4 py-8 sm:py-10">
            <ModuleOutro module={MASTERMIND_MODULE} />
          </div>
        )}
      </GameShellV2>
    </>
  );
};

/* Same classes/styles as IgniteSession's primary CTA anchor, on the cta tokens. */
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
      "focus-visible:ring-2 focus-visible:ring-[rgba(var(--accent-rgb),0.6)] outline-none",
    )}
    style={{
      ...SERIF,
      color: "var(--cta-text)",
      backgroundImage: "var(--cta-bg)",
      boxShadow: "var(--cta-shadow)",
      textShadow: "var(--cta-text-shadow)",
    }}
  >
    <span style={{ textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "0.88em" }}>
      {CTA_IS_PENDING ? MASTERMIND_COPY.ctaLabelPending : MASTERMIND_COPY.ctaLabel}
    </span>
    <ArrowRight
      className="w-4 h-4 ml-0.5 transition-transform duration-300 group-hover:translate-x-0.5"
      aria-hidden="true"
    />
  </a>
);

export default Mastermind;
