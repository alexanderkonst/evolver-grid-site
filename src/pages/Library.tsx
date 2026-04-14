import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  LIBRARY_CATEGORIES,
  LIBRARY_ITEMS,
  LibraryItem,
  LibraryCategoryId,
} from "@/modules/library/libraryContent";
import { cn } from "@/lib/utils";
import { ChevronDown, Lock, Play, BookOpen, GraduationCap, Users, Rocket, TrendingUp, Crown, ArrowRight } from "lucide-react";

/* ─── Growth Sequence Steps ─── */
type GrowthStep = {
  id: string;
  number: number;
  title: string;
  description: string;
  locked: boolean;
  icon: React.ReactNode;
  neonColor: string;       // for the glow
  neonColorRgb: string;    // for box-shadow
  content?: "videos" | "article-link" | "article-27" | "locked" | "cta";
  linkTo?: string;
};

const GROWTH_STEPS: GrowthStep[] = [
  {
    id: "foundational-videos",
    number: 1,
    title: "Watch the foundational course",
    description: "Curated breathwork, activations, wisdom, and spiritual practices from embodied modern guides.",
    locked: false,
    icon: <Play className="w-5 h-5" />,
    neonColor: "from-cyan-400 to-cyan-300",
    neonColorRgb: "0, 200, 255",
    content: "videos",
  },
  {
    id: "scientific-materialism-antidote",
    number: 2,
    title: "Read the scientific materialism antidote",
    description: "The article that dissolves the dominant paradigm and reveals what's underneath.",
    locked: false,
    icon: <BookOpen className="w-5 h-5" />,
    neonColor: "from-emerald-400 to-emerald-300",
    neonColorRgb: "52, 211, 153",
    content: "article-link",
  },
  {
    id: "founder-academy",
    number: 3,
    title: "Do the founder academy modules",
    description: "Structured modules to build your unique business from your zone of genius.",
    locked: true,
    icon: <GraduationCap className="w-5 h-5" />,
    neonColor: "from-violet-400 to-violet-300",
    neonColorRgb: "167, 139, 250",
    content: "locked",
  },
  {
    id: "27-perspectives",
    number: 4,
    title: "Read the 27 perspectives article",
    description: "The full ontological framework: 4 quadrants × 3 depths × recursive seeing = 27 dimensions of reality.",
    locked: false,
    icon: <BookOpen className="w-5 h-5" />,
    neonColor: "from-amber-400 to-amber-300",
    neonColorRgb: "251, 191, 36",
    content: "article-27",
    linkTo: "/integral_theory_upgrade1",
  },
  {
    id: "integral-mystery-school",
    number: 5,
    title: "Do the integral mystery school",
    description: "Deep immersion into the living architecture of consciousness and creation.",
    locked: true,
    icon: <Crown className="w-5 h-5" />,
    neonColor: "from-rose-400 to-rose-300",
    neonColorRgb: "251, 113, 133",
    content: "locked",
  },
  {
    id: "work-1-on-1",
    number: 6,
    title: "Work with me 1:1",
    description: "Direct transmission. Personal guidance through the full phase-shift sequence.",
    locked: false,
    icon: <Rocket className="w-5 h-5" />,
    neonColor: "from-fuchsia-400 to-fuchsia-300",
    neonColorRgb: "232, 121, 249",
    content: "cta",
    linkTo: "/ignite",
  },
];

/* ─── Video Category Filter Sub-component ─── */
const VideoCategoryFilter = ({
  activeCategory,
  onSelect,
}: {
  activeCategory: LibraryCategoryId | "all";
  onSelect: (id: LibraryCategoryId | "all") => void;
}) => (
  <div className="flex gap-2 flex-wrap mb-6">
    <button
      onClick={() => onSelect("all")}
      className={cn(
        "px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 border",
        activeCategory === "all"
          ? "bg-white/15 text-white border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          : "bg-white/5 text-white/50 border-white/10 hover:border-white/20 hover:text-white/70"
      )}
    >
      All
    </button>
    {LIBRARY_CATEGORIES.map((cat) => (
      <button
        key={cat.id}
        onClick={() => onSelect(cat.id)}
        className={cn(
          "px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 border",
          activeCategory === cat.id
            ? "bg-white/15 text-white border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            : "bg-white/5 text-white/50 border-white/10 hover:border-white/20 hover:text-white/70"
        )}
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
    className="flex flex-col rounded-xl liquid-glass text-left group hover:scale-[1.02] transition-all duration-300 overflow-hidden"
  >
    <div className="relative w-full aspect-video overflow-hidden">
      <img
        src={`https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`}
        alt={item.title}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-300" />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Play className="w-5 h-5 text-white ml-0.5" />
        </div>
      </div>
    </div>
    <div className="p-4 flex flex-col gap-1.5">
      <div className="text-sm font-semibold text-white line-clamp-2">
        {item.title}
      </div>
      {item.teacher && (
        <div className="text-xs text-white/50">{item.teacher}</div>
      )}
      {(item.durationLabel || item.durationMinutes) && (
        <div className="text-xs text-white/40">
          {item.durationLabel ?? `${item.durationMinutes} min`}
        </div>
      )}
    </div>
  </button>
);

/* ─── Main Page ─── */
const Library = () => {
  const navigate = useNavigate();
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<LibraryCategoryId | "all">("all");
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
  const [howExpanded, setHowExpanded] = useState<Record<string, boolean>>({});

  const toggleStep = (stepId: string, locked: boolean) => {
    if (locked) return;
    setExpandedStep((prev) => (prev === stepId ? null : stepId));
  };

  const toggleHow = (stepId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHowExpanded((prev) => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const filteredItems = LIBRARY_ITEMS.filter(
    (item) => activeCategory === "all" || item.categoryId === activeCategory
  );

  return (
    <div className="min-h-dvh flex flex-col bg-[#0a0a1a] text-white overflow-hidden">
      {/* ─── Ambient Background ─── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Gradient base */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#0d1025] to-[#0a0a1a]" />
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-violet-500/5 blur-[120px]" />
        <div className="absolute top-2/3 left-1/2 w-[400px] h-[400px] rounded-full bg-emerald-500/4 blur-[100px]" />
      </div>

      <Navigation />

      <main className="flex-1 relative z-10 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">

          {/* ═══════ PANEL 1: GROW ═══════ */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass mb-6">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-medium text-white/70 uppercase tracking-widest">Growth Space</span>
            </div>
            <h1
              className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 tracking-tight"
              style={{ textShadow: "0 0 40px rgba(255,255,255,0.15), 0 0 80px rgba(255,255,255,0.05)" }}
            >
              GROW
            </h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
              Your journey from scattered talent to centered mastery.
              Each step unlocks the next level of seeing.
            </p>
          </div>

          {/* ═══════ PANEL 2: GROWTH SEQUENCE ═══════ */}
          <div className="space-y-4">
            {GROWTH_STEPS.map((step) => {
              const isExpanded = expandedStep === step.id;
              const isHowOpen = howExpanded[step.id] ?? false;

              return (
                <div key={step.id} className="relative">
                  {/* ── Step Button ── */}
                  <button
                    onClick={() => toggleStep(step.id, step.locked)}
                    disabled={step.locked}
                    className={cn(
                      "w-full rounded-2xl p-5 sm:p-6 text-left transition-all duration-500 group relative overflow-hidden",
                      step.locked
                        ? "opacity-40 cursor-not-allowed"
                        : "hover:scale-[1.01] cursor-pointer",
                      isExpanded
                        ? "liquid-glass-strong"
                        : "liquid-glass"
                    )}
                    style={
                      !step.locked
                        ? {
                            boxShadow: isExpanded
                              ? `0 0 40px rgba(${step.neonColorRgb}, 0.15), inset 0 1px 1px rgba(255,255,255,0.1)`
                              : `0 0 20px rgba(${step.neonColorRgb}, 0.08)`,
                          }
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-4">
                      {/* Number badge */}
                      <div
                        className={cn(
                          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
                          step.locked
                            ? "bg-white/5 text-white/30"
                            : `bg-gradient-to-br ${step.neonColor} text-black/80`
                        )}
                      >
                        {step.locked ? <Lock className="w-4 h-4" /> : step.number}
                      </div>

                      {/* Title + description */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-base sm:text-lg font-semibold transition-colors duration-300",
                            step.locked ? "text-white/30" : "text-white"
                          )}>
                            {step.title}
                          </span>
                        </div>
                        {!isExpanded && (
                          <p className={cn(
                            "text-sm mt-1 line-clamp-1 transition-colors duration-300",
                            step.locked ? "text-white/15" : "text-white/40"
                          )}>
                            {step.description}
                          </p>
                        )}
                      </div>

                      {/* Right side: icon + expand */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {/* "How" toggle */}
                        {!step.locked && !isExpanded && (
                          <button
                            onClick={(e) => toggleHow(step.id, e)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs text-white/40 hover:text-white/70 bg-white/5 hover:bg-white/10 transition-all duration-300"
                          >
                            How
                            <ChevronDown className={cn(
                              "w-3 h-3 transition-transform duration-300",
                              isHowOpen && "rotate-180"
                            )} />
                          </button>
                        )}
                        {/* Expand chevron */}
                        {!step.locked && (
                          <ChevronDown className={cn(
                            "w-5 h-5 text-white/30 group-hover:text-white/60 transition-all duration-300",
                            isExpanded && "rotate-180 text-white/60"
                          )} />
                        )}
                      </div>
                    </div>

                    {/* "How" dropdown (inline, above expansion) */}
                    {isHowOpen && !isExpanded && !step.locked && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-sm text-white/50 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    )}
                  </button>

                  {/* ── Expanded Content ── */}
                  {isExpanded && (
                    <div className="mt-2 rounded-2xl liquid-glass p-6 sm:p-8 animate-in fade-in slide-in-from-top-2 duration-500">
                      <p className="text-sm text-white/60 mb-6 leading-relaxed">
                        {step.description}
                      </p>

                      {/* Videos grid */}
                      {step.content === "videos" && (
                        <div>
                          <VideoCategoryFilter
                            activeCategory={activeCategory}
                            onSelect={setActiveCategory}
                          />
                          {filteredItems.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                              {filteredItems.map((item) => (
                                <VideoCard
                                  key={item.id}
                                  item={item}
                                  onSelect={setSelectedItem}
                                />
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-white/30">
                              No content in this category yet.
                            </p>
                          )}
                        </div>
                      )}

                      {/* Article link (scientific materialism) */}
                      {step.content === "article-link" && (
                        <div className="flex flex-col items-center gap-4">
                          <div className="liquid-glass-strong rounded-xl p-6 text-center max-w-md mx-auto hover:scale-[1.02] transition-transform duration-300">
                            <BookOpen className="w-8 h-8 mx-auto mb-3 text-emerald-400" />
                            <h3 className="text-lg font-semibold text-white mb-2">Coming Soon</h3>
                            <p className="text-sm text-white/50">
                              The scientific materialism antidote article is being prepared for publication.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* 27 Perspectives article */}
                      {step.content === "article-27" && (
                        <div className="flex flex-col items-center gap-4">
                          <button
                            onClick={() => navigate(step.linkTo!)}
                            className="liquid-glass-strong rounded-xl p-6 text-center max-w-md mx-auto hover:scale-[1.02] transition-all duration-300 group/card w-full"
                            style={{ boxShadow: `0 0 30px rgba(${step.neonColorRgb}, 0.15)` }}
                          >
                            <BookOpen className="w-8 h-8 mx-auto mb-3 text-amber-400" />
                            <h3 className="text-lg font-semibold text-white mb-2">
                              27-Perspective Vision
                            </h3>
                            <p className="text-sm text-white/50 mb-4">
                              Person-Perspectives as Dimensions of Reality — by Aleksandr Konstantinov
                            </p>
                            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-400/20 text-amber-300 text-sm font-medium group-hover/card:from-amber-500/30 group-hover/card:to-amber-400/30 transition-all duration-300">
                              Read the article
                              <ArrowRight className="w-4 h-4 group-hover/card:translate-x-1 transition-transform duration-300" />
                            </div>
                          </button>
                        </div>
                      )}

                      {/* CTA - Work 1:1 */}
                      {step.content === "cta" && (
                        <div className="flex flex-col items-center gap-4">
                          <button
                            onClick={() => navigate(step.linkTo!)}
                            className="liquid-glass-strong rounded-xl p-8 text-center max-w-md mx-auto hover:scale-[1.03] transition-all duration-300 group/card w-full"
                            style={{ boxShadow: `0 0 40px rgba(${step.neonColorRgb}, 0.2)` }}
                          >
                            <Rocket className="w-10 h-10 mx-auto mb-4 text-fuchsia-400" />
                            <h3 className="text-xl font-bold text-white mb-2">
                              Ignition Session
                            </h3>
                            <p className="text-sm text-white/50 mb-5">
                              One conversation that changes your trajectory.
                              Articulate your top talent, build your unique business, and launch from center.
                            </p>
                            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-fuchsia-500/20 to-fuchsia-400/20 text-fuchsia-300 text-sm font-bold group-hover/card:from-fuchsia-500/30 group-hover/card:to-fuchsia-400/30 transition-all duration-300 ring-1 ring-fuchsia-400/20">
                              Start now
                              <ArrowRight className="w-4 h-4 group-hover/card:translate-x-1 transition-transform duration-300" />
                            </div>
                          </button>
                        </div>
                      )}

                      {/* Locked placeholder */}
                      {step.content === "locked" && (
                        <div className="text-center py-4">
                          <Lock className="w-6 h-6 mx-auto mb-2 text-white/20" />
                          <p className="text-sm text-white/30">
                            This module is being built. Stay tuned.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Milestone connector between steps ── */}
                  {step.number < GROWTH_STEPS.length && (
                    <div className="flex items-center justify-center py-2">
                      <div className="w-px h-6 bg-gradient-to-b from-white/10 to-transparent" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* ─── Video Modal ─── */}
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
              <h2 className="text-base sm:text-lg font-semibold pr-4 text-white">
                {selectedItem.title}
              </h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-sm text-white/50 hover:text-white transition-colors rounded-full px-3 py-1 hover:bg-white/10"
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
              <p className="text-sm text-white/50">
                Guided by {selectedItem.teacher}
              </p>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Library;
