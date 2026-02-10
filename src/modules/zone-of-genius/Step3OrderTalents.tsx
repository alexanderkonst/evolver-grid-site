import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useZoneOfGenius } from "./ZoneOfGeniusContext";
import { TALENTS } from "./talents";
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown, ArrowLeft, GripVertical } from "lucide-react";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { getZogAssessmentBasePath, getZogStepPath } from "./zogRoutes";

const Step3OrderTalents = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { top3CoreTalentIds, orderedTalentIds, setOrderedTalentIds } = useZoneOfGenius();
  const basePath = getZogAssessmentBasePath(location.pathname);
  const [localOrdered, setLocalOrdered] = useState<number[]>(
    orderedTalentIds.length > 0 ? orderedTalentIds : top3CoreTalentIds
  );
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (top3CoreTalentIds.length === 0) {
      navigate(getZogStepPath(basePath, 2));
      return;
    }
    if (orderedTalentIds.length === 0) {
      setLocalOrdered(top3CoreTalentIds);
    }
  }, [top3CoreTalentIds, orderedTalentIds, navigate, basePath]);

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
    navigate(getZogStepPath(basePath, 4));
  };

  const handleBack = () => {
    navigate(getZogStepPath(basePath, 2));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newOrder = [...localOrdered];
    const draggedItem = newOrder[draggedIndex];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, draggedItem);

    setLocalOrdered(newOrder);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const rankLabels = ["Primary Genius", "Secondary Genius", "Supporting Genius"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-xl sm:text-2xl font-semibold font-display text-[#2c3150]">
          Order Your Top 3
        </h2>
        <p className="text-sm text-[var(--wabi-text-secondary)] max-w-xl mx-auto">
          Put your 3 core talents in order, from <strong>most defining</strong> (#1) to third (#3).
        </p>
        <p className="text-xs text-[var(--wabi-text-muted)]">
          Drag or use arrows to reorder.
        </p>
      </div>

      {/* Ordered talent cards */}
      <div className="max-w-lg mx-auto space-y-3">
        {orderedTalents.map((talent, index) => (
          <div
            key={talent.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={cn(
              "flex items-center gap-3 p-4 rounded-xl border cursor-move transition-all duration-200",
              "bg-white/80 backdrop-blur-sm hover:shadow-md",
              draggedIndex === index
                ? "opacity-50 border-[#8460ea]/30"
                : "border-white/40 hover:border-[var(--wabi-lavender)]/50"
            )}
          >
            {/* Drag handle */}
            <GripVertical size={16} className="text-[var(--wabi-text-muted)] shrink-0" />

            {/* Arrows */}
            <div className="flex flex-col gap-0.5 shrink-0">
              <button
                onClick={() => moveUp(index)}
                disabled={index === 0}
                className={cn(
                  "p-1.5 rounded hover:bg-[#8460ea]/10 transition-colors min-h-[40px] sm:min-h-0",
                  index === 0 ? "opacity-20 cursor-not-allowed" : "opacity-60 hover:opacity-100"
                )}
              >
                <ChevronUp size={16} className="text-[#8460ea]" />
              </button>
              <button
                onClick={() => moveDown(index)}
                disabled={index === orderedTalents.length - 1}
                className={cn(
                  "p-1.5 rounded hover:bg-[#8460ea]/10 transition-colors min-h-[40px] sm:min-h-0",
                  index === orderedTalents.length - 1 ? "opacity-20 cursor-not-allowed" : "opacity-60 hover:opacity-100"
                )}
              >
                <ChevronDown size={16} className="text-[#8460ea]" />
              </button>
            </div>

            {/* Rank badge */}
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                index === 0
                  ? "bg-[#8460ea] text-white"
                  : index === 1
                    ? "bg-[#8460ea]/20 text-[#8460ea]"
                    : "bg-[var(--wabi-pearl)] text-[var(--wabi-text-secondary)]"
              )}
            >
              {index + 1}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-[#8460ea]/60 font-medium mb-0.5">
                {rankLabels[index]}
              </p>
              <h3 className="text-sm font-semibold text-[#2c3150] font-sans">
                {talent.name}
              </h3>
              <p className="text-xs text-[var(--wabi-text-muted)] truncate">
                {talent.description}
              </p>
            </div>
          </div>
        ))}
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
        <PremiumButton size="lg" onClick={handleContinue}>
          Generate My Zone of Genius ✦
        </PremiumButton>
      </div>

      {/* Mobile sticky */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-white/40 p-4 shadow-lg z-20">
        <div className="flex items-center justify-between gap-3 mb-3">
          <button
            onClick={handleBack}
            className="text-xs px-3 py-1.5 rounded-full text-[var(--wabi-text-secondary)]
                       border border-white/40 bg-white/60 hover:bg-white/80 transition-colors"
          >
            Back
          </button>
        </div>
        <PremiumButton className="w-full" size="lg" onClick={handleContinue}>
          Generate My Snapshot ✦
        </PremiumButton>
      </div>

      <div className="sm:hidden h-32" />
    </div>
  );
};

export default Step3OrderTalents;
