import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useZoneOfGenius } from "./ZoneOfGeniusContext";
import { TALENTS } from "./talents";
import { cn } from "@/lib/utils";
import { Check, ArrowLeft } from "lucide-react";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { getZogAssessmentBasePath, getZogStepPath } from "./zogRoutes";

const Step2SelectTop3CoreTalents = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedTop10TalentIds, top3CoreTalentIds, setTop3CoreTalentIds } = useZoneOfGenius();
  const basePath = getZogAssessmentBasePath(location.pathname);
  const [localSelected, setLocalSelected] = useState<number[]>(top3CoreTalentIds);
  const [showMaxWarning, setShowMaxWarning] = useState(false);

  useEffect(() => {
    if (selectedTop10TalentIds.length === 0) {
      navigate(getZogStepPath(basePath, 1));
      return;
    }
    setLocalSelected(top3CoreTalentIds);
  }, [selectedTop10TalentIds, top3CoreTalentIds, navigate, basePath]);

  const top10Talents = TALENTS.filter(t => selectedTop10TalentIds.includes(t.id));

  const handleTalentClick = (talentId: number) => {
    if (localSelected.includes(talentId)) {
      setLocalSelected(localSelected.filter(id => id !== talentId));
      setShowMaxWarning(false);
    } else {
      if (localSelected.length < 3) {
        setLocalSelected([...localSelected, talentId]);
        setShowMaxWarning(false);
      } else {
        setShowMaxWarning(true);
        setTimeout(() => setShowMaxWarning(false), 3000);
      }
    }
  };

  const handleContinue = () => {
    setTop3CoreTalentIds(localSelected);
    navigate(getZogStepPath(basePath, 3));
  };

  const handleBack = () => {
    navigate(getZogStepPath(basePath, 1));
  };

  const canContinue = localSelected.length === 3;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-xl sm:text-2xl font-semibold font-display text-[#2c3150]">
          Your Top 3
        </h2>
        <p className="text-sm text-[var(--wabi-text-secondary)] max-w-xl mx-auto">
          Now narrow it down. Which <strong>3</strong> do you love doing the most?
          The ones you'd keep even if you had to drop the rest.
        </p>
      </div>

      {/* Selection counter */}
      <div className="sticky top-20 z-10">
        <div
          className={cn(
            "flex items-center justify-between px-5 py-3 rounded-xl border transition-all duration-300",
            "bg-white/90 backdrop-blur-md shadow-sm",
            canContinue
              ? "border-[#8460ea]/30 shadow-[0_0_20px_rgba(132,96,234,0.1)]"
              : "border-white/40"
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "text-xl font-bold font-display transition-colors",
                canContinue ? "text-[#8460ea]" : "text-[#2c3150]"
              )}
            >
              {localSelected.length}<span className="text-[var(--wabi-text-muted)] font-normal text-sm"> / 3</span>
            </div>
            <span className="text-xs text-[var(--wabi-text-muted)]">core talents selected</span>
          </div>

          {showMaxWarning && (
            <div className="text-xs text-amber-600 animate-fade-in">
              Deselect one to choose another
            </div>
          )}

          <div className="hidden sm:block">
            <PremiumButton
              size="sm"
              onClick={handleContinue}
              disabled={!canContinue}
              className={cn("transition-all", canContinue ? "opacity-100" : "opacity-40")}
            >
              Continue →
            </PremiumButton>
          </div>
        </div>
      </div>

      {/* Talent cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl mx-auto">
        {top10Talents.map((talent) => {
          const isSelected = localSelected.includes(talent.id);
          return (
            <button
              key={talent.id}
              onClick={() => handleTalentClick(talent.id)}
              className={cn(
                "relative p-4 rounded-xl border text-left transition-all duration-200",
                "hover:scale-[1.02] active:scale-[0.98]",
                isSelected
                  ? "border-[#8460ea]/40 bg-[#8460ea]/5 shadow-md shadow-[#8460ea]/8"
                  : "border-white/40 bg-white/70 backdrop-blur-sm hover:border-[var(--wabi-lavender)]/50 hover:shadow-sm"
              )}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#8460ea] flex items-center justify-center">
                  <Check size={12} className="text-white" />
                </div>
              )}
              <h3 className="text-sm font-semibold text-[#2c3150] mb-1 pr-7 font-sans">
                {talent.name}
              </h3>
              <p className="text-xs text-[var(--wabi-text-secondary)] leading-relaxed">
                {talent.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Desktop nav */}
      <div className="hidden sm:flex items-center justify-center gap-4 pt-4 pb-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm
                     text-[var(--wabi-text-secondary)] hover:text-[#2c3150]
                     border border-white/40 bg-white/60 backdrop-blur-sm
                     hover:bg-white/80 transition-all"
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <PremiumButton
          size="lg"
          onClick={handleContinue}
          disabled={!canContinue}
          className={cn(canContinue ? "opacity-100" : "opacity-40 cursor-not-allowed")}
        >
          Continue to Step 3 →
        </PremiumButton>
      </div>

      {/* Mobile sticky */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-white/40 p-4 shadow-lg z-20">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className={cn("text-lg font-bold font-display", canContinue ? "text-[#8460ea]" : "text-[#2c3150]")}>
              {localSelected.length} / 3
            </span>
            <span className="text-xs text-[var(--wabi-text-muted)]">selected</span>
          </div>
          <button
            onClick={handleBack}
            className="text-xs px-3 py-1.5 rounded-full text-[var(--wabi-text-secondary)]
                       border border-white/40 bg-white/60 hover:bg-white/80 transition-colors"
          >
            Back
          </button>
        </div>
        <PremiumButton
          className={cn("w-full", canContinue ? "" : "opacity-40 cursor-not-allowed")}
          size="lg"
          onClick={handleContinue}
          disabled={!canContinue}
        >
          Continue →
        </PremiumButton>
      </div>

      <div className="sm:hidden h-32" />
    </div>
  );
};

export default Step2SelectTop3CoreTalents;
