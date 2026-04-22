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
    <div className="space-y-6" style={{ color: "var(--skin-text-primary, #0a1628)" }}>
      {/* Header — Day 47 late pass: dark text on light Panel 3 */}
      <div className="text-center space-y-2">
        <h2
          className="text-xl sm:text-2xl font-semibold"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            color: "var(--skin-text-primary, #0a1628)",
            textShadow: "0 1px 2px rgba(255,255,255,0.7)",
          }}
        >
          Your Top 3
        </h2>
        <p
          className="text-sm max-w-xl mx-auto"
          style={{
            color: "var(--skin-text-body, rgba(26,30,58,0.82))",
            textShadow: "0 1px 2px rgba(255,255,255,0.6)",
          }}
        >
          Now narrow it down. Which <strong style={{ color: "var(--skin-text-primary, #0a1628)" }}>3</strong> do you love doing the most?
          The ones you'd keep even if you had to drop the rest.
        </p>
      </div>

      {/* Selection counter */}
      <div className="sticky top-4 z-10">
        <div className="liquid-glass flex items-center justify-between px-5 py-3 rounded-xl transition-all duration-300">
          <div className="flex items-center gap-3">
            <div
              className="text-xl font-bold transition-colors"
              style={{ color: canContinue ? "var(--skin-text-primary, #0a1628)" : "var(--skin-text-muted, rgba(26,30,58,0.7))" }}
            >
              {localSelected.length}
              <span className="font-normal text-sm" style={{ color: "var(--skin-text-hint, rgba(26,30,58,0.4))" }}>
                {" / 3"}
              </span>
            </div>
            <span className="text-xs" style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.72))" }}>core talents selected</span>
          </div>

          {showMaxWarning && (
            <div className="text-xs animate-fade-in" style={{ color: "#d97706" }}>
              Deselect one to choose another
            </div>
          )}

          <div className="hidden sm:block">
            <button
              onClick={handleContinue}
              disabled={!canContinue}
              className={cn(
                "liquid-glass-strong px-5 py-2 rounded-full text-sm font-semibold transition-all hover:scale-[1.02] active:scale-95",
                canContinue ? "opacity-100" : "opacity-40 cursor-not-allowed"
              )}
              style={{
                color: "var(--skin-text-primary, #0a1628)",
                textShadow: "0 1px 2px rgba(255,255,255,0.6)",
              }}
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
                isSelected ? "liquid-glass-strong" : "liquid-glass"
              )}
              style={{ color: "var(--skin-text-primary, #0a1628)" }}
            >
              {isSelected && (
                <div
                  className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#5b21b6" }}
                >
                  <Check size={12} className="text-white" />
                </div>
              )}
              <h3
                className="text-sm font-semibold mb-1 pr-7"
                style={{ color: "var(--skin-text-primary, #0a1628)" }}
              >
                {talent.name}
              </h3>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.78))" }}
              >
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
          className="liquid-glass flex items-center gap-2 px-5 py-2.5 rounded-full text-sm transition-all hover:scale-[1.02]"
          style={{ color: "var(--skin-text-body, rgba(26,30,58,0.82))" }}
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className={cn(
            "liquid-glass-strong flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all hover:scale-[1.02] active:scale-95",
            canContinue ? "opacity-100" : "opacity-40 cursor-not-allowed"
          )}
          style={{
            color: "var(--skin-text-primary, #0a1628)",
            textShadow: "0 1px 2px rgba(255,255,255,0.6)",
          }}
        >
          Continue to Step 3
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Mobile sticky */}
      <div
        className="sm:hidden fixed bottom-0 left-0 right-0 p-4 z-20"
        style={{
          background:
            "linear-gradient(to top, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 80%, transparent 100%)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span
              className="text-lg font-bold"
              style={{ color: canContinue ? "var(--skin-text-primary, #0a1628)" : "var(--skin-text-muted, rgba(26,30,58,0.7))" }}
            >
              {localSelected.length} / 3
            </span>
            <span className="text-xs" style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.72))" }}>selected</span>
          </div>
          <button
            onClick={handleBack}
            className="text-xs px-3 py-1.5 rounded-full liquid-glass transition-colors"
            style={{ color: "var(--skin-text-body, rgba(26,30,58,0.82))" }}
          >
            Back
          </button>
        </div>
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className={cn(
            "w-full liquid-glass-strong px-6 py-3 rounded-full text-sm font-semibold transition-all active:scale-95",
            canContinue ? "opacity-100" : "opacity-40 cursor-not-allowed"
          )}
          style={{
            color: "var(--skin-text-primary, #0a1628)",
            textShadow: "0 1px 2px rgba(255,255,255,0.6)",
          }}
        >
          Continue →
        </button>
      </div>

      <div className="sm:hidden h-32" />
    </div>
  );
};

export default Step2SelectTop3CoreTalents;
