import { ArrowRight, Check, Sparkles } from "lucide-react";

const IgniteSession = () => {
  return (
    <div className="min-h-screen bg-[#0c1220] text-white font-sans" id="ignite-page">
      {/* Aurora */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#8460ea]/6 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#6894d0]/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "3s" }} />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 md:px-6 py-12 space-y-10">
        {/* Nav */}
        <div className="flex items-center justify-between">
          <a href="/founders" className="text-xs text-[#6894d0] hover:text-[#8460ea] transition-colors">← All Founders</a>
          <a href="/dashboard" className="text-xs text-white/20 hover:text-white/40 transition-colors">Dashboard</a>
        </div>

        {/* Hero */}
        <header className="text-center space-y-4" id="ignite-hero">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#8460ea]/10 border border-[#8460ea]/20 mb-2">
            <Sparkles className="w-7 h-7 text-[#8460ea]" />
          </div>
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-[#a4a3d0]">
            The Ignition Session
          </p>
          <h1 className="text-3xl md:text-4xl font-display font-medium tracking-tight text-white/90">
            Find your genius.<br />
            <span className="bg-gradient-to-r from-[#8460ea] to-[#6894d0] bg-clip-text text-transparent">
              Build your business around it.
            </span>
          </h1>
          <p className="text-sm text-white/40 max-w-md mx-auto leading-relaxed">
            90 minutes. One session. You walk out with your Unique Business Canvas —
            your myth discovered, your tribe named, your business designed around
            who you already are.
          </p>
        </header>

        {/* What You Get */}
        <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8" id="session-includes">
          <h2 className="text-lg font-display text-white/70 mb-5">What Happens in the Session</h2>
          <div className="space-y-4">
            {[
              { step: "Your Uniqueness", desc: "We extract who you are at your brightest — the thing you've been doing for free that others can't do at all." },
              { step: "Your Shadow", desc: "The lie you've been telling yourself about why your genius 'doesn't count.' We name it so it stops running the show." },
              { step: "Your Myth", desc: "The world-truth that makes your work inevitable. Not a tagline — a reality distortion field that attracts the right people." },
              { step: "Your Tribe", desc: "Who recognizes themselves in your myth. Named with precision so you stop marketing to everyone and start calling the ones who need you." },
              { step: "Your Pain → Promise", desc: "Where your tribe is stuck and where you take them. The master transformation your business delivers." },
              { step: "Your Canvas", desc: "All artifacts distilled into a single-page Unique Business Canvas. Iterate from here. Build from here. This IS your business." },
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

        {/* Social Proof */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center" id="proof-stats">
          {[
            { num: "4", label: "Canvases completed" },
            { num: "100%", label: "Hit rate" },
            { num: "90", label: "Minutes per session" },
            { num: "10", label: "Days, zero spend" },
          ].map((s, i) => (
            <div key={i} className="p-4 rounded-xl border border-white/8 bg-white/3">
              <p className="text-xl font-display font-medium bg-gradient-to-br from-[#8460ea] to-[#6894d0] bg-clip-text text-transparent">{s.num}</p>
              <p className="text-[10px] text-white/25 uppercase tracking-wide mt-1">{s.label}</p>
            </div>
          ))}
        </section>

        {/* Pricing */}
        <section className="rounded-2xl border border-[#8460ea]/20 bg-gradient-to-br from-[#8460ea]/8 to-[#0c1220] p-8 text-center" id="pricing-section">
          <p className="text-xs uppercase tracking-[0.3em] text-[#a4a3d0] mb-2">Investment</p>
          <div className="flex items-baseline justify-center gap-1 mb-1">
            <span className="text-4xl md:text-5xl font-display font-bold text-white/90">$277</span>
          </div>
          <p className="text-xs text-white/25 mb-6">One session. Full canvas. Yours forever.</p>

          <a
            href="https://cal.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold bg-[#8460ea] text-white hover:bg-[#7350d8] transition-all duration-300 hover:shadow-xl hover:shadow-[#8460ea]/30 hover:scale-[1.02] active:scale-[0.98]"
            id="book-session-btn"
          >
            Book Your Ignition Session
            <ArrowRight className="w-5 h-5" />
          </a>

          <p className="text-[10px] text-white/15 mt-4">
            Calendly / Cal.com link — session happens via Zoom or in-person
          </p>
        </section>

        {/* FAQ */}
        <section className="space-y-3" id="faq-section">
          <h2 className="text-lg font-display text-white/70 text-center mb-4">Questions</h2>
          {[
            { q: "What if I don't know my genius yet?", a: "That's exactly what this session is for. You don't prepare — you arrive." },
            { q: "What if I already have a business?", a: "Even better. We check if it's actually aligned with who you are. Most businesses are built around a market gap, not around the founder's uniqueness. We close that gap." },
            { q: "How is this different from coaching?", a: "This isn't coaching. It's extraction. We're not strategizing — we're discovering what's already there and naming it with precision. You walk out with a canvas, not a to-do list." },
            { q: "What happens after the session?", a: "You have your Unique Business Canvas. You iterate from it. You join The Originals — a group of founders who've been through the same process and share wins together." },
          ].map((faq, i) => (
            <div key={i} className="p-4 rounded-xl border border-white/8 bg-white/3">
              <p className="text-sm text-white/60 font-medium">{faq.q}</p>
              <p className="text-xs text-white/35 leading-relaxed mt-1">{faq.a}</p>
            </div>
          ))}
        </section>

        {/* See the founders */}
        <div className="text-center pb-8">
          <a href="/founders" className="text-xs text-[#6894d0] hover:text-[#8460ea] transition-colors inline-flex items-center gap-1.5 border border-[#6894d0]/20 px-4 py-2 rounded-full">
            See the Founders Who've Done It →
          </a>
        </div>
      </div>
    </div>
  );
};

export default IgniteSession;
