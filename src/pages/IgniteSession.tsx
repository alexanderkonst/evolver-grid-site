/**
 * /ignite — purchase page for the **Productize Yourself Session**
 *           (formerly "Ignition Session" → "Top Talent Business Session"
 *           → final canonical name as of Day 55, Sasha 2026-04-29).
 *
 * Day 55 (Sasha 2026-04-29): canonical product name is now
 * **Productize Yourself Session**. The /ignite route, file name, and
 * the `igniteLogo` asset are kept for URL stability + asset import
 * coherence; user-facing copy and all post-Day-55 references should use
 * "Productize Yourself Session." Price: $555. Length: 2 hours.
 * Guarantee: or you don't pay.
 *
 * Entry points to this page:
 *   - Landing primary CTA → /zone-of-genius (assessment) → reveal →
 *     "Build a business off your top talent" → /ignite#pricing-section
 *   - AppleseedDisplay reveal → primary CTA → here
 */
import { ArrowRight, Check, ShieldCheck, ChevronDown } from "lucide-react";
import { trackPageView, trackCTAClick } from "@/lib/funnelAnalytics";
import { ExpandableTestimonial } from "@/components/ExpandableTestimonial";
import type { TestimonialData } from "@/components/ExpandableTestimonial";
import { useLocation } from "react-router-dom";
import GameShellV2 from "../components/game/GameShellV2";
import SEO from "@/components/SEO";
// SiteLogo import removed Day 47 late pass — GameShellV2 now owns the logo.
// aleksandrPhoto + MessageCircle + trackFunnelEvent imports removed Day 61
// (Sasha 2026-05-04) — about-section photo collapsed to a single
// attribution line; clarity-call CTAs no longer use the speech-bubble
// glyph (now plain italic underline links); DivineTimingCapture
// removed (called trackFunnelEvent for the divine_timing event).
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import geniusLogo from "@/assets/ignite-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import BoldText from "@/components/BoldText";

/* ─── Shared testimonial data (single source of truth) ─── */
import { TESTIMONIALS } from "@/data/testimonials";
const FALLBACK_TESTIMONIALS = TESTIMONIALS;

/* ─── Hook: fetch testimonials from Supabase, fallback to hardcoded ─── */
const useTestimonials = (): TestimonialData[] => {
  const [testimonials, setTestimonials] = useState<TestimonialData[]>(FALLBACK_TESTIMONIALS);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('testimonials')
          .select('person_name, title, short_quote, full_quote, sort_order')
          .eq('surface', 'ignite')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (error || !data || data.length === 0) return; // Keep fallback

        setTestimonials(data.map(row => ({
          shortQuote: row.short_quote,
          fullQuote: row.full_quote,
          name: row.person_name,
          before: row.title,
        })));
      } catch {
        // Silently fall back to hardcoded
      }
    };
    fetchTestimonials();
  }, []);

  return testimonials;
};

const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/9B6dR9bME6i71TP7r2dEs0A";
const CALCOM_BOOKING_LINK = "https://cal.com/aleksandrkonstantinov/unique-business-ignition-session";
const CALCOM_CLARITY_LINK = "https://cal.com/aleksandrkonstantinov/direction-choice-call";


/* ─── Lazy YouTube Embed ──────────────────────────────────── */
const LazyYouTube = ({ id, title }: { id: string; title: string }) => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { rootMargin: "200px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="aspect-video rounded-2xl overflow-hidden">
      {visible ? (
        <iframe
          src={`https://www.youtube.com/embed/${id}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-xs text-white/20 bg-white/5">{t('ignite.videoLoading')}</div>
      )}
    </div>
  );
};

/* ─── Already Paid → Book ─────────────────── */
const AlreadyPaidLink = () => {
  const { t } = useTranslation();
  return (
    <Button variant="outline" size="sm" asChild>
      <a
        href={CALCOM_BOOKING_LINK}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Check className="w-3 h-3" />
        {t('ignite.alreadyPaidLink')}
      </a>
    </Button>
  );
};

/* Day 61 (Sasha 2026-05-04): retired components.
   – PrimaryCTA helper (replaced by inline <Button> calls so each
     site gets its own tracked id + label).
   – DivineTimingCapture (the "maybe in a month" email-grab) — added
     friction without conversion lift; the clarity-call CTA does the
     "not now" job better.
   – MicroCommitmentBlock (the "Which of these feels most true" 4-
     button self-diagnostic) — qualifier work belongs upstream on the
     reveal page, not here. */

const IgniteSession = () => {
  const { t } = useTranslation();
  const location = useLocation();
  // `inShell` flag retired Day 47 late pass — GameShellV2 is now the
  // wrapper regardless of URL. `location` still used for hash scrolling below.
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const testimonials = useTestimonials();

  useEffect(() => {
    const previousTitle = document.title;
    // Day 123 (Sasha 2026-07-13): tab title harmonized to the hero's
    // being-wanted register — the old shame-hook headline contradicted
    // the page it opened.
    document.title = "Leave with a One-Sentence Business — Productize Yourself Session";
    trackPageView('ignite_view');
    return () => { document.title = previousTitle; };
  }, []);

  // Handle hash-based scrolling.
  // Day 55 (Sasha 2026-04-29): switched from a single 300ms-delayed
  // smooth scroll to a two-shot instant scroll. The previous timing
  // landed on the right element initially, but content loading after
  // the scroll (testimonials fetch, HLS video, image decode) shifted
  // the page down so the target ended up partially above the viewport
  // top — the user landed BETWEEN sections, with stray copy from the
  // previous block visible. Two instant `scrollIntoView` calls — one
  // immediate, one after layout settles (450ms) — pin the target to
  // viewport top regardless of late-loading content. Instant (`auto`)
  // beats `smooth` here: the second call would jump anyway, and a
  // smooth-then-jump animation reads as a glitch, not polish.
  useEffect(() => {
    const hash = location.hash;
    if (!hash) return;
    const target = () => document.querySelector(hash);
    const scroll = () => {
      const el = target();
      if (el) el.scrollIntoView({ behavior: 'auto', block: 'start' });
    };
    scroll();
    const t1 = setTimeout(scroll, 100);
    const t2 = setTimeout(scroll, 450);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [location.hash]);

  const content = (
    // `/ignite` uses a static, skin-aware darkroom canvas. The previous
    // page-owned HLS background and wash were removed so no moving overlay
    // competes with the purchase decision.
    <div
      className="relative min-h-dvh text-white overflow-hidden font-sans"
      id="ignite-page"
      style={{
        background:
          "linear-gradient(var(--skin-darkroom-bg, rgba(10, 10, 26, 0.96)), var(--skin-darkroom-bg, rgba(10, 10, 26, 0.96))), #0a0a1a",
      }}
    >

      {/* CONTENT LAYER */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 md:px-6 py-16 space-y-14">

        {/* Day 61 (Sasha 2026-05-04): major copy + structure pass per
            Sasha's "transformational result + button + confirmation"
            principle. Distilled from ~80+ lines of body copy across 10
            sections to ~25 lines across 4 blocks: hero (promise + CTA)
            → what you leave with (deliverable + repeat CTA) → proof +
            price + guarantee (booking) → quiet footer (alternates +
            FAQ + methodology video).

            Methodology video preserved with id="hero-video" anchor —
            external links from GeniusQuiz.tsx and MyResult.tsx point
            here, must keep working. The section just lives in a
            quieter position (below FAQ) instead of right under hero.

            Dropped: pain pre-amble, "we take what you do" bullets,
            "you're not far off" reframe, DivineTimingCapture email
            grab, S2 Qualifier (5 italic objection bullets), S4 How It
            Works (3 emoji cards), S5 About full block (collapsed to
            single attribution line under price), MicroCommitmentBlock,
            "More time isn't what's missing", "We fix this in 2 hours.
            Or you don't pay." (redundant with the guarantee box), 3
            of 4 FAQs (kept "Don't know my top talent" + new "No actual
            business" pair), and the entire emotional close. */}

        {/* BLOCK 1 — HERO (promise + immediate CTA) */}
        <header className="text-center space-y-6 pt-4 pb-2" id="ignite-hero">
          <img
            src={geniusLogo}
            alt={t('ignite.logoAlt')}
            className="w-[140px] h-auto mx-auto opacity-80"
          />

          <h1
            className="font-serif max-w-2xl mx-auto"
            style={{
              fontSize: "clamp(1.85rem, 5vw, 2.75rem)",
              fontWeight: 600,
              lineHeight: 1.15,
              letterSpacing: "-0.018em",
              color: "rgba(255,255,255,0.96)",
              textShadow:
                "0 0 30px rgba(255,255,255,0.20), 0 0 60px rgba(255,255,255,0.08)",
            }}
          >
            {t('ignite.heroTitle')}
          </h1>

          <p
            className="text-base sm:text-lg italic text-white/70 max-w-md mx-auto leading-relaxed"
            style={{ fontFamily: "'Source Serif 4', serif" }}
          >
            {t('ignite.heroSubA')}
            <br />
            {t('ignite.heroSubB')}
          </p>

          {/* Day 118 (2026-07-08): the shelf line — category sentence placing
              the offer on a known shelf (marketing_playbook.md, "Category
              Lines: the Shelf Key"). One size smaller than /path per spec. */}
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
            {t('ignite.shelfLine')}
          </p>

          <div className="flex flex-col items-center gap-3 pt-4">
            <Button size="lg" asChild>
              <a
                href={STRIPE_PAYMENT_LINK}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackCTAClick('booking_click', 'hero-cta')}
              >
                <BoldText className="uppercase">{t('ignite.ctaGetBusiness')}</BoldText>
                <ArrowRight className="w-4 h-4 ml-1" />
              </a>
            </Button>

            <a
              href="#direction-call"
              className="text-xs text-white/55 hover:text-white/85 italic underline underline-offset-4 decoration-white/15 hover:decoration-white/40 transition-colors"
              onClick={() => trackCTAClick('clarity_call_click', 'hero-quiet-link')}
            >
              {t('ignite.clarityLinkHero')}
            </a>
          </div>
        </header>

        {/* BLOCK 2 — WHAT YOU LEAVE WITH */}
        <section className="space-y-5 max-w-md mx-auto" aria-label={t('ignite.sectionLeaveWith')}>
          <p className="text-[10px] text-white/45 uppercase tracking-[0.28em] text-center font-medium">
            {t('ignite.leaveWithLabel')}
          </p>
          <div className="space-y-2.5 text-left">
            {[
              t('ignite.leaveWith1'),
              t('ignite.leaveWith2'),
              t('ignite.leaveWith3'),
              t('ignite.leaveWith4'),
            ].map((item, i) => (
              <div key={i} className="flex items-baseline gap-2.5">
                <span className="text-white/40 text-sm">→</span>
                <span className="text-sm sm:text-base text-white/85 leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
          <p
            className="text-sm text-white/75 text-center leading-relaxed pt-1 max-w-md mx-auto"
            style={{ fontFamily: "'Source Serif 4', serif" }}
          >
            {t('ignite.leaveWithConvergence')}
          </p>
          <p
            className="text-xs text-white/55 italic text-center leading-relaxed pt-1 max-w-sm mx-auto"
            style={{ fontFamily: "'Source Serif 4', serif" }}
          >
            {t('ignite.leaveWithDisclaimer')}
          </p>
          <div className="flex justify-center pt-2">
            <Button size="lg" asChild>
              <a
                href={STRIPE_PAYMENT_LINK}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackCTAClick('booking_click', 'block2-cta')}
              >
                <BoldText className="uppercase">{t('ignite.ctaGetBusiness')}</BoldText>
                <ArrowRight className="w-4 h-4 ml-1" />
              </a>
            </Button>
          </div>
        </section>

        {/* BLOCK 3 — PROOF + PRICE + GUARANTEE (booking section) */}
        <section
          className="liquid-glass-strong rounded-[2.5rem] p-7 md:p-9 text-center space-y-6"
          id="pricing-section"
          aria-label={t('ignite.sectionBook')}
        >
          <div id="booking" className="sr-only" aria-hidden="true" />

          {/* Compact testimonials — all of them, expandable single-liners */}
          <div className="space-y-1 max-w-md mx-auto text-left" id="testimonials">
            {testimonials.map((t, i) => (
              <ExpandableTestimonial key={i} t={t} variant="dark" compact />
            ))}
          </div>

          {/* Price + attribution */}
          <div className="space-y-2">
            <div className="flex items-baseline justify-center gap-1">
              <span
                className="text-5xl md:text-6xl text-white tracking-tight font-serif"
                style={{ fontWeight: 500 }}
              >
                $555
              </span>
            </div>
            <p className="text-xs text-white/60">
              {t('ignite.priceAttribution')}
            </p>
          </div>

          {/* Guarantee */}
          <div className="px-4 py-3 max-w-sm mx-auto rounded-xl border border-white/10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-white/55" aria-hidden="true" />
            </div>
            <p className="text-sm text-white/90 leading-relaxed font-medium">
              {t('ignite.guarantee')}
            </p>
          </div>

          {/* Resonance permission */}
          <p
            className="text-[11px] text-white/50 italic max-w-xs mx-auto leading-relaxed"
            style={{ fontFamily: "'Source Serif 4', serif" }}
          >
            {t('ignite.resonancePermission')}
          </p>

          {/* Final CTA */}
          <div className="pt-2">
            <Button size="lg" asChild>
              <a
                href={STRIPE_PAYMENT_LINK}
                target="_blank"
                rel="noopener noreferrer"
                id="book-session-btn"
                onClick={() => trackCTAClick('booking_click', 'pricing-cta')}
              >
                <BoldText className="uppercase">{t('ignite.ctaBookSession')}</BoldText>
                <ArrowRight className="w-4 h-4 ml-1" />
              </a>
            </Button>
          </div>

          {/* Already-paid escape hatch (kept inline near booking CTA) */}
          <div className="pt-1">
            <AlreadyPaidLink />
          </div>
        </section>

        {/* Day 124: Direction Call block — subordinate offer for people not
            ready for the paid session. Sits right after price/guarantee,
            right before the quiet footer. Footer's own clarity link was
            removed as redundant (this block covers it). */}
        <section
          className="text-center space-y-4 max-w-md mx-auto"
          id="direction-call"
          aria-label={t('ignite.directionCallTitle')}
        >
          <p className="text-[10px] text-white/45 uppercase tracking-[0.28em] text-center font-medium">
            {t('ignite.directionCallEyebrow')}
          </p>
          <h2
            className="font-serif text-white/90"
            style={{ fontSize: "clamp(1.3rem, 3.5vw, 1.75rem)", fontWeight: 600, letterSpacing: "-0.01em" }}
          >
            {t('ignite.directionCallTitle')}
          </h2>
          <p
            className="text-sm sm:text-base text-white/75 leading-relaxed max-w-md mx-auto"
            style={{ fontFamily: "'Source Serif 4', serif" }}
          >
            {t('ignite.directionCallPromise')}
          </p>
          <p className="text-xs text-white/50">
            {t('ignite.directionCallMeta')}
          </p>
          <div className="pt-1">
            <Button size="lg" variant="outline" asChild>
              <a
                href={CALCOM_CLARITY_LINK}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackCTAClick('clarity_call_click', 'direction-call-cta')}
              >
                {t('ignite.directionCallCta')}
              </a>
            </Button>
          </div>
        </section>

        {/* BLOCK 4 — QUIET FOOTER (alternates + 2 FAQs + methodology video) */}
        <section className="space-y-6 pt-2" aria-label={t('ignite.sectionAlternatesFaq')}>

          {/* TWO FAQs only — self concern + business concern */}
          <div className="space-y-2 max-w-lg mx-auto" id="faq-section">
            {[
              {
                q: t('ignite.faq1Q'),
                a: t('ignite.faq1A'),
              },
              {
                q: t('ignite.faq2Q'),
                a: t('ignite.faq2A'),
              },
            ].map((faq, i) => (
              <div key={i} className="liquid-glass rounded-2xl">
                <button
                  className="w-full p-4 flex items-center justify-between text-left cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white/50 rounded-2xl"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  aria-controls={`faq-answer-${i}`}
                >
                  <p className="text-sm text-white/80 font-medium">{faq.q}</p>
                  <ChevronDown
                    className={`w-4 h-4 text-white/45 transition-transform duration-200 flex-shrink-0 ml-2 ${openFaq === i ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </button>
                <div
                  id={`faq-answer-${i}`}
                  role="region"
                  className={`overflow-hidden transition-all duration-200 ${openFaq === i ? "max-h-60 opacity-100" : "max-h-0 opacity-0"}`}
                >
                  <div className="px-4 pb-4">
                    <p className="text-xs text-white/55 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Methodology video — quiet, below FAQ. PRESERVES id="hero-video"
              so external links from GeniusQuiz.tsx and MyResult.tsx
              (and any other route pointing to /ignite#hero-video)
              continue to land on this exact section. The section just
              lives in a quieter position now. */}
          <section
            id="hero-video"
            aria-label={t('ignite.sectionMethodologyVideo')}
            className="space-y-3 pt-4"
          >
            <p className="text-[10px] text-white/40 uppercase tracking-[0.28em] text-center font-medium">
              {t('ignite.methodologyLabel')}
            </p>
            <div className="liquid-glass rounded-2xl p-1">
              <LazyYouTube
                id="afWWcXUqnLI"
                title={t('ignite.methodologyVideoTitle')}
              />
            </div>
          </section>
        </section>

        {/* Bottom spacing */}
        <div className="h-8" />
      </div>
    </div>
  );

  // Day 47 late pass (Sasha): ALWAYS wrap in GameShellV2 — previously
  // only wrapped when URL started with /game/. Now /ignite is part of the
  // unified journey shell. `hideLogo` because shell's top-right logo tile
  // would double-up with the genius-business logo we render in the hero.
  return (
    <>
      <SEO
        title="Professional Direction Session — Free 45 min | Find Your Top Talent"
        description="A free 45-minute 1:1 with Aleksandr. Name your top talent in one exact sentence, see the direction it points to, and leave with a clear next step."
        path="/ignite"
        ogTitle="Find your professional direction in 45 minutes."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Professional Direction Session",
          provider: { "@type": "Person", name: "Alexander Konstantinov" },
          areaServed: "Worldwide",
          description: "Free 45-minute 1:1 session to name your top talent and see the professional direction it points to.",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }}
      />
      <GameShellV2 hideLogo>{content}</GameShellV2>
    </>
  );
};

export default IgniteSession;
