import { useState, useCallback } from "react";
import GameShellV2 from "@/components/game/GameShellV2";
import ErrorBoundary from "@/components/ErrorBoundary";
import { FoundersHero, FoundersCTA } from "@/components/founders/FoundersShared";
import { FOUNDERS, FounderCard } from "@/pages/FoundersShowcase";


const MarketplaceSpace = () => {
    const [expandedFounder, setExpandedFounder] = useState<string | null>(null);

    const toggle = useCallback(
        (name: string) =>
            setExpandedFounder((prev) => (prev === name ? null : name)),
        []
    );

    return (
        <GameShellV2>
            <ErrorBoundary>
                <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-10">
                    {/* ─── Hero ──────────────────────────────────── */}
                    <FoundersHero lightMode />

                    {/* ─── Founder Cards ─────────────────────────── */}
                    <div className="space-y-6" id="founders-grid">
                        {FOUNDERS.map((f, i) => (
                            <FounderCard
                                key={f.name}
                                founder={f}
                                index={i}
                                isExpanded={expandedFounder === f.name}
                                onToggle={() => toggle(f.name)}
                                lightMode
                            />
                        ))}
                    </div>

                    {/* ─── CTA ──────────────────────────────────── */}
                    <FoundersCTA lightMode />
                </div>
            </ErrorBoundary>
        </GameShellV2>
    );
};

export default MarketplaceSpace;
