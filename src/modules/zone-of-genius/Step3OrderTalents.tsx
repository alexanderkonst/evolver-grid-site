import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useZoneOfGenius } from "./ZoneOfGeniusContext";
import { TALENTS } from "./talents";
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown, ArrowLeft, GripVertical, Sparkles } from "lucide-react";
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
        <h2 className="text-xl sm:text-2xl font-semibold text-white/90">
          Order Your Top 3
        </h2>
        <p className="text-sm text-white/50 max-w-xl mx-auto">
          Put your 3 core talents in order, from <strong className="text-white/70">most defining</strong> (#1) to third (#3).
        </p>
        <p className="text-xs text-white/30">
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
              "flex items-center gap-3 p-4 rounded-xl cursor-move transition-all duration-200",
              "liquid-glass hover:ring-1 hover:ring-white/15",
              draggedIndex === index && "opacity-50 ring-1 ring-white/30"
            )}
          >
            {/* Drag handle */}
            <GripVertical size={16} className="text-white/20 shrink-0" />

            {/* Arrows */}
            <div className="flex flex-col gap-0.5 shrink-0">
              <button
                onClick={() => moveUp(index)}
                disabled={index === 0}
                className={cn(
                  "p-1.5 rounded hover:bg-white/10 transition-colors min-h-[40px] sm:min-h-0",
                  index === 0 ? "opacity-20 cursor-not-allowed" : "opacity-50 hover:opacity-80"
                )}
              >
                <ChevronUp size={16} className="text-white" />
              </button>
              <button
                onClick={() => moveDown(index)}
                disabled={index === orderedTalents.length - 1}
                className={cn(
                  "p-1.5 rounded hover:bg-white/10 transition-colors min-h-[40px] sm:min-h-0",
                  index === orderedTalents.length - 1 ? "opacity-20 cursor-not-allowed" : "opacity-50 hover:opacity-80"
                )}
              >
                <ChevronDown size={16} className="text-white" />
              </button>
            </div>

            {/* Rank badge */}
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                index === 0
                  ? "bg-white/25 text-white"
                  : index === 1
                    ? "bg-white/12 text-white/70"
                    : "bg-white/5 text-white/40"
              )}
            >
              {index + 1}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-white/30 font-medium mb-0.5">
                {rankLabels[index]}
              </p>
              <h3 className="text-sm font-semibold text-white/90">
                {talent.name}
              </h3>
              <p className="text-xs text-white/35 truncate">
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
          className="liquid-glass flex items-center gap-2 px-5 py-2.5 rounded-full text-sm text-white/50 hover:text-white/80 transition-all hover:scale-[1.02]"
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <button
          onClick={handleContinue}
          className="liquid-glass-strong flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium text-white transition-all hover:scale-[1.02] active:scale-95 ring-1 ring-white/20"
        >
          <Sparkles size={14} />
          Generate My Zone of Genius
        </button>
      </div>

      {/* Mobile sticky */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 z-20" style={{
        background: 'linear-gradient(to top, rgba(10,10,26,0.98) 0%, rgba(10,10,26,0.9) 80%, transparent 100%)',
      }}>
        <div className="flex items-center justify-between gap-3 mb-3">
          <button
            onClick={handleBack}
            className="text-xs px-3 py-1.5 rounded-full text-white/40 liquid-glass hover:text-white/60 transition-colors"
          >
            Back
          </button>
        </div>
        <button
          onClick={handleContinue}
          className="w-full liquid-glass-strong px-6 py-3 rounded-full text-sm font-medium text-white transition-all ring-1 ring-white/20 active:scale-95 flex items-center justify-center gap-2"
        >
          <Sparkles size={14} />
          Generate My Snapshot
        </button>
      </div>

      <div className="sm:hidden h-32" />
    </div>
  );
};

export default Step3OrderTalents;
