import { ArrowRight, Check, ShieldCheck, MessageCircle, ChevronDown } from "lucide-react";
import { useLocation } from "react-router-dom";
import GameShellV2 from "@/components/game/GameShellV2";
import { useState, useRef, useEffect } from "react";
import geniusLogo from "@/assets/logo.png";

const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/9B6dR9bME6i71TP7r2dEs0A";
const CALCOM_BOOKING_LINK = "https://cal.com/aleksandrkonstantinov/unique-business-ignition-session";
const CALCOM_CLARITY_LINK = "https://cal.com/aleksandrkonstantinov/15min";

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
    <div ref={ref} className="aspect-video bg-[#1a1a2e]/5">
      {visible ? (
        <iframe
          src={`https://www.youtube.com/embed/${id}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-xs text-[#1a1a2e]/20">Loading...</div>
      )}
    </div>
  );
};

const IgniteSession = () => {
  const location = useLocation();
  const inShell = location.pathname.startsWith("/game/");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const content = (
    <div className="min-h-screen bg-[#faf9f7] text-[#1a1a2e] font-sans" id="ignite-page">
      <div className="relative z-10 max-w-2xl mx-auto px-4 md:px-6 py-12 space-y-10">

        {/* ═══════════════════════════════════════════════
            HERO — Recognition Trigger + CTA
            ═══════════════════════════════════════════════ */}
        <header className="text-center space-y-5 pt-2" id="ignite-hero">
          <img
            src={geniusLogo}
            alt=""
            className="w-16 h-16 mx-auto"
          />

          {/* Recognition trigger — makes the visitor feel SEEN, not informed */}
          <h1 className="text-3xl md:text-4xl font-display font-medium tracking-tight text-[#1a1a2e] leading-tight">
            You've been giving your best work away for free.
          </h1>
          <p className="text-base text-[#1a1a2e]/60 max-w-md mx-auto leading-relaxed">
            You know it. The people around you know it.<br />
            You just haven't{" "}
            <span className="bg-gradient-to-r from-[#8460ea] to-[#6894d0] bg-clip-text text-transparent font-medium">
              named it
            </span>{" "}yet.
          </p>
          <p className="text-sm text-[#1a1a2e]/40 max-w-sm mx-auto leading-relaxed">
            In 90 minutes, we name your craft, discover the business built on
            who you already are, and get you the first easy move to your first paying client.
          </p>

          {/* Single primary CTA — no competing clarity call */}
          <div className="flex flex-col items-center gap-2 pt-1">
            <a
              href={STRIPE_PAYMENT_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold bg-[#8460ea] text-white hover:bg-[#7350d8] transition-all duration-300 hover:shadow-xl hover:shadow-[#8460ea]/20 hover:scale-[1.02] active:scale-[0.98]"
              id="hero-cta-btn"
            >
              Book Your Ignition Session — $555
              <ArrowRight className="w-5 h-5" />
            </a>
            <span className="flex items-center gap-1 text-xs text-[#1a1a2e]/30">
              <ShieldCheck className="w-3 h-3" />
              Money-back guarantee
            </span>
          </div>
        </header>

        {/* ═══════════════════════════════════════════════
            WHO IS THIS FOR — Self-selection qualifier
            ═══════════════════════════════════════════════ */}
        <section className="text-center space-y-3" id="qualifier">
          <p className="text-xs text-[#1a1a2e]/30 uppercase tracking-wider">This session is for you if</p>
          <div className="space-y-2 max-w-sm mx-auto">
            {[
              "You're stuck between your dream, coaching, and \"getting a job\"",
              "People keep coming to you for help — you never charge",
              "You suspect you ARE the product but can't see the product label from inside yourself",
            ].map((item, i) => (
              <p key={i} className="text-sm text-[#1a1a2e]/55 leading-relaxed flex items-start gap-2">
                <span className="text-[#8460ea] mt-0.5 flex-shrink-0">→</span>
                {item}
              </p>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            VIDEO — with compelling intro
            ═══════════════════════════════════════════════ */}
        <section id="hero-video">
          <p className="text-xs text-[#1a1a2e]/40 text-center mb-3">
            The exact methodology disclosed in 4 minutes
          </p>
          <div className="rounded-2xl border border-[#1a1a2e]/8 bg-white/60 overflow-hidden shadow-sm">
            <div className="aspect-video">
              <iframe
                src="https://www.youtube.com/embed/pnQzKNJyP0A"
                title="The Ignition Session"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            WHAT YOU WALK OUT WITH — 2 deliverables
            ═══════════════════════════════════════════════ */}
        <section className="rounded-2xl border border-[#1a1a2e]/8 bg-white/70 p-6 md:p-8 shadow-sm" id="deliverables">
          <h2 className="text-lg font-display text-[#1a1a2e]/80 mb-5">What You Walk Out With</h2>
          <div className="space-y-4">
            {[
              {
                title: "Your uniqueness named",
                desc: "Two questions. Deep mirroring. I name the thing you've been doing for free — the gift people thank you for that feels too natural to be valuable. You hear it and your body knows: \"That's it.\""
              },
              {
                title: "Your entire business on one page",
                desc: "Your worldview, your audience, their deepest struggle, your promise to them, and your offer — compiled in real time by AI, on screen, while we work. Not a first draft. A naming."
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
            TESTIMONIALS — with "before" context
            ═══════════════════════════════════════════════ */}
        <section className="space-y-3" id="testimonials">
          <p className="text-xs text-[#1a1a2e]/30 uppercase tracking-wider text-center mb-1">What they said after</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { quote: "Wow, wow, wow, wow, wow. My guides, they like you.", name: "Oyi" },
              { quote: "A tool that just plain works.", name: "Alexey" },
              { quote: "I was applying force, but the vector was wrong.", name: "Sergey" },
              { quote: "Brings tears in my eyes. It's uplifting me so much and giving me psychological and emotional stability.", name: "Sandra" },
              { quote: "The whole journey feels really beautiful.", name: "Aleksa" },
              { quote: "I feel caught. Wonderful. This is great work.", name: "Karime" },
            ].map((t, i) => (
              <div key={i} className="rounded-xl border border-[#1a1a2e]/6 bg-white/50 p-4">
                <blockquote className="text-sm text-[#1a1a2e]/55 italic leading-relaxed">
                  "{t.quote}"
                </blockquote>
                <p className="text-xs text-[#8460ea] mt-2">— {t.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            ABOUT ALEXANDER — moved up for trust
            ═══════════════════════════════════════════════ */}
        <section className="rounded-2xl border border-[#1a1a2e]/6 bg-white/50 p-6 md:p-8" id="about-section">
          <p className="text-sm text-[#1a1a2e]/55 leading-relaxed">
            I spent five years helping other founders find their uniqueness while unable to see my own.
            I studied entrepreneurship at MIT, spent four years in Silicon Valley,
            and helped 200+ people articulate what makes them irreplaceable.
          </p>
          <p className="text-sm text-[#1a1a2e]/55 leading-relaxed mt-3">
            What I do best — naming the gift that hides in plain sight —
            was the business I couldn't name for myself. Now I do this full-time.
            Every session is a mirror. I don't teach you anything new. I show you what was always there.
          </p>
          <p className="text-xs text-[#1a1a2e]/30 mt-4 italic">
            — Alexander Konstantinov · Every participant left with their business named
          </p>
        </section>

        {/* ═══════════════════════════════════════════════
            PRICING + GUARANTEE
            ═══════════════════════════════════════════════ */}
        <section className="rounded-2xl border border-[#8460ea]/15 bg-gradient-to-br from-[#8460ea]/5 to-white/80 p-8 text-center space-y-5 shadow-sm" id="pricing-section">
          <div>
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
              You walk out with your uniqueness named and your business on one page — or full refund. No questions.
            </p>
          </div>

          {/* "Most clients don't stop here" hint */}
          <p className="text-xs text-[#1a1a2e]/25 italic">
            Most clients who ignite don't stop here.
          </p>

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

          <div className="flex flex-col items-center gap-2 pt-1">
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
            FAQ — with clarity call moved here
            ═══════════════════════════════════════════════ */}
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
              a: "I don't give advice. I mirror back what you already said until you see the pattern you couldn't see from inside. Then AI compiles your entire business canvas in real time. You walk out with a business on a page, not a pep talk."
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

          {/* Clarity call moved here — where hesitant visitors naturally congregate */}
          <div className="text-center pt-3">
            <a
              href={CALCOM_CLARITY_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#1a1a2e]/40 hover:text-[#8460ea] transition-colors"
            >
              <MessageCircle className="w-3 h-3" />
              Still have questions? Book a free 15-min clarity call
            </a>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            THE OPEN BLUEPRINTS — lazy-loaded
            ═══════════════════════════════════════════════ */}
        <section className="space-y-4" id="blueprints-section">
          <div className="text-center space-y-1">
            <p className="text-xs text-[#1a1a2e]/30 uppercase tracking-wider">The Open Blueprints</p>
            <h2 className="text-lg font-display text-[#1a1a2e]/80">The entire methodology. Free.</h2>
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
                <LazyYouTube id={video.youtubeId} title={video.title} />
                <div className="px-4 py-3">
                  <p className="text-sm text-[#1a1a2e]/65 font-medium">{video.title}</p>
                  <p className="text-xs text-[#1a1a2e]/35">{video.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            BOTTOM CTA
            ═══════════════════════════════════════════════ */}
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
