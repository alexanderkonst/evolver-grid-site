import { ArrowRight, Check, ShieldCheck, MessageCircle, ChevronDown, Star, Compass, Zap, Heart } from "lucide-react";
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
const PrimaryCTA = ({ id, label = "Book a Mirror Session" }: { id: string; label?: string }) => (
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
    document.title = "The Swamp Grew the Lotus — Oyi Sun";
    return () => { document.title = "Evolver"; };
  }, []);

  const content = (
    <div className="relative min-h-screen bg-black text-white overflow-hidden" id="oyi-page" style={{ fontFamily: "'Poppins', sans-serif" }}>

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
        <header className="text-center space-y-6 pt-4" id="oyi-hero">
          <p className="text-xs text-white/50 uppercase tracking-[0.25em]">Oyi Sun · for source path builders</p>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-[-0.05em] text-white leading-[1.1]" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Remember When You{" "}
            <span className="text-white" style={{ textShadow: "0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(255,255,255,0.2)" }}>
              Used to Feel Alive?
            </span>
            <br />Before You "Got Serious."
          </h1>

          <p className="text-base text-white/90 max-w-lg mx-auto leading-relaxed">
            You carry two worlds inside you—the ancient and the modern, the spiritual and the practical. Everyone said pick one. You couldn't. Because both are real. And every step of "growing up" was a step of giving away your power.
          </p>

          <p className="text-sm text-white/75 max-w-sm mx-auto leading-relaxed">
            Joy left. Peace left. The light in your eyes is fading. You don't need another framework. You need to get the rust off.
          </p>

          <p className="text-xs text-white/55 max-w-sm mx-auto leading-relaxed italic">
            The swamp doesn't kill the lotus. The swamp IS the lotus.<br />And the lotus bows to no one.
          </p>

          <div className="flex flex-col items-center gap-3 pt-2">
            <PrimaryCTA id="hero-cta-btn" />
            <span className="text-xs text-white/50">If this lands in your body—not your mind—reach out.</span>
          </div>
        </header>

        {/* ═══════════════════════════════════════════════
            S2: QUALIFIER — Self-selection pills
            ═══════════════════════════════════════════════ */}
        <section className="text-center space-y-4" id="qualifier" aria-label="Who this is for">
          <h2 className="text-lg font-medium text-white/90 text-center tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>This is for you if</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              "You carry both ancient wisdom AND cutting-edge technology—the world says pick one",
              "Life forged you through real crisis—and the transformation wasn't theory, it was survival",
              "You're giving away your most powerful work for free because 'who would pay for just being me?'",
              "You hear 'Live Free' and something inside catches fire",
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
              You stop handing over your power to frameworks that were never yours, restore the sovereign you were born as, and build a business from the gift you've been giving away for free—joy, peace, and the light return because the rust is finally off.
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
                emoji: "🪞",
                step: "1",
                title: "The Read",
                desc: "Give me your birthday. Before you say a word, I read your chart—astrology, human design—and name three undeniable truths about you. You'll wonder how I know.",
              },
              {
                emoji: "🔥",
                step: "2",
                title: "The Mirror",
                desc: "I tell YOUR story through MY story. The swamp. The lotus. The lie running your life. The shadow you can't see from inside. Then silence. You pour out.",
              },
              {
                emoji: "🪷",
                step: "3",
                title: "The Prescription",
                desc: "I name your gift—the one you've been giving away for free. Then ONE action. A 5-day practice aligned to your design. No 90-day plan. One thing. Clean.",
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
            S5: DELIVERABLES — The Sovereignty Map
            ═══════════════════════════════════════════════ */}
        <section id="deliverables" aria-label="Session deliverables" className="space-y-4">
          <h2 className="text-lg font-medium text-white/90 text-center tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>What You Walk Out With: The Sovereignty Map</h2>
          <div className="liquid-glass-strong rounded-3xl p-6 md:p-8">
          <div className="space-y-4">
            {[
              {
                title: "The Swamp Named",
                desc: "Your South Node patterns spelled out. The loop you keep running. The poison you keep drinking. Why it feels comfortable but keeps you stuck. Not a character flaw—a structural pattern."
              },
              {
                title: "The Lotus Named",
                desc: "Your North Node purpose articulated with precision. The thing you've been avoiding because it's unfamiliar. Growth = the opposite of what you've mastered."
              },
              {
                title: "The Strategy Installed",
                desc: "Your Human Design type, strategy, and authority explained. A decision-making compass for life—not just business. 'Wait to respond.' 'Sleep on it.' 'Follow your authority, not your mind.'"
              },
              {
                title: "The Shadow Shown",
                desc: "The specific inversion running your life—the gift you give others but deny yourself. Named through testimony, not coaching. The cobbler finally sees his own shoes."
              },
              {
                title: "The Prescription",
                desc: "ONE action. A 5-day Tiny Challenge aligned to your design and your North Node. Not a business plan. One practice. When you complete it—that's the natural entry into The Build."
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
                from: "\"Grow up or get left behind.\" Every framework followed was a piece of sovereignty surrendered. Playing the businessman. Wearing the CEO mask.",
                to: "The lie is seen. Building from your own authority. No borrowed frameworks. Applied knowledge of self. Sovereignty restored.",
                label: "Sovereignty Restored"
              },
              {
                from: "Joy gone. Peace gone. Light in the eyes fading. The inner child abandoned, rained on, stopped knocking.",
                to: "Joy restored. Peace restored. The light returns. The inner child leads again. The rust is off. The car gleams.",
                label: "Inner Child Reinstated"
              },
              {
                from: "Giving away the most powerful work for free. \"Who's posing as the businessman?\" The teacher dies. The businessman wins.",
                to: "The teacher IS the business. Gift has a price. People are grateful to pay. The storytelling that hits at DNA level—THAT is the product.",
                label: "Teacher Becomes the Business"
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
                step: "The medicine",
                title: "Podcast & Cipher",
                desc: "Hear Oyi's story. If your body responds—if something catches fire—reach out. The medicine lands through conversation, not marketing.",
                tag: "Free",
              },
              {
                icon: <Star className="w-4 h-4 text-white/70" />,
                step: "First session",
                title: "The Mirror Session",
                desc: "60–75 minutes. 1-on-1. Chart read → Mirror → Silence → Gift named → Prescription. You walk out with your Sovereignty Map.",
                tag: "$555",
              },
              {
                icon: <Heart className="w-4 h-4 text-white/70" />,
                step: "The journey",
                title: "The Build",
                desc: "6 weeks. Full sovereignty restoration. Inner child reinstated. Business aligned to your gift. First paying client by Week 6.",
                tag: "$5,000",
              },
              {
                icon: <Zap className="w-4 h-4 text-white/70" />,
                step: "Ongoing",
                title: "The Container",
                desc: "Advisory. Light touch, biweekly. Astrology timing check-ins. 'Is this from emotional clarity?' The medicine man watches the garden grow.",
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
            S8: ABOUT OYI — trust anchor
            ═══════════════════════════════════════════════ */}
        <section id="about-section" aria-label="About Oyi" className="relative pt-8">
          <div className="w-20 h-20 rounded-full bg-white/5 border-2 border-white/10 mx-auto relative z-10 flex items-center justify-center text-2xl">
            🪷
          </div>
          <div className="liquid-glass rounded-3xl p-6 md:p-8 pt-14 -mt-10 text-center">
            <p className="text-sm text-white/70 leading-relaxed">
              &nbsp;
            </p>
            <p className="text-sm text-white/70 leading-relaxed">
              I was a crisis magnet with no skills to cope, who had to hide and lie to survive. Car accidents. Guns in my face. Domestic violence. Kidnapped by my parents. Making grown-man decisions at twelve. No one to nurture, care, or protect.
            </p>
            <p className="text-sm text-white/70 leading-relaxed mt-3">
              That was my swamp. And now I am a Lotus Flower. Because that's what Lotus does—it grows. Ten teachers across 24 years forged the medicine: astrology, human design, storytelling, martial arts, plant medicine, mystery schools.
            </p>
            <p className="text-sm text-white/70 leading-relaxed mt-3">
              I help people find the power they were born with—the power that got buried under hard times, survival, and growing up too fast. Your gift was never gone. Your soul was never lost. It just needs the rust cleaned off.
            </p>
            <p className="text-xs text-white/55 mt-4">
              — <em style={{ fontFamily: "'Source Serif 4', serif" }}>Oyi Sun</em>
            </p>
            <p className="text-xs text-white/35 mt-1">
              Lotus Medicine Man · Sifu · Master Astrologer · Ye Ming Zhu Keeper
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S9: SOCIAL PROOF — myth line
            ═══════════════════════════════════════════════ */}
        <section className="text-center space-y-4" id="social-proof" aria-label="The myth">
          <div className="liquid-glass rounded-3xl p-6 md:p-8">
            <p className="text-sm text-white/70 leading-relaxed italic max-w-md mx-auto">
              "The kid who created without asking, played without planning, led without permission—that wasn't childish. That was your power. And you've been handing it away ever since."
            </p>
            <p className="text-xs text-white/40 mt-3">— The Sovereignty Myth</p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S10: PRICING — CTA + resonance permission
            ═══════════════════════════════════════════════ */}
        <section className="liquid-glass-strong rounded-[2.5rem] p-8 md:p-10 text-center space-y-5" id="pricing-section" aria-label="Next step">
          <div>
            <h2 className="text-2xl md:text-3xl font-medium text-white tracking-tight mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Ready to Restore What Growing Up Took?
            </h2>
            <p className="text-xs text-white/45">60–75 minutes. Your chart. Your story. Your sovereignty.</p>
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
            Only proceed if this lands in your body—not your mind. A gut feeling. Goosebumps. A fire that catches. If it's not the right time, trust that. The lotus blooms when the season is right.
          </p>
        </section>

        {/* ═══════════════════════════════════════════════
            S11: FAQ — glass accordions
            ═══════════════════════════════════════════════ */}
        <section className="space-y-2" id="faq-section" aria-label="Frequently asked questions">
          <h2 className="text-lg font-medium text-white/90 text-center mb-4 tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Questions</h2>
          {[
            {
              q: "How can you read me before I say anything?",
              a: "Your birth chart and human design profile contain precise data about who you were designed to be—your purpose (North Node), your patterns (South Node), your decision-making strategy, and your shadow. 24 years of mastery across multiple traditions gives me the literacy to read it with devastating accuracy."
            },
            {
              q: "Do I need to believe in astrology or spirituality?",
              a: "No. You need to be honest. The precision of the read speaks for itself. People from every background—tech executives, doctors, veterans—sit down skeptical and leave saying 'how did you know that?' The data doesn't require belief. It requires an open ear."
            },
            {
              q: "What's a 'Sovereignty Map'?",
              a: "It's a precise diagnosis of where you gave away your power (the swamp), what your actual purpose is (the lotus), how you're designed to make decisions (your strategy), the shadow running your life, and one prescription to begin restoring the car. Think of it as a GPS for your sovereignty."
            },
            {
              q: "I carry both the spiritual and practical worlds. Will this understand that?",
              a: "That's literally who I work with. Source Path Builders—people who bridge ancient wisdom and modern building. The world says pick one. I walk both and show you the lane is the bridge itself."
            },
            {
              q: "What if I've done years of self-work already?",
              a: "Good. This isn't beginner work. I work with people who are the lotus, not the mud. You've done the transformation—but you haven't BUILT from it yet. The Mirror Session names what you can't see from inside—no matter how much work you've done. The eye can't see itself."
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
            The swamp grew the lotus.<br />And the lotus bows to no one.<br />Live Free.
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

export default OyiIgnition;
