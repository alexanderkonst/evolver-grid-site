import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Target, ArrowRight, RotateCcw } from "lucide-react";
import type { MissionInfo } from "@/modules/profile-space/types";
import { cardShell, ceremonialPill, ceremonialPillPrimary, cormorantTitle, labelMuted, sourceSerifBody } from "./styles";

interface MissionCardProps {
    mission: MissionInfo;
}

const MissionCard = ({ mission }: MissionCardProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const hasMission = Boolean(mission.statement);

    return (
        <section style={cardShell}>
            <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4" style={{ color: "var(--skin-accent-gold, #b8860b)" }} />
                <h2 style={{ ...cormorantTitle, fontSize: "18px", fontWeight: 600 }}>
                    {t("profileSpace.mission.title")}
                </h2>
            </div>

            {hasMission ? (
                <div className="space-y-3">
                    <p className="italic" style={{ ...cormorantTitle, fontStyle: "italic", fontSize: "16px", fontWeight: 600 }}>
                        {mission.statement}
                    </p>
                    {mission.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {mission.categories.map((category) => (
                                <span
                                    key={category}
                                    style={{
                                        ...labelMuted,
                                        background: "rgba(212, 175, 55, 0.10)",
                                        border: "0.5px solid rgba(212, 175, 55, 0.30)",
                                        color: "var(--skin-goldDeep, #5d4307)",
                                        padding: "2px 10px",
                                        borderRadius: "999px",
                                    }}
                                >
                                    {category}
                                </span>
                            ))}
                        </div>
                    )}
                    <div className="flex flex-wrap gap-2 pt-1">
                        <button
                            onClick={() => navigate("/game/me/mission")}
                            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 transition-all duration-200 hover:translate-y-[-0.5px]"
                            style={ceremonialPillPrimary}
                        >
                            {t("profileSpace.mission.view")}
                            <ArrowRight className="w-3 h-3" />
                        </button>
                        <button
                            onClick={() => navigate("/mission-discovery")}
                            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 transition-all duration-200 hover:translate-y-[-0.5px]"
                            style={ceremonialPill}
                        >
                            <RotateCcw className="w-3 h-3" style={{ color: "var(--skin-accent-gold, #b8860b)" }} />
                            {t("profileSpace.mission.rediscover")}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center py-4 space-y-3">
                    <p className="italic" style={{ ...sourceSerifBody, fontStyle: "italic", fontSize: "14px", lineHeight: 1.55 }}>
                        {t("profileSpace.mission.emptyLine")}
                    </p>
                    <button
                        onClick={() => navigate("/mission-discovery")}
                        className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 transition-all duration-200 hover:translate-y-[-0.5px]"
                        style={ceremonialPillPrimary}
                    >
                        {t("profileSpace.mission.ctaDiscover")}
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
        </section>
    );
};

export default MissionCard;
