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
    shortQuote: "Wow, wow, wow, wow, wow. My guides, they like you.",
    fullQuote: "Wow, wow, wow, wow, wow. I never had the words to say that ... I've been working on this since 2011 - change my age, make small edits. You've changed the dynamic ... This is a major breakthrough. I really hope your AI is recording this ... I feel like I'm in a deep mushroom journey. Like, how many hours is this thing going to last? ... I'd like another shot of the good vodka that you're pouring ... What you're doing is not vertically integrated. It's mycelially integrated ... I physically feel chills, and I feel unfolding. I feel like skin peeling off and layers of things unfolding off my shoulders right now. You take pressure off of me. I just relax ... I am in awe right now of the accuracy and the amount of freedom that it is letting me have ... This stuff is really, really sharp ... My guides, they like you ... I see this as life changing.",
    name: "Oyi Sun",
    before: "Medicine Man, Ye Ming Zhu keeper",
  },
  {
    shortQuote: "This is a miracle of miracles. A tool that just plain works.",
    fullQuote: "This is a miracle of miracles. Other tools come at this half-baked and shallow — they've got no depth. Your approach, though? A tool that just plain works.",
    name: "Alexey Utkin",
    before: "Serial founder, Stanford MBA, ex-management consultant",
  },
  {
    shortQuote: "I was applying force, but the vector was wrong.",
    fullQuote: "I knew, I just knew — \"this is a door that you need to go through.\" I feel understood. When you can work with somebody where you can be a human — oh man. The gold is under the dust. It applies to everything — to my clients, your clients, to a country. Your prompts are super powerful. So cool that this collaboration with AI uses the technology as a true soul-driven companion. Brings tears in my eyes. It's uplifting me so much and giving me psychological and emotional stability. It's a real breakthrough. Oh my God, it's so profound. I'm loving this.",
    name: "Sergey Jay Makarov",
    before: "Serial Founder & System Architect",
  },
  {
    shortQuote: "Brings tears in my eyes. It's uplifting me so much and giving me psychological and emotional stability.",
    fullQuote: "I knew, I just knew — \"this is a door that you need to go through.\" I feel understood. When you can work with somebody where you can be a human — oh man. The gold is under the dust. It applies to everything — to my clients, your clients, to a country. Your prompts are super powerful. So cool that this collaboration with AI uses the technology as a true soul-driven companion. Brings tears in my eyes. It's uplifting me so much and giving me psychological and emotional stability. It's a real breakthrough. Oh my God, it's so profound. I'm loving this.",
    name: "Sandra Otto",
    before: "New Earth conscious deep tech leader, ex-corporate global consultant",
  },
  {
    shortQuote: "The whole journey feels really beautiful.",
    fullQuote: "Wow. Wow. This is beautiful, man. You know what the testimonial page should say? One word for every person: \"Wow\". And you wouldn't be wrong ... It flips the whole situation. Thank you for enabling me this opportunity — or this journey, actually. I highly resonate with it. Your vision is beautiful. It's like a meta-startup, intergalactic meta-startup. Everything that you said — I remember, and it resonated, and it helped at that moment a lot. So yeah, thanks for all of that, man. I appreciate it. I'm laughing because it's liberating. I feel so much in the flow. It's such a beautiful thing to actually do. Such a good vibe, such a good understanding. I think it's a wonderful thing to do. it was — transformative. Full of high truths, or at least discoveries for me.",
    name: "Aleksa Stojanovic",
    before: "Web3 System Architect",
  },
  {
    shortQuote: "I feel caught. Wonderful. This is great work.",
    fullQuote: "I feel caught. Wonderful. This is great work. Thank you for opening my eyes to things that maybe I'm pushing away — to not embody or execute or own. I appreciate that a lot. I'm pushing it away by belittling myself, making myself smaller. My alternatives are to quit this or to go [deeper]. So I go.",
    name: "Karime Kuri",
    before: "Healer of Healers, ex-WEF leader, Oxford alum",
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
const PrimaryCTA = ({ id, showPrice = true }: { id: string; showPrice?: boolean }) => (
  <a
    href={STRIPE_PAYMENT_LINK}
    target="_blank"
    rel="noopener noreferrer"
    className="liquid-glass-strong inline-flex items-center gap-3 px-8 py-4 rounded-full text-base font-medium text-white hover:scale-105 active:scale-95 transition-transform duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
    style={{ fontFamily: "'Poppins', sans-serif" }}
    id={id}
  >
    Book Your Ignition Session{showPrice && " — $555"}
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
    document.title = "You're Not Confused. You Just Can't Name What You Do—Yet — Ignition Session";
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
      <div className="relative z-10 max-w-2xl mx-auto px-4 md:px-6 py-16 space-y-12">

        {/* ═══════════════════════════════════════════════
            S1: HERO — Recognition Trigger + CTA
            ═══════════════════════════════════════════════ */}
        <header className="text-center space-y-6 pt-4" id="ignite-hero">
          <img
            src={geniusLogo}
            alt="Evolver — Unique Business Ignition"
            className="w-[104px] h-auto mx-auto opacity-90"
          />

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-[-0.05em] text-white leading-[1.1]" style={{ fontFamily: "'Poppins', sans-serif" }}>
            You're Not{" "}
            <span className="text-white" style={{ textShadow: "0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(255,255,255,0.2)" }}>
              Confused.
            </span>
            <br />You Just Can't Name What You Do—Yet.
          </h1>

          <p className="text-base text-white/90 max-w-lg mx-auto leading-relaxed">
            You've been undercharging and overexplaining—because your answer to "so what do you do?" still sounds like a riddle.
          </p>

          <p className="text-sm text-white/75 max-w-sm mx-auto leading-relaxed">
            In 90 minutes, we name it, package it, and see exactly how it becomes a business.
          </p>

          <p className="text-xs text-white/55 max-w-sm mx-auto leading-relaxed">
            If you can't explain what you do in one sentence, this is for you.
          </p>

          <p className="text-xs text-white/55 max-w-sm mx-auto leading-relaxed italic">
            You don't need a new idea.<br />You need language for what you already do.
          </p>

          <div className="flex flex-col items-center gap-3 pt-2">
            <PrimaryCTA id="hero-cta-btn" />
            <span className="text-xs text-white/50">Limited sessions per week. First come, first serve.</span>
            <span className="flex items-center gap-1.5 text-xs text-white/45">
              <ShieldCheck className="w-3 h-3" aria-hidden="true" />
              Money-back guarantee
            </span>
          </div>
        </header>

        {/* ═══════════════════════════════════════════════
            S2: QUALIFIER — Self-selection pills
            ═══════════════════════════════════════════════ */}
        <section className="text-center space-y-4" id="qualifier" aria-label="Who this session is for">
          <h2 className="text-lg font-medium text-white/90 text-center tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>This session is for you if</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              "You've been giving your best work away for free — not because it's not valuable, but because you can't explain it cleanly enough to charge",
              "Conversations drag, pricing feels random, and opportunities slip",
              "Your answer to \"so what do you do?\" still sounds like a riddle",
            ].map((item, i) => (
              <span
                key={i}
                className="liquid-glass rounded-full px-4 py-2 text-xs text-white/90"
              >
                {item}
              </span>
            ))}
          </div>
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
            S3.5: HOW IT WORKS — 3 glass step cards
            ═══════════════════════════════════════════════ */}
        <section className="space-y-5" id="how-it-works" aria-label="How it works">
          <h2 className="text-lg font-medium text-white/90 text-center tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                emoji: "🔮",
                step: "1",
                title: "We name your genius in one sentence",
                desc: "You talk. I guide you through the Zone of Genius articulation. AI synthesizes it live.",
              },
              {
                emoji: "📦",
                step: "2",
                title: "We turn it into a product",
                desc: "Your sentence becomes an offer people can understand—and buy.",
              },
              {
                emoji: "🚀",
                step: "3",
                title: "We map your business + next move",
                desc: "You leave with direction, structure, and momentum.",
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
            S4: DELIVERABLES — What you walk out with
            ═══════════════════════════════════════════════ */}
        <section id="deliverables" aria-label="Session deliverables" className="space-y-4">
          <h2 className="text-lg font-medium text-white/90 text-center tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>What You Walk Out With</h2>
          <div className="liquid-glass-strong rounded-3xl p-6 md:p-8">
          <div className="space-y-4">
            {[
              {
                title: "Your genius named in one sentence",
                desc: "The thing you've been doing for free — named clearly enough that anyone can understand and buy it."
              },
              {
                title: "Your entire business on one page",
                desc: "Product, audience, pain, promise, and offer — structured and compiled in real time."
              },
              {
                title: "A clear, immediate next step",
                desc: "You leave knowing exactly who to talk to, what to say, and what to charge."
              },
              {
                title: "The ability to explain what you do — without overthinking",
                desc: "No more riddles. One sentence that lands."
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
            S5: ABOUT ALEXANDER — trust anchor
            ═══════════════════════════════════════════════ */}
        <section id="about-section" aria-label="About Aleksandr" className="relative pt-8">
          {/* Photo centered on top edge */}
          <img
            src={aleksandrPhoto}
            alt="Aleksandr Konstantinov"
            className="w-20 h-20 rounded-full object-cover opacity-90 mx-auto relative z-10 border-2 border-white/10"
          />
          {/* Glass box pulled up under the photo */}
          <div className="liquid-glass rounded-3xl p-6 md:p-8 pt-14 -mt-10 text-center">
            <p className="text-sm text-white/70 leading-relaxed">
              &nbsp;
            </p>
            <p className="text-sm text-white/70 leading-relaxed">
              I've spent years helping founders articulate what makes them irreplaceable—while struggling to name my own.
            </p>
            <p className="text-sm text-white/70 leading-relaxed mt-3">
              What I do best is simple: I see what people can't see in themselves—and give it back to them clearly.
            </p>
            <p className="text-sm text-white/70 leading-relaxed mt-3">
              Now I do this full-time.
            </p>
            <p className="text-xs text-white/55 mt-4">
              — <em style={{ fontFamily: "'Source Serif 4', serif" }}>Aleksandr Konstantinov</em>
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S6: TESTIMONIALS — glass cards with before-context
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
            S7: PRICING + GUARANTEE — strong glass panel
            ═══════════════════════════════════════════════ */}
        <section className="liquid-glass-strong rounded-[2.5rem] p-8 md:p-10 text-center space-y-5" id="pricing-section" aria-label="Pricing">
          <div>
            <div className="flex items-baseline justify-center gap-1 mb-1">
              <span className="text-5xl md:text-6xl font-medium text-white tracking-tight">$555</span>
            </div>
            <p className="text-xs text-white/45">One session. Fully filled unique business canvas. Yours forever.</p>
            <p className="text-xs text-white/50 mt-1">Limited sessions per week. First come, first serve.</p>
          </div>

          <PrimaryCTA id="book-session-btn" showPrice={false} />

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
            S8: FAQ — glass accordions
            ═══════════════════════════════════════════════ */}
        <section className="space-y-2" id="faq-section" aria-label="Frequently asked questions">
          <h2 className="text-lg font-medium text-white/90 text-center mb-4 tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Questions</h2>
          {[
            {
              q: "What if I don't know my genius yet?",
              a: "Perfect. That's exactly who this is for. You don't prepare — you arrive. The questions do the work."
            },
            {
              q: "What if I already have a business?",
              a: "Even better. Most businesses are built around a market gap, not the founder's uniqueness. I check if yours is aligned with who you are. If it is, we sharpen it. If it isn't, you'll finally see why it's felt like a grind."
            },
            {
              q: "How is this different from coaching?",
              a: "Coaching explores. This names and structures. You walk out with a business on a page, not a pep talk."
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
            S9: BOTTOM CTA — above blueprints
            ═══════════════════════════════════════════════ */}
        <div className="text-center space-y-3" id="bottom-cta">
          <p className="text-sm text-white/65 max-w-sm mx-auto leading-relaxed">
            If you've been circling this for months…<br />this is where it clicks.
          </p>
          <PrimaryCTA id="bottom-cta-btn" />
          <div className="flex flex-col items-center gap-2">
            <AlreadyPaidLink />
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            S10: OPEN BLUEPRINTS — glass video cards
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
            S11: FINAL CTA — very end of page
            ═══════════════════════════════════════════════ */}
        <div className="text-center space-y-3" id="final-cta">
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
