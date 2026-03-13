import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";

const STEPS = [
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
];

/**
 * Compact Assembly Progress Tracker for the GameHome page.
 * Shows The Originals community journey through the 12-step emergence sequence.
 */
const AssemblyTracker = () => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate("/the-originals")}
      className="p-4 bg-white/60 rounded-xl border border-[#a4a3d0]/20 hover:border-[#8460ea]/30 transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-[#8460ea]" />
        <p className="text-xs text-[#8460ea] uppercase tracking-wide font-medium">
          The Originals · Community Journey
        </p>
      </div>
      <div className="flex items-center gap-1 flex-wrap">
        {STEPS.map((s) => (
          <div
            key={s.step}
            className={`flex items-center justify-center w-7 h-7 rounded-lg text-[10px] font-semibold transition-all ${
              s.current
                ? "bg-[#8460ea] text-white shadow-sm shadow-[#8460ea]/30"
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
      <p className="text-xs text-[#2c3150]/50 mt-2 group-hover:text-[#8460ea] transition-colors">
        Step 2: Growing through word of mouth · 3 founders active →
      </p>
    </div>
  );
};

export default AssemblyTracker;
