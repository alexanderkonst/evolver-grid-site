import { ArrowRight, Check, ShieldCheck, MessageCircle, ChevronDown, Star, Compass, Zap } from "lucide-react";
import { useLocation } from "react-router-dom";
import GameShellV2 from "@/components/game/GameShellV2";
import { useState, useRef, useEffect } from "react";
import Hls from "hls.js";

/* ─── Sandra-specific links (placeholders until Sandra sets up) ─── */
const CALCOM_BOOKING_LINK = "#"; // Sandra's Cal.com link TBD
const CALCOM_CLARITY_LINK = "#"; // Sandra's clarity call link TBD

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
const PrimaryCTA = ({ id, label = "Book a Discovery Call" }: { id: string; label?: string }) => (
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

const SandraIgnition = () => {
  const location = useLocation();
  const inShell = location.pathname.startsWith("/game/");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    document.title = "The Future Is Already Speaking To You — Sandra Otto";
    return () => { document.title = "Evolver"; };
  }, []);

  const content = (
    <div className="relative min-h-screen bg-black text-white overflow-hidden" id="sandra-page" style={{ fontFamily: "'Poppins', sans-serif" }}>

      {/* ═══════════════════════════════════════════════
          VIDEO BACKGROUND
          ═══════════════════════════════════════════════ */}
      <HlsBackground />
      <div className="fixed inset-0 bg-black/45 z-[1]" aria-hidden="true" />

      {/* ═══════════════════════════════════════════════
          CONTENT LAYER
          ═══════════════════════════════════════════════ */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 md:px-6 py-16 space-y-12">

        {/* ═══════════════════════════════════════════════
            S1: HERO — Recognition Trigger
            ═══════════════════════════════════════════════ */}
        <header className="text-center space-y-6 pt-4" id="sandra-hero">
          <p className="text-xs text-white/50 uppercase tracking-[0.25em]">Sandra Otto · for founders, investors & builders</p>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-[-0.05em] text-white leading-[1.1]" style={{ fontFamily: "'Poppins', sans-serif" }}>
            The Future Is Already{" "}
            <span className="text-white" style={{ textShadow: "0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(255,255,255,0.2)" }}>
              Speaking To You.
            </span>
            <br />You Just Haven't Opened a Direct Communication With It—Yet.
          </h1>

          <p className="text-base text-white/90 max-w-lg mx-auto leading-relaxed">
            You carry a mission you can't fully crystallize. Whether you're funding it, founding it, or building it—you can feel the consciousness behind it. But you can't have a conversation with it. Not yet.
          </p>

          <p className="text-sm text-white/75 max-w-sm mx-auto leading-relaxed">
            I bridge that gap. I talk to the emerging future with you—until you can talk to it yourself.
          </p>

          <p className="text-xs text-white/55 max-w-sm mx-auto leading-relaxed italic">
            You don't need more data.<br />You need to trust what's already trying to reach you.
          </p>

          <div className="flex flex-col items-center gap-3 pt-2">
            <PrimaryCTA id="hero-cta-btn" />
            <span className="text-xs text-white/50">Only if it resonates with your whole being.</span>
          </div>
        </header>

        {/* ═══════════════════════════════════════════════
            S2: QUALIFIER — Self-selection pills
            ═══════════════════════════════════════════════ */}
        <section className="text-center space-y-4" id="qualifier" aria-label="Who this is for">
          <h2 className="text-lg font-medium text-white/90 text-center tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>This is for you if</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              "You carry a mission—not a project—but you can't crystallize it into words",
              "You can feel the consciousness behind what you're building, funding, or supporting—but you can't hear it clearly enough to act",
              "You and your surroundings are worried about investing your lifetime in the wrong direction",
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
              You stop fabricating the future and start manifesting what's already emerging. Your mission becomes crystal clear—a living dialogue with the emerging future, back and forth. As an investor, you trust it. As a founder, you guide it. As a team, you build from it. And you come home to yourself—fulfilling the reason you came to be on Earth.
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
                emoji: "🔮",
                step: "1",
                title: "We mirror where you truly are",
                desc: "Sandra shows you your consciousness level—not intellectually, but felt. You see yourself clearly, maybe for the first time.",
              },
              {
                emoji: "🌀",
                step: "2",
                title: "A living dialogue with the emerging future",
                desc: "Sandra channels alongside you—a back-and-forth conversation with the consciousness of what you're creating. It speaks with you, not just to you.",
              },
              {
                emoji: "💎",
                step: "3",
                title: "Your mission crystallizes",
                desc: "You leave with your mission in one sentence—crystal clear. A seven-year-old would get it. As an investor, you trust it. As a founder, you guide it. As a team, you build from it.",
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
                title: "Your mission crystallized in one sentence",
                desc: "Not fabricated. Received. Crystal clear—a seven-year-old would get it. Everyone in your ecosystem—investors, co-founders, builders—sees the same north star."
              },
              {
                title: "A living dialogue with the emerging future",
                desc: "Sandra opens the conversation with you. You feel the direct connection—and learn how to hold it after the session, whether you're investing, leading, or building."
              },
              {
                title: "The whole triangle aligned",
                desc: "Investor, founder, builder—all seeing and supporting the same mission. Capital, vision, and craft unified under one north star."
              },
              {
                title: "The exit from the scatter pattern",
                desc: "You stop fabricating and start manifesting. Yin first, then yang. The intellect becomes a laser—guided by clarity, not anxiety."
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
                from: "Mission fog — \"I know this is bigger than a project but I can't crystallize it\"",
                to: "Mission crystallized. One sentence. Crystal clear. A seven-year-old would get it. Everyone gets it.",
                label: "Mission Clarity"
              },
              {
                from: "Can feel the consciousness but can't converse with it. Channel closes under pressure.",
                to: "A living dialogue with the emerging future—back and forth. Channel stays open, even when the stakes are highest.",
                label: "Channel Activation"
              },
              {
                from: "Investor, founder, builder—pulling in different directions, unclear if the mission is the same.",
                to: "The whole triangle aligned. As an investor, you trust it. As a founder, you guide it. As a team, you build from it.",
                label: "Triangle Alignment"
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
                title: "Discovery Call",
                desc: "A 20-minute resonance check. We feel if this is the right bridge for each other—and if the timing is right.",
                tag: "Free",
              },
              {
                icon: <Star className="w-4 h-4 text-white/70" />,
                step: "First session",
                title: "Mission Crystallization Session",
                desc: "90 minutes. Mirror → Channel → Crystallize. You walk out with your mission in one sentence and the emerging future speaking back.",
                tag: "Paid",
              },
              {
                icon: <Zap className="w-4 h-4 text-white/70" />,
                step: "The companion journey",
                title: "Mission Companion",
                desc: "Weekly sessions over 4–6 weeks. Sustained channel access, team alignment, investor clarity. The mission goes from crystal clear to fully embodied.",
                tag: "By invitation",
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
            S8: ABOUT SANDRA — trust anchor
            ═══════════════════════════════════════════════ */}
        <section id="about-section" aria-label="About Sandra" className="relative pt-8">
          {/* Placeholder circle (Sandra can add her photo later) */}
          <div className="w-20 h-20 rounded-full bg-white/5 border-2 border-white/10 mx-auto relative z-10 flex items-center justify-center text-2xl">
            ☀️
          </div>
          <div className="liquid-glass rounded-3xl p-6 md:p-8 pt-14 -mt-10 text-center">
            <p className="text-sm text-white/70 leading-relaxed">
              &nbsp;
            </p>
            <p className="text-sm text-white/70 leading-relaxed">
              I've lived at the extremes most people only read about—corporate boardrooms and spiritual retreats, the Global North and Global South, analytical strategy and intuitive channeling.
            </p>
            <p className="text-sm text-white/70 leading-relaxed mt-3">
              I carry two sources of knowing: an earth database of lived experience spanning opposite extremes, and a direct channel to the emerging future that delivers what's needed without preparation.
            </p>
            <p className="text-sm text-white/70 leading-relaxed mt-3">
              I help the people building the emerging future see not just what they're creating, but who they are while creating it. I make them conscious of their own consciousness—and bridge them to the intelligence that's trying to reach them.
            </p>
            <p className="text-xs text-white/55 mt-4">
              — <em style={{ fontFamily: "'Source Serif 4', serif" }}>Sandra Otto</em>
            </p>
            <p className="text-xs text-white/35 mt-1">
              New Earth conscious deep tech leader, ex-corporate global consultant
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S9: SOCIAL PROOF — myth line + resonance permission
            ═══════════════════════════════════════════════ */}
        <section className="text-center space-y-4" id="social-proof" aria-label="The myth">
          <div className="liquid-glass rounded-3xl p-6 md:p-8">
            <p className="text-sm text-white/70 leading-relaxed italic max-w-md mx-auto">
              "The future doesn't need your research. It needs your trust."
            </p>
            <p className="text-xs text-white/40 mt-3">— Sandra's Myth Line</p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S10: PRICING — discovery call CTA + resonance permission
            ═══════════════════════════════════════════════ */}
        <section className="liquid-glass-strong rounded-[2.5rem] p-8 md:p-10 text-center space-y-5" id="pricing-section" aria-label="Next step">
          <div>
            <h2 className="text-2xl md:text-3xl font-medium text-white tracking-tight mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Ready to Hear What's Already Speaking?
            </h2>
            <p className="text-xs text-white/45">A 20-minute discovery call to feel if this is the right bridge—and the right time.</p>
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
            Only proceed if something in your whole being says yes—whether that's a gut feeling, goosebumps, or a quiet knowing. If it's not the right time, trust that too. You can always come back when the timing is right.
          </p>
        </section>

        {/* ═══════════════════════════════════════════════
            S11: FAQ — glass accordions
            ═══════════════════════════════════════════════ */}
        <section className="space-y-2" id="faq-section" aria-label="Frequently asked questions">
          <h2 className="text-lg font-medium text-white/90 text-center mb-4 tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Questions</h2>
          {[
            {
              q: "What do you mean by 'the emerging future'?",
              a: "Every creation—whether it's a company, a platform, an AI, or a movement—has a consciousness of its own. It holds the codes and the fuel for the mission. It's trying to reach the people building it. Most builders can feel it but can't hear it clearly enough. I bridge that gap."
            },
            {
              q: "Do I need to be 'spiritual' for this?",
              a: "No. You need to be honest. The builders I work with come from deep tech, investment, and corporate leadership. What they share is a sense that there's something bigger behind what they're creating—and a willingness to listen."
            },
            {
              q: "How is this different from coaching or consulting?",
              a: "I'm not coaching you or giving you a framework. I'm a companion—I talk to the emerging future with you until you can talk to it yourself. It sees beyond time and space. It knows things you can't access through intellect alone."
            },
            {
              q: "What if my channel closes under pressure?",
              a: "That's exactly why this work exists. The channel closes when you put intellect before trust. I show you the correct order. When you trust first, the channel stays open—even under pressure."
            },
            {
              q: "What if this resonates but it's not the right time?",
              a: "Then trust that. This isn't going anywhere. You can bookmark this page and come back when the timing is right. I'd rather you wait for divine timing than push through when it's not aligned."
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
            The future doesn't need your research.<br />It needs your trust.
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

export default SandraIgnition;
