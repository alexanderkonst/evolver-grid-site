import { ArrowRight, Check, MessageCircle, ChevronDown, Star, Compass, Flame, Target, Zap, UserCheck } from "lucide-react";
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
const PrimaryCTA = ({ id, label = "See My Leverage Map" }: { id: string; label?: string }) => (
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
      <div className="fixed inset-0 bg-black/55 z-[1]" aria-hidden="true" />

      {/* ═══════════════════════════════════════════════
          CONTENT LAYER
          ═══════════════════════════════════════════════ */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 md:px-6 py-16 space-y-12">

        {/* ═══════════════════════════════════════════════
            S1: HERO — Godfather Recognition Trigger
            ═══════════════════════════════════════════════ */}
        <header className="text-center space-y-6 pt-4" id="sergey-hero">
          <p className="text-xs text-white/50 uppercase tracking-[0.25em]">Sergey Jay Makarov · for tech leaders</p>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-[-0.05em] text-white leading-[1.1]" style={{ fontFamily: "'Poppins', sans-serif" }}>
            You're Working 80 Hours—
            <br />
            <span className="text-white" style={{ textShadow: "0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(255,255,255,0.2)" }}>
              And Your Team Still Can't Keep Up.
            </span>
          </h1>

          <p className="text-base text-white/90 max-w-lg mx-auto leading-relaxed">
            It's not a workload problem. You're building the wrong thing.
          </p>

          <p className="text-sm text-white/75 max-w-md mx-auto leading-relaxed">
            You're solving fires all day. Slack never stops.
            And the more you push—the worse the returns get.
          </p>

          <p className="text-sm text-white/75 max-w-md mx-auto leading-relaxed">
            You already know what actually drives results.
            But it's buried under "fires first."
          </p>

          <div className="liquid-glass rounded-2xl p-5 max-w-md mx-auto text-left space-y-3">
            <p className="text-xs text-white/40 uppercase tracking-widest text-center">The inversion</p>
            <p className="text-sm text-white/90 leading-relaxed">
              The thing you do for free… <strong>is the business.</strong>
              <br />And AI turns it into a force multiplier.
            </p>
            <p className="text-xs text-white/60 leading-relaxed">
              In 60 minutes, you'll see how to turn your current team into a 2–5× output machine—without hiring. No theory. No slides. On your actual work.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 pt-2">
            <PrimaryCTA id="hero-cta-btn" />
            <span className="text-xs text-white/40">Private diagnostic. Limited spots monthly.</span>
          </div>
        </header>

        {/* ═══════════════════════════════════════════════
            S2: QUALIFIER — Self-selection pills
            ═══════════════════════════════════════════════ */}
        <section className="text-center space-y-4" id="qualifier" aria-label="Who this is for">
          <h2 className="text-lg font-medium text-white/90 text-center tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>This is for you if</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              "You're a founder, exec, or PM—and you're still the bottleneck",
              "You're working harder than ever, but results are flattening",
              "Your team depends on you too much",
              "AI feels useful—but nowhere near its full potential",
              "You know something has to change—and soon",
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
            S3: WHAT HAPPENS — Live diagnostic
            ═══════════════════════════════════════════════ */}
        <section className="space-y-4" id="what-happens" aria-label="What happens in the session">
          <div className="text-center space-y-2">
            <h2 className="text-lg font-medium text-white/90 tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>What Happens in 60 Minutes</h2>
            <p className="text-xs text-white/50">This is not coaching. This is a live diagnostic + leverage rebuild.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                emoji: "🎯",
                step: "1",
                title: "Find Your Pull",
                desc: "We identify the exact function you should be building around—the thing you already do that drives disproportionate results. Not 'passion.' Leverage.",
              },
              {
                emoji: "⚡",
                step: "2",
                title: "AI as Force Multiplier",
                desc: "We apply AI directly to your real work. You'll see what disappears from your workload, what gets amplified, and what gets automated instantly.",
              },
              {
                emoji: "🔄",
                step: "3",
                title: "Team Reconfiguration",
                desc: "We map how your team shifts around your pull + AI. Result: less control, less dependency, more output.",
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
                <p className="text-xs text-white/55 leading-relaxed">{item.desc}</p>
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
            <p className="text-xs text-white/45 mb-4">In 60 minutes, you'll have:</p>
            <div className="space-y-4">
              {[
                {
                  title: "The ONE function you should never be doing again",
                  desc: ""
                },
                {
                  title: "A live example of AI replacing 30–50% of your current workload",
                  desc: ""
                },
                {
                  title: "The bottleneck silently killing your team output",
                  desc: ""
                },
                {
                  title: "A clear 30-day path to double output without adding headcount",
                  desc: ""
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white/80" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm text-white/95 font-medium">{item.title}</p>
                    {item.desc && <p className="text-xs text-white/55 leading-relaxed mt-0.5">{item.desc}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S5: THE THREE SHIFTS — A → B
            ═══════════════════════════════════════════════ */}
        <section id="transformation" aria-label="The three shifts" className="space-y-4">
          <h2 className="text-lg font-medium text-white/90 text-center tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>The Three Shifts</h2>
          <div className="liquid-glass rounded-3xl p-6 md:p-8 space-y-6">
            {[
              {
                from: "You spend your day reacting. More effort = worse returns.",
                to: "You operate from what actually drives results. Everything else gets handled.",
                label: "From Push → Pull"
              },
              {
                from: "AI saves time on tasks.",
                to: "AI becomes your execution layer. You + AI = output that didn't exist before.",
                label: "From AI Tool → AI Superpower"
              },
              {
                from: "You are the system.",
                to: "The system runs—with you as the multiplier, not the constraint.",
                label: "From Bottleneck → Leveraged Leader"
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
            S6: REALITY CHECK
            ═══════════════════════════════════════════════ */}
        <section className="text-center space-y-3" id="reality-check" aria-label="Reality check">
          <div className="liquid-glass rounded-3xl p-6 md:p-8 space-y-3">
            <p className="text-sm text-white/80 font-medium leading-relaxed">
              Push got you here.<br />Push will not get you there.
            </p>
            <p className="text-xs text-white/50 leading-relaxed">
              More effort will not fix a structural problem.
            </p>
          </div>
        </section>


        {/* ═══════════════════════════════════════════════
            S8: THE SPRINT — next step if it lands
            ═══════════════════════════════════════════════ */}
        <section id="the-path" aria-label="The path forward" className="space-y-4">
          <h2 className="text-lg font-medium text-white/90 text-center tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>The Next Step (If This Lands)</h2>
          <p className="text-xs text-white/50 text-center">We take the same transformation to your team.</p>
          <div className="space-y-3">
            {[
              {
                icon: <Compass className="w-4 h-4 text-white/70" />,
                step: "Start here",
                title: "Leverage Map Session",
                desc: "60 minutes, 1-on-1. Live diagnostic on your actual system. Walk out seeing the path.",
                tag: "Free (limited)",
              },
              {
                icon: <Flame className="w-4 h-4 text-white/70" />,
                step: "For your team",
                title: "The Sprint",
                desc: "3–6 weeks. Every team member aligned to their highest leverage. AI embedded into daily execution. Measurable output increase. A team of 5 doing what used to take 15.",
                tag: "$5K–15K",
              },
              {
                icon: <Star className="w-4 h-4 text-white/70" />,
                step: "Ongoing",
                title: "Advisory",
                desc: "Monthly strategic partner for scaling pull + AI culture across teams and departments.",
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
            S9: ABOUT SERGEY — trust anchor
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
              15 years building systems across startups and corporations. Built everything: clean, precise, high-performing.
            </p>
            <p className="text-sm text-white/80 leading-relaxed mt-3 font-medium">
              But wrong.
            </p>
            <p className="text-sm text-white/70 leading-relaxed mt-3">
              I was optimizing systems that shouldn't exist. Meanwhile, the real work—helping people see what they should actually be building—I was doing for free.
            </p>
            <p className="text-sm text-white/70 leading-relaxed mt-3">
              That was the business.
            </p>
            <p className="text-sm text-white/70 leading-relaxed mt-3">
              Now I help leaders find their pull, apply AI correctly, and build teams that outperform without burning out.
            </p>
            <p className="text-xs text-white/55 mt-4">
              — <em style={{ fontFamily: "'Source Serif 4', serif" }}>Sergey Jay Makarov</em>
            </p>
            <p className="text-xs text-white/35 mt-1">
              Beauty Builder · System Architect · 15 Years in Tech
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S10: FINAL CTA
            ═══════════════════════════════════════════════ */}
        <section className="liquid-glass-strong rounded-[2.5rem] p-8 md:p-10 text-center space-y-5" id="pricing-section" aria-label="Next step">
          <div>
            <h2 className="text-2xl md:text-3xl font-medium text-white tracking-tight mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
              If you're still the hardest-working person on your team—
            </h2>
            <p className="text-base text-white/70 font-medium">You're the bottleneck.</p>
            <p className="text-xs text-white/45 mt-2">Let's fix that.</p>
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

          <p className="text-xs text-white/40 max-w-sm mx-auto leading-relaxed italic pt-2">
            Private diagnostic. Limited spots available.
          </p>
        </section>

        {/* ═══════════════════════════════════════════════
            S11: FAQ — glass accordions (tightened)
            ═══════════════════════════════════════════════ */}
        <section className="space-y-2" id="faq-section" aria-label="Frequently asked questions">
          <h2 className="text-lg font-medium text-white/90 text-center mb-4 tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Questions</h2>
          {[
            {
              q: "Is this coaching?",
              a: "No. This is a working session on your actual system."
            },
            {
              q: "Will this work for my team?",
              a: "If your team depends on you too much—yes."
            },
            {
              q: "Do I need to be technical in AI?",
              a: "No. That's the point."
            },
            {
              q: "What if I don't have time?",
              a: "That's exactly why this exists."
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
            S12: FOOTER BRIDGE
            ═══════════════════════════════════════════════ */}
        <div className="text-center space-y-3" id="bottom-cta">
          <div className="liquid-glass rounded-2xl p-5 max-w-md mx-auto">
            <p className="text-xs text-white/50 leading-relaxed">
              If your bottleneck isn't systems—but something deeper—<br />I'll point you to the right person.
            </p>
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

export default SergeyIgnition;
