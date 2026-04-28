import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import GameShellV2 from "@/components/game/GameShellV2";
import {
  LIBRARY_CATEGORIES,
  LIBRARY_ITEMS,
  LibraryItem,
  LibraryCategoryId,
} from "@/modules/library/libraryContent";
import { GROWTH_STEPS, findStep, type GrowthStep } from "@/modules/library/growthSteps";
import { GOLD_TEXT_STYLE, Ornament } from "@/lib/landingDesign";
import { cn } from "@/lib/utils";
import { Lock, Play, BookOpen, ArrowRight, Rocket, Sparkles } from "lucide-react";

/* ─── Shared skin-aware text styles ─── */
// Day 56 night (Sasha 2026-04-28): Library now reads against the editorial
// brand register, not the dark cosmic-only palette. All text uses skin
// tokens so it stays legible on Aurora (cream) AND Navy+Gold (dark) skins
// — same pattern Auth.tsx uses, same litmus as the landing.
const TITLE_STYLE: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  color: "var(--skin-text-primary, #0a1628)",
  textShadow:
    "var(--skin-text-halo-strong, 0 0 22px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.8))",
};

const BODY_STYLE: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  color: "var(--skin-text-muted, rgba(26,30,58,0.7))",
  textShadow:
    "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
};

const EYEBROW_STYLE: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  color: "var(--skin-text-muted, rgba(26,30,58,0.78))",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  fontWeight: 600,
};

/* ─── Video Category Filter ─── */
const VideoCategoryFilter = ({
  activeCategory,
  onSelect,
}: {
  activeCategory: LibraryCategoryId | "all";
  onSelect: (id: LibraryCategoryId | "all") => void;
}) => (
  <div className="flex gap-2 flex-wrap mb-6 justify-center">
    <button
      onClick={() => onSelect("all")}
      className={cn(
        "px-4 py-2 rounded-full text-xs font-medium transition-all duration-300",
        activeCategory === "all"
          ? "bg-[rgba(212,175,55,0.18)] ring-1 ring-[rgba(212,175,55,0.6)]"
          : "bg-[rgba(212,175,55,0.06)] ring-1 ring-[rgba(212,175,55,0.18)] hover:bg-[rgba(212,175,55,0.12)]"
      )}
      style={{
        ...EYEBROW_STYLE,
        color: "var(--skin-text-primary, #0a1628)",
        letterSpacing: "0.16em",
      }}
    >
      All
    </button>
    {LIBRARY_CATEGORIES.map((cat) => (
      <button
        key={cat.id}
        onClick={() => onSelect(cat.id)}
        className={cn(
          "px-4 py-2 rounded-full text-xs font-medium transition-all duration-300",
          activeCategory === cat.id
            ? "bg-[rgba(212,175,55,0.18)] ring-1 ring-[rgba(212,175,55,0.6)]"
            : "bg-[rgba(212,175,55,0.06)] ring-1 ring-[rgba(212,175,55,0.18)] hover:bg-[rgba(212,175,55,0.12)]"
        )}
        style={{
          ...EYEBROW_STYLE,
          color: "var(--skin-text-primary, #0a1628)",
          letterSpacing: "0.16em",
        }}
      >
        {cat.name}
      </button>
    ))}
  </div>
);

/* ─── Video Card ─── */
const VideoCard = ({
  item,
  onSelect,
}: {
  item: LibraryItem;
  onSelect: (item: LibraryItem) => void;
}) => (
  <button
    onClick={() => onSelect(item)}
    className="flex flex-col rounded-2xl liquid-glass-strong text-left group hover:scale-[1.015] transition-all duration-300 overflow-hidden"
    style={{
      boxShadow:
        "0 8px 24px -10px rgba(10, 22, 40, 0.18), 0 0 0 1px rgba(212, 175, 55, 0.18)",
    }}
  >
    <div className="relative w-full aspect-video overflow-hidden">
      <img
        src={`https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`}
        alt={item.title}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/5 transition-colors duration-300" />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
          <Play className="w-5 h-5 text-white ml-0.5" />
        </div>
      </div>
    </div>
    <div className="p-4 flex flex-col gap-1.5">
      <div
        className="text-base font-semibold line-clamp-2"
        style={{
          ...TITLE_STYLE,
          fontWeight: 600,
        }}
      >
        {item.title}
      </div>
      {item.teacher && (
        <div className="text-xs italic" style={BODY_STYLE}>
          {item.teacher}
        </div>
      )}
      {(item.durationLabel || item.durationMinutes) && (
        <div className="text-[11px]" style={{ ...BODY_STYLE, opacity: 0.75 }}>
          {item.durationLabel ?? `${item.durationMinutes} min`}
        </div>
      )}
    </div>
  </button>
);

/* ─── Step Header ─── */
const StepHeader = ({ step }: { step: GrowthStep }) => (
  <div className="text-center mb-10">
    <div
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass-strong mb-5"
      style={{ boxShadow: "0 0 0 1px rgba(212, 175, 55, 0.22)" }}
    >
      <span
        className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-semibold"
        style={{
          background: "linear-gradient(135deg, rgba(244, 212, 114, 0.95) 0%, rgba(212, 175, 55, 0.85) 100%)",
          color: "#0a1628",
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontVariantNumeric: "tabular-nums lining-nums",
          border: "0.5px solid rgba(122, 81, 8, 0.45)",
        }}
      >
        {step.number}
      </span>
      <span className="text-[10.5px]" style={EYEBROW_STYLE}>
        Growth Sequence · Step {step.number}
      </span>
    </div>
    <h1
      className="text-3xl sm:text-4xl lg:text-5xl font-semibold mb-4 tracking-tight leading-[1.1]"
      style={TITLE_STYLE}
    >
      {step.title}
    </h1>
    <Ornament className="my-4" />
    <p className="text-base sm:text-lg italic max-w-2xl mx-auto leading-relaxed" style={BODY_STYLE}>
      {step.description}
    </p>
  </div>
);

/* ─── Step Content (pane 3) ─── */
const StepContent = ({ step }: { step: GrowthStep }) => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<LibraryCategoryId | "all">("all");
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);

  const filteredItems = LIBRARY_ITEMS.filter(
    (item) => activeCategory === "all" || item.categoryId === activeCategory
  );

  return (
    <>
      <div className="p-6 pb-24 lg:p-10 lg:pb-12 max-w-5xl mx-auto">
        <StepHeader step={step} />

        {/* Videos grid */}
        {step.content === "videos" && (
          <div>
            <VideoCategoryFilter activeCategory={activeCategory} onSelect={setActiveCategory} />
            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredItems.map((item) => (
                  <VideoCard key={item.id} item={item} onSelect={setSelectedItem} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-center" style={BODY_STYLE}>
                No content in this category yet.
              </p>
            )}
          </div>
        )}

        {/* Article link (scientific materialism) */}
        {step.content === "article-link" && (
          <div className="flex flex-col items-center">
            <div
              className="liquid-glass-strong rounded-2xl p-8 text-center max-w-md mx-auto"
              style={{ boxShadow: "0 8px 30px -10px rgba(10,22,40,0.2), 0 0 0 1px rgba(212,175,55,0.22)" }}
            >
              <BookOpen
                className="w-8 h-8 mx-auto mb-4"
                style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.5))" }}
              />
              <h3 className="text-xl font-semibold mb-2" style={TITLE_STYLE}>
                Coming Soon
              </h3>
              <p className="text-sm italic" style={BODY_STYLE}>
                The scientific materialism antidote article is being prepared.
              </p>
            </div>
          </div>
        )}

        {/* 27 Perspectives article */}
        {step.content === "article-27" && (
          <div className="flex flex-col items-center">
            <button
              onClick={() => navigate(step.linkTo!)}
              className="liquid-glass-strong rounded-2xl p-8 text-center max-w-md mx-auto hover:scale-[1.015] transition-all duration-300 group/card w-full"
              style={{
                boxShadow:
                  "0 12px 36px -12px rgba(10,22,40,0.22), 0 0 0 1px rgba(212,175,55,0.3)",
              }}
            >
              <BookOpen
                className="w-9 h-9 mx-auto mb-4"
                style={{ color: "rgba(160, 109, 8, 0.88)" }}
              />
              <h3 className="text-xl font-semibold mb-1" style={TITLE_STYLE}>
                27-Perspective{" "}
                <span className="bg-clip-text text-transparent" style={GOLD_TEXT_STYLE}>
                  Vision
                </span>
              </h3>
              <p className="text-sm italic mb-5" style={BODY_STYLE}>
                Person-Perspectives as Dimensions of Reality
              </p>
              <div
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300"
                style={{
                  background: "rgba(212, 175, 55, 0.16)",
                  border: "1px solid rgba(212, 175, 55, 0.55)",
                  color: "#7a5108",
                  fontFamily: "'Cormorant Garamond', serif",
                  letterSpacing: "0.04em",
                }}
              >
                Read the article
                <ArrowRight className="w-4 h-4 group-hover/card:translate-x-1 transition-transform duration-300" />
              </div>
            </button>
          </div>
        )}

        {/* CTA — Work With Me 1:1 */}
        {step.content === "cta" && (
          <div className="flex flex-col items-center">
            <button
              onClick={() => navigate(step.linkTo!)}
              className="liquid-glass-strong rounded-2xl p-8 text-center max-w-md mx-auto hover:scale-[1.025] transition-all duration-300 group/card w-full"
              style={{
                boxShadow:
                  "0 16px 44px -14px rgba(10,22,40,0.28), 0 0 0 1px rgba(212,175,55,0.4)",
              }}
            >
              <Rocket
                className="w-10 h-10 mx-auto mb-4"
                style={{ color: "rgba(160, 109, 8, 0.92)" }}
              />
              <h3 className="text-2xl font-semibold mb-2" style={TITLE_STYLE}>
                <span className="bg-clip-text text-transparent" style={GOLD_TEXT_STYLE}>
                  Ignition
                </span>{" "}
                Session
              </h3>
              <p className="text-sm italic mb-6" style={BODY_STYLE}>
                One conversation that changes your trajectory.
              </p>
              <div
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, rgba(244,212,114,0.28) 0%, rgba(212,175,55,0.18) 100%)",
                  border: "1px solid rgba(212, 175, 55, 0.7)",
                  color: "#6b4208",
                  fontFamily: "'Cormorant Garamond', serif",
                  letterSpacing: "0.06em",
                  boxShadow: "0 0 20px -4px rgba(244,212,114,0.3)",
                }}
              >
                Start now
                <ArrowRight className="w-4 h-4 group-hover/card:translate-x-1 transition-transform duration-300" />
              </div>
            </button>
          </div>
        )}

        {/* Locked */}
        {step.content === "locked" && (
          <div className="flex flex-col items-center">
            <div
              className="liquid-glass rounded-2xl p-8 text-center max-w-md mx-auto"
              style={{ boxShadow: "0 0 0 1px rgba(212, 175, 55, 0.18)", opacity: 0.85 }}
            >
              <Lock
                className="w-7 h-7 mx-auto mb-4"
                style={{ color: "var(--skin-text-muted-soft, rgba(26,30,58,0.45))" }}
              />
              <h3 className="text-lg font-semibold mb-2" style={TITLE_STYLE}>
                Locked
              </h3>
              <p className="text-sm italic leading-relaxed" style={BODY_STYLE}>
                {step.lockedHint ?? "This module is being built. Stay tuned."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Video Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm px-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="w-full max-w-4xl rounded-2xl liquid-glass-strong p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-base sm:text-lg font-semibold pr-4" style={TITLE_STYLE}>
                {selectedItem.title}
              </h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-sm rounded-full px-3 py-1 transition-colors"
                style={{
                  ...BODY_STYLE,
                  background: "rgba(212,175,55,0.08)",
                  border: "1px solid rgba(212,175,55,0.24)",
                }}
              >
                Close
              </button>
            </div>
            <div className="w-full aspect-video mb-4">
              <iframe
                src={`https://www.youtube.com/embed/${selectedItem.youtubeId}`}
                title={selectedItem.title}
                className="h-full w-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {selectedItem.teacher && (
              <p className="text-sm italic" style={BODY_STYLE}>
                Guided by {selectedItem.teacher}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

/* ─── Index View (no stepId) ─── */
const LibraryIndex = ({ pathBase }: { pathBase: string }) => {
  const navigate = useNavigate();
  return (
    <div className="p-6 pb-24 lg:p-10 lg:pb-12 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass-strong mb-6"
          style={{ boxShadow: "0 0 0 1px rgba(212, 175, 55, 0.22)" }}
        >
          <Sparkles
            className="w-4 h-4"
            style={{ color: "rgba(160, 109, 8, 0.85)" }}
          />
          <span className="text-[10.5px]" style={EYEBROW_STYLE}>
            Growth Sequence
          </span>
        </div>
        <h1
          className="text-5xl sm:text-6xl lg:text-7xl font-semibold mb-4 tracking-tight leading-[1.05]"
          style={TITLE_STYLE}
        >
          <span className="bg-clip-text text-transparent" style={GOLD_TEXT_STYLE}>
            GROW
          </span>
        </h1>
        <Ornament className="my-5" />
        <p className="text-base sm:text-lg italic max-w-xl mx-auto leading-relaxed" style={BODY_STYLE}>
          Six steps. From scattered talent to centered mastery. Pick a step from the side
          panel — each one unlocks the next level of seeing.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {GROWTH_STEPS.map((step) => {
          const isLocked = step.locked;
          return (
            <button
              key={step.id}
              onClick={() => !isLocked && navigate(`${pathBase}/${step.id}`)}
              disabled={isLocked}
              className={cn(
                "rounded-2xl p-5 text-left transition-all duration-300 relative overflow-hidden liquid-glass-strong",
                isLocked
                  ? "opacity-55 cursor-not-allowed"
                  : "hover:scale-[1.012] cursor-pointer hover:shadow-[0_12px_36px_-14px_rgba(10,22,40,0.25)]"
              )}
              style={{
                boxShadow: "0 8px 24px -12px rgba(10, 22, 40, 0.18), 0 0 0 1px rgba(212, 175, 55, 0.22)",
              }}
            >
              <div className="flex items-start gap-3">
                <span
                  className="flex-shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold"
                  style={{
                    background: isLocked
                      ? "rgba(212, 175, 55, 0.16)"
                      : "linear-gradient(135deg, rgba(244, 212, 114, 0.95) 0%, rgba(212, 175, 55, 0.85) 100%)",
                    color: isLocked ? "rgba(122, 81, 8, 0.65)" : "#0a1628",
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    fontVariantNumeric: "tabular-nums lining-nums",
                    border: isLocked
                      ? "0.5px solid rgba(212, 175, 55, 0.35)"
                      : "0.5px solid rgba(122, 81, 8, 0.45)",
                  }}
                >
                  {isLocked ? <Lock className="w-3.5 h-3.5" /> : step.number}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-semibold mb-1" style={{ ...TITLE_STYLE, fontWeight: 600 }}>
                    {step.shortLabel}
                  </div>
                  <div className="text-xs italic line-clamp-2" style={BODY_STYLE}>
                    {isLocked && step.lockedHint ? step.lockedHint : step.description}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ─── Shared inner component ─── */
export const LearnSpaceContent = ({ pathBase = "/library" }: { pathBase?: string }) => {
  const { stepId } = useParams<{ stepId?: string }>();
  const step = findStep(stepId);
  if (!stepId) return <LibraryIndex pathBase={pathBase} />;
  if (!step) return <LibraryIndex pathBase={pathBase} />;
  return <StepContent step={step} />;
};

/* ─── Public Library page (/library and /library/:stepId) ─── */
const Library = () => (
  <GameShellV2>
    <LearnSpaceContent pathBase="/library" />
  </GameShellV2>
);

export default Library;
