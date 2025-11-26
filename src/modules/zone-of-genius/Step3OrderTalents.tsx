import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useZoneOfGenius } from "./ZoneOfGeniusContext";
import { TALENTS } from "./talents";
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown } from "lucide-react";

const Step3OrderTalents = () => {
  const navigate = useNavigate();
  const { top3CoreTalentIds, orderedTalentIds, setOrderedTalentIds } = useZoneOfGenius();
  const [localOrdered, setLocalOrdered] = useState<number[]>(
    orderedTalentIds.length > 0 ? orderedTalentIds : top3CoreTalentIds
  );

  useEffect(() => {
    if (top3CoreTalentIds.length === 0) {
      navigate("/zone-of-genius/assessment/step-2");
      return;
    }
    if (orderedTalentIds.length === 0) {
      setLocalOrdered(top3CoreTalentIds);
    }
  }, [top3CoreTalentIds, orderedTalentIds, navigate]);

  const orderedTalents = localOrdered.map(id => TALENTS.find(t => t.id === id)!).filter(Boolean);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...localOrdered];
    [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
    setLocalOrdered(newOrder);
  };

  const moveDown = (index: number) => {
    if (index === localOrdered.length - 1) return;
    const newOrder = [...localOrdered];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setLocalOrdered(newOrder);
  };

  const handleContinue = () => {
    setOrderedTalentIds(localOrdered);
    navigate("/zone-of-genius/assessment/step-4");
  };

  const handleBack = () => {
    navigate("/zone-of-genius/assessment/step-2");
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          Step 3: Arrange Your Talents in Order of Use
        </h2>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto">
          Drag and drop your talents or use the arrow buttons to arrange them in the order you typically apply them in your life. The first talent should be the one you use most naturally and frequently.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {orderedTalents.map((talent, index) => (
          <div
            key={talent.id}
            className="flex items-center gap-4 p-5 rounded-xl border-2 border-border bg-card/60"
          >
            <div className="flex flex-col gap-1">
              <button
                onClick={() => moveUp(index)}
                disabled={index === 0}
                className={cn(
                  "p-1 rounded hover:bg-primary/10 transition-colors",
                  index === 0 ? "opacity-30 cursor-not-allowed" : "opacity-100"
                )}
              >
                <ChevronUp size={20} className="text-primary" />
              </button>
              <button
                onClick={() => moveDown(index)}
                disabled={index === orderedTalents.length - 1}
                className={cn(
                  "p-1 rounded hover:bg-primary/10 transition-colors",
                  index === orderedTalents.length - 1 ? "opacity-30 cursor-not-allowed" : "opacity-100"
                )}
              >
                <ChevronDown size={20} className="text-primary" />
              </button>
            </div>

            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg flex-shrink-0">
              {index + 1}
            </div>

            <div className="flex-1">
              <h3 className="text-base font-semibold text-foreground mb-1">
                {talent.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {talent.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden sm:flex items-center justify-center gap-4 pt-8">
        <button
          onClick={handleBack}
          className="px-6 py-3 rounded-full border border-border bg-background hover:bg-muted transition-colors"
        >
          Back to Step 2
        </button>
        <button
          onClick={handleContinue}
          className="px-8 py-3 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(26,54,93,0.5)] hover:shadow-[0_0_30px_rgba(26,54,93,0.8)]"
          style={{ 
            backgroundColor: 'hsl(210, 70%, 15%)',
            color: 'white'
          }}
        >
          Continue to Generate My Zone of Genius Snapshot
        </button>
      </div>

      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 shadow-lg z-10">
        <div className="flex items-center justify-between gap-3 mb-3">
          <button
            onClick={handleBack}
            className="text-xs px-3 py-2 rounded-full border border-border bg-background hover:bg-muted transition-colors"
          >
            Back to Step 2
          </button>
        </div>
        <button
          onClick={handleContinue}
          className="w-full py-3 rounded-full font-bold transition-all text-sm"
          style={{ 
            backgroundColor: 'hsl(210, 70%, 15%)',
            color: 'white'
          }}
        >
          Generate My Snapshot
        </button>
      </div>

      <div className="sm:hidden h-32" />
    </div>
  );
};

export default Step3OrderTalents;
