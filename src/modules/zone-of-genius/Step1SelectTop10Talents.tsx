import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useZoneOfGenius } from "./ZoneOfGeniusContext";
import { TALENTS } from "./talents";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import BoldText from "@/components/BoldText";

const Step1SelectTop10Talents = () => {
  const navigate = useNavigate();
  const { selectedTop10TalentIds, setSelectedTop10TalentIds } = useZoneOfGenius();
  const [localSelected, setLocalSelected] = useState<number[]>(selectedTop10TalentIds);
  const [showMaxWarning, setShowMaxWarning] = useState(false);
  const [randomizedTalents] = useState(() => {
    // Randomize talents order on mount
    const shuffled = [...TALENTS];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });

  useEffect(() => {
    setLocalSelected(selectedTop10TalentIds);
  }, [selectedTop10TalentIds]);

  const handleTalentClick = (talentId: number) => {
    if (localSelected.includes(talentId)) {
      // Deselect
      setLocalSelected(localSelected.filter(id => id !== talentId));
      setShowMaxWarning(false);
    } else {
      // Try to select
      if (localSelected.length < 10) {
        setLocalSelected([...localSelected, talentId]);
        setShowMaxWarning(false);
      } else {
        // Show warning
        setShowMaxWarning(true);
        setTimeout(() => setShowMaxWarning(false), 3000);
      }
    }
  };

  const handleContinue = () => {
    setSelectedTop10TalentIds(localSelected);
    navigate("/zone-of-genius/assessment/step-2");
  };

  const handleBack = () => {
    navigate("/zone-of-genius");
  };

  const canContinue = localSelected.length === 10;

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          Step 1: Select Your Top 10 Most Energizing Talents
        </h2>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto">
          From the list below, choose the 10 talents that <BoldText>FEEL MOST ALIVE AND NATURAL</BoldText> to you. Don't overthink it — go with what <BoldText>FEELS TRUE</BoldText>.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-between bg-card/60 border border-border rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "text-2xl font-bold transition-colors",
            localSelected.length === 10 ? "text-green-500" : "text-primary"
          )}>
            {localSelected.length} / 10
          </div>
          <span className="text-sm text-muted-foreground">talents selected</span>
        </div>
        {showMaxWarning && (
          <div className="text-xs sm:text-sm text-orange-500 animate-fade-in">
            You can only select up to 10 talents. Please deselect one to choose another.
          </div>
        )}
      </div>

      {/* Talent Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {randomizedTalents.map((talent) => {
          const isSelected = localSelected.includes(talent.id);
          return (
            <button
              key={talent.id}
              onClick={() => handleTalentClick(talent.id)}
              className={cn(
                "relative p-5 rounded-xl border-2 text-left transition-all hover:scale-[1.02] active:scale-[0.98]",
                isSelected
                  ? "border-primary bg-primary/10 shadow-md"
                  : "border-border bg-card/60 hover:border-primary/50"
              )}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check size={16} className="text-primary-foreground" />
                </div>
              )}
              <h3 className="text-base font-semibold text-foreground mb-2 pr-8">
                {talent.name}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {talent.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Navigation Buttons - Desktop */}
      <div className="hidden sm:flex items-center justify-center gap-4 pt-8">
        <button
          onClick={handleBack}
          className="px-6 py-3 rounded-full border border-border bg-background hover:bg-muted transition-colors"
        >
          Back to Landing Page
        </button>
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className={cn(
            "px-8 py-3 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(26,54,93,0.5)] hover:shadow-[0_0_30px_rgba(26,54,93,0.8)]",
            canContinue
              ? "opacity-100 cursor-pointer"
              : "opacity-50 cursor-not-allowed"
          )}
          style={{ 
            backgroundColor: 'hsl(210, 70%, 15%)',
            color: 'white'
          }}
        >
          Continue to Step 2
        </button>
      </div>

      {/* Sticky Bottom Bar - Mobile */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 shadow-lg z-10">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              "text-xl font-bold transition-colors",
              localSelected.length === 10 ? "text-green-500" : "text-primary"
            )}>
              {localSelected.length} / 10
            </div>
            <span className="text-xs text-muted-foreground">selected</span>
          </div>
          <button
            onClick={handleBack}
            className="text-xs px-3 py-2 rounded-full border border-border bg-background hover:bg-muted transition-colors"
          >
            Back
          </button>
        </div>
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className={cn(
            "w-full py-3 rounded-full font-bold transition-all text-sm",
            canContinue
              ? "opacity-100"
              : "opacity-50 cursor-not-allowed"
          )}
          style={{ 
            backgroundColor: 'hsl(210, 70%, 15%)',
            color: 'white'
          }}
        >
          Continue to Step 2
        </button>
      </div>

      {/* Spacer for mobile sticky bar */}
      <div className="sm:hidden h-32" />
    </div>
  );
};

export default Step1SelectTop10Talents;
