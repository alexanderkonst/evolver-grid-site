import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { MapIcon, ArrowRight, RotateCcw } from "lucide-react";
import type { QolSnapshotLite } from "@/modules/profile-space/types";
import { cardShell, ceremonialPill, ceremonialPillPrimary, cormorantTitle, sourceSerifBody } from "./styles";

interface QolCardProps {
    qol: QolSnapshotLite | null;
}

// Mirrors QOL_MAX_STAGE in src/modules/profile/generateProfilePdf.ts —
// canonical QoL scale is 1-10 (qolConfig.ts defines 10 narrative stages
// per domain, and the results page divides by 10).
const QOL_MAX_STAGE = 10;

const QOL_DIMENSIONS: Array<{ key: keyof QolSnapshotLite["stages"]; labelKey: string }> = [
    { key: "happiness", labelKey: "profileSpace.qol.dimensions.happiness" },
    { key: "health", labelKey: "profileSpace.qol.dimensions.health" },
    { key: "loveRelationships", labelKey: "profileSpace.qol.dimensions.loveRelationships" },
    { key: "socialTies", labelKey: "profileSpace.qol.dimensions.socialTies" },
    { key: "wealth", labelKey: "profileSpace.qol.dimensions.wealth" },
    { key: "home", labelKey: "profileSpace.qol.dimensions.home" },
    { key: "growth", labelKey: "profileSpace.qol.dimensions.growth" },
    { key: "impact", labelKey: "profileSpace.qol.dimensions.impact" },
];

const QolCard = ({ qol }: QolCardProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const average = qol
        ? QOL_DIMENSIONS.reduce((sum, { key }) => sum + qol.stages[key], 0) / QOL_DIMENSIONS.length
        : 0;

    return (
        <section style={cardShell}>
            <div className="flex items-center gap-2 mb-3">
                <MapIcon className="w-4 h-4" style={{ color: "var(--skin-accent-gold, #b8860b)" }} />
                <h2 style={{ ...cormorantTitle, fontSize: "18px", fontWeight: 600 }}>
                    {t("profileSpace.qol.title")}
                </h2>
            </div>

            {qol ? (
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        {QOL_DIMENSIONS.map(({ key, labelKey }) => {
                            const stage = qol.stages[key];
                            return (
                                <div key={key} className="space-y-1">
                                    <div className="flex items-baseline justify-between gap-2">
                                        <span style={{ ...sourceSerifBody, fontSize: "12px", fontWeight: 500 }}>
                                            {t(labelKey)}
                                        </span>
                                        <span
                                            style={{
                                                fontFamily: "'DM Sans', system-ui, sans-serif",
                                                fontVariantNumeric: "tabular-nums lining-nums",
                                                fontSize: "11px",
                                                color: "var(--skin-goldDeep, #5d4307)",
                                            }}
                                        >
                                            {stage}/{QOL_MAX_STAGE}
                                        </span>
                                    </div>
                                    <div
                                        className="h-1.5 rounded-full overflow-hidden"
                                        style={{ background: "rgba(212, 175, 55, 0.14)" }}
                                    >
                                        <div
                                            className="h-full rounded-full"
                                            style={{
                                                width: `${Math.max(0, Math.min(stage / QOL_MAX_STAGE, 1)) * 100}%`,
                                                background: "var(--skin-accent-gold, #b8860b)",
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <p className="italic text-center pt-1" style={{ ...sourceSerifBody, fontStyle: "italic", fontSize: "13px" }}>
                        {t("profileSpace.qol.overall", { average: average.toFixed(1), max: QOL_MAX_STAGE })}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center pt-1">
                        <button
                            onClick={() => navigate("/game/me/quality-of-life")}
                            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 transition-all duration-200 hover:translate-y-[-0.5px]"
                            style={ceremonialPillPrimary}
                        >
                            {t("profileSpace.qol.viewMap")}
                            <ArrowRight className="w-3 h-3" />
                        </button>
                        <button
                            onClick={() => navigate("/quality-of-life-map/assessment")}
                            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 transition-all duration-200 hover:translate-y-[-0.5px]"
                            style={ceremonialPill}
                        >
                            <RotateCcw className="w-3 h-3" style={{ color: "var(--skin-accent-gold, #b8860b)" }} />
                            {t("profileSpace.qol.retake")}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center py-4 space-y-3">
                    <p className="italic" style={{ ...sourceSerifBody, fontStyle: "italic", fontSize: "14px", lineHeight: 1.55 }}>
                        {t("profileSpace.qol.emptyLine")}
                    </p>
                    <button
                        onClick={() => navigate("/quality-of-life-map/assessment")}
                        className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 transition-all duration-200 hover:translate-y-[-0.5px]"
                        style={ceremonialPillPrimary}
                    >
                        {t("profileSpace.qol.ctaAssess")}
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
        </section>
    );
};

export default QolCard;
