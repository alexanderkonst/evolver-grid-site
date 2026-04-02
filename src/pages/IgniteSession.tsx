import { ArrowRight, Check, ShieldCheck, MessageCircle, ChevronDown } from "lucide-react";
import { ExpandableTestimonial } from "@/components/ExpandableTestimonial";
import type { TestimonialData } from "@/components/ExpandableTestimonial";
import { useLocation } from "react-router-dom";
import GameShellV2 from "@/components/game/GameShellV2";
import { useState, useRef, useEffect, useCallback } from "react";
import Hls from "hls.js";
import geniusLogo from "@/assets/ignite-logo.png";
import aleksandrPhoto from "@/assets/aleksandr-photo.jpeg";
import { supabase } from "@/integrations/supabase/client";

/* ─── Hardcoded fallback testimonials (used if DB unavailable) ─── */
const FALLBACK_TESTIMONIALS: TestimonialData[] = [
  {
    shortQuote: "I was applying force, but the vector was wrong. Everything clicks.",
    fullQuote: "I was applying force—but the vector was wrong. Myth was the missing piece. I knew nothing about this. Everything starts aligning. This is like a ten, nine-plus. There's nothing here that doesn't click. Absolutely everything clicks. I feel enormous value.",
    name: "Sergey Jay Makarov",
    before: "Serial Founder & System Architect",
  },
  {
    shortQuote: "It's uplifting me so much. It's a real breakthrough.",
    fullQuote: "When you can work with somebody where you can be a human—oh man. The gold is under the dust. It applies to everything—to my clients, your clients, to a country. Your prompts are super powerful. So cool that this collaboration with AI uses the technology as a true soul-driven companion. Brings tears in my eyes. It's uplifting me so much and giving me psychological and emotional stability. It's a real breakthrough. Oh my God, it's so profound. I'm loving this.",
    name: "Sandra Otto",
    before: "New Earth conscious deep tech leader, ex-corporate global consultant",
  },
  {
    shortQuote: "I've been working on this since 2011. This is life changing.",
    fullQuote: "Wow, wow, wow, wow, wow. I've been working on this since 2011. You've changed the dynamic. This is a major breakthrough. I feel like I'm in a deep mushroom journey. Like, how many hours is this thing going to last? I'd like another shot of the good vodka that you're pouring. I physically feel chills, and I feel unfolding. I feel like skin peeling off and layers of things unfolding off my shoulders right now. You take pressure off of me. I just relax. I am in awe right now of the accuracy and the amount of freedom that it is letting me have. My guides, they like you. I see this as life changing.",
    name: "Oyi Sun",
    before: "Medicine Man, Ye Ming Zhu keeper",
  },
  {
    shortQuote: "Thank you for opening my eyes. I appreciate that a lot.",
    fullQuote: "I feel caught. Wonderful. This is great work. Thank you for opening my eyes to things that maybe I'm pushing away—to not embody or execute or own. I appreciate that a lot. I'm pushing it away by belittling myself, making myself smaller. My alternatives are to quit this or to go [deeper]. So I go.",
    name: "Karime Kuri",
    before: "Healer of Healers, ex-WEF leader, Oxford alum",
  },
  {
    shortQuote: "It flips the whole situation. Transformative, full of high truths.",
    fullQuote: "Wow. Wow. This is beautiful, man. It flips the whole situation. Thank you for enabling me this opportunity—or this journey, actually. I highly resonate with it. Your vision is beautiful. It's like a meta-startup, intergalactic meta-startup. Everything that you said—I remember, and it resonated, and it helped at that moment a lot. I'm laughing because it's liberating. I feel so much in the flow. It's such a beautiful thing to actually do. Such a good vibe, such a good understanding. Transformative, full of high truths, or at least discoveries for me.",
    name: "Aleksa Stojanovic",
    before: "Web3 System Architect",
  },
  {
    shortQuote: "This is a miracle of miracles. A tool that just plain works.",
    fullQuote: "This is a miracle of miracles. Other tools come at this half-baked and shallow—they've got no depth. Your approach, though? A tool that just plain works.",
    name: "Alexey Utkin",
    before: "Serial Founder, Stanford MBA",
  },
];

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


/* ─── HLS Background Video ────────────────────────────────── */
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
      // Safari native HLS support
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
      className="fixed inset-0 w-full h-full object-cover z-0"
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

/* ─── Primary CTA Button (liquid glass) ──────────────────── */
const PrimaryCTA = ({ id, label = "Book Your Session", showPrice = true }: { id: string; label?: string; showPrice?: boolean }) => (
  <a
    href={STRIPE_PAYMENT_LINK}
    target="_blank"
    rel="noopener noreferrer"
    className="liquid-glass-strong inline-flex items-center gap-3 px-8 py-4 rounded-full text-base font-medium text-white hover:scale-105 active:scale-95 transition-transform duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
    style={{ fontFamily: "'Poppins', sans-serif" }}
    id={id}
  >
    {label}{showPrice && " — $555"}
    <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
      <ArrowRight className="w-4 h-4" />
    </span>
  </a>
);

/* ─── Already Paid → Book (more visible) ─────────────────── */
const AlreadyPaidLink = () => (
  <a
    href={CALCOM_BOOKING_LINK}
    target="_blank"
    rel="noopener noreferrer"
    className="liquid-glass inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs text-white/50 hover:text-white/80 transition-all duration-200 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
    style={{ fontFamily: "'Poppins', sans-serif" }}
  >
    <Check className="w-3 h-3" />
    Already paid? Book your session here →
  </a>
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
      // Store the divine timing lead — lightweight pre-GHL capture
      await (supabase as any).from('divine_timing_leads').insert({
        email: email.trim(),
        source: 'ignite_page',
        created_at: new Date().toISOString(),
      });
    } catch {
      // Silently continue — we don't want to block the experience
    }
    setState('saved');
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
          className="w-full px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/70 placeholder:text-white/25 focus:outline-none focus:border-white/30 transition-colors"
          style={{ fontFamily: "'Poppins', sans-serif" }}
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

/* ─── Micro-Commitment Block — psychological ownership ─── */
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
      <p className="text-sm text-white/60 text-center font-medium" style={{ fontFamily: "'Source Serif 4', serif" }}>
        Which of these feels most true right now?
      </p>
      <p className="text-[10px] text-white/25 text-center">Just one question:</p>
      <div className="space-y-2">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
              selected === i
                ? "liquid-glass-strong ring-1 ring-[#8460ea]/40 text-white/90 shadow-[0_0_15px_rgba(132,96,234,0.15)]"
                : "liquid-glass ring-1 ring-white/5 text-white/50 hover:text-white/70 hover:ring-white/15"
            }`}
            style={{ fontFamily: "'Source Serif 4', serif" }}
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
  const inShell = location.pathname.startsWith("/game/");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const testimonials = useTestimonials();

  useEffect(() => {
    document.title = "You've Been Giving Your Best Work Away for Free — Ignition Session";
    return () => { document.title = "Evolver"; };
  }, []);

  // Handle hash-based scrolling (e.g. /ignite#hero-video)
  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      // Small delay to allow the page to render first
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
    <div className="relative min-h-screen bg-black text-white overflow-hidden" id="ignite-page" style={{ fontFamily: "'Poppins', sans-serif" }}>

      {/* ═══════════════════════════════════════════════
          VIDEO BACKGROUND — HLS stream via hls.js
          ═══════════════════════════════════════════════ */}
      <HlsBackground />

      {/* Dark overlay for text readability */}
      <div className="fixed inset-0 bg-black/45 z-[1]" aria-hidden="true" />

      {/* ═══════════════════════════════════════════════
          CONTENT LAYER — all sections float above video
          ═══════════════════════════════════════════════ */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 md:px-6 py-16 space-y-14">

        {/* ═══════════════════════════════════════════════
            S1: HERO
            ═══════════════════════════════════════════════ */}
        <header className="text-center space-y-6 pt-4 pb-2" id="ignite-hero">
          <img
            src={geniusLogo}
            alt="Evolver — Unique Business Engine"
            className="w-[80px] h-auto mx-auto opacity-80"
          />

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white leading-[1.1] max-w-2xl mx-auto" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <span className="text-white/60">You can't clearly explain what you do.</span>
            <br />
            <span className="text-white" style={{ textShadow: "0 0 30px rgba(255,255,255,0.4), 0 0 60px rgba(255,255,255,0.1)" }}>
              That's why it's not turning into something people buy.
            </span>
          </h1>

          <p className="text-base md:text-lg text-white/80 max-w-md mx-auto leading-relaxed" style={{ fontFamily: "'Source Serif 4', serif" }}>
            In 90 minutes, we take what you already do —<br/>
            and turn it into:
          </p>
          <div className="text-sm text-white/70 max-w-sm mx-auto leading-relaxed space-y-1" style={{ fontFamily: "'Source Serif 4', serif" }}>
            <p>→ a clear one-sentence business</p>
            <p>→ a real offer</p>
            <p>→ something people understand — and pay for</p>
          </div>

          {/* Proximity reframe */}
          <p className="text-sm text-white/50 max-w-sm mx-auto leading-relaxed mt-2" style={{ fontFamily: "'Source Serif 4', serif" }}>
            You're not far off.
          </p>
          <p className="text-sm text-white/65 font-medium max-w-sm mx-auto" style={{ fontFamily: "'Source Serif 4', serif" }}>
            You're one structural layer away from something that works.
          </p>

          {/* Self-qualification — kills "is this for me?" */}
          <p className="text-xs text-white/40 max-w-sm mx-auto leading-relaxed mt-3 italic" style={{ fontFamily: "'Source Serif 4', serif" }}>
            If this already feels familiar — this is for you.<br/>
            If it doesn't, it won't land.
          </p>

          <div className="flex flex-col items-center gap-4 pt-6">

            {/* Paid path: Ignition Session */}
            <a
              href={STRIPE_PAYMENT_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="liquid-glass-strong w-full max-w-md inline-flex items-center justify-between px-6 py-4 rounded-xl text-sm font-medium text-white hover:scale-[1.02] active:scale-95 transition-all duration-200 ring-1 ring-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <span>Turn this into something real ($555)</span>
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <ArrowRight className="w-3 h-3" />
              </span>
            </a>
          </div>

          <div className="pt-8 space-y-4">
            <a href="#hero-video" className="text-sm font-medium text-white/50 hover:text-white transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-white/50">
              See why this hasn't worked yet (4 min)
            </a>
            <div className="flex flex-col items-center justify-center gap-1 pt-2">
              <DivineTimingCapture />
            </div>
          </div>
        </header>

        {/* ═══════════════════════════════════════════════
            S2: QUALIFIER — the gold (untouched)
            ═══════════════════════════════════════════════ */}
        <section className="space-y-5" id="qualifier" aria-label="Who this session is for">
          <h2 className="text-lg font-medium text-white/90 text-center tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>This is for you if</h2>
          <p className="text-sm text-white/55 text-center max-w-md mx-auto leading-relaxed" style={{ fontFamily: "'Source Serif 4', serif" }}>
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
                style={{ fontFamily: "'Source Serif 4', serif" }}
              >
                {item}
              </div>
            ))}
          </div>
          <p className="text-xs text-white/45 text-center max-w-sm mx-auto leading-relaxed">
            You've proven your value—for other people. The question is: What is yours to build?
          </p>
        </section>

        {/* ═══════════════════════════════════════════════
            S3: VIDEO
            ═══════════════════════════════════════════════ */}
        <section id="hero-video" aria-label="Methodology video">
          <h2 className="text-lg font-medium text-white/90 text-center tracking-tight mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Watch this before you book
          </h2>
          <p className="text-sm text-white/55 text-center mb-3" style={{ fontFamily: "'Source Serif 4', serif" }}>This will show you why insight alone never converts into income — and what actually needs to happen instead.</p>
          <div className="liquid-glass rounded-2xl p-1">
            <LazyYouTube id="afWWcXUqnLI" title="The Ignition Session — Methodology Overview" />
          </div>
          <p className="text-xs text-white/40 text-center mt-4 italic" style={{ fontFamily: "'Source Serif 4', serif" }}>
            If you're still thinking about this after watching… you already know.
          </p>

          {/* Non-optionality — felt consequence, not intellectual */}
          <div className="text-center mt-5 space-y-1">
            <p className="text-xs text-white/45 leading-relaxed">
              This doesn't stay neutral.
            </p>
            <p className="text-xs text-white/55 leading-relaxed font-medium">
              It either becomes a business—<br/>
              or it stays something people benefit from for free.
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S4: HOW IT WORKS — 3 steps + deliverables
            ═══════════════════════════════════════════════ */}
        <section className="space-y-5" id="how-it-works" aria-label="How it works">
          <h2 className="text-lg font-medium text-white/90 text-center tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>What happens in 90 minutes</h2>
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
                title: "You leave with a real business",
                desc: "Not something to 'figure out later.' AI compiles everything live into one page. What you do, who it's for, why they pay, what to say next.",
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

        {/* ═══════════════════════════════════════════════
            S5: ABOUT — trimmed, no jargon
            ═══════════════════════════════════════════════ */}
        <section id="about-section" aria-label="About Aleksandr" className="relative pt-8">
          <img
            src={aleksandrPhoto}
            alt="Aleksandr Konstantinov"
            className="w-20 h-20 rounded-full object-cover opacity-90 mx-auto relative z-10 border-2 border-white/10"
          />
          <div className="liquid-glass rounded-3xl p-6 md:p-8 pt-14 -mt-10 text-center space-y-3">
            <p className="text-sm text-white/70 leading-relaxed" style={{ fontFamily: "'Source Serif 4', serif" }}>
              I spent years in the loop myself. Building startups that didn't stick. Consulting. Coaching friends for free. Circling the same question everyone in this situation circles:
            </p>
            <p className="text-sm text-white/80 leading-relaxed italic" style={{ fontFamily: "'Source Serif 4', serif" }}>
              "What is mine to build?"
            </p>
            <p className="text-sm text-white/70 leading-relaxed mt-1">
              What I do now is simple: I sit with someone for 90 minutes, hear what they've been saying for years, and hand them back the one sentence they couldn't see from inside themselves. Then AI compiles their entire business on one page before the session ends.
            </p>
            <p className="text-xs text-white/55 mt-4">
              — <em style={{ fontFamily: "'Source Serif 4', serif" }}>Aleksandr Konstantinov</em>
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S6: TESTIMONIALS
            ═══════════════════════════════════════════════ */}
        <section className="space-y-3" id="testimonials" aria-label="Client testimonials">
          <h2 className="text-lg font-medium text-white/90 text-center tracking-tight mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>What they said after</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {testimonials.map((t, i) => (
              <ExpandableTestimonial key={i} t={t} variant="dark" />
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            MICRO-COMMITMENT — psychological ownership before purchase
            ═══════════════════════════════════════════════ */}
        <MicroCommitmentBlock />

        {/* ═══════════════════════════════════════════════
            S7: BOOKING — decision clarity + safety + inevitability
            ═══════════════════════════════════════════════ */}
        <section className="liquid-glass-strong rounded-[2.5rem] p-8 md:p-10 text-center space-y-6" id="pricing-section" aria-label="Book your session">
          {/* Anchor for direct-link scrolling */}
          <div id="booking" className="sr-only" aria-hidden="true" />

          {/* What happens — consequence-first */}
          <div className="space-y-3 max-w-sm mx-auto">
            <p className="text-lg font-medium text-white/90 text-center" style={{ fontFamily: "'Poppins', sans-serif" }}>One session. One clear business.</p>
            <p className="text-xs text-white/45 text-center leading-relaxed" style={{ fontFamily: "'Source Serif 4', serif" }}>
              If you don't turn this into something concrete:
            </p>
            <div className="text-xs text-white/50 space-y-1 text-center" style={{ fontFamily: "'Source Serif 4', serif" }}>
              <p>→ it stays something people benefit from — but don't pay for</p>
              <p>→ you keep circling the same question</p>
              <p>→ nothing fundamentally changes</p>
            </div>
            <p className="text-xs text-white/40 uppercase tracking-widest text-center pt-2">In 90 minutes</p>
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
            <div className="flex items-baseline justify-center gap-1 mb-1">
              <span className="text-5xl md:text-6xl font-medium text-white tracking-tight">$555</span>
            </div>
            <p className="text-xs text-white/55">One session. One business.</p>
          </div>

          {/* Guarantee */}
          <div className="px-4 py-3 max-w-sm mx-auto rounded-xl border border-white/10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-white/50" aria-hidden="true" />
            </div>
            <p className="text-sm text-white/90 leading-relaxed font-medium">
              If you don't leave with a clear one-sentence business: you don't pay.
            </p>
          </div>

          {/* Micro social proof — 3 quotes */}
          <div className="space-y-1.5 max-w-sm mx-auto">
            {[
              "\"I was applying force, but the vector was wrong.\"",
              "\"This is a miracle of miracles.\"",
              "\"I've never been able to say it like that before.\"",
            ].map((quote, i) => (
              <p key={i} className="text-xs text-white/40 italic text-center" style={{ fontFamily: "'Source Serif 4', serif" }}>
                {quote}
              </p>
            ))}
          </div>

          {/* Final decision collapse */}
          <p className="text-xs text-white/55 font-medium">
            You don't need more time to figure this out.<br/>
            You need to decide if this becomes real.
          </p>

          {/* Resonance Permission — HD Emotional Authority principle */}
          <p className="text-[10px] text-white/35 italic max-w-xs mx-auto leading-relaxed" style={{ fontFamily: "'Source Serif 4', serif" }}>
            If your heart isn't resonating with this, don't sign up. This works because people come when they're ready — not when they're pressured.
          </p>

          {/* CTA */}
          <PrimaryCTA id="book-session-btn" label="Book Your Session" showPrice={false} />

          {/* Small text */}
          <div className="flex flex-col items-center gap-2 pt-1">
            <a
              href={CALCOM_CLARITY_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] text-white/25 hover:text-white/50 transition-colors underline underline-offset-4 decoration-white/5 hover:decoration-white/20"
            >
              Have a question? 15-min call
            </a>
            <AlreadyPaidLink />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S8: FAQ — glass accordions
            ═══════════════════════════════════════════════ */}
        <section className="space-y-2" id="faq-section" aria-label="Frequently asked questions">
          <h2 className="text-lg font-medium text-white/90 text-center mb-4 tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Questions</h2>
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

        {/* ═══════════════════════════════════════════════
            EMOTIONAL CLOSE
            ═══════════════════════════════════════════════ */}
        <div className="text-center space-y-4 pt-2" id="final-close">
          <p className="text-sm text-white/55 max-w-sm mx-auto leading-relaxed" style={{ fontFamily: "'Source Serif 4', serif" }}>
            You've been carrying something real.
          </p>
          <p className="text-sm text-white/50 max-w-sm mx-auto leading-relaxed" style={{ fontFamily: "'Source Serif 4', serif" }}>
            That's not the problem.
          </p>
          <p className="text-sm text-white/80 font-medium max-w-sm mx-auto leading-relaxed">
            The problem is it hasn't been turned into something people can say yes to.
          </p>
          <p className="text-xs text-white/50 italic max-w-sm mx-auto" style={{ fontFamily: "'Source Serif 4', serif" }}>
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

  if (inShell) return <GameShellV2>{content}</GameShellV2>;
  return content;
};

export default IgniteSession;

