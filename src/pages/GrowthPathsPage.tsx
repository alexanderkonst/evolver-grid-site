import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Lock, ChevronRight, ArrowLeft } from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";
import { growthPaths, getPathIcon, TYPE_ICONS, TYPE_LABELS, type GrowthPath, type Upgrade } from "@/data/growthPaths";
import { Button } from "@/components/ui/button";

const GrowthPathsPage = () => {
    const [selectedPath, setSelectedPath] = useState<GrowthPath | null>(null);

    // If viewing a specific path
    if (selectedPath) {
        const Icon = getPathIcon(selectedPath.iconType);

        return (
            <GameShellV2>
                <div className="p-4 lg:p-6 max-w-3xl mx-auto">
                    {/* Back button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedPath(null)}
                        className="text-slate-600 hover:text-slate-900 mb-6"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>

                    {/* Path header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div
                                className="p-2 rounded-lg"
                                style={{ backgroundColor: `${selectedPath.color}20` }}
                            >
                                <Icon className="w-6 h-6" style={{ color: selectedPath.color }} />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">
                                    {selectedPath.name}
                                </h1>
                                <p className="text-sm text-slate-500">{selectedPath.subtitle}</p>
                            </div>
                        </div>
                        <p className="text-slate-600 mt-2">{selectedPath.description}</p>
                    </div>

                    {/* Upgrade list */}
                    <div className="space-y-3">
                        {selectedPath.upgrades.map((upgrade, index) => (
                            <UpgradeCard
                                key={upgrade.id}
                                upgrade={upgrade}
                                pathColor={selectedPath.color}
                                isFirst={index === 0}
                                isLast={index === selectedPath.upgrades.length - 1}
                            />
                        ))}
                    </div>
                </div>
            </GameShellV2>
        );
    }

    // Path selection view
    return (
        <GameShellV2>
            <div className="p-4 lg:p-6 max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Growth Paths</h1>
                    <p className="text-slate-600">
                        Sequences of transformational upgrades — how you develop yourself
                    </p>
                </div>

                {/* Path cards */}
                <div className="space-y-3">
                    {growthPaths.map((path) => {
                        const Icon = getPathIcon(path.iconType);
                        return (
                            <button
                                key={path.id}
                                onClick={() => setSelectedPath(path)}
                                className="w-full p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className="p-3 rounded-lg shrink-0"
                                        style={{ backgroundColor: `${path.color}15` }}
                                    >
                                        <Icon
                                            className="w-6 h-6"
                                            style={{ color: path.color }}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h2 className="font-semibold text-slate-900">
                                                {path.name}
                                            </h2>
                                            <span className="text-xs text-slate-400 font-normal">
                                                ({path.subtitle})
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 mt-0.5">
                                            {path.tagline}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {path.upgrades.length} upgrades
                                        </p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="mt-8 p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <h3 className="text-sm font-medium text-slate-700 mb-3">Legend</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                            <span>🔥</span>
                            <span className="text-slate-600">Immersive Activation</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>📚</span>
                            <span className="text-slate-600">Micro-learning (90s)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>📝</span>
                            <span className="text-slate-600">Self-Assessment</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>💰</span>
                            <span className="text-slate-600">Premium Module</span>
                        </div>
                    </div>
                </div>
            </div>
        </GameShellV2>
    );
};

// Individual upgrade card
const UpgradeCard = ({
    upgrade,
    pathColor,
    isFirst,
    isLast
}: {
    upgrade: Upgrade;
    pathColor: string;
    isFirst: boolean;
    isLast: boolean;
}) => {
    const isCompleted = false; // TODO: Connect to actual completion status
    const isLocked = !isFirst && !isCompleted; // TODO: Check prerequisites
    const typeIcon = TYPE_ICONS[upgrade.type];

    // Content status badge
    const getStatusBadge = () => {
        if (!upgrade.contentStatus || upgrade.contentStatus === 'coming-soon') {
            return <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-400">Coming Soon</span>;
        }
        if (upgrade.contentStatus === 'available') {
            return <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-600">Ready</span>;
        }
        if (upgrade.contentStatus === 'module') {
            return <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-600">Module</span>;
        }
        return null;
    };

    const content = (
        <div
            className={`
                p-4 rounded-xl border transition-all
                ${isLocked
                    ? 'border-slate-200 bg-slate-50 opacity-60'
                    : isCompleted
                        ? 'border-green-200 bg-green-50'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                }
            `}
        >
            <div className="flex items-start gap-3">
                {/* Step number / status */}
                <div
                    className={`
                        w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold
                        ${isCompleted
                            ? 'bg-green-500 text-white'
                            : isLocked
                                ? 'bg-slate-200 text-slate-400'
                                : 'text-white'
                        }
                    `}
                    style={!isCompleted && !isLocked ? { backgroundColor: pathColor } : undefined}
                >
                    {isCompleted ? (
                        <Check className="w-4 h-4" />
                    ) : isLocked ? (
                        <Lock className="w-3 h-3" />
                    ) : (
                        upgrade.order
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-lg">{typeIcon}</span>
                        <h3 className={`font-medium ${isLocked ? 'text-slate-400' : 'text-slate-900'}`}>
                            {upgrade.name}
                        </h3>
                        {!isLocked && getStatusBadge()}
                    </div>
                    <p className={`text-sm ${isLocked ? 'text-slate-400' : 'text-slate-600'}`}>
                        {upgrade.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                        {upgrade.duration && (
                            <span className="text-xs text-slate-400">{upgrade.duration}</span>
                        )}
                        <span className="text-xs font-medium" style={{ color: pathColor }}>
                            +{upgrade.xpReward} XP
                        </span>
                    </div>
                </div>

                {/* Arrow for actionable items */}
                {!isLocked && !isCompleted && upgrade.contentStatus !== 'coming-soon' && (
                    <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                )}
            </div>
        </div>
    );

    // Wrap in Link if there's a link and not locked and content is available
    if (upgrade.link && !isLocked && upgrade.contentStatus !== 'coming-soon') {
        return (
            <Link to={upgrade.link} className="block">
                {content}
            </Link>
        );
    }

    return content;
};

export default GrowthPathsPage;
