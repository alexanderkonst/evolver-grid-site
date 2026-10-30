import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { User } from "lucide-react";
import PlayerLevel from "@/components/game/PlayerLevel";

interface MeSummaryProps {
    archetypeTitle?: string | null;
    /** The one player level (QoL average); null until measured. Owner-only screen. */
    level: number | null;
}

/**
 * MeSummary - Shows who I am at a glance
 * Part of Daily Loop home screen
 */
export default function MeSummary({ archetypeTitle, level }: MeSummaryProps) {
    const { t } = useTranslation();

    // Day 91 (Sasha 2026-06-09): tokenized for Aurum - lapis falls back to the original bg-white/80
    return (
        <div className="bg-[var(--skin-card-fill,rgba(255,255,255,0.8))] backdrop-blur-sm rounded-2xl shadow-sm border border-[var(--wabi-lavender)]/20 p-6 breathing-card">
            <div className="flex items-start gap-4">
                {/* Archetype Icon */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#a4a3d0] to-[#8460ea] flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-white" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-[#2c3150] font-display truncate">
                        {archetypeTitle || t("meSummary.discovering")}
                    </h2>
                    <PlayerLevel level={level} className="text-sm text-[var(--wabi-text-secondary)]" />
                </div>
            </div>

            {/* View Profile Link */}
            <Link
                to="/game/me"
                className="mt-4 text-sm text-[#8460ea] hover:underline flex items-center gap-1"
            >
                {t("meSummary.viewProfile")}
            </Link>
        </div>
    );
}
