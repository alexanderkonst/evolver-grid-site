import { ArrowRight, Check, ShieldCheck, MessageCircle, ChevronDown, Star, Compass, Zap, Flame } from "lucide-react";
import { useLocation } from "react-router-dom";
import GameShellV2 from "@/components/game/GameShellV2";
import { useState, useRef, useEffect } from "react";
import Hls from "hls.js";

/* ─── Sergey-specific links (placeholders until Sergey sets up) ─── */
const CALCOM_BOOKING_LINK = "#"; // Sergey's booking link TBD
const CALCOM_CLARITY_LINK = "#"; // Sergey's clarity call link TBD

const HLS_VIDEO_URL = "https://stream.mux.com/f7R901xPVirn4wi01FeaJ02XPvUJrylNdM3RGOiLs4RPBs.m3u8";

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

/* ─── Primary CTA Button (liquid glass) ──────────────────── */
const PrimaryCTA = ({ id, label = "Book a Gift Session" }: { id: string; label?: string }) => (
  <a
    href={CALCOM_BOOKING_LINK}
    target="_blank"
    rel="noopener noreferrer"
    className="liquid-glass-strong inline-flex items-center gap-3 px-8 py-4 rounded-full text-base font-medium text-white hover:scale-105 active:scale-95 transition-transform duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
    style={{ fontFamily: "'Poppins', sans-serif" }}
    id={id}
  >
    {label}
    <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
      <ArrowRight className="w-4 h-4" />
    </span>
  </a>
);

const SergeyIgnition = () => {
  const location = useLocation();
  const inShell = location.pathname.startsWith("/game/");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    document.title = "Pull + AI = Breakthrough — Sergey Jay Makarov";
    return () => { document.title = "Evolver"; };
  }, []);

  const content = (
    <div className="relative min-h-screen bg-black text-white overflow-hidden" id="sergey-page" style={{ fontFamily: "'Poppins', sans-serif" }}>

      {/* ═══════════════════════════════════════════════
          VIDEO BACKGROUND
          ═══════════════════════════════════════════════ */}
      <HlsBackground />
      <div className="fixed inset-0 bg-black/50 z-[1]" aria-hidden="true" />

      {/* ═══════════════════════════════════════════════
          CONTENT LAYER
          ═══════════════════════════════════════════════ */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 md:px-6 py-16 space-y-12">

        {/* ═══════════════════════════════════════════════
            S1: HERO — Recognition Trigger
            ═══════════════════════════════════════════════ */}
        <header className="text-center space-y-6 pt-4" id="sergey-hero">
          <p className="text-xs text-white/50 uppercase tracking-[0.25em]">Sergey Jay Makarov · for tech leaders</p>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-[-0.05em] text-white leading-[1.1]" style={{ fontFamily: "'Poppins', sans-serif" }}>
            You're Pushing Harder.{" "}
            <span className="text-white" style={{ textShadow: "0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(255,255,255,0.2)" }}>
              It's Paying Off Less.
            </span>
            <br />What If the Answer Is the Opposite?
          </h1>

          <p className="text-base text-white/90 max-w-lg mx-auto leading-relaxed">
            You work 80 hours. Slack is on fire. You KNOW what truly drives you—but there's no time because "fires first." Push got you here. Push won't get you there.
          </p>

          <p className="text-sm text-white/75 max-w-sm mx-auto leading-relaxed">
            What if the thing you do for free—the thing that lights you up—IS the business? And AI is the superpower that makes it unstoppable?
          </p>

          <p className="text-xs text-white/55 max-w-sm mx-auto leading-relaxed italic">
            Pull + AI = Breakthrough.<br />Not a theory. Tested on myself and others.
          </p>

          <div className="flex flex-col items-center gap-3 pt-2">
            <PrimaryCTA id="hero-cta-btn" />
            <span className="text-xs text-white/50">60 minutes. Your situation. No pitch.</span>
          </div>
        </header>

        {/* ═══════════════════════════════════════════════
            S2: QUALIFIER — Self-selection pills
            ═══════════════════════════════════════════════ */}
        <section className="text-center space-y-4" id="qualifier" aria-label="Who this is for">
          <h2 className="text-lg font-medium text-white/90 text-center tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>This is for you if</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              "You're a tech leader—founder, executive, PM—and push is no longer paying off",
              "You KNOW what lights you up, but there's no time because fires come first",
              "AI is a 'helpful tool' for you—but you sense it could be a superpower",
              "You feel: something has to change, and the window is now",
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
            S3: MASTER RESULT — one sentence
            ═══════════════════════════════════════════════ */}
        <section className="text-center space-y-4" id="master-result" aria-label="The master transformational result">
          <div className="liquid-glass-strong rounded-3xl p-6 md:p-8 space-y-4">
            <p className="text-xs text-white/40 uppercase tracking-widest">The Journey</p>
            <p className="text-base md:text-lg text-white/95 leading-relaxed font-medium max-w-lg mx-auto">
              You stop pushing harder at the wrong thing and start building from what lights you up—with AI as your superpower—and both you and your team deliver results that push alone could never produce.
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S4: HOW IT WORKS — 3 glass step cards
            ═══════════════════════════════════════════════ */}
        <section className="space-y-5" id="how-it-works" aria-label="How it works">
          <h2 className="text-lg font-medium text-white/90 text-center tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                emoji: "🔍",
                step: "1",
                title: "Find your Pull",
                desc: "In 60 minutes, we identify what truly drives you—the thing you do for free that IS the business. Not theory. On YOUR situation.",
              },
              {
                emoji: "⚡",
                step: "2",
                title: "AI becomes your superpower",
                desc: "Not a 'helpful assistant.' A force multiplier. You + AI = results a team of 15 couldn't produce. I show you how on your actual work.",
              },
              {
                emoji: "🚀",
                step: "3",
                title: "Your team transforms",
                desc: "The same breakthrough scales to your team. Small team, burning eyes, AI-native. Outstanding—not just good. Pull + AI = breakthrough for everyone.",
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
                title: "Your Pull identified—concretely, on your situation",
                desc: "Not 'find your passion.' The specific thing you already do that drives results when you're lit up. Named. Seen. Undeniable."
              },
              {
                title: "AI as superpower—demonstrated on YOUR work",
                desc: "In the session, you see what AI does when paired with your pull. Not slides. Not theory. On your actual challenges."
              },
              {
                title: "The path from 'most expensive executor' to breakthrough leader",
                desc: "You stop towing the entire company on your back. Your team of 5 delivers what used to take 15. Push dissolves. Pull takes over."
              },
              {
                title: "One clear next step: the Sprint",
                desc: "If this lands, I bring the same breakthrough to your team. 3–6 weeks. AI-native. Pull-driven culture. Measurable results."
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
            S6: THE TRANSFORMATION — A → B sub-results
            ═══════════════════════════════════════════════ */}
        <section id="transformation" aria-label="The transformation" className="space-y-4">
          <h2 className="text-lg font-medium text-white/90 text-center tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>The Three Shifts</h2>
          <div className="liquid-glass rounded-3xl p-6 md:p-8 space-y-6">
            {[
              {
                from: "Day burns on fires and other people's tasks. Push harder = worse returns.",
                to: "Pull activated. You spend your day on what truly drives results. AI handles the rest. You set the rhythm.",
                label: "Pull Activated"
              },
              {
                from: "AI = helpful assistant. Saves time on tasks. Nice to have.",
                to: "AI = superpower. You're a superhero. One person + AI agents = a team that didn't exist before. 2–5× on what you do best.",
                label: "AI as Superpower"
              },
              {
                from: "Team scattered, overloaded, executing without fire. \"More people + control = results.\"",
                to: "Small team, burning eyes, AI-native. Outstanding—not good. Everyone doing their best work. Pull + AI = breakthrough.",
                label: "Team Breakthrough"
              },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <p className="text-xs text-white/40 uppercase tracking-widest">{item.label}</p>
                <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-start">
                  <p className="text-xs text-white/50 leading-relaxed italic">"{item.from}"</p>
                  <ArrowRight className="w-4 h-4 text-white/30 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-white/80 leading-relaxed">{item.to}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S7: THE PATH — Value Ladder silhouette
            ═══════════════════════════════════════════════ */}
        <section id="the-path" aria-label="The path forward" className="space-y-4">
          <h2 className="text-lg font-medium text-white/90 text-center tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>The Path</h2>
          <div className="space-y-3">
            {[
              {
                icon: <Compass className="w-4 h-4 text-white/70" />,
                step: "Start here",
                title: "Gift Session",
                desc: "60–90 minutes, 1-on-1. I show you your pull, how AI amplifies it, and what your first breakthrough looks like. On your situation—not theory.",
                tag: "Free (first 10)",
              },
              {
                icon: <Flame className="w-4 h-4 text-white/70" />,
                step: "For your team",
                title: "The Sprint",
                desc: "3–6 weeks. I bring the same breakthrough to your team. Every member finds their pull + AI. Measurable: team of 5 delivers what used to take 15.",
                tag: "$5K–15K",
              },
              {
                icon: <Star className="w-4 h-4 text-white/70" />,
                step: "Ongoing",
                title: "Advisory",
                desc: "Monthly. I help you scale pull + AI culture across teams and departments. Strategic partner for the AI-native transformation.",
                tag: "$2–5K/mo",
              },
            ].map((item, i) => (
              <div key={i} className="liquid-glass rounded-2xl p-5 flex items-start gap-4 hover:scale-[1.02] transition-transform duration-200">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-white/40 uppercase tracking-widest">{item.step}</p>
                    <span className="text-[10px] text-white/50 bg-white/5 px-2 py-0.5 rounded-full">{item.tag}</span>
                  </div>
                  <p className="text-sm text-white/95 font-medium mt-1">{item.title}</p>
                  <p className="text-xs text-white/50 leading-relaxed mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S8: ABOUT SERGEY — trust anchor
            ═══════════════════════════════════════════════ */}
        <section id="about-section" aria-label="About Sergey" className="relative pt-8">
          <div className="w-20 h-20 rounded-full bg-white/5 border-2 border-white/10 mx-auto relative z-10 flex items-center justify-center text-2xl">
            🔥
          </div>
          <div className="liquid-glass rounded-3xl p-6 md:p-8 pt-14 -mt-10 text-center">
            <p className="text-sm text-white/70 leading-relaxed">
              &nbsp;
            </p>
            <p className="text-sm text-white/70 leading-relaxed">
              15 years building systems in tech—for startups, corporations, and everything between. I built beautifully. With soul. With precision. But I was building the wrong thing.
            </p>
            <p className="text-sm text-white/70 leading-relaxed mt-3">
              I was selling boring workflow automation to clients while doing the real work—synthesizing frameworks for human development, helping people find their path—for free. "Who would pay for what I do for myself?"
            </p>
            <p className="text-sm text-white/70 leading-relaxed mt-3">
              Everyone, it turns out. Because that IS the business. Pull + AI = breakthrough. I lived it. Now I help other tech leaders see it—on their own situation, in 60 minutes.
            </p>
            <p className="text-xs text-white/55 mt-4">
              — <em style={{ fontFamily: "'Source Serif 4', serif" }}>Sergey Jay Makarov</em>
            </p>
            <p className="text-xs text-white/35 mt-1">
              Beauty Builder for Human Development · Serial Tech Founder · System Architect
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S9: SOCIAL PROOF — myth line
            ═══════════════════════════════════════════════ */}
        <section className="text-center space-y-4" id="social-proof" aria-label="The myth">
          <div className="liquid-glass rounded-3xl p-6 md:p-8">
            <p className="text-sm text-white/70 leading-relaxed italic max-w-md mx-auto">
              "Good work pays less each year. Push is a dead end. AI is not a helper—it's a superpower. Pull + AI = breakthrough."
            </p>
            <p className="text-xs text-white/40 mt-3">— The Work Ethic Myth, Inverted</p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S10: PRICING — CTA + resonance permission
            ═══════════════════════════════════════════════ */}
        <section className="liquid-glass-strong rounded-[2.5rem] p-8 md:p-10 text-center space-y-5" id="pricing-section" aria-label="Next step">
          <div>
            <h2 className="text-2xl md:text-3xl font-medium text-white tracking-tight mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Ready to See What Pull + AI Looks Like—On You?
            </h2>
            <p className="text-xs text-white/45">60 minutes. Your situation. Your team. No pitch. No strings.</p>
          </div>

          <PrimaryCTA id="book-session-btn" />

          <div className="flex flex-col items-center gap-3 pt-1">
            <a
              href={CALCOM_CLARITY_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="liquid-glass inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm text-white/80 hover:text-white hover:scale-105 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              Have questions? Let's talk first
            </a>
          </div>

          {/* Resonance Permission Principle */}
          <p className="text-xs text-white/40 max-w-sm mx-auto leading-relaxed italic pt-2">
            Only proceed if something in you says "it's time." If it's not the right moment, trust that. The window will be here when you're ready.
          </p>
        </section>

        {/* ═══════════════════════════════════════════════
            S11: FAQ — glass accordions
            ═══════════════════════════════════════════════ */}
        <section className="space-y-2" id="faq-section" aria-label="Frequently asked questions">
          <h2 className="text-lg font-medium text-white/90 text-center mb-4 tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Questions</h2>
          {[
            {
              q: "What do you mean by 'Pull + AI = Breakthrough'?",
              a: "Push = working harder through force on things that drain you. Pull = doing what naturally drives you at a high level. AI = the force multiplier that makes one person's pull output what a team of 15 couldn't produce through push. Together: breakthrough results with less effort, more energy."
            },
            {
              q: "I'm an executive. How is this different from leadership coaching?",
              a: "Coaching asks 'how do I do my current job better?' This asks 'what if the job itself should change?' I don't optimize your push. I help you find your pull, connect it to AI at superpower level, and show you what happens when your team does the same."
            },
            {
              q: "Will this actually work for my team?",
              a: "The Gift Session works on YOU first. You see the breakthrough on your own situation. Then—if you see it—the Sprint brings the same process to your team. Same tools, same framework. Team of 5 delivers what used to take 15."
            },
            {
              q: "What if I don't have time for this right now?",
              a: "That's the push talking. 'Fires first, always fires first.' The Gift Session is 60 minutes. If you genuinely don't have 60 minutes—that IS the problem this solves. But if the timing isn't right, trust that too."
            },
            {
              q: "Is this only for tech?",
              a: "The methodology works across industries—but my beachhead is tech leaders (founders, executives, PMs) because that's my world. 15 years. I speak the language. I know the pain. I've lived it."
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
            S12: BOTTOM CTA
            ═══════════════════════════════════════════════ */}
        <div className="text-center space-y-3" id="bottom-cta">
          <p className="text-sm text-white/65 max-w-sm mx-auto leading-relaxed">
            The rules changed.<br />Push won't save you. Pull + AI will.
          </p>
          <PrimaryCTA id="bottom-cta-btn" />
        </div>

        {/* Bottom spacing */}
        <div className="h-8" />
      </div>
    </div>
  );

  if (inShell) return <GameShellV2>{content}</GameShellV2>;
  return content;
};

export default SergeyIgnition;
