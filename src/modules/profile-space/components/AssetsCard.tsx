import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Boxes, ArrowRight, Plus } from "lucide-react";
import type { AssetLite } from "@/modules/profile-space/types";
import { cardShell, ceremonialPill, ceremonialPillPrimary, cormorantTitle, sourceSerifBody } from "./styles";

interface AssetsCardProps {
    assets: AssetLite[];
}

const AssetsCard = ({ assets }: AssetsCardProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const hasAssets = assets.length > 0;
    const latestThree = assets.slice(0, 3);

    return (
        <section style={cardShell}>
            <div className="flex items-center gap-2 mb-3">
                <Boxes className="w-4 h-4" style={{ color: "var(--skin-accent-gold, #b8860b)" }} />
                <h2 style={{ ...cormorantTitle, fontSize: "18px", fontWeight: 600 }}>
                    {t("profileSpace.assets.title")}
                </h2>
                {hasAssets && (
                    <span
                        style={{
                            fontFamily: "'DM Sans', system-ui, sans-serif",
                            fontVariantNumeric: "tabular-nums lining-nums",
                            fontSize: "13px",
                            color: "var(--skin-text-muted, rgba(11, 42, 90, 0.93))",
                        }}
                    >
                        ({assets.length})
                    </span>
                )}
            </div>

            {hasAssets ? (
                <div className="space-y-3">
                    <ul className="space-y-1.5">
                        {latestThree.map((asset) => (
                            <li
                                key={asset.id}
                                style={{ ...sourceSerifBody, fontSize: "14px", lineHeight: 1.4 }}
                            >
                                {asset.title}
                            </li>
                        ))}
                    </ul>
                    <div className="flex flex-wrap gap-2 pt-1">
                        <button
                            onClick={() => navigate("/game/me/assets")}
                            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 transition-all duration-200 hover:translate-y-[-0.5px]"
                            style={ceremonialPillPrimary}
                        >
                            {t("profileSpace.assets.viewAll")}
                            <ArrowRight className="w-3 h-3" />
                        </button>
                        <button
                            onClick={() => navigate("/asset-mapping/wizard?return=" + encodeURIComponent("/game/me/profile"))}
                            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 transition-all duration-200 hover:translate-y-[-0.5px]"
                            style={ceremonialPill}
                        >
                            <Plus className="w-3 h-3" style={{ color: "var(--skin-accent-gold, #b8860b)" }} />
                            {t("profileSpace.assets.addMore")}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center py-4 space-y-3">
                    <p className="italic" style={{ ...sourceSerifBody, fontStyle: "italic", fontSize: "14px", lineHeight: 1.55 }}>
                        {t("profileSpace.assets.emptyLine")}
                    </p>
                    <button
                        onClick={() => navigate("/asset-mapping/wizard?return=" + encodeURIComponent("/game/me/profile"))}
                        className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 transition-all duration-200 hover:translate-y-[-0.5px]"
                        style={ceremonialPillPrimary}
                    >
                        {t("profileSpace.assets.ctaMap")}
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
        </section>
    );
};

export default AssetsCard;
