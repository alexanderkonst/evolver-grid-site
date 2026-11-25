import VillagePlaceHeader from "@/components/game/VillagePlaceHeader";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { usePublishedGeniusBusiness } from "@/modules/product-builder/ProductBuilderContext";
import { useState, useCallback } from "react";
import GameShellV2 from "@/components/game/GameShellV2";
import ErrorBoundary from "@/components/ErrorBoundary";
import MyStall from "@/components/game/MyStall";
import { FoundersHero, FoundersCTA } from "@/components/founders/FoundersShared";
import { FOUNDERS, FounderCard } from "@/pages/FoundersShowcase";


const MarketplaceSpace = () => {
    const { t } = useTranslation();
    const business = usePublishedGeniusBusiness();
    const [expandedFounder, setExpandedFounder] = useState<string | null>(null);

    const toggle = useCallback(
        (name: string) =>
            setExpandedFounder((prev) => (prev === name ? null : name)),
        []
    );

    return (
        <GameShellV2>
            <ErrorBoundary>
                {/* pb: room under the last control for the «Chat with us» pill (WP-15, --chat-clearance) */}
                <div className="p-4 pb-[calc(var(--chat-clearance)+1rem)] lg:p-6 max-w-4xl mx-auto space-y-10">
                    <VillagePlaceHeader place="market" />
                    <MyStall />
                    {!business && (
                        <div className="space-y-3 rounded-xl border border-dashed border-border p-6">
                            <p>{t("villagePlaces.market.empty")}</p>
                            <Button asChild><Link to="/ubb">{t("villagePlaces.openWorkshop")}</Link></Button>
                        </div>
                    )}
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
