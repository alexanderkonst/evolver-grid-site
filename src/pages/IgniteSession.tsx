import { ArrowRight, Check, ShieldCheck, MessageCircle, ChevronDown } from "lucide-react";
import { ExpandableTestimonial } from "@/components/ExpandableTestimonial";
import type { TestimonialData } from "@/components/ExpandableTestimonial";
import { useLocation } from "react-router-dom";
import GameShellV2 from "@/components/game/GameShellV2";
import { useState, useRef, useEffect } from "react";
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
const PrimaryCTA = ({ id, label = "See My Business on One Page", showPrice = true }: { id: string; label?: string; showPrice?: boolean }) => (
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

/* ─── Already Paid Link ─────────────────────────────────── */
const AlreadyPaidLink = () => (
  <a
    href={CALCOM_BOOKING_LINK}
    target="_blank"
    rel="noopener noreferrer"
    className="text-xs text-white/25 hover:text-white/50 transition-colors underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 rounded"
    style={{ fontFamily: "'Poppins', sans-serif" }}
  >
    Already paid? Book your session here →
  </a>
);

const IgniteSession = () => {
  const location = useLocation();
  const inShell = location.pathname.startsWith("/game/");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const testimonials = useTestimonials();

  useEffect(() => {
    document.title = "You've Been Giving Your Best Work Away for Free — Ignition Session";
    return () => { document.title = "Evolver"; };
  }, []);

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
            S1: HERO — The Funnel Page Architecture v3.0
            ═══════════════════════════════════════════════ */}
        <header className="text-center space-y-6 pt-4 pb-2" id="ignite-hero">
          <img
            src={geniusLogo}
            alt="Evolver — Unique Business Engine"
            className="w-[80px] h-auto mx-auto opacity-80"
          />

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-white leading-[1.05] max-w-3xl mx-auto" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <span className="text-white/50">Overqualified?</span>
            <br />
            <span className="text-white" style={{ textShadow: "0 0 30px rgba(255,255,255,0.4), 0 0 60px rgba(255,255,255,0.1)" }}>
              You're overprepared.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/90 max-w-md mx-auto leading-relaxed" style={{ fontFamily: "'Source Serif 4', serif" }}>
            Name your genius.<br/>Monetize it through a dream business.
          </p>

          <div className="flex flex-col items-center gap-4 pt-6">
            {/* Entry 2: The Matchmaking Quiz */}
            <a
              href="/matchmaking"
              className="liquid-glass w-full max-w-md inline-flex items-center justify-between px-6 py-4 rounded-xl text-sm font-medium text-white hover:scale-[1.02] active:scale-95 transition-all duration-200"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <span>Near instant zone of genius reveal</span>
              <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                <ArrowRight className="w-3 h-3" />
              </span>
            </a>

            {/* Entry 1: The Build Session */}
            <a
              href={STRIPE_PAYMENT_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="liquid-glass-strong w-full max-w-md inline-flex items-center justify-between px-6 py-4 rounded-xl text-sm font-medium text-white hover:scale-[1.02] active:scale-95 transition-all duration-200 ring-1 ring-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <span>Build a business out of it ($555)</span>
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <ArrowRight className="w-3 h-3" />
              </span>
            </a>
          </div>

          <div className="pt-8 space-y-4">
            <a href="#hero-video" className="text-sm font-medium text-white/50 hover:text-white transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-white/50">
              Watch how to build your unique genius business, free.
            </a>
            <div className="flex flex-col items-center justify-center gap-1 pt-2">
              <p className="text-[10px] text-white/30 italic uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="w-3 h-3 text-white/40" aria-hidden="true" />
                If and as long as this resonates, I suggest keep going.
              </p>
              <button 
                onClick={() => alert("Divine Timing acknowledged. The Noosphere will hold this space and return in 6 months.")}
                className="text-[9px] text-white/20 hover:text-white/40 transition-colors uppercase tracking-[0.2em] mt-2 underline underline-offset-4 decoration-white/10"
              >
                Not right now, but in 6 months
              </button>
            </div>
          </div>
        </header>

        {/* ═══════════════════════════════════════════════
            S2: QUALIFIER — Meta-segment recognition
            ═══════════════════════════════════════════════ */}
        <section className="space-y-5" id="qualifier" aria-label="Who this session is for">
          <h2 className="text-lg font-medium text-white/90 text-center tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>This is for you if</h2>
          <p className="text-sm text-white/55 text-center max-w-md mx-auto leading-relaxed" style={{ fontFamily: "'Source Serif 4', serif" }}>
            You've tried building. You've tried coaching. You've considered going back to corporate. Nothing held all of you.
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
            You know your work matters. You've proven it a hundred times—for other people. The thing you can't prove is: what is yours to build?
          </p>
        </section>

        {/* ═══════════════════════════════════════════════
            S3: VIDEO — Methodology demonstration
            ═══════════════════════════════════════════════ */}
        <section id="hero-video" aria-label="Methodology video">
          <h2 className="text-lg font-medium text-white/90 text-center tracking-tight mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
            The exact methodology disclosed in 4 minutes
          </h2>
          <div className="liquid-glass rounded-2xl p-1">
            <LazyYouTube id="pnQzKNJyP0A" title="The Ignition Session — Methodology Overview" />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S4: HOW IT WORKS — 3 glass step cards
            ═══════════════════════════════════════════════ */}
        <section className="space-y-5" id="how-it-works" aria-label="How it works">
          <h2 className="text-lg font-medium text-white/90 text-center tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>What happens in the session</h2>
          <p className="text-xs text-white/45 text-center">This is not coaching. This is real-time crystallization.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                emoji: "🔮",
                step: "1",
                title: "Your genius gets named",
                desc: "You talk. I listen for what's already there—but invisible to you. Then we land it in one sentence clear enough that a 7-year-old understands, an investor trusts, and a client buys.",
              },
              {
                emoji: "📦",
                step: "2",
                title: "It becomes a product",
                desc: "That sentence becomes a clear offer, a defined audience, a real problem, a real outcome. No guessing. No branding exercise. Just structure that holds.",
              },
              {
                emoji: "🚀",
                step: "3",
                title: "Your business appears",
                desc: "AI compiles everything live into your entire business on one page. What you do, who it's for, why they pay, what to say next. You leave with a system.",
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
            S5: DELIVERABLES — What you walk out with
            ═══════════════════════════════════════════════ */}
        <section id="deliverables" aria-label="Session deliverables" className="space-y-4">
          <h2 className="text-lg font-medium text-white/90 text-center tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>What You Walk Out With</h2>
          <div className="liquid-glass-strong rounded-3xl p-6 md:p-8">
          <div className="space-y-4">
            {[
              {
                title: "The Sacred Trading Card (7.0 Precision Draft)",
                desc: "Your entire business architecture structured and compiled live into a physically beautiful, inherently viral artifact."
              },
              {
                title: "Your genius named in one undeniable sentence",
                desc: "The thing you've been doing for free—named clearly enough that anyone can understand and buy it."
              },
              {
                title: "A structured offer you can charge for",
                desc: "Not vague value. A concrete container with a clear price that makes sense."
              },
              {
                title: "The exact person to talk to next—and the exact words to say",
                desc: "You leave knowing who, what, and how. No more guessing."
              },
              {
                title: "The confidence that comes from finally being seen",
                desc: "Not a pep talk. The structural clarity that makes confidence automatic."
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-white/80" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-white/95 font-medium">{item.title}</p>
                  <p className="text-xs text-white/55 leading-relaxed mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S6: THREE SHIFTS — The transformation arc
            ═══════════════════════════════════════════════ */}
        <section className="space-y-4" id="three-shifts" aria-label="The three shifts">
          <h2 className="text-lg font-medium text-white/90 text-center tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>The Three Shifts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                num: "1",
                label: "Scattered → Clear",
                before: '"I do a lot of things…"',
                after: "One sentence that lands instantly.",
              },
              {
                num: "2",
                label: "Free → Paid",
                before: "Giving your best work away—because it felt noble, because it came naturally.",
                after: "People understand it fast enough to pay. And you understand WHY it's worth paying for.",
              },
              {
                num: "3",
                label: "Looping → Moving",
                before: "Building, coaching, considering corporate—round and round.",
                after: "One container that doesn't ask you to amputate. Clear next move.",
              },
            ].map((item, i) => (
              <div key={i} className="liquid-glass rounded-3xl p-5 space-y-3">
                <p className="text-xs text-white/60 font-medium uppercase tracking-widest text-center">{item.num}. {item.label}</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">Before</p>
                    <p className="text-xs text-white/50 italic leading-relaxed" style={{ fontFamily: "'Source Serif 4', serif" }}>{item.before}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">After</p>
                    <p className="text-xs text-white/70 leading-relaxed">{item.after}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S7: REALITY CHECK — The ache named
            ═══════════════════════════════════════════════ */}
        <section className="text-center space-y-3 py-2" id="reality-check">
          <p className="text-sm text-white/70 leading-relaxed max-w-md mx-auto">
            You're not stuck because you lack ability.
          </p>
          <p className="text-sm text-white/70 leading-relaxed max-w-md mx-auto">
            You're stuck because you can't <span className="text-white/90 font-medium">say what you do</span>—clearly enough for someone to buy it.
          </p>
          <p className="text-xs text-white/45 leading-relaxed max-w-sm mx-auto" style={{ fontFamily: "'Source Serif 4', serif" }}>
            And what can't be explained can't be sold, can't be scaled, can't become the business you know it should be.
          </p>
        </section>

        {/* ═══════════════════════════════════════════════
            S8: ABOUT ALEXANDER — Expanded trust anchor
            ═══════════════════════════════════════════════ */}
        <section id="about-section" aria-label="About Aleksandr" className="relative pt-8">
          {/* Photo centered on top edge */}
          <img
            src={aleksandrPhoto}
            alt="Aleksandr Konstantinov"
            className="w-20 h-20 rounded-full object-cover opacity-90 mx-auto relative z-10 border-2 border-white/10"
          />
          {/* Glass box pulled up under the photo */}
          <div className="liquid-glass rounded-3xl p-6 md:p-8 pt-14 -mt-10 text-center space-y-3">
            <p className="text-sm text-white/70 leading-relaxed" style={{ fontFamily: "'Source Serif 4', serif" }}>
              I spent years in the loop myself. Building startups that didn't stick. Consulting. Coaching friends for free. Circling the same question everyone in this situation circles:
            </p>
            <p className="text-sm text-white/80 leading-relaxed italic" style={{ fontFamily: "'Source Serif 4', serif" }}>
              "What is mine to build?"
            </p>
            <p className="text-sm text-white/60 leading-relaxed" style={{ fontFamily: "'Source Serif 4', serif" }}>
              The answer was embarrassingly close the whole time. I was already doing it—in every conversation, every session, every "just helping out" moment.
            </p>
            <p className="text-sm text-white/70 leading-relaxed mt-1">
              What I do now is simple: I sit with someone for 90 minutes, hear what they've been saying for years, and hand them back the one sentence they couldn't see from inside themselves.
            </p>
            <p className="text-sm text-white/55 leading-relaxed">
              Then AI compiles their entire business on one page before the session ends.
            </p>
            <p className="text-xs text-white/40 leading-relaxed mt-2">
              Hundreds of transformative sessions facilitated. The system is infused with Y&nbsp;Combinator, Silicon Valley, MIT, and New Earth methodologies. AI workflows at every step.
            </p>
            <p className="text-xs text-white/55 mt-4">
              — <em style={{ fontFamily: "'Source Serif 4', serif" }}>Aleksandr Konstantinov</em>
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S9: TESTIMONIALS — glass cards with before-context
            ═══════════════════════════════════════════════ */}
        <section className="space-y-3" id="testimonials" aria-label="Client testimonials">
          <p className="text-sm text-white/60 text-center mb-1">People don't expect this to work this fast. Then it does.</p>
          <h2 className="text-lg font-medium text-white/90 text-center tracking-tight mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>What they said after</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {testimonials.map((t, i) => (
              <ExpandableTestimonial key={i} t={t} variant="dark" />
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S10: PRICING + GUARANTEE — strong glass panel
            ═══════════════════════════════════════════════ */}
        <section className="liquid-glass-strong rounded-[2.5rem] p-8 md:p-10 text-center space-y-5" id="pricing-section" aria-label="Pricing">
          <div>
            <div className="flex items-baseline justify-center gap-1 mb-1">
              <span className="text-5xl md:text-6xl font-medium text-white tracking-tight">$555</span>
            </div>
            <p className="text-xs text-white/45">One session. Fully filled unique business canvas. Yours forever.</p>
            <p className="text-xs text-white/50 mt-1">Limited sessions per week. First come, first serve.</p>
          </div>

          <PrimaryCTA id="book-session-btn" label="Book Your Ignition Session" showPrice={false} />

          {/* Guarantee */}
          <div className="px-5 py-2 max-w-md mx-auto">
            <div className="flex items-center justify-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-white/40" aria-hidden="true" />
              <p className="text-xs font-medium text-white/55 uppercase tracking-widest">The Ignition Guarantee</p>
            </div>
            <p className="text-xs text-white/50 leading-relaxed">
              You leave with your genius named and your business on one page—or you don't pay.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 pt-1">
            <a
              href={CALCOM_CLARITY_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="liquid-glass inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm text-white/80 hover:text-white hover:scale-105 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              Still have questions? Book a free 15-min clarity call
            </a>
            <AlreadyPaidLink />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S10.5: THE BUILD — What happens after
            ═══════════════════════════════════════════════ */}
        <section className="liquid-glass rounded-3xl p-6 md:p-8 text-center space-y-4" id="the-build" aria-label="What comes next">
          <p className="text-xs text-white/40 uppercase tracking-widest">If this clicks, we don't stop at clarity</p>
          <h2 className="text-lg font-medium text-white/90 tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>The Build (Outcome Scaling)</h2>
          <div className="space-y-1 text-sm text-white/60 leading-relaxed max-w-sm mx-auto" style={{ fontFamily: "'Source Serif 4', serif" }}>
            <p><strong className="text-white/80 font-medium">The Machine:</strong> $1,111 upfront.</p>
            <p><strong className="text-white/80 font-medium">The Alignment:</strong> $2,500 backend extracted from your first $10K baseline.</p>
          </div>
          <p className="text-xs text-white/70 font-medium tracking-widest uppercase mt-4">
            The Outcome: 10 clients. Early PMF. Done.
          </p>
        </section>

        {/* ═══════════════════════════════════════════════
            S11: FAQ — glass accordions
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
              q: "What if I've tried other things—coaching, courses, frameworks—and they didn't work?",
              a: "They probably served one part of you. This is for people who need a container that holds ALL of them."
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

          <div className="text-center pt-4">
            <a
              href={CALCOM_CLARITY_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="liquid-glass inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm text-white/80 hover:text-white hover:scale-105 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              Still have questions? Book a free 15-min clarity call
            </a>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S12: BOTTOM CTA — above blueprints
            ═══════════════════════════════════════════════ */}
        <div className="text-center space-y-3" id="bottom-cta">
          <p className="text-sm text-white/55 max-w-sm mx-auto leading-relaxed italic" style={{ fontFamily: "'Source Serif 4', serif" }}>
            If you've been carrying this unnamed thing in silence—
            <br />wondering why it's so hard to say, why nothing fully fits, why you keep circling—
          </p>
          <p className="text-sm text-white/70 font-medium">
            This is where it clicks.
          </p>
          <PrimaryCTA id="bottom-cta-btn" />
          <div className="flex flex-col items-center gap-2">
            <AlreadyPaidLink />
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            S13: OPEN BLUEPRINTS — glass video cards
            ═══════════════════════════════════════════════ */}
        <section className="space-y-4 pt-6" id="blueprints-section" aria-label="Free methodology blueprints">
          <div className="text-center space-y-1">
            <p className="text-xs text-white/40 uppercase tracking-widest">The Open Blueprints</p>
            <h2 className="text-lg font-medium text-white/90 tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>The entire methodology. Free.</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                title: "Blueprint 1: Unique Product",
                subtitle: "From Zero to Sales",
                youtubeId: "-eO36lBMPRo",
              },
              {
                title: "Blueprint 2: Unique Marketing",
                subtitle: "From Fog to Reality Cohering Field",
                youtubeId: "wjcD5r9iq8A",
              },
              {
                title: "Blueprint 3: Aligned Distribution",
                subtitle: "From Manipulation to Soul-Aligned Tactics",
                youtubeId: "XI2xqNO4Oek",
              },
            ].map((video, i) => (
              <div key={i} className="liquid-glass rounded-2xl">
                <div className="p-1">
                  <LazyYouTube id={video.youtubeId} title={video.title} />
                </div>
                <div className="px-4 py-3">
                  <p className="text-sm text-white/75 font-medium">{video.title}</p>
                  <p className="text-xs text-white/45">{video.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S14: FOOTER BRIDGE + FINAL CTA
            ═══════════════════════════════════════════════ */}
        <div className="text-center space-y-4" id="final-cta">
          <p className="text-xs text-white/35 max-w-sm mx-auto leading-relaxed">
            This page is the second mirror. If you arrived here from a message that resonated—trust that signal.
          </p>
          <PrimaryCTA id="final-cta-btn" />
          <div className="flex flex-col items-center gap-2">
            <AlreadyPaidLink />
          </div>
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
