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
import { useState, useRef, useEffect, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import geniusLogo from "@/assets/ignite-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { GOLD_TEXT_STYLE, Ornament } from "@/lib/landingDesign";
import { cn } from "@/lib/utils";

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
const CALCOM_BOOKING_LINK = "https://cal.com/aleksandrkonstantinov/productize-yourself";
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
        <div
          className="w-full h-full flex items-center justify-center text-xs"
          style={{ color: "var(--skin-text-muted-soft, rgba(26,30,58,0.35))", background: "rgba(10,22,40,0.04)" }}
        >
          {t('ignite.videoLoading')}
        </div>
      )}
    </div>
  );
};

/* ─── Already Paid → Book ─────────────────── */
const AlreadyPaidLink = () => {
  const { t } = useTranslation();
  return (
    <a
      href={CALCOM_BOOKING_LINK}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors hover:bg-black/[0.03]"
      style={{
        borderColor: "var(--skin-ornament-rule, rgba(26,30,58,0.18))",
        color: "var(--skin-text-secondary, #33415c)",
      }}
    >
      <Check className="w-3 h-3" aria-hidden="true" />
      {t('ignite.alreadyPaidLink')}
    </a>
  );
};

/* ─── House CTA grammar, as an anchor ───────────────────────
   Day 131 (Sasha 2026-07-30, reskin): `EditorialCta` (the site's
   canonical primary-CTA component — dark glass pill, rotating
   ignite-logo emblem, gold-halo small-caps label) only renders a
   <button>. Ignite's CTAs are real links (Stripe checkout, Cal.com
   booking) that must stay `<a href>` for hover-preview / ctrl-click /
   right-click "open in new tab" — swapping to an onClick-driven
   button would be a structural regression disguised as a visual one.
   This local anchor replicates the exact same classNames + inline
   styles as EditorialCta's primary/secondary variants (same
   `.liquid-glass-dark` / `.liquid-glass` classes from index.css) so
   the grammar matches pixel-for-pixel, while staying a real link. */
const IgniteCta = ({
  href,
  onClick,
  children,
  variant = "primary",
  className,
  id,
}: {
  href: string;
  onClick?: () => void;
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  id?: string;
}) => {
  if (variant === "secondary") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        id={id}
        onClick={onClick}
        className={cn(
          "group liquid-glass rounded-full",
          "inline-flex items-center justify-center gap-2",
          "px-5 sm:px-6 py-3 max-w-full",
          "text-sm sm:text-base font-medium",
          "transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
          "focus-visible:ring-2 focus-visible:ring-[#0a1628]/30 outline-none",
          className,
        )}
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          color: "var(--skin-link-secondary, rgba(26,30,58,0.85))",
          textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
        }}
      >
        <span style={{ textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "0.88em" }}>
          {children}
        </span>
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      id={id}
      onClick={onClick}
      className={cn(
        "group liquid-glass-dark cta-breath rounded-full",
        "inline-flex items-center justify-center gap-2",
        "px-6 sm:px-7 py-3.5 max-w-full",
        "text-sm sm:text-base font-semibold",
        "transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]",
        "focus-visible:ring-2 focus-visible:ring-white/40 outline-none",
        className,
      )}
      style={{
        fontFamily: "'Cormorant Garamond', serif",
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
        {children}
      </span>
      <ArrowRight className="w-4 h-4 ml-0.5 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
    </a>
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
    // Day 131 (Sasha 2026-07-30) reskin: /ignite now sits on the same
    // warm parchment field as `/` and `/home` instead of the midnight
    // "darkroom" canvas. Still a static, self-painted background (no
    // moving HLS layer) so nothing competes with the purchase decision
    // — the reskin is a palette + typography change, not a return of
    // the animated video.
    <div
      className="relative min-h-dvh overflow-hidden font-sans"
      id="ignite-page"
      style={{
        // NOTE: intentionally NOT `--skin-darkroom-bg` — that token is
        // already claimed everywhere as an opaque near-black overlay
        // (see index.css, every skin block), so reusing it here would
        // silently keep the old midnight canvas on every skin. This is
        // a new, unclaimed token so it defaults to the parchment field
        // until a future skin wants to override it specifically.
        background:
          "var(--skin-ignite-bg, linear-gradient(180deg, #fdfaf3 0%, #f6efe0 45%, #fdfaf3 100%))",
      }}
    >

      {/* CONTENT LAYER */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 md:px-6 py-16 space-y-12">

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
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.95rem, 5vw, 2.9rem)",
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: "-0.018em",
              color: "var(--skin-text-primary, #0a1628)",
              textShadow:
                "var(--skin-text-halo-deep, 0 0 22px rgba(255,255,255,0.7), 0 1px 2px rgba(255,255,255,0.9), 0 0 1px rgba(11,42,90,0.45), 0 1px 0 rgba(11,42,90,0.25))",
            }}
          >
            {t('ignite.heroTitle')}
          </h1>

          <p
            className="text-base sm:text-lg italic max-w-md mx-auto leading-relaxed"
            style={{
              fontFamily: "'Source Serif 4', serif",
              color: "var(--skin-text-secondary, #33415c)",
            }}
          >
            {t('ignite.heroSubA')}
            <br />
            {t('ignite.heroSubB')}
          </p>

          {/* Day 118 (2026-07-08): the shelf line — category sentence placing
              the offer on a known shelf (marketing_playbook.md, "Category
              Lines: the Shelf Key"). One size smaller than /path per spec. */}
          <p
            className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.28em] bg-clip-text text-transparent"
            style={GOLD_TEXT_STYLE}
          >
            {t('ignite.shelfLine')}
          </p>

          <Ornament className="my-1" />

          <div className="flex flex-col items-center gap-3 pt-2">
            <IgniteCta
              href={STRIPE_PAYMENT_LINK}
              onClick={() => trackCTAClick('booking_click', 'hero-cta')}
            >
              {t('ignite.ctaGetBusiness')}
            </IgniteCta>

            <a
              href="#direction-call"
              className="text-xs italic underline underline-offset-4 transition-colors"
              style={{
                color: "var(--skin-text-muted-soft, rgba(26,30,58,0.6))",
                textDecorationColor: "var(--skin-ornament-rule, rgba(26,30,58,0.25))",
              }}
              onClick={() => trackCTAClick('clarity_call_click', 'hero-quiet-link')}
            >
              {t('ignite.clarityLinkHero')}
            </a>
          </div>
        </header>

        {/* BLOCK 2 — WHAT YOU LEAVE WITH */}
        <section className="space-y-5 max-w-md mx-auto" aria-label={t('ignite.sectionLeaveWith')}>
          <p
            className="text-[10px] uppercase tracking-[0.28em] text-center font-bold bg-clip-text text-transparent"
            style={GOLD_TEXT_STYLE}
          >
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
                <span className="text-sm bg-clip-text text-transparent" style={GOLD_TEXT_STYLE}>→</span>
                <span
                  className="text-sm sm:text-base leading-relaxed"
                  style={{ color: "var(--skin-text-primary, #0a1628)" }}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>
          <p
            className="text-sm text-center leading-relaxed pt-1 max-w-md mx-auto"
            style={{
              fontFamily: "'Source Serif 4', serif",
              color: "var(--skin-text-secondary, #33415c)",
            }}
          >
            {t('ignite.leaveWithConvergence')}
          </p>
          <p
            className="text-xs italic text-center leading-relaxed pt-1 max-w-sm mx-auto"
            style={{
              fontFamily: "'Source Serif 4', serif",
              color: "var(--skin-text-muted-soft, rgba(26,30,58,0.6))",
            }}
          >
            {t('ignite.leaveWithDisclaimer')}
          </p>
          <div className="flex justify-center pt-2">
            <IgniteCta
              href={STRIPE_PAYMENT_LINK}
              onClick={() => trackCTAClick('booking_click', 'block2-cta')}
            >
              {t('ignite.ctaGetBusiness')}
            </IgniteCta>
          </div>
        </section>

        <Ornament />

        {/* BLOCK 3 — PROOF + PRICE + GUARANTEE (booking section) */}
        <section
          className="liquid-glass-strong rounded-[2.5rem] p-7 md:p-9 text-center space-y-6"
          id="pricing-section"
          aria-label={t('ignite.sectionBook')}
        >
          <div id="booking" className="sr-only" aria-hidden="true" />

          {/* Compact testimonials — all of them, expandable single-liners.
              variant="house" = Cormorant italic quote + gold small-caps
              name, matching /home's testimony strip. */}
          <div className="space-y-1 max-w-md mx-auto text-left" id="testimonials">
            {testimonials.map((t, i) => (
              <ExpandableTestimonial key={i} t={t} variant="house" compact />
            ))}
          </div>

          <Ornament className="my-2" />

          {/* Price + attribution */}
          <div className="space-y-2">
            <div className="flex items-baseline justify-center gap-1">
              <span
                className="text-5xl md:text-6xl tracking-tight"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 600,
                  color: "var(--skin-text-primary, #0a1628)",
                }}
              >
                $555
              </span>
            </div>
            <p className="text-xs" style={{ color: "var(--skin-text-muted-soft, rgba(26,30,58,0.6))" }}>
              {t('ignite.priceAttribution')}
            </p>
          </div>

          {/* Price comparison trio */}
          <div className="max-w-sm mx-auto space-y-2 text-left">
            <h3
              className="text-[11px] font-bold uppercase tracking-[0.2em] text-center bg-clip-text text-transparent"
              style={GOLD_TEXT_STYLE}
            >
              {t('ignite.priceCompareHeading')}
            </h3>
            <ul
              className="space-y-1.5 text-xs leading-relaxed list-disc list-inside"
              style={{ color: "var(--skin-text-secondary, #33415c)" }}
            >
              <li>{t('ignite.priceCompare1')}</li>
              <li>{t('ignite.priceCompare2')}</li>
              <li>{t('ignite.priceCompare3')}</li>
            </ul>
          </div>

          {/* Guarantee */}
          <div
            className="px-4 py-3 max-w-sm mx-auto rounded-xl border"
            style={{ borderColor: "var(--skin-ornament-rule, rgba(26,30,58,0.16))" }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <ShieldCheck
                className="w-5 h-5"
                style={{ color: "var(--skin-text-muted-soft, rgba(26,30,58,0.55))" }}
                aria-hidden="true"
              />
            </div>
            <p
              className="text-sm leading-relaxed font-medium"
              style={{ color: "var(--skin-text-primary, #0a1628)" }}
            >
              {t('ignite.guarantee')}
            </p>
          </div>

          {/* Resonance permission */}
          <p
            className="text-[11px] italic max-w-xs mx-auto leading-relaxed"
            style={{
              fontFamily: "'Source Serif 4', serif",
              color: "var(--skin-text-muted-soft, rgba(26,30,58,0.55))",
            }}
          >
            {t('ignite.resonancePermission')}
          </p>

          {/* Final CTA */}
          <div className="pt-2">
            <IgniteCta
              href={STRIPE_PAYMENT_LINK}
              id="book-session-btn"
              onClick={() => trackCTAClick('booking_click', 'pricing-cta')}
            >
              {t('ignite.ctaBookSession')}
            </IgniteCta>
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
          <p
            className="text-[10px] uppercase tracking-[0.28em] text-center font-bold bg-clip-text text-transparent"
            style={GOLD_TEXT_STYLE}
          >
            {t('ignite.directionCallEyebrow')}
          </p>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.3rem, 3.5vw, 1.75rem)",
              fontWeight: 700,
              letterSpacing: "-0.01em",
              color: "var(--skin-text-primary, #0a1628)",
            }}
          >
            {t('ignite.directionCallTitle')}
          </h2>
          <p
            className="text-sm sm:text-base leading-relaxed max-w-md mx-auto"
            style={{
              fontFamily: "'Source Serif 4', serif",
              color: "var(--skin-text-secondary, #33415c)",
            }}
          >
            {t('ignite.directionCallPromise')}
          </p>
          <p className="text-xs" style={{ color: "var(--skin-text-muted-soft, rgba(26,30,58,0.55))" }}>
            {t('ignite.directionCallMeta')}
          </p>
          <div className="pt-1">
            <IgniteCta
              href={CALCOM_CLARITY_LINK}
              variant="secondary"
              onClick={() => trackCTAClick('clarity_call_click', 'direction-call-cta')}
            >
              {t('ignite.directionCallCta')}
            </IgniteCta>
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
                  className="w-full p-4 flex items-center justify-between text-left cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#0a1628]/30 rounded-2xl"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  aria-controls={`faq-answer-${i}`}
                >
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--skin-text-primary, #0a1628)" }}
                  >
                    {faq.q}
                  </p>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ml-2 ${openFaq === i ? "rotate-180" : ""}`}
                    style={{ color: "var(--skin-text-muted-soft, rgba(26,30,58,0.45))" }}
                    aria-hidden="true"
                  />
                </button>
                <div
                  id={`faq-answer-${i}`}
                  role="region"
                  className={`overflow-hidden transition-all duration-200 ${openFaq === i ? "max-h-60 opacity-100" : "max-h-0 opacity-0"}`}
                >
                  <div className="px-4 pb-4">
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "var(--skin-text-secondary, #33415c)" }}
                    >
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Ornament className="my-2" />

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
            <p
              className="text-[10px] uppercase tracking-[0.28em] text-center font-bold bg-clip-text text-transparent"
              style={GOLD_TEXT_STYLE}
            >
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
