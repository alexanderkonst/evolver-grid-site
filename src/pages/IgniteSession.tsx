import { ArrowRight, Check, Sparkles, MapPin, ChevronDown, ShieldCheck, MessageCircle } from "lucide-react";
import { useLocation } from "react-router-dom";
import GameShellV2 from "@/components/game/GameShellV2";
import { useState } from "react";

const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/9B6dR9bME6i71TP7r2dEs0A";
const CALCOM_BOOKING_LINK = "https://cal.com/aleksandrkonstantinov/unique-business-ignition-session";
const CALCOM_CLARITY_LINK = "https://cal.com/aleksandrkonstantinov/15min";

const IgniteSession = () => {
  const location = useLocation();
  const inShell = location.pathname.startsWith("/game/");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const content = (
    <div className="min-h-screen bg-[#faf9f7] text-[#1a1a2e] font-sans" id="ignite-page">
      {/* Subtle warm glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#8460ea]/4 rounded-full blur-[180px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#6894d0]/3 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 md:px-6 py-12 space-y-12">

        {/* ═══════════════════════════════════════════════
            SECTION 1: HERO
            ═══════════════════════════════════════════════ */}
        <header className="text-center space-y-4 pt-4" id="ignite-hero">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#8460ea]/8 border border-[#8460ea]/15 mb-2">
            <Sparkles className="w-7 h-7 text-[#8460ea]" />
          </div>
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-[#8460ea]/70">
            The Ignition Session
          </p>
          <h1 className="text-3xl md:text-4xl font-display font-medium tracking-tight text-[#1a1a2e]">
            Your genius is already there.<br />
            <span className="bg-gradient-to-r from-[#8460ea] to-[#6894d0] bg-clip-text text-transparent">
              I name it. You build from it.
            </span>
          </h1>
          <p className="text-sm text-[#1a1a2e]/50 max-w-lg mx-auto leading-relaxed">
            90 minutes. One session. You walk out with your entire business
            on one page — your uniqueness named, your audience defined,
            your first message written. Yours forever.
          </p>

          {/* CDMX Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#1a1a2e]/8 bg-white/60 text-xs text-[#1a1a2e]/40">
            <MapPin className="w-3 h-3" />
            Based in Mexico City · In-person & Zoom
          </div>
        </header>

        {/* ═══════════════════════════════════════════════
            SECTION 2: HERO VIDEO
            ═══════════════════════════════════════════════ */}
        <section className="rounded-2xl border border-[#1a1a2e]/8 bg-white/60 overflow-hidden shadow-sm" id="hero-video">
          <div className="aspect-video">
            <iframe
              src="https://www.youtube.com/embed/pnQzKNJyP0A"
              title="The Ignition Session"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            SECTION 3: WHAT YOU WALK OUT WITH
            ═══════════════════════════════════════════════ */}
        <section className="rounded-2xl border border-[#1a1a2e]/8 bg-white/70 backdrop-blur-xl p-6 md:p-8 shadow-sm" id="deliverables">
          <h2 className="text-lg font-display text-[#1a1a2e]/80 mb-5">What You Walk Out With</h2>
          <div className="space-y-4">
            {[
              {
                title: "Your uniqueness named",
                desc: "Two questions. Deep mirroring. I name the thing you've been doing for free — the gift people thank you for that feels too natural to be valuable. You hear it and your body knows: \"That's it.\""
              },
              {
                title: "Your business on one page",
                desc: "Your worldview, your audience, their deepest struggle, your promise to them, and your offer — compiled in real time by AI, on screen, while we work. One page. Your entire business."
              },
              {
                title: "Your first message written",
                desc: "Not a business plan that sits in a drawer. An actual message you can send today — to a friend, on LinkedIn, in a DM — that makes the right person say: \"How did you know?\""
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#8460ea]/10 border border-[#8460ea]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-[#8460ea]" />
                </div>
                <div>
                  <p className="text-sm text-[#1a1a2e]/80 font-medium">{item.title}</p>
                  <p className="text-xs text-[#1a1a2e]/40 leading-relaxed mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            SECTION 4: ABOUT ALEXANDER
            ═══════════════════════════════════════════════ */}
        <section className="rounded-2xl border border-[#1a1a2e]/6 bg-white/50 p-6 md:p-8" id="about-section">
          <p className="text-sm text-[#1a1a2e]/55 leading-relaxed">
            I spent five years helping other founders find their uniqueness while unable to see my own.
            I studied entrepreneurship at MIT, spent four years in Silicon Valley,
            built ventures across multiple continents, and helped 200+ people articulate what makes them irreplaceable.
          </p>
          <p className="text-sm text-[#1a1a2e]/55 leading-relaxed mt-3">
            The searching was the finding. What I do best — naming the gift that hides in plain sight —
            was the business I couldn't name for myself. Now I do this full-time.
            Every session is a mirror. I don't teach you anything new. I show you what was always there.
          </p>
          <p className="text-xs text-[#1a1a2e]/30 mt-4 italic">
            — Alexander Konstantinov · 15+ sessions delivered · 5 unique businesses in active development
          </p>
        </section>

        {/* ═══════════════════════════════════════════════
            SECTION 5: TESTIMONIALS
            ═══════════════════════════════════════════════ */}
        <section className="space-y-3" id="testimonials">
          {[
            {
              quote: "I've never had a session like that before. Thank you for helping me face my fears. Nobody can hold space for me. They're all afraid. You're very courageous.",
              name: "Oyi",
              context: "after Ignition Session #1"
            },
            {
              quote: "I was on 100% in your structure, and I never wanted or needed to change the methodology or approach. While building my business, I caught an error in my own story that was invisible at the higher level but obvious once I went deeper. That's the precision.",
              name: "Sergey",
              context: "after Session #4"
            },
            {
              quote: "This is a miracle of miracles. Other tools come at this half-baked and shallow — they've got no depth. Your approach, though? A tool that just plain works.",
              name: "Alexey",
              context: "on the uniqueness extraction"
            },
          ].map((t, i) => (
            <div key={i} className="rounded-2xl border border-[#1a1a2e]/6 bg-white/50 p-5">
              <blockquote className="text-sm text-[#1a1a2e]/55 italic leading-relaxed">
                "{t.quote}"
              </blockquote>
              <p className="text-xs text-[#8460ea] mt-3">— {t.name}, {t.context}</p>
            </div>
          ))}
        </section>

        {/* ═══════════════════════════════════════════════
            SECTION 6: PRICING + GUARANTEE + CTA
            ═══════════════════════════════════════════════ */}
        <section className="rounded-2xl border border-[#8460ea]/15 bg-gradient-to-br from-[#8460ea]/5 to-white/80 p-8 text-center space-y-5 shadow-sm" id="pricing-section">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#8460ea]/70 mb-2">The Ignition Session</p>
            <div className="flex items-baseline justify-center gap-1 mb-1">
              <span className="text-4xl md:text-5xl font-display font-bold text-[#1a1a2e]">$555</span>
            </div>
            <p className="text-xs text-[#1a1a2e]/30">One session. Full canvas. Yours forever.</p>
          </div>

          {/* Guarantee */}
          <div className="rounded-xl border border-[#8460ea]/10 bg-[#8460ea]/[0.04] px-5 py-4 max-w-md mx-auto">
            <div className="flex items-center justify-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-[#8460ea]" />
              <p className="text-xs font-medium text-[#8460ea]/80 uppercase tracking-wider">The Ignition Guarantee</p>
            </div>
            <p className="text-xs text-[#1a1a2e]/45 leading-relaxed">
              You walk out with your uniqueness named, your business on one page,
              and your first message written — or full refund. No questions.
            </p>
          </div>

          {/* Primary CTA */}
          <a
            href={STRIPE_PAYMENT_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold bg-[#8460ea] text-white hover:bg-[#7350d8] transition-all duration-300 hover:shadow-xl hover:shadow-[#8460ea]/20 hover:scale-[1.02] active:scale-[0.98]"
            id="book-session-btn"
          >
            Book Your Ignition Session
            <ArrowRight className="w-5 h-5" />
          </a>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#1a1a2e]/25">
            <ShieldCheck className="w-3 h-3" />
            <span>Secure payment via Stripe</span>
          </div>

          {/* Secondary options */}
          <div className="flex flex-col items-center gap-2 pt-1">
            <a
              href={CALCOM_CLARITY_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#1a1a2e]/40 hover:text-[#8460ea] transition-colors"
            >
              <MessageCircle className="w-3 h-3" />
              Not sure yet? Book a free 15-min call
            </a>
            <a
              href={CALCOM_BOOKING_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#1a1a2e]/25 hover:text-[#8460ea] transition-colors underline underline-offset-2"
            >
              Already paid? Book your session here →
            </a>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            BELOW THE FOLD
            ═══════════════════════════════════════════════ */}

        {/* How the Session Works */}
        <section className="rounded-2xl border border-[#1a1a2e]/8 bg-white/70 backdrop-blur-xl p-6 md:p-8 shadow-sm" id="session-flow">
          <h2 className="text-lg font-display text-[#1a1a2e]/80 mb-5">How the 90 Minutes Work</h2>
          <div className="space-y-4">
            {[
              {
                step: "Two questions",
                desc: "I ask you what you desire most and where you feel most stuck. Your answers contain your entire business — you just can't read the label from inside the jar."
              },
              {
                step: "The mirror",
                desc: "I reorganize what you just said until you see the pattern you couldn't see from inside. This is recognition, not learning. You've always known — you just hadn't heard it said back."
              },
              {
                step: "The hidden belief",
                desc: "There's a reason you've been giving your best work away for free. We name that belief. Once it's visible, it stops running the show."
              },
              {
                step: "Your canvas, live",
                desc: "AI compiles everything in real time — your worldview, your audience, their struggle, your promise, your offer, your first message. You watch your business appear on screen."
              },
              {
                step: "Your next move",
                desc: "You leave with one clear action: one message to one person. Not a 90-day plan. One step. The rest unfolds from there."
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#8460ea]/8 border border-[#8460ea]/12 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] text-[#8460ea] font-mono">{i + 1}</span>
                </div>
                <div>
                  <p className="text-sm text-[#1a1a2e]/80 font-medium">{item.step}</p>
                  <p className="text-xs text-[#1a1a2e]/40 leading-relaxed mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* DIY vs. Guided */}
        <section className="rounded-2xl border border-[#1a1a2e]/8 bg-white/70 backdrop-blur-xl p-6 md:p-8 shadow-sm" id="diy-vs-guided">
          <h2 className="text-lg font-display text-[#1a1a2e]/80 mb-2 text-center">
            "Can I do this myself?"
          </h2>
          <p className="text-xs text-[#1a1a2e]/35 text-center mb-5">
            Yes. Everything I know is in the free blueprints below. Here's what changes with a guide.
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-3">
              <p className="text-[#1a1a2e]/50 font-medium uppercase tracking-wider text-[10px]">The Blueprints (free)</p>
              {[
                "The full methodology explained",
                "AI prompts you can use yourself",
                "The artifact sequence laid out",
                "~20-40 hours of trial and error",
                "You reading your own label",
              ].map((item, i) => (
                <p key={i} className="text-[#1a1a2e]/40 leading-relaxed">{item}</p>
              ))}
            </div>
            <div className="space-y-3">
              <p className="text-[#8460ea] font-medium uppercase tracking-wider text-[10px]">The Session ($555)</p>
              {[
                "All of the above, plus:",
                "A mirror built from 200+ sessions",
                "The hidden belief named live",
                "Your full canvas generated in real time",
                "90 minutes. Done.",
              ].map((item, i) => (
                <p key={i} className="text-[#1a1a2e]/55 leading-relaxed">{item}</p>
              ))}
            </div>
          </div>

          <p className="text-xs text-[#1a1a2e]/35 text-center mt-5 italic">
            You can read every label in the store. But you can't read the one on your own jar.
            That's what the session is for.
          </p>
        </section>

        {/* FAQ */}
        <section className="space-y-2" id="faq-section">
          <h2 className="text-lg font-display text-[#1a1a2e]/80 text-center mb-4">Questions</h2>
          {[
            {
              q: "What if I don't know my genius yet?",
              a: "That's exactly what this session is for. You don't prepare — you arrive. The two questions do the work. Every person who's sat in this session walked out with their uniqueness named. That's the guarantee."
            },
            {
              q: "What if I already have a business?",
              a: "Even better. Most businesses are built around a market gap, not the founder's uniqueness. I check if yours is aligned with who you are. If it is, we sharpen it. If it isn't, you'll finally see why it's felt like a grind."
            },
            {
              q: "How is this different from coaching?",
              a: "This isn't coaching. I don't give advice. I mirror back what you already said until you see the pattern you couldn't see from inside. Then AI compiles your entire business canvas in real time. You walk out with a business, not a pep talk."
            },
          ].map((faq, i) => (
            <div key={i} className="rounded-xl border border-[#1a1a2e]/6 bg-white/60 overflow-hidden">
              <button
                className="w-full p-4 flex items-center justify-between text-left"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <p className="text-sm text-[#1a1a2e]/65 font-medium">{faq.q}</p>
                <ChevronDown className={`w-4 h-4 text-[#1a1a2e]/30 transition-transform flex-shrink-0 ml-2 ${openFaq === i ? "rotate-180" : ""}`} />
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4">
                  <p className="text-xs text-[#1a1a2e]/40 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </section>

        {/* The Path — Value Ladder */}
        <section className="space-y-3" id="value-ladder">
          <h2 className="text-lg font-display text-[#1a1a2e]/80 text-center mb-4">The Path</h2>
          <div className="space-y-3">
            {[
              {
                step: "1",
                name: "The Ignition",
                price: "$555",
                desc: "Name your genius. See your business on one page. Walk out with your first message ready to send.",
                active: true
              },
              {
                step: "2",
                name: "The Build",
                price: "By invitation",
                desc: "6 weeks. Every artifact refined to full precision. Your first paying clients. Your business, operational. Discussed at the end of the Ignition.",
                active: false
              },
            ].map((tier, i) => (
              <div
                key={i}
                className={`p-5 rounded-xl border transition-all ${
                  tier.active
                    ? "border-[#8460ea]/20 bg-[#8460ea]/5"
                    : "border-[#1a1a2e]/6 bg-white/40 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#8460ea]/70 font-mono">Step {tier.step}</span>
                    <span className="text-sm text-[#1a1a2e]/80 font-medium">{tier.name}</span>
                  </div>
                  <span className={`text-sm font-display font-medium ${tier.active ? "text-[#8460ea]" : "text-[#1a1a2e]/30"}`}>
                    {tier.price}
                  </span>
                </div>
                <p className="text-xs text-[#1a1a2e]/40 leading-relaxed">{tier.desc}</p>
                {tier.active && (
                  <p className="text-[10px] text-[#8460ea]/50 mt-2">← You are here</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* The Open Blueprints */}
        <section className="space-y-6" id="blueprints-section">
          <div className="text-center space-y-2">
            <p className="text-xs text-[#1a1a2e]/30 uppercase tracking-wider">The Open Blueprints</p>
            <h2 className="text-lg font-display text-[#1a1a2e]/80">The entire methodology. Free.</h2>
            <p className="text-xs text-[#1a1a2e]/30 max-w-md mx-auto">
              I give away the full recipe — product, marketing, and distribution.
              Because the protocol is the gift. The building is the business.
            </p>
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
                subtitle: "From Fog to Reality Distortion Field",
                youtubeId: "wjcD5r9iq8A",
              },
              {
                title: "Blueprint 3: Aligned Distribution",
                subtitle: "From Manipulation to Soul-Aligned Tactics",
                youtubeId: "XI2xqNO4Oek",
              },
            ].map((video, i) => (
              <div key={i} className="rounded-xl border border-[#1a1a2e]/8 bg-white/60 overflow-hidden shadow-sm">
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.youtubeId}`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
                <div className="px-4 py-3">
                  <p className="text-sm text-[#1a1a2e]/65 font-medium">{video.title}</p>
                  <p className="text-xs text-[#1a1a2e]/35">{video.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="text-center space-y-3 pb-8">
          <a
            href={STRIPE_PAYMENT_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold bg-[#8460ea] text-white hover:bg-[#7350d8] transition-all duration-300 hover:shadow-xl hover:shadow-[#8460ea]/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            Book Your Ignition Session — $555
            <ArrowRight className="w-5 h-5" />
          </a>
          <div className="flex flex-col items-center gap-2">
            <a
              href={CALCOM_CLARITY_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#1a1a2e]/40 hover:text-[#8460ea] transition-colors"
            >
              <MessageCircle className="w-3 h-3" />
              Not sure yet? Book a free 15-min call
            </a>
            <a
              href={CALCOM_BOOKING_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#1a1a2e]/25 hover:text-[#8460ea] transition-colors underline underline-offset-2"
            >
              Already paid? Book your session here →
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  if (inShell) return <GameShellV2>{content}</GameShellV2>;
  return content;
};

export default IgniteSession;
