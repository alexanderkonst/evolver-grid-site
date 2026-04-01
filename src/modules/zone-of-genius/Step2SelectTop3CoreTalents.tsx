import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useZoneOfGenius } from "./ZoneOfGeniusContext";
import { TALENTS } from "./talents";
import { cn } from "@/lib/utils";
import { Check, ArrowLeft, ArrowRight } from "lucide-react";
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
        <h2 className="text-xl sm:text-2xl font-semibold text-white/90">
          Your Top 3
        </h2>
        <p className="text-sm text-white/50 max-w-xl mx-auto">
          Now narrow it down. Which <strong className="text-white/70">3</strong> do you love doing the most?
          The ones you'd keep even if you had to drop the rest.
        </p>
      </div>

      {/* Selection counter */}
      <div className="sticky top-4 z-10">
        <div
          className={cn(
            "liquid-glass flex items-center justify-between px-5 py-3 rounded-xl transition-all duration-300",
            canContinue && "ring-1 ring-white/30 shadow-[0_0_20px_rgba(255,255,255,0.08)]"
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "text-xl font-bold transition-colors",
                canContinue ? "text-white" : "text-white/70"
              )}
            >
              {localSelected.length}<span className="text-white/30 font-normal text-sm"> / 3</span>
            </div>
            <span className="text-xs text-white/30">core talents selected</span>
          </div>

          {showMaxWarning && (
            <div className="text-xs text-amber-400/80 animate-fade-in">
              Deselect one to choose another
            </div>
          )}

          <div className="hidden sm:block">
            <button
              onClick={handleContinue}
              disabled={!canContinue}
              className={cn(
                "liquid-glass-strong px-5 py-2 rounded-full text-sm font-medium text-white transition-all hover:scale-[1.02] active:scale-95",
                canContinue ? "opacity-100 ring-1 ring-white/20" : "opacity-30 cursor-not-allowed"
              )}
            >
              Continue →
            </button>
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
                "relative p-4 rounded-xl text-left transition-all duration-200",
                "hover:scale-[1.02] active:scale-[0.98]",
                isSelected
                  ? "liquid-glass-strong ring-1 ring-white/30 shadow-[0_0_15px_rgba(255,255,255,0.08)]"
                  : "liquid-glass hover:ring-1 hover:ring-white/15"
              )}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-white/30 flex items-center justify-center">
                  <Check size={12} className="text-white" />
                </div>
              )}
              <h3 className="text-sm font-semibold text-white/90 mb-1 pr-7">
                {talent.name}
              </h3>
              <p className="text-xs text-white/45 leading-relaxed">
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
          className="liquid-glass flex items-center gap-2 px-5 py-2.5 rounded-full text-sm text-white/50 hover:text-white/80 transition-all hover:scale-[1.02]"
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className={cn(
            "liquid-glass-strong flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium text-white transition-all hover:scale-[1.02] active:scale-95 ring-1 ring-white/20",
            canContinue ? "opacity-100" : "opacity-30 cursor-not-allowed"
          )}
        >
          Continue to Step 3
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Mobile sticky */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 z-20" style={{
        background: 'linear-gradient(to top, rgba(10,10,26,0.98) 0%, rgba(10,10,26,0.9) 80%, transparent 100%)',
      }}>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className={cn("text-lg font-bold", canContinue ? "text-white" : "text-white/70")}>
              {localSelected.length} / 3
            </span>
            <span className="text-xs text-white/30">selected</span>
          </div>
          <button
            onClick={handleBack}
            className="text-xs px-3 py-1.5 rounded-full text-white/40 liquid-glass hover:text-white/60 transition-colors"
          >
            Back
          </button>
        </div>
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className={cn(
            "w-full liquid-glass-strong px-6 py-3 rounded-full text-sm font-medium text-white transition-all ring-1 ring-white/20 active:scale-95",
            canContinue ? "opacity-100" : "opacity-30 cursor-not-allowed"
          )}
        >
          Continue →
        </button>
      </div>

      <div className="sm:hidden h-32" />
    </div>
  );
};

export default Step2SelectTop3CoreTalents;
