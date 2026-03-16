/**
 * Shared sections reused across /founders and /game/marketplace pages.
 * Light-mode styling by default (for in-platform use).
 */

export const FoundersHero = ({ lightMode = true }: { lightMode?: boolean }) => (
  <div className="text-center space-y-5" id="showcase-header">
    <p className="text-[11px] font-medium tracking-[0.4em] uppercase text-[#8460ea]/60">
      The Originals
    </p>

    <h2 className="text-3xl md:text-5xl font-display font-medium tracking-tight leading-[1.1]">
      <span className="bg-gradient-to-r from-[#8460ea] via-[#5eaf8b] to-[#d49a5e] bg-clip-text text-transparent">
        Founders Who Found
      </span>
      <br />
      <span className={lightMode ? 'text-[#2c3150]/85' : 'text-white/85'}>Their Genius</span>
    </h2>

    <p className={`text-sm max-w-md mx-auto leading-relaxed ${lightMode ? 'text-[#2c3150]/40' : 'text-white/30'}`}>
      Each person went through the Unique Business Canvas process.
      Their myth was discovered. Their business was designed
      around who they already are.
    </p>

    {/* Stats ribbon */}
    <div className={`flex justify-center gap-6 text-[11px] pt-2 ${lightMode ? 'text-[#2c3150]/25' : 'text-white/15'}`}>
      {[
        { val: "4", label: "canvases" },
        { val: "10", label: "days" },
        { val: "$0", label: "spent" },
        { val: "100%", label: "conversion" },
      ].map((s, i) => (
        <div key={i} className="flex flex-col items-center gap-0.5">
          <span
            className={`text-sm font-display font-medium bg-gradient-to-b bg-clip-text text-transparent ${lightMode ? 'from-[#2c3150]/60 to-[#2c3150]/30' : 'from-white/40 to-white/15'}`}
          >
            {s.val}
          </span>
          <span>{s.label}</span>
        </div>
      ))}
    </div>
  </div>
);

export const FoundersCTA = ({ lightMode = true }: { lightMode?: boolean }) => (
  <div id="showcase-cta">
    {/* Rotating border */}
    <div
      className="relative rounded-3xl p-[1px]"
      style={{
        background:
          "linear-gradient(135deg, #8460ea40, #5eaf8b30, #d49a5e30, #7eb8d430, #8460ea40)",
      }}
    >
      <div className={`rounded-3xl p-10 md:p-14 text-center relative overflow-hidden ${lightMode ? 'bg-white' : 'bg-[#0e1528]'}`}>
        {/* Internal glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[120px] ${lightMode ? 'bg-[#8460ea]/8' : 'bg-[#8460ea]/6'}`} />
        </div>

        <div className="relative z-10">
          <p className="text-[11px] tracking-[0.4em] uppercase text-[#8460ea]/50 mb-4">
            Ready to Find Your Genius?
          </p>

          <h3 className="text-2xl md:text-4xl font-display font-medium mb-3">
            <span className="bg-gradient-to-r from-[#8460ea] via-[#5eaf8b] to-[#d49a5e] bg-clip-text text-transparent">
              Your Uniqueness IS
            </span>
            <br />
            <span className={lightMode ? 'text-[#2c3150]/80' : 'text-white/80'}>Your Business</span>
          </h3>

          <p className={`text-sm max-w-sm mx-auto mb-8 ${lightMode ? 'text-[#2c3150]/40' : 'text-white/30'}`}>
            One session. Your myth discovered. Your canvas complete.
            The business you were always meant to build — revealed.
          </p>

          <a
            href="/ignite"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm font-semibold bg-gradient-to-r from-[#8460ea] to-[#6a4ecf] text-white hover:shadow-xl hover:shadow-[#8460ea]/25 transition-all duration-500 hover:scale-[1.03] active:scale-[0.98]"
            id="book-session-btn"
          >
            <span className="text-lg">◉</span>
            Book Your Ignition Session — $555
          </a>
        </div>
      </div>
    </div>
  </div>
);
