import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Users } from "lucide-react";

const STEPS = [
  { step: 0, labelKey: "assemblyTracker.steps.founder", done: true },
  { step: 1, labelKey: "assemblyTracker.steps.test", done: true },
  { step: 2, labelKey: "assemblyTracker.steps.grow", current: true },
  { step: 3, labelKey: "assemblyTracker.steps.charge" },
  { step: 4, labelKey: "assemblyTracker.steps.community", done: true },
  { step: 5, labelKey: "assemblyTracker.steps.improve", current: true },
  { step: 6, labelKey: "assemblyTracker.steps.others" },
  { step: 7, labelKey: "assemblyTracker.steps.tenK" },
  { step: 8, labelKey: "assemblyTracker.steps.match" },
  { step: 9, labelKey: "assemblyTracker.steps.products" },
  { step: 10, labelKey: "assemblyTracker.steps.selfOrg" },
  { step: 11, labelKey: "assemblyTracker.steps.spread" },
  { step: 12, labelKey: "assemblyTracker.steps.connect" },
];

/**
 * Compact Assembly Progress Tracker for the GameHome page.
 * Shows The Originals community journey through the 12-step emergence sequence.
 */
const AssemblyTracker = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div
      onClick={() => navigate("/the-originals")}
      className="p-4 bg-white/60 rounded-xl border border-[#a4a3d0]/20 hover:border-[#8460ea]/30 transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-[#8460ea]" />
        <p className="text-xs text-[#8460ea] uppercase tracking-wide font-medium">
          {t("assemblyTracker.header")}
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
            title={t("assemblyTracker.stepTooltip", {
              step: s.step,
              label: t(s.labelKey),
            })}
          >
            {s.done ? "✓" : s.step}
          </div>
        ))}
      </div>
      <p className="text-xs text-[#2c3150]/50 mt-2 group-hover:text-[#8460ea] transition-colors">
        {t("assemblyTracker.status")}
      </p>
    </div>
  );
};

export default AssemblyTracker;
