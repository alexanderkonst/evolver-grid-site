import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useZoneOfGenius } from "./ZoneOfGeniusContext";
import { TALENTS } from "./talents";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const Step2SelectTop3CoreTalents = () => {
  const navigate = useNavigate();
  const { selectedTop10TalentIds, top3CoreTalentIds, setTop3CoreTalentIds } = useZoneOfGenius();
  const [localSelected, setLocalSelected] = useState<number[]>(top3CoreTalentIds);
  const [showMaxWarning, setShowMaxWarning] = useState(false);

  useEffect(() => {
    if (selectedTop10TalentIds.length === 0) {
      navigate("/zone-of-genius/assessment/step-1");
      return;
    }
    setLocalSelected(top3CoreTalentIds);
  }, [selectedTop10TalentIds, top3CoreTalentIds, navigate]);

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
    navigate("/zone-of-genius/assessment/step-3");
  };

  const handleBack = () => {
    navigate("/zone-of-genius/assessment/step-1");
  };

  const canContinue = localSelected.length === 3;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          Step 2: Narrow Down to Your Top 3 Core Talents
        </h2>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto">
          From your selected talents, choose the 3 that feel like your absolute strongest abilities — the ones you can't not use.
        </p>
      </div>

      <div className="flex items-center justify-between bg-card/60 border border-border rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "text-2xl font-bold transition-colors",
            localSelected.length === 3 ? "text-green-500" : "text-primary"
          )}>
            {localSelected.length} / 3
          </div>
          <span className="text-sm text-muted-foreground">core talents selected</span>
        </div>
        {showMaxWarning && (
          <div className="text-xs sm:text-sm text-orange-500 animate-fade-in">
            You can only select 3 core talents. Please deselect one to choose another.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {top10Talents.map((talent) => {
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

      <div className="hidden sm:flex items-center justify-center gap-4 pt-8">
        <button
          onClick={handleBack}
          className="px-6 py-3 rounded-full border border-border bg-background hover:bg-muted transition-colors"
        >
          Back to Step 1
        </button>
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className={cn(
            "px-8 py-3 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(26,54,93,0.5)] hover:shadow-[0_0_30px_rgba(26,54,93,0.8)]",
            canContinue ? "opacity-100 cursor-pointer" : "opacity-50 cursor-not-allowed"
          )}
          style={{ 
            backgroundColor: 'hsl(210, 70%, 15%)',
            color: 'white'
          }}
        >
          Continue to Step 3
        </button>
      </div>

      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 shadow-lg z-10">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              "text-xl font-bold transition-colors",
              localSelected.length === 3 ? "text-green-500" : "text-primary"
            )}>
              {localSelected.length} / 3
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
            canContinue ? "opacity-100" : "opacity-50 cursor-not-allowed"
          )}
          style={{ 
            backgroundColor: 'hsl(210, 70%, 15%)',
            color: 'white'
          }}
        >
          Continue to Step 3
        </button>
      </div>

      <div className="sm:hidden h-32" />
    </div>
  );
};

export default Step2SelectTop3CoreTalents;
