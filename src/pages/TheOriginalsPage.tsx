import { useNavigate } from "react-router-dom";
import { Users, ExternalLink, Sparkles, ArrowRight } from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";

interface Founder {
  name: string;
  archetype: string;
  tagline: string;
  status: "active" | "in-progress";
}

const FOUNDERS: Founder[] = [
  {
    name: "Alexander",
    archetype: "The Focus Lens",
    tagline: "Helps build ventures from who you already are",
    status: "active",
  },
  {
    name: "Oyi",
    archetype: "Lotus Medicine Man",
    tagline: "Restores what growing up took from you",
    status: "active",
  },
  {
    name: "Sergey",
    archetype: "The Vision Builder",
    tagline: "Sees what your life is trying to become",
    status: "in-progress",
  },
];

const TheOriginalsPage = () => {
  const navigate = useNavigate();

  return (
    <GameShellV2>
      <div className="max-w-2xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Hero */}
        <div className="text-center py-10 bg-gradient-to-br from-[#c8b7d8] via-[#d4d1e8] to-[#e7e9f5] rounded-2xl px-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/60 mb-4">
            <Users className="w-7 h-7 text-[#8460ea]" />
          </div>
          <h1 className="text-3xl font-display font-bold text-[#2c3150] mb-3">
            The Originals
          </h1>
          <p className="text-[#2c3150]/70 max-w-md mx-auto">
            Founders who found their genius and built on it. Each person went
            through the process, got clarity, and started building.
          </p>
        </div>

        {/* Founder Cards */}
        <div className="space-y-3">
          {FOUNDERS.map((founder) => (
            <div
              key={founder.name}
              className="p-5 bg-white/60 rounded-xl border border-[#a4a3d0]/20 hover:border-[#8460ea]/30 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-[#2c3150] text-lg">
                      {founder.name}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        founder.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {founder.status === "active" ? "Active" : "Building"}
                    </span>
                  </div>
                  <p className="text-xs text-[#8460ea] uppercase tracking-wide mb-1">
                    {founder.archetype}
                  </p>
                  <p className="text-[#2c3150]/60 text-sm">{founder.tagline}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8460ea]/20 to-[#c8b7d8]/30 flex items-center justify-center flex-shrink-0 ml-4">
                  <span className="text-lg font-bold text-[#8460ea]">
                    {founder.name[0]}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* What Is This */}
        <div className="p-5 bg-white/60 rounded-xl border border-[#a4a3d0]/20">
          <h2 className="font-semibold text-[#2c3150] mb-2">
            What is The Originals?
          </h2>
          <p className="text-sm text-[#2c3150]/70 leading-relaxed mb-3">
            Everyone who's been through the Unique Business Canvas process joins
            this group. It's not a marketing channel — it's a real group of
            founders who share a similar experience and help each other grow.
          </p>
          <p className="text-sm text-[#2c3150]/70 leading-relaxed">
            When one person succeeds, it raises the bar for everyone. Every win
            is shared. Every breakthrough lifts the whole group.
          </p>
        </div>

        {/* Assembly Progress */}
        <div className="p-5 bg-gradient-to-r from-[#8460ea]/5 to-[#c8b7d8]/10 rounded-xl border border-[#8460ea]/15">
          <p className="text-xs text-[#8460ea] uppercase tracking-wide font-medium mb-3">
            Where we are in the journey
          </p>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { step: 0, label: "Founder", done: true },
              { step: 1, label: "Test", done: true },
              { step: 2, label: "Grow", current: true },
              { step: 3, label: "Charge" },
              { step: 4, label: "Community", done: true },
              { step: 5, label: "Improve", current: true },
              { step: 6, label: "Others" },
              { step: 7, label: "$10K" },
              { step: 8, label: "Match" },
              { step: 9, label: "Products" },
              { step: 10, label: "Self-org" },
              { step: 11, label: "Spread" },
              { step: 12, label: "Connect" },
            ].map((s) => (
              <div
                key={s.step}
                className={`flex items-center justify-center w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                  s.current
                    ? "bg-[#8460ea] text-white shadow-md shadow-[#8460ea]/30"
                    : s.done
                    ? "bg-[#8460ea]/20 text-[#8460ea]"
                    : "bg-[#a4a3d0]/10 text-[#a4a3d0]"
                }`}
                title={`Step ${s.step}: ${s.label}`}
              >
                {s.done ? "✓" : s.step}
              </div>
            ))}
          </div>
          <p className="text-xs text-[#2c3150]/50 mt-2">
            Step 2: Growing through word of mouth · 7/10 spots filled
          </p>
        </div>

        {/* Join CTA */}
        <div className="text-center py-4">
          <a
            href="https://t.me/+example"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-lg"
            style={{ backgroundColor: "hsl(210, 70%, 15%)", color: "white" }}
          >
            <ExternalLink className="w-4 h-4" />
            Join on Telegram
          </a>
        </div>

        {/* Back to ZoG CTA */}
        <div className="text-center p-4 bg-gradient-to-br from-white via-[#f5f5ff] to-[#ebe8f7] rounded-xl border border-[#a4a3d0]/20">
          <p className="text-sm text-[#a4a3d0] mb-3">
            Haven't found your genius yet?
          </p>
          <button
            onClick={() => navigate("/zone-of-genius/entry")}
            className="inline-flex items-center gap-2 text-[#8460ea] text-sm font-medium hover:underline"
          >
            <Sparkles className="w-4 h-4" />
            Discover Your Zone of Genius
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </GameShellV2>
  );
};

export default TheOriginalsPage;
