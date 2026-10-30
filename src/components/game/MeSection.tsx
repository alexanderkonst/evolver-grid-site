import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import PlayerLevel from "@/components/game/PlayerLevel";

interface MeSectionProps {
    archetypeTitle?: string;
    /** The one player level (QoL average); null until measured. Owner-only screen. */
    level: number | null;
    displayName?: string;
    avatarUrl?: string | null;
}

const MeSection = ({ archetypeTitle, level, displayName, avatarUrl }: MeSectionProps) => {
    const { t } = useTranslation();

    return (
        <div className="relative overflow-hidden rounded-xl liquid-glass ring-1 ring-white/10 p-5 mb-4 breathing-card">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10 overflow-hidden flex items-center justify-center ring-1 ring-white/15">
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={t('meSection.avatarAlt')}
                            loading="lazy"
                            onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg";
                            }}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <Sparkles className="w-5 h-5 text-[#8460ea]" />
                    )}
                </div>
                <div>
                    {displayName && (
                        <p className="text-sm text-white/50">{displayName}</p>
                    )}
                    <h2 className="font-semibold text-white">
                        {archetypeTitle ? (
                            <span>✦ {archetypeTitle} ✦</span>
                        ) : (
                            t('meSection.discoverArchetype')
                        )}
                    </h2>
                    <PlayerLevel level={level} className="text-sm text-white/50" />
                </div>
            </div>
        </div>
    );
};

export default MeSection;
