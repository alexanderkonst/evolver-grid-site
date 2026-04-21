import { ArrowRight, Check, ShieldCheck, MessageCircle, ChevronDown } from "lucide-react";
import { trackPageView, trackCTAClick, trackFunnelEvent } from "@/lib/funnelAnalytics";
import { ExpandableTestimonial } from "@/components/ExpandableTestimonial";
import type { TestimonialData } from "@/components/ExpandableTestimonial";
import { useLocation } from "react-router-dom";
import GameShellV2 from "../components/game/GameShellV2";
// SiteLogo import removed Day 47 late pass — GameShellV2 now owns the logo.
import { useState, useRef, useEffect, useCallback } from "react";
import Hls from "hls.js";
import geniusLogo from "@/assets/ignite-logo.png";
import aleksandrPhoto from "@/assets/aleksandr-photo.jpeg";
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

const HLS_VIDEO_URL = "https://stream.mux.com/wstCtshW01u9dh5EBOuLyGy201ftwiVvQZPtENsX2F9QI.m3u8";

const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/9B6dR9bME6i71TP7r2dEs0A";
const CALCOM_BOOKING_LINK = "https://cal.com/aleksandrkonstantinov/unique-business-ignition-session";
const CALCOM_CLARITY_LINK = "https://cal.com/aleksandrkonstantinov/15min";


/* ─── HLS Background Video ──────────────────────────────────
   Day 47 late pass (Sasha): changed from `fixed` → `absolute` so the video
   scopes to Panel 3 when this page is wrapped in GameShellV2, rather than
   leaking over the spaces rail + sections panel. */
const HlsBackground = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({ autoStartLoad: true });
      hls.loadSource(HLS_VIDEO_URL);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => { video.play().catch(() => {}); });
      return () => hls.destroy();
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = HLS_VIDEO_URL;
      video.addEventListener("loadedmetadata", () => { video.play().catch(() => {}); });
    }
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      loop
      muted
      playsInline
      className="absolute inset-0 w-full h-full object-cover z-0"
      aria-hidden="true"
    />
  );
};
/* ─── Lazy YouTube Embed ──────────────────────────────────── */
const LazyYouTube = ({ id, title }: { id: string; title: string }) => {
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
        <div className="w-full h-full flex items-center justify-center text-xs text-white/20 bg-white/5">Loading…</div>
      )}
    </div>
  );
};

/* ─── Primary CTA Button ──────────────────── */
const PrimaryCTA = ({ id, label = "Book Your Session", showPrice = true }: { id: string; label?: string; showPrice?: boolean }) => (
  <Button
    size="lg"
    asChild
  >
    <a
      href={STRIPE_PAYMENT_LINK}
      target="_blank"
      rel="noopener noreferrer"
      id={id}
      onClick={() => trackCTAClick('booking_click', id)}
    >
      <BoldText className="uppercase">{`${label}${showPrice ? " — $555" : ""}`}</BoldText>
      <ArrowRight className="w-4 h-4 ml-1" />
    </a>
  </Button>
);

/* ─── Already Paid → Book ─────────────────── */
const AlreadyPaidLink = () => (
  <Button variant="outline" size="sm" asChild>
    <a
      href={CALCOM_BOOKING_LINK}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Check className="w-3 h-3" />
      Already paid? Book your session here →
    </a>
  </Button>
);

/* ─── Divine Timing Email Capture ────────────────────────── */
const DivineTimingCapture = () => {
  const [state, setState] = useState<'idle' | 'input' | 'saving' | 'saved'>('idle');
  const [email, setEmail] = useState('');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    setState('saving');
    try {
      await (supabase as any).from('divine_timing_leads').insert({
        email: email.trim(),
        source: 'ignite_page',
        created_at: new Date().toISOString(),
      });
    } catch {
      // Silently continue
    }
    setState('saved');
    trackFunnelEvent({ step: 'divine_timing', source: 'ignite_page' });
  }, [email]);

  if (state === 'saved') {
    return (
      <p className="text-[10px] text-white/40 italic mt-2 animate-pulse">
        ✨ Saved. We'll reach out when the timing is right.
      </p>
    );
  }

  if (state === 'input' || state === 'saving') {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-2 mt-2 max-w-xs mx-auto">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email — I'll check in about a month"
          className="w-full px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/70 placeholder:text-white/25 focus:outline-none focus:border-white/30 transition-colors font-sans"
          autoFocus
          required
        />
        <button
          type="submit"
          disabled={state === 'saving'}
          className="text-[9px] text-white/40 hover:text-white/60 transition-colors uppercase tracking-[0.15em] underline underline-offset-4 decoration-white/10 disabled:opacity-50"
        >
          {state === 'saving' ? 'Saving...' : 'Hold this space for me'}
        </button>
      </form>
    );
  }

  return (
    <button
      onClick={() => setState('input')}
      className="text-[9px] text-white/20 hover:text-white/40 transition-colors uppercase tracking-[0.2em] mt-2 underline underline-offset-4 decoration-white/10"
    >
      Not right now, but maybe in a month
    </button>
  );
};

/* ─── Micro-Commitment Block ─── */
const MicroCommitmentBlock = () => {
  const [selected, setSelected] = useState<number | null>(null);

  const options = [
    "I struggle to explain what I do",
    "People get value but don't pay",
    "I've tried multiple directions",
    "I know I'm close but can't land it",
  ];

  return (
    <section className="space-y-4 max-w-md mx-auto" aria-label="Self-diagnostic">
      <p className="text-sm text-white/60 text-center font-medium font-serif uppercase tracking-wide">
        Which of these feels most true right now?
      </p>
      <p className="text-[10px] text-white/25 text-center">Just one question:</p>
      <div className="space-y-2">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 font-sans ${
              selected === i
                ? "liquid-glass-strong ring-1 ring-[#8460ea]/40 text-white/90 shadow-[0_0_15px_rgba(132,96,234,0.15)]"
                : "liquid-glass ring-1 ring-white/5 text-white/50 hover:text-white/70 hover:ring-white/15"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {selected !== null && (
        <p className="text-xs text-white/55 text-center font-medium animate-in fade-in slide-in-from-bottom-2 duration-300">
          Good. That's exactly what we solve in the session.
        </p>
      )}
    </section>
  );
};

const IgniteSession = () => {
  const location = useLocation();
  // `inShell` flag retired Day 47 late pass — GameShellV2 is now the
  // wrapper regardless of URL. `location` still used for hash scrolling below.
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const testimonials = useTestimonials();

  useEffect(() => {
    document.title = "You've Been Giving Your Best Work Away for Free — Productize Yourself Session";
    trackPageView('ignite_view');
    return () => { document.title = "Genius Business"; };
  }, []);

  // Handle hash-based scrolling
  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      const timer = setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [location.hash]);

  const content = (
    // Day 47 late pass (Sasha): `/ignite` is now always rendered inside
    // GameShellV2. The wrapper is a relative container (not min-h-screen
    // bg-black fixed), video + dark overlay are scoped to THIS page's
    // Panel 3 area via `absolute` positioning — they no longer cover the
    // spaces rail and sections panel. Own SiteLogo removed (shell owns it).
    <div className="relative min-h-dvh text-white overflow-hidden font-sans" id="ignite-page">

      {/* VIDEO BACKGROUND — scoped to Panel 3 via absolute positioning */}
      <HlsBackground />

      {/* Dark wash — the "decision room" feel, scoped to Panel 3 */}
      <div className="absolute inset-0 bg-black/55 z-[1]" aria-hidden="true" />

      {/* CONTENT LAYER */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 md:px-6 py-16 space-y-14">

        {/* S1: HERO */}
        <header className="text-center space-y-6 pt-4 pb-2" id="ignite-hero">
          <img
            src={geniusLogo}
            alt="Genius Business"
            className="w-[160px] h-auto mx-auto opacity-80"
          />

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-medium uppercase tracking-[0.15em] text-white leading-[1.3] max-w-2xl mx-auto font-serif">
            <span className="text-white/60">You can't clearly explain what you do</span>
            <br />
            <span className="inline-block w-12 h-px bg-white/40 my-4" />
            <br />
            <span className="text-white" style={{ textShadow: "0 0 30px rgba(255,255,255,0.4), 0 0 60px rgba(255,255,255,0.1)" }}>
              That's why it's not turning into something people buy
            </span>
          </h1>

          <p className="text-base md:text-lg text-white/80 max-w-md mx-auto leading-relaxed">
            In 2 hours, we take what you already do —<br/>
            and turn it into:
          </p>
          <div className="text-sm text-white/70 max-w-sm mx-auto leading-relaxed space-y-1">
            <p>→ a clear one-sentence business</p>
            <p>→ a real offer</p>
            <p>→ something people understand — and pay for</p>
          </div>

          {/* Proximity reframe */}
          <p className="text-sm text-white/50 max-w-sm mx-auto leading-relaxed mt-2">
            You're not far off.
          </p>
          <p className="text-sm text-white/65 font-medium max-w-sm mx-auto">
            You're one structural layer away from something that works.
          </p>



          <div className="flex flex-col items-center gap-4 pt-6">
            {/* Paid path: Productize Yourself Session */}
            <Button size="lg" asChild>
              <a
                href={STRIPE_PAYMENT_LINK}
                target="_blank"
                rel="noopener noreferrer"
              >
                <BoldText className="uppercase">Turn this into something real — $555</BoldText>
                <ArrowRight className="w-4 h-4 ml-1" />
              </a>
            </Button>

            {/* Free path: clarity call */}
            <Button variant="outline" size="sm" asChild>
              <a
                href={CALCOM_CLARITY_LINK}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-3.5 h-3.5 opacity-70" />
                Not sure yet? Let's talk for 15 min — free
              </a>
            </Button>
            <p className="text-[10px] text-white/30 max-w-xs mx-auto">
              No convincing. No persuasion. Just clarity on your situation, your top talent, and your unique business.
            </p>
          </div>

          <div className="pt-8 space-y-4">
            <a href="#hero-video" className="text-sm font-medium text-white/50 hover:text-white transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-white/50">
              See why this hasn't worked yet (6 min)
            </a>
            <div className="flex flex-col items-center justify-center gap-1 pt-2">
              <DivineTimingCapture />
            </div>
          </div>
        </header>

        {/* S1.5: VIDEO */}
        <section id="hero-video" aria-label="Methodology video" className="space-y-5">
          <div className="liquid-glass rounded-2xl p-1">
            <LazyYouTube id="afWWcXUqnLI" title="The Productize Yourself Session — Methodology Overview" />
          </div>
          <p className="text-xs text-white/45 text-center italic">
            If you're still thinking about this after watching… you already know.
          </p>

          {/* Post-video CTA */}
          <div className="flex flex-col items-center gap-3 pt-2">
            <Button size="lg" asChild>
              <a
                href={STRIPE_PAYMENT_LINK}
                target="_blank"
                rel="noopener noreferrer"
              >
                <BoldText className="uppercase">Turn this into something real — $555</BoldText>
                <ArrowRight className="w-4 h-4 ml-1" />
              </a>
            </Button>
          </div>
        </section>

        {/* S2: QUALIFIER */}
        <section className="space-y-5" id="qualifier" aria-label="Who this session is for">
          <h2 className="text-xl font-serif font-semibold text-white/90 text-center uppercase tracking-[0.1em]">
            <BoldText>This Is For You If</BoldText>
          </h2>
          <p className="text-sm text-white/55 text-center max-w-md mx-auto leading-relaxed">
            You've proven your value—for other people.<br/>
            The question is: What is yours to build?
          </p>
          <div className="space-y-2 max-w-md mx-auto">
            {[
              '"Why is this still so hard to say?"',
              '"I\'m a mix of things and none of the labels fit"',
              '"I know I should charge more but I can\'t afford to lose the few clients I have"',
              '"Something fundamental is off but I can\'t see what"',
              '"I\'m so much more capable than my results show"',
            ].map((item, i) => (
              <div
                key={i}
                className="liquid-glass rounded-xl px-4 py-3 text-sm text-white/70 italic"
              >
                {item}
              </div>
            ))}
          </div>
          <p className="text-xs text-white/45 text-center max-w-sm mx-auto leading-relaxed">
            You've proven your value—for other people. The question is: What is yours to build?
          </p>
        </section>


        {/* S4: HOW IT WORKS */}
        <section className="space-y-5" id="how-it-works" aria-label="How it works">
          <h2 className="text-xl font-serif font-semibold text-white/90 text-center uppercase tracking-[0.1em]">
            <BoldText>What Happens In 2 Hours</BoldText>
          </h2>
          <p className="text-xs text-white/45 text-center">This is not coaching. You leave with a document, not a feeling.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                emoji: "🔮",
                step: "1",
                title: "We name what you already do — clearly",
                desc: "You talk. I listen for what's already there — but invisible to you. We land it in one sentence a 7-year-old understands, an investor trusts, and a client buys.",
              },
              {
                emoji: "📦",
                step: "2",
                title: "We structure it into something people can buy",
                desc: "That sentence becomes a clear offer, a defined audience, a real problem, a real outcome. No guessing. Just structure that holds.",
              },
              {
                emoji: "🚀",
                step: "3",
                title: "You leave with a one-page offer",
                desc: "Not something to 'figure out later.' AI compiles everything live into one page: what you do, who it's for, why they pay, and what to say next.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="liquid-glass rounded-3xl p-5 text-center space-y-3 hover:scale-105 transition-transform duration-200"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mx-auto text-xl">
                  <span aria-hidden="true">{item.emoji}</span>
                </div>
                <p className="text-xs text-white/60 font-medium uppercase tracking-widest">Step {item.step}</p>
                <p className="text-sm text-white font-medium leading-snug">{item.title}</p>
                {item.desc && <p className="text-xs text-white/55 leading-relaxed">{item.desc}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* S5: ABOUT */}
        <section id="about-section" aria-label="About Aleksandr" className="relative pt-8">
          <img
            src={aleksandrPhoto}
            alt="Aleksandr Konstantinov"
            className="w-20 h-20 rounded-full object-cover opacity-90 mx-auto relative z-10 border-2 border-white/10"
          />
          <div className="liquid-glass rounded-3xl p-6 md:p-8 pt-14 -mt-10 text-center space-y-3">
            <p className="text-sm text-white/70 leading-relaxed">
              I spent years in the loop myself. Building startups that didn't stick. Consulting. Coaching friends for free. Circling the same question everyone in this situation circles:
            </p>
            <p className="text-sm text-white/80 leading-relaxed italic">
              "What is mine to build?"
            </p>
            <p className="text-sm text-white/70 leading-relaxed mt-1">
              What I do now is simple: I sit with someone for 2 hours, hear what they've been saying for years, and hand them back the one sentence they couldn't see from inside themselves. Then AI compiles their entire business on one page before the session ends.
            </p>
            <p className="text-xs text-white/55 mt-4">
              — <em>Aleksandr Konstantinov</em>
            </p>
          </div>
        </section>

        {/* S6: TESTIMONIALS */}
        <section className="space-y-3" id="testimonials" aria-label="Client testimonials">
          <h2 className="text-xl font-serif font-semibold text-white/90 text-center uppercase tracking-[0.1em] mb-3">
            <BoldText>What They Said After</BoldText>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {testimonials.map((t, i) => (
              <ExpandableTestimonial key={i} t={t} variant="dark" />
            ))}
          </div>
        </section>

        {/* MICRO-COMMITMENT */}
        <MicroCommitmentBlock />

        {/* S7: BOOKING */}
        <section className="liquid-glass-strong rounded-[2.5rem] p-8 md:p-10 text-center space-y-6" id="pricing-section" aria-label="Book your session">
          <div id="booking" className="sr-only" aria-hidden="true" />

          <div className="space-y-3 max-w-sm mx-auto">
            <p className="text-xl font-serif font-semibold text-white/90 text-center uppercase tracking-[0.1em]">
              <BoldText>One Session. One Clear Business.</BoldText>
            </p>
            <p className="text-xs text-white/45 text-center leading-relaxed">
              If you don't turn this into something concrete:
            </p>
            <div className="text-xs text-white/50 space-y-1 text-center">
              <p>→ it stays something people benefit from — but don't pay for</p>
              <p>→ you keep circling the same question</p>
              <p>→ nothing fundamentally changes</p>
            </div>
            <p className="text-xs text-white/40 uppercase tracking-widest text-center pt-2">In 2 hours</p>
            <div className="space-y-2 text-left">
              {[
                { arrow: "We define", result: "exactly what you do" },
                { arrow: "Who", result: "it's for" },
                { arrow: "Why", result: "they pay" },
                { arrow: "How to", result: "express it simply" },
              ].map((item, i) => (
                <div key={i} className="flex items-baseline gap-2">
                  <span className="text-xs text-white/50">{item.arrow} →</span>
                  <span className="text-sm text-white/90 font-medium">{item.result}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Price */}
          <div>
            <div className="flex items-baseline justify-center gap-1 mb-4">
              <span className="text-5xl md:text-6xl font-medium text-white tracking-tight font-serif">$555</span>
            </div>
            <p className="text-xs text-white/55">In 2 hours</p>
          </div>

          {/* Guarantee */}
          <div className="px-4 py-3 max-w-sm mx-auto rounded-xl border border-white/10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-white/50" aria-hidden="true" />
            </div>
            <p className="text-sm text-white/90 leading-relaxed font-medium">
              If you don't leave with a one-sentence business you recognize as yours: you don't pay.
            </p>
          </div>

          {/* Micro social proof */}
          <div className="space-y-1.5 max-w-sm mx-auto">
            {[
              "\"I was applying force, but the vector was wrong.\"",
              "\"This is a miracle of miracles.\"",
              "\"I've never been able to say it like that before.\"",
            ].map((quote, i) => (
              <p key={i} className="text-xs text-white/40 italic text-center">
                {quote}
              </p>
            ))}
          </div>

          {/* Final decision */}
          <p className="text-xs text-white/55 font-medium">
            You don't need more time to figure this out.<br/>
            You need to decide if this becomes real.
          </p>

          {/* Resonance Permission */}
          <p className="text-[10px] text-white/35 italic max-w-xs mx-auto leading-relaxed">
            If your heart isn't resonating with this, don't sign up. This works because people come when they're ready — not when they're pressured.
          </p>

          {/* CTA */}
          <PrimaryCTA id="book-session-btn" label="Book Your Session" showPrice={false} />

          {/* Secondary Actions */}
          <div className="flex flex-col items-center gap-3 pt-3">
            <Button variant="outline" size="sm" asChild>
              <a
                href={CALCOM_CLARITY_LINK}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-3.5 h-3.5 opacity-70" />
                Have a question? Let's chat for 15 mins
              </a>
            </Button>
            <p className="text-[10px] text-white/30 max-w-xs mx-auto">
              No convincing. No persuasion. Just clarity.
            </p>
            <AlreadyPaidLink />
          </div>
        </section>

        {/* S8: FAQ */}
        <section className="space-y-2" id="faq-section" aria-label="Frequently asked questions">
          <h2 className="text-xl font-serif font-semibold text-white/90 text-center uppercase tracking-[0.1em] mb-4">
            <BoldText>Questions</BoldText>
          </h2>
          {[
            {
              q: "What if I don't know my genius yet?",
              a: "You do. You just can't see it from inside. That's literally why this works."
            },
            {
              q: "What if I already have a business?",
              a: "Then we sharpen it until it actually fits YOU—not a template someone else made."
            },
            {
              q: "Is this coaching?",
              a: "No. This is a working session that produces output. You leave with a document, not a feeling."
            },
            {
              q: "What if this doesn't work for me?",
              a: "Then you don't pay."
            },
          ].map((faq, i) => (
            <div key={i} className="liquid-glass rounded-2xl">
              <button
                className="w-full p-4 flex items-center justify-between text-left cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white/50 rounded-2xl"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
                aria-controls={`faq-answer-${i}`}
              >
                <p className="text-sm text-white/75 font-medium">{faq.q}</p>
                <ChevronDown className={`w-4 h-4 text-white/45 transition-transform duration-200 flex-shrink-0 ml-2 ${openFaq === i ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>
              <div
                id={`faq-answer-${i}`}
                role="region"
                className={`overflow-hidden transition-all duration-200 ${openFaq === i ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}
              >
                <div className="px-4 pb-4">
                  <p className="text-xs text-white/50 leading-relaxed">{faq.a}</p>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* EMOTIONAL CLOSE */}
        <div className="text-center space-y-4 pt-2" id="final-close">
          <p className="text-sm text-white/55 max-w-sm mx-auto leading-relaxed">
            You've been carrying something real.
          </p>
          <p className="text-sm text-white/50 max-w-sm mx-auto leading-relaxed">
            That's not the problem.
          </p>
          <p className="text-sm text-white/80 font-medium max-w-sm mx-auto leading-relaxed">
            The problem is it hasn't been turned into something people can say yes to.
          </p>
          <p className="text-xs text-white/50 italic max-w-sm mx-auto">
            This is where that changes.
          </p>

          {/* Final Collapse Line */}
          <p className="text-sm text-white/60 font-medium max-w-sm mx-auto pt-2">
            It either becomes something real now —<br/>
            or it stays something you keep thinking about.
          </p>

          <PrimaryCTA id="final-close-btn" showPrice={false} />
        </div>

        {/* Bottom spacing */}
        <div className="h-8" />
      </div>
    </div>
  );

  // Day 47 late pass (Sasha): ALWAYS wrap in GameShellV2 — previously
  // only wrapped when URL started with /game/. Now /ignite is part of the
  // unified journey shell. `hideLogo` because shell's top-right logo tile
  // would double-up with the genius-business logo we render in the hero.
  return <GameShellV2 hideLogo>{content}</GameShellV2>;
};

export default IgniteSession;
