import { ArrowRight, Check, MessageCircle, ChevronDown, Star, Compass, Flame, Eye, Heart, Shield } from "lucide-react";
import { useLocation } from "react-router-dom";
import GameShellV2 from "@/components/game/GameShellV2";
import { useState, useRef, useEffect } from "react";
import Hls from "hls.js";

/* ─── Oyi-specific links (placeholders until Oyi sets up) ─── */
const CALCOM_BOOKING_LINK = "#"; // Oyi's booking link TBD
const CALCOM_CLARITY_LINK = "#"; // Oyi's clarity call link TBD

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
const PrimaryCTA = ({ id, label = "See My Map" }: { id: string; label?: string }) => (
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

const OyiIgnition = () => {
  const location = useLocation();
  const inShell = location.pathname.startsWith("/game/");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    document.title = "Sovereignty Restored — Oyi Sun";
    return () => { document.title = "Evolver"; };
  }, []);

  const content = (
    <div className="relative min-h-screen bg-black text-white overflow-hidden" id="oyi-page" style={{ fontFamily: "'Poppins', sans-serif" }}>

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
        <header className="text-center space-y-6 pt-4" id="oyi-hero">
          <p className="text-xs text-white/50 uppercase tracking-[0.25em]">Oyi Sun · for source path builders</p>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-[-0.05em] text-white leading-[1.1]" style={{ fontFamily: "'Poppins', sans-serif" }}>
            You Didn't Lose Yourself.
            <br />
            <span className="text-white" style={{ textShadow: "0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(255,255,255,0.2)" }}>
              You Traded Yourself.
            </span>
          </h1>

          <p className="text-base text-white/90 max-w-lg mx-auto leading-relaxed">
            Every step of &ldquo;growing up&rdquo; cost you power. Let's find where.
          </p>

          <div className="text-sm text-white/75 max-w-md mx-auto leading-relaxed space-y-3">
            <p>
              You carry two worlds inside you—the spiritual and the practical, the ancient and the modern.
            </p>
            <p>The world told you to pick one.</p>
            <p>You couldn't. Because both are real.</p>
          </div>

          <div className="text-sm text-white/60 max-w-sm mx-auto leading-relaxed space-y-1">
            <p>But somewhere along the way:</p>
            <p className="text-white/70">Joy left.</p>
            <p className="text-white/70">Peace left.</p>
            <p className="text-white/70">The light in your eyes started fading.</p>
          </div>

          <div className="liquid-glass rounded-2xl p-5 max-w-md mx-auto text-center space-y-3">
            <p className="text-sm text-white/90 leading-relaxed">
              You didn't lose it. You gave it away—piece by piece.
            </p>
            <p className="text-xs text-white/60 leading-relaxed">
              In 60 minutes, you'll see exactly where that happened—and what to do in the next 5 days to take it back.
            </p>
            <p className="text-xs text-white/45 leading-relaxed">
              No frameworks. No theory. No performance. Just truth.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 pt-2">
            <PrimaryCTA id="hero-cta-btn" />
            <span className="text-xs text-white/40">Private session. Limited availability.</span>
          </div>
        </header>

        {/* ═══════════════════════════════════════════════
            S2: QUALIFIER — Self-selection pills
            ═══════════════════════════════════════════════ */}
        <section className="text-center space-y-4" id="qualifier" aria-label="Who this is for">
          <h2 className="text-lg font-medium text-white/90 text-center tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>This is for you if</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              "You feel like you're not fully yourself anymore",
              "You've done the work—but something still feels off",
              "You're powerful… but not in control of your own life",
              "You give your best work away for free—and don't know why",
              "You feel both spiritual AND practical—and don't fit anywhere",
              "You hear 'Live Free'… and something in you wakes up",
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
            S3: WHAT HAPPENS — Read + Mirror + Reset
            ═══════════════════════════════════════════════ */}
        <section className="space-y-4" id="what-happens" aria-label="What happens in the session">
          <div className="text-center space-y-2">
            <h2 className="text-lg font-medium text-white/90 tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>What Happens in the Session</h2>
            <p className="text-xs text-white/50">This is not coaching. This is a read + mirror + reset.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                emoji: "👁",
                step: "1",
                title: "The Read",
                desc: "You give me your birthday. Before you say a word, I map your patterns, your pressure points, your natural path. Not guesswork. Pattern recognition from 24+ years across astrology and human design.",
              },
              {
                emoji: "🪞",
                step: "2",
                title: "The Mirror",
                desc: "I tell your story—through mine. The swamp. The survival. The lie running your life. Then I stop. And you see it.",
              },
              {
                emoji: "💊",
                step: "3",
                title: "The Prescription",
                desc: "I name your gift—the one you've been giving away for free. Then ONE move. One action. Five days. That's it.",
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
            S4: DELIVERABLES — Your Sovereignty Map
            ═══════════════════════════════════════════════ */}
        <section id="deliverables" aria-label="Session deliverables" className="space-y-4">
          <h2 className="text-lg font-medium text-white/90 text-center tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>What You Walk Out With</h2>
          <div className="liquid-glass-strong rounded-3xl p-6 md:p-8">
            <p className="text-xs text-white/45 mb-4">Your Sovereignty Map:</p>
            <div className="space-y-4">
              {[
                "The pattern that's been quietly running your life",
                "The exact moment you started giving your power away",
                "Your real decision-making system (not what you've been taught)",
                "The gift you've been undervaluing—and how it becomes income",
                "The ONE move to start reclaiming your life immediately",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white/80" aria-hidden="true" />
                  </div>
                  <p className="text-sm text-white/95 font-medium">{item}</p>
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
                from: "You follow systems, strategies, expectations that were never yours.",
                to: "You move from your own authority. No borrowed identity.",
                label: "From Control → Sovereignty"
              },
              {
                from: "Joy gone. Peace gone. Just functioning.",
                to: "Energy returns. Clarity returns. The light comes back.",
                label: "From Exhaustion → Aliveness"
              },
              {
                from: "Your most powerful work is free, hidden, or minimized.",
                to: "Your gift becomes your life—and your income.",
                label: "From Hiding Your Gift → Living From It"
              },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <p className="text-xs text-white/40 uppercase tracking-widest">{item.label}</p>
                <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-start">
                  <p className="text-xs text-white/50 leading-relaxed italic">&ldquo;{item.from}&rdquo;</p>
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
              You don't need another framework.
            </p>
            <p className="text-xs text-white/50 leading-relaxed">
              You need to see the truth you've been avoiding.
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S7: MICRO PROOF — social proof
            ═══════════════════════════════════════════════ */}
        <section className="space-y-4" id="micro-proof" aria-label="Testimonial">
          <h2 className="text-lg font-medium text-white/90 text-center tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Micro Proof</h2>
          <div className="liquid-glass-strong rounded-3xl p-6 md:p-8 space-y-4">
            <p className="text-sm text-white/70 leading-relaxed">
              Someone once sat down, gave me their birthday, and said:
            </p>
            <p className="text-base text-white/90 leading-relaxed font-medium italic" style={{ fontFamily: "'Source Serif 4', serif" }}>
              &ldquo;I've never felt this seen in my life.&rdquo;
            </p>
            <p className="text-sm text-white/70 leading-relaxed">
              Then they told me everything they'd been carrying—alone.
            </p>
            <p className="text-xs text-white/50 leading-relaxed italic mt-2">
              That's what happens when the pattern gets named.
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S8: THE PATH — next step if it lands
            ═══════════════════════════════════════════════ */}
        <section id="the-path" aria-label="The path forward" className="space-y-4">
          <h2 className="text-lg font-medium text-white/90 text-center tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>The Next Step (If This Lands)</h2>
          <p className="text-xs text-white/50 text-center">We don't stop at awareness.</p>
          <div className="space-y-3">
            {[
              {
                icon: <Eye className="w-4 h-4 text-white/70" />,
                step: "Start here",
                title: "The Mirror Session",
                desc: "60 minutes, 1-on-1. The read, the mirror, and your Sovereignty Map. Walk out seeing the pattern.",
                tag: "$555",
              },
              {
                icon: <Flame className="w-4 h-4 text-white/70" />,
                step: "Go deeper",
                title: "The Build",
                desc: "6 weeks. Your sovereignty restored, your inner child leading again, your business aligned to your actual gift. Outcome: your first aligned income—from being who you actually are.",
                tag: "$5,000",
              },
              {
                icon: <Star className="w-4 h-4 text-white/70" />,
                step: "Stay connected",
                title: "The Container",
                desc: "Monthly advisory. Sovereignty maintained. Accountability without performance.",
                tag: "$500/mo",
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
            S9: ABOUT OYI — trust anchor
            ═══════════════════════════════════════════════ */}
        <section id="about-section" aria-label="About Oyi" className="relative pt-8">
          <div className="w-20 h-20 rounded-full bg-white/5 border-2 border-white/10 mx-auto relative z-10 flex items-center justify-center text-2xl">
            🪷
          </div>
          <div className="liquid-glass rounded-3xl p-6 md:p-8 pt-14 -mt-10 text-center space-y-3">
            <p className="text-sm text-white/80 leading-relaxed font-medium">
              I didn't learn this from a book. I lived it.
            </p>
            <p className="text-xs text-white/60 leading-relaxed">
              Guns in my face. Car crashes. Domestic violence. Kidnapped by my own parents.
            </p>
            <p className="text-sm text-white/70 leading-relaxed mt-2">
              Survival forced me to read people before they spoke.
            </p>
            <p className="text-sm text-white/70 leading-relaxed">
              That became the gift.
            </p>
            <p className="text-xs text-white/55 leading-relaxed mt-2">
              Then came 24 years of refinement: astrology, human design, martial arts, storytelling, lineage teachings. Ten teachers. One method.
            </p>
            <p className="text-sm text-white/70 leading-relaxed mt-3">
              Now I help people find the power they never actually lost—just buried.
            </p>
            <p className="text-xs text-white/55 mt-4">
              — <em style={{ fontFamily: "'Source Serif 4', serif" }}>Oyi Sun</em>
            </p>
            <p className="text-xs text-white/35 mt-1">
              Lotus Medicine Man · 24 Years Reading People · Live Free
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S10: FINAL CTA
            ═══════════════════════════════════════════════ */}
        <section className="liquid-glass-strong rounded-[2.5rem] p-8 md:p-10 text-center space-y-5" id="pricing-section" aria-label="Next step">
          <div>
            <h2 className="text-2xl md:text-3xl font-medium text-white tracking-tight mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
              If this made you pause—even for a second—
            </h2>
            <p className="text-base text-white/70 font-medium">That's your signal.</p>
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
            Only proceed if this lands in your body, not your mind.
          </p>
        </section>

        {/* ═══════════════════════════════════════════════
            S11: FAQ — glass accordions (tightened)
            ═══════════════════════════════════════════════ */}
        <section className="space-y-2" id="faq-section" aria-label="Frequently asked questions">
          <h2 className="text-lg font-medium text-white/90 text-center mb-4 tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Questions</h2>
          {[
            {
              q: "Do I need to believe in astrology?",
              a: "No. You just need to be honest."
            },
            {
              q: "How can you know so much from a birthday?",
              a: "Patterns repeat. I've been reading them for 24 years."
            },
            {
              q: "What is a Sovereignty Map?",
              a: "A clear view of your patterns, your power, and your next move."
            },
            {
              q: "What if I've already done a lot of inner work?",
              a: "Then you'll recognize this faster."
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
              If your gift is clear—but execution is still stuck—<br />I'll show you who to talk to next.
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

export default OyiIgnition;
