import { ArrowRight, Check, Sparkles, MapPin, ChevronDown } from "lucide-react";
import { useLocation } from "react-router-dom";
import GameShellV2 from "@/components/game/GameShellV2";
import { useState } from "react";

const IgniteSession = () => {
  const location = useLocation();
  const inShell = location.pathname.startsWith("/game/");
  const foundersPath = inShell ? "/game/marketplace/founders" : "/founders";
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const content = (
    <div className="min-h-screen bg-[#0c1220] text-white font-sans" id="ignite-page">
      {/* Aurora */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#8460ea]/6 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#6894d0]/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "3s" }} />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 md:px-6 py-12 space-y-12">
        {/* Nav */}
        <div className="flex items-center justify-between">
          <a href={foundersPath} className="text-xs text-[#6894d0] hover:text-[#8460ea] transition-colors">← See the Founders</a>
          <a href="/zone-of-genius" className="text-xs text-white/20 hover:text-white/40 transition-colors">Free Genius Test →</a>
        </div>

        {/* Story Section */}
        <section className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 md:p-8" id="story-section">
          <p className="text-sm text-white/50 leading-relaxed italic">
            "I sat with a conscious founder, a medicine man, a healer, a New Earth leader, and a systems architect.
            In one session, we named what they actually do — the gift that was always there but hadn't been put into words.
            In two more, we packaged the business, created the distribution strategy, and built the step-by-step tactics."
          </p>
          <p className="text-xs text-white/25 mt-3">
            These aren't theories. These are people I know by name.
          </p>
        </section>

        {/* Hero */}
        <header className="text-center space-y-4" id="ignite-hero">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#8460ea]/10 border border-[#8460ea]/20 mb-2">
            <Sparkles className="w-7 h-7 text-[#8460ea]" />
          </div>
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-[#a4a3d0]">
            The Ignition Session
          </p>
          <h1 className="text-3xl md:text-4xl font-display font-medium tracking-tight text-white/90">
            Your genius is already there.<br />
            <span className="bg-gradient-to-r from-[#8460ea] to-[#6894d0] bg-clip-text text-transparent">
              We name it. You build from it.
            </span>
          </h1>
          <p className="text-sm text-white/40 max-w-md mx-auto leading-relaxed">
            60–90 minutes. One session. You walk out with your Unique Business Canvas —
            your myth discovered, your tribe named, your business designed around
            who you already are.
          </p>

          {/* CDMX Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white/30">
            <MapPin className="w-3 h-3" />
            Based in Mexico City · In-person & Zoom
          </div>
        </header>

        {/* Social Proof */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center" id="proof-stats">
          {[
            { num: "10", label: "Sessions delivered" },
            { num: "100%", label: "Conversion rate" },
            { num: "90", label: "Minutes per session" },
            { num: "5", label: "Unique businesses built" },
          ].map((s, i) => (
            <div key={i} className="p-4 rounded-xl border border-white/8 bg-white/3">
              <p className="text-xl font-display font-medium bg-gradient-to-br from-[#8460ea] to-[#6894d0] bg-clip-text text-transparent">{s.num}</p>
              <p className="text-[10px] text-white/25 uppercase tracking-wide mt-1">{s.label}</p>
            </div>
          ))}
        </section>

        {/* What Happens */}
        <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8" id="session-includes">
          <h2 className="text-lg font-display text-white/70 mb-5">What Happens in the Session</h2>
          <div className="space-y-4">
            {[
              { step: "Your Uniqueness Extracted", desc: "Two questions. Deep mirroring. We name what you've been doing for free — the thing people thank you for that feels too easy to be valuable." },
              { step: "Your Shadow Named", desc: "The lie you tell yourself about why your genius 'doesn't count.' Once named, it stops running the show." },
              { step: "Your Full Canvas Generated", desc: "AI compiles your myth, tribe, pain, promise, value ladder, and first marketing message — in real time, on screen. Your entire business, first draft." },
              { step: "Your Recognition", desc: "You see your whole business on one page. Body responds. 'This is what I do.' Not learning — recognition." },
              { step: "Your Precision Gap", desc: "This is iteration 1 at ~7 precision. The Build takes it to 9.5+. You can FEEL the gap — because you hold the rough sketch." },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#8460ea]/15 border border-[#8460ea]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-[#8460ea]" />
                </div>
                <div>
                  <p className="text-sm text-white/70 font-medium">{item.step}</p>
                  <p className="text-xs text-white/35 leading-relaxed mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Value Ladder */}
        <section className="space-y-3" id="value-ladder">
          <h2 className="text-lg font-display text-white/70 text-center mb-4">The Path</h2>
          <div className="space-y-3">
            {[
              { 
                step: "1", 
                name: "The Ignition", 
                price: "$555", 
                desc: "Name your genius. See your business on one page. First draft at ~7 precision.", 
                active: true 
              },
              { 
                step: "2", 
                name: "The Build", 
                price: "$5,000", 
                desc: "6 weeks. Every artifact at 9.5+ precision. First client by week 6. Your business, operational.", 
                active: false 
              },
              { 
                step: "3", 
                name: "The Venture", 
                price: "Rev Share", 
                desc: "Scaling. Systematization. Platform entry. Your unique business as a node in the network.", 
                active: false 
              },
            ].map((tier, i) => (
              <div
                key={i}
                className={`p-5 rounded-xl border transition-all ${
                  tier.active
                    ? "border-[#8460ea]/30 bg-[#8460ea]/8"
                    : "border-white/8 bg-white/[0.02] opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#a4a3d0] font-mono">Step {tier.step}</span>
                    <span className="text-sm text-white/80 font-medium">{tier.name}</span>
                  </div>
                  <span className={`text-sm font-display font-medium ${tier.active ? "text-[#8460ea]" : "text-white/30"}`}>
                    {tier.price}
                  </span>
                </div>
                <p className="text-xs text-white/35 leading-relaxed">{tier.desc}</p>
                {tier.active && (
                  <p className="text-[10px] text-[#8460ea]/60 mt-2">← You are here</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* The Open Blueprints */}
        <section className="space-y-6" id="blueprints-section">
          <div className="text-center space-y-2">
            <p className="text-xs text-white/30 uppercase tracking-wider">The Open Blueprints</p>
            <h2 className="text-lg font-display text-white/70">The entire methodology. Free. Watch all three.</h2>
            <p className="text-xs text-white/25 max-w-md mx-auto">
              We give away the full recipe — product, marketing, and distribution. 
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
              <div key={i} className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
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
                  <p className="text-sm text-white/60 font-medium">{video.title}</p>
                  <p className="text-xs text-white/30">{video.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* DIY vs. Guided */}
        <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8" id="diy-vs-guided">
          <h2 className="text-lg font-display text-white/70 mb-2 text-center">
            "Can I do this myself?"
          </h2>
          <p className="text-xs text-white/30 text-center mb-5">
            Yes. The blueprints are real. Here's what changes when you do it with a guide.
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-3">
              <p className="text-white/40 font-medium uppercase tracking-wider text-[10px]">The Blueprints (free)</p>
              {[
                "The full strategy & methodology",
                "AI prompts you can use yourself",
                "The artifact sequence explained",
                "~20-40 hours of trial and error",
                "Self-assessment (the jar reads its own label)",
                "Generic patterns, not your specifics",
              ].map((item, i) => (
                <p key={i} className="text-white/35 leading-relaxed">{item}</p>
              ))}
            </div>
            <div className="space-y-3">
              <p className="text-[#8460ea] font-medium uppercase tracking-wider text-[10px]">The Session ($555)</p>
              {[
                "All of the above, plus:",
                "A trained mirror who's done this 10+ times",
                "Live clearing of blocks & limiting beliefs",
                "Your full canvas generated in real time by AI",
                "60-90 minutes. Done.",
                "Archetype-specific precision for YOUR wall",
              ].map((item, i) => (
                <p key={i} className="text-white/50 leading-relaxed">{item}</p>
              ))}
            </div>
          </div>

          <p className="text-xs text-white/25 text-center mt-5 italic">
            The blueprints show you the architecture. The session builds the house.
          </p>
        </section>

        {/* Pricing */}
        <section className="rounded-2xl border border-[#8460ea]/20 bg-gradient-to-br from-[#8460ea]/8 to-[#0c1220] p-8 text-center" id="pricing-section">
          <p className="text-xs uppercase tracking-[0.3em] text-[#a4a3d0] mb-2">The Ignition Session</p>
          <div className="flex items-baseline justify-center gap-1 mb-1">
            <span className="text-4xl md:text-5xl font-display font-bold text-white/90">$555</span>
          </div>
          <p className="text-xs text-white/25 mb-6">One session. Full canvas. Yours forever.</p>

          <a
            href="https://www.calendly.com/konstantinov"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold bg-[#8460ea] text-white hover:bg-[#7350d8] transition-all duration-300 hover:shadow-xl hover:shadow-[#8460ea]/30 hover:scale-[1.02] active:scale-[0.98]"
            id="book-session-btn"
          >
            Book Your Ignition Session
            <ArrowRight className="w-5 h-5" />
          </a>

          <p className="text-[10px] text-white/15 mt-4">
            In-person in Mexico City or via Zoom worldwide
          </p>
        </section>

        {/* Testimonial */}
        <section className="rounded-2xl border border-white/8 bg-white/[0.03] p-6" id="testimonial-section">
          <blockquote className="text-sm text-white/50 italic leading-relaxed">
            "I've never had a session like that before. Thank you for helping me face my fears. Nobody can hold space for me. They're all afraid. You're very courageous."
          </blockquote>
          <p className="text-xs text-[#8460ea] mt-3">— Ogi, after Ignition Session #1</p>
        </section>

        {/* FAQ */}
        <section className="space-y-2" id="faq-section">
          <h2 className="text-lg font-display text-white/70 text-center mb-4">Questions</h2>
          {[
            { q: "What if I don't know my genius yet?", a: "That's exactly what this session is for. You don't prepare — you arrive. The two questions do the work." },
            { q: "What if I already have a business?", a: "Even better. We check if it's aligned with who you are. Most businesses are built around a market gap, not the founder's uniqueness. We close that gap." },
            { q: "How is this different from coaching?", a: "This isn't coaching. It's extraction + AI compilation. We discover your uniqueness live, then AI generates your full business canvas in real time — myth, tribe, pain, promise, value ladder, first message. You walk out with a business, not advice." },
            { q: "What happens after the session?", a: "You have your Unique Business Canvas at ~7 precision. If you want it operational at 9.5+, that's The Build — 6 weeks, $5K, your first client by week 6. Many people also choose to become partnership nodes and use the protocol with their own tribe." },
            { q: "Can I do this in person?", a: "Yes. Based in Mexico City — in-person sessions available. Otherwise we do Zoom, which works equally well." },
          ].map((faq, i) => (
            <div key={i} className="rounded-xl border border-white/8 bg-white/3 overflow-hidden">
              <button
                className="w-full p-4 flex items-center justify-between text-left"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <p className="text-sm text-white/60 font-medium">{faq.q}</p>
                <ChevronDown className={`w-4 h-4 text-white/30 transition-transform flex-shrink-0 ml-2 ${openFaq === i ? "rotate-180" : ""}`} />
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4">
                  <p className="text-xs text-white/35 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </section>

        {/* Bottom CTA */}
        <div className="text-center space-y-3 pb-8">
          <a
            href="https://www.calendly.com/konstantinov"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold bg-[#8460ea] text-white hover:bg-[#7350d8] transition-all duration-300 hover:shadow-xl hover:shadow-[#8460ea]/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            Book Your Ignition Session
            <ArrowRight className="w-5 h-5" />
          </a>
          <div className="flex items-center justify-center gap-4">
            <a href={foundersPath} className="text-xs text-[#6894d0] hover:text-[#8460ea] transition-colors">
              See the Founders →
            </a>
            <a href="/zone-of-genius" className="text-xs text-[#6894d0] hover:text-[#8460ea] transition-colors">
              Free Genius Test →
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
