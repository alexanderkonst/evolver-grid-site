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
          Order Your Top 3
        </h2>
        <p
          className="text-sm max-w-xl mx-auto"
          style={{
            color: "var(--skin-text-body, rgba(26,30,58,0.82))",
            textShadow: "0 1px 2px rgba(255,255,255,0.6)",
          }}
        >
          Put your 3 core talents in order, from <strong style={{ color: "var(--skin-text-primary, #0a1628)" }}>most defining</strong> (#1) to third (#3).
        </p>
        <p className="text-xs" style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.7))" }}>
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
              "flex items-center gap-3 p-4 rounded-xl cursor-move transition-all duration-200 liquid-glass",
              draggedIndex === index && "opacity-50"
            )}
            style={{ color: "var(--skin-text-primary, #0a1628)" }}
          >
            {/* Drag handle */}
            <GripVertical size={16} className="shrink-0" style={{ color: "var(--skin-text-hint, rgba(26,30,58,0.3))" }} />

            {/* Arrows */}
            <div className="flex flex-col gap-0.5 shrink-0">
              <button
                onClick={() => moveUp(index)}
                disabled={index === 0}
                className={cn(
                  "p-1.5 rounded transition-colors min-h-[40px] sm:min-h-0",
                  index === 0 ? "opacity-20 cursor-not-allowed" : "opacity-60 hover:opacity-100"
                )}
                style={{ backgroundColor: "transparent" }}
              >
                <ChevronUp size={16} style={{ color: "var(--skin-text-primary, #0a1628)" }} />
              </button>
              <button
                onClick={() => moveDown(index)}
                disabled={index === orderedTalents.length - 1}
                className={cn(
                  "p-1.5 rounded transition-colors min-h-[40px] sm:min-h-0",
                  index === orderedTalents.length - 1 ? "opacity-20 cursor-not-allowed" : "opacity-60 hover:opacity-100"
                )}
                style={{ backgroundColor: "transparent" }}
              >
                <ChevronDown size={16} style={{ color: "var(--skin-text-primary, #0a1628)" }} />
              </button>
            </div>

            {/* Rank badge — purple accent for #1, graded violet hues */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={
                index === 0
                  ? { backgroundColor: "#5b21b6", color: "#ffffff" }
                  : index === 1
                    ? { backgroundColor: "rgba(91,33,182,0.2)", color: "#5b21b6" }
                    : { backgroundColor: "rgba(26,30,58,0.08)", color: "var(--skin-text-muted, rgba(26,30,58,0.7))" }
              }
            >
              {index + 1}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p
                className="text-[10px] uppercase tracking-wider font-medium mb-0.5"
                style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.7))" }}
              >
                {rankLabels[index]}
              </p>
              <h3 className="text-sm font-semibold" style={{ color: "var(--skin-text-primary, #0a1628)" }}>
                {talent.name}
              </h3>
              <p className="text-xs truncate" style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.75))" }}>
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
          className="liquid-glass flex items-center gap-2 px-5 py-2.5 rounded-full text-sm transition-all hover:scale-[1.02]"
          style={{ color: "var(--skin-text-body, rgba(26,30,58,0.82))" }}
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <button
          onClick={handleContinue}
          className="liquid-glass-strong flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all hover:scale-[1.02] active:scale-95"
          style={{
            color: "var(--skin-text-primary, #0a1628)",
            textShadow: "0 1px 2px rgba(255,255,255,0.6)",
          }}
        >
          <Sparkles size={14} style={{ color: "#5b21b6" }} />
          Generate My Top Talent
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
          className="w-full liquid-glass-strong px-6 py-3 rounded-full text-sm font-semibold transition-all active:scale-95 flex items-center justify-center gap-2"
          style={{
            color: "var(--skin-text-primary, #0a1628)",
            textShadow: "0 1px 2px rgba(255,255,255,0.6)",
          }}
        >
          <Sparkles size={14} style={{ color: "#5b21b6" }} />
          Generate My Snapshot
        </button>
      </div>

      <div className="sm:hidden h-32" />
    </div>
  );
};

export default Step3OrderTalents;
