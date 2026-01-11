import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SkillTree from "@/components/SkillTree";
import BoldText from "@/components/BoldText";
import { skillTrees } from "@/data/skillTrees";
import { cn } from "@/lib/utils";
import { normalizeDomainSlug, DomainSlug } from "@/lib/domains";

const SkillTrees = () => {
    const navigate = useNavigate();
    const { pathId } = useParams<{ pathId: string }>();
    const [searchParams] = useSearchParams();

    // Support legacy URL params like ?path=waking-up
    const legacyPath = searchParams.get('path');
    const normalizedPath = normalizeDomainSlug(pathId || legacyPath);

    // Map canonical domain slugs to tree IDs
    const domainToTreeMap: Record<DomainSlug, string> = {
        body: 'body',
        mind: 'growing-up',
        emotions: 'cleaning-up',
        spirit: 'waking-up',
        uniqueness: 'showing-up',
    };

    const initialTreeId = normalizedPath
        ? domainToTreeMap[normalizedPath]
        : skillTrees[0].id;

    const [activeTreeId, setActiveTreeId] = useState(initialTreeId);

    const activeTree = skillTrees.find((t) => t.id === activeTreeId) || skillTrees[0];

    // Mock progress data (in future, fetch from database)
    const mockProgress: Record<string, "locked" | "available" | "in_progress" | "completed"> = {
        "wu-awareness-101": "completed",
        "wu-breath-anchor": "completed",
        "wu-body-scan": "in_progress",
        "gu-self-honesty": "completed",
        "cu-feel-feelings": "available",
        "su-zone-of-genius": "completed",
        "su-values-clarity": "available",
        "gr-sleep-hygiene": "completed",
        "gr-breath-basics": "available",
        "gr-daily-movement": "in_progress",
    };

    // Scroll to top when page loads
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navigation />

            <main className="flex-grow pt-24 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto max-w-6xl">
                    {/* Back link */}
                    <button
                        onClick={() => navigate("/game")}
                        className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-6"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        <BoldText>BACK TO CHARACTER</BoldText>
                    </button>

                    {/* Page Header */}
                    <div className="text-center mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                            <BoldText>SKILL TREES</BoldText>
                        </h1>
                        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base px-2">
                            Five paths of development. Each skill unlocks as you complete practices and quests.
                        </p>
                    </div>

                    {/* Tree Selector Tabs */}
                    <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-6 sm:mb-8 px-2">
                        {skillTrees.map((tree) => {
                            const isActive = tree.id === activeTreeId;
                            const TreeIcon = tree.icon;

                            return (
                                <button
                                    key={tree.id}
                                    onClick={() => setActiveTreeId(tree.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all duration-200",
                                        isActive
                                            ? "border-current shadow-lg"
                                            : "border-border bg-muted/30 hover:bg-muted/50"
                                    )}
                                    style={{
                                        color: isActive ? tree.color : undefined,
                                        backgroundColor: isActive ? `${tree.color}15` : undefined,
                                        borderColor: isActive ? tree.color : undefined,
                                    }}
                                >
                                    {tree.iconImage ? (
                                        <img src={tree.iconImage} alt={tree.name} className="w-6 h-6 rounded-full object-cover" />
                                    ) : (
                                        <TreeIcon className="w-4 h-4" />
                                    )}
                                    <span className="text-sm font-medium hidden sm:inline">{tree.name}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Large Icon + Active Tree Info */}
                    <div className="flex flex-col items-center mb-6 sm:mb-8">
                        {/* Large icon */}
                        <div className="mb-4">
                            {activeTree.iconImage ? (
                                <img
                                    src={activeTree.iconImage}
                                    alt={activeTree.name}
                                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover shadow-lg"
                                    style={{ boxShadow: `0 0 30px ${activeTree.color}40` }}
                                />
                            ) : (
                                <div
                                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: `${activeTree.color}20` }}
                                >
                                    <activeTree.icon
                                        className="w-12 h-12 sm:w-14 sm:h-14"
                                        style={{ color: activeTree.color }}
                                    />
                                </div>
                            )}
                        </div>
                        <h2
                            className="text-xl sm:text-2xl font-bold mb-1"
                            style={{ color: activeTree.color }}
                        >
                            {activeTree.name}
                        </h2>
                        <p className="text-xs sm:text-sm text-muted-foreground">{activeTree.tagline}</p>
                    </div>

                    {/* Skill Tree Visualization */}
                    <div
                        className="relative w-full aspect-square max-w-2xl mx-auto rounded-xl border border-border overflow-hidden bg-muted/20"
                    >
                        <SkillTree
                            tree={activeTree}
                            progress={mockProgress}
                            onNodeClick={(node) => {
                                // TODO: Open practice modal or navigate to quest
                            }}
                        />
                    </div>

                    {/* Tree Description */}
                    <div className="text-center mt-6 sm:mt-8 max-w-xl mx-auto px-2">
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            {activeTree.description}
                        </p>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-8 sm:mt-10 text-xs text-slate-400">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-muted/30 border border-muted/50" />
                            <span>Locked</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: activeTree.color }} />
                            <span>Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div
                                className="w-4 h-4 rounded-full animate-pulse"
                                style={{ backgroundColor: `${activeTree.color}40`, borderColor: activeTree.color }}
                            />
                            <span>In Progress</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div
                                className="w-4 h-4 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: `${activeTree.color}30` }}
                            >
                                <svg className="w-2.5 h-2.5" fill={activeTree.color} viewBox="0 0 24 24">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                </svg>
                            </div>
                            <span>Completed</span>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default SkillTrees;
