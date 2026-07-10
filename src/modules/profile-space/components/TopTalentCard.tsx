import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, RotateCcw } from "lucide-react";
import type { ZogSnapshotLite } from "@/modules/profile-space/types";
import { cardShell, ceremonialPill, ceremonialPillPrimary, cormorantTitle, labelMuted, sourceSerifBody } from "./styles";

interface TopTalentCardProps {
    zog: ZogSnapshotLite | null;
}

const TopTalentCard = ({ zog }: TopTalentCardProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <section style={cardShell}>
            <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4" style={{ color: "var(--skin-accent-gold, #b8860b)" }} />
                <h2 style={{ ...cormorantTitle, fontSize: "18px", fontWeight: 600 }}>
                    {t("profileSpace.topTalent.title")}
                </h2>
            </div>

            {zog ? (
                <div className="space-y-3">
                    {zog.archetypeTitle && (
                        <p style={{ ...cormorantTitle, fontSize: "16px", fontWeight: 600 }}>{zog.archetypeTitle}</p>
                    )}
                    {zog.topThreeTalents.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {zog.topThreeTalents.map((talent) => (
                                <span
                                    key={talent}
                                    style={{
                                        ...labelMuted,
                                        background: "rgba(212, 175, 55, 0.10)",
                                        border: "0.5px solid rgba(212, 175, 55, 0.30)",
                                        color: "var(--skin-goldDeep, #5d4307)",
                                        padding: "2px 10px",
                                        borderRadius: "999px",
                                    }}
                                >
                                    {talent}
                                </span>
                            ))}
                        </div>
                    )}
                    {zog.corePattern && (
                        <p className="italic" style={{ ...sourceSerifBody, fontStyle: "italic", fontSize: "13.5px", lineHeight: 1.5, fontWeight: 500 }}>
                            {zog.corePattern}
                        </p>
                    )}
                    <div className="flex flex-wrap gap-2 pt-1">
                        <button
                            onClick={() => navigate("/game/me/zone-of-genius")}
                            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 transition-all duration-200 hover:translate-y-[-0.5px]"
                            style={ceremonialPillPrimary}
                        >
                            {t("profileSpace.topTalent.viewFull")}
                            <ArrowRight className="w-3 h-3" />
                        </button>
                        <button
                            onClick={() => navigate("/zone-of-genius/assessment")}
                            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 transition-all duration-200 hover:translate-y-[-0.5px]"
                            style={ceremonialPill}
                        >
                            <RotateCcw className="w-3 h-3" style={{ color: "var(--skin-accent-gold, #b8860b)" }} />
                            {t("profileSpace.topTalent.retake")}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center py-4 space-y-3">
                    <p className="italic" style={{ ...sourceSerifBody, fontStyle: "italic", fontSize: "14px", lineHeight: 1.55 }}>
                        {t("profileSpace.topTalent.emptyLine")}
                    </p>
                    <button
                        onClick={() => navigate("/zone-of-genius/assessment")}
                        className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 transition-all duration-200 hover:translate-y-[-0.5px]"
                        style={ceremonialPillPrimary}
                    >
                        {t("profileSpace.topTalent.ctaTakeAssessment")}
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
        </section>
    );
};

export default TopTalentCard;
