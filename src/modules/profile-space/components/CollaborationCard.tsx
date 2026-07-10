import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Users, ArrowRight } from "lucide-react";
import { formatDate } from "@/i18n/format";
import type { CollabRequestLite } from "@/modules/profile-space/types";
import { cardShell, ceremonialPill, cormorantTitle, labelMuted, sourceSerifBody } from "./styles";

interface CollaborationCardProps {
    requests: CollabRequestLite[];
}

const STATUS_STYLE: Record<CollabRequestLite["status"], { bg: string; border: string; color: string }> = {
    pending: { bg: "rgba(212, 175, 55, 0.10)", border: "rgba(212, 175, 55, 0.30)", color: "var(--skin-goldDeep, #5d4307)" },
    accepted: { bg: "rgba(16, 122, 79, 0.10)", border: "rgba(16, 122, 79, 0.30)", color: "rgb(16, 122, 79)" },
    declined: { bg: "rgba(155, 40, 40, 0.08)", border: "rgba(155, 40, 40, 0.24)", color: "rgb(155, 40, 40)" },
};

const CollaborationCard = ({ requests }: CollaborationCardProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const hasRequests = requests.length > 0;

    return (
        <section style={cardShell}>
            <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4" style={{ color: "var(--skin-accent-gold, #b8860b)" }} />
                <h2 style={{ ...cormorantTitle, fontSize: "18px", fontWeight: 600 }}>
                    {t("profileSpace.collaboration.title")}
                </h2>
            </div>

            {hasRequests ? (
                <div className="space-y-3">
                    <ul className="space-y-2">
                        {requests.map((request) => {
                            const status = STATUS_STYLE[request.status];
                            return (
                                <li key={request.id} className="flex items-center justify-between gap-3">
                                    <div>
                                        <p style={{ ...sourceSerifBody, fontSize: "14px" }}>
                                            {request.toName || t("profileSpace.collaboration.unnamedRecipient")}
                                        </p>
                                        <p style={{ ...labelMuted, textTransform: "none", letterSpacing: "0.02em", fontSize: "11.5px" }}>
                                            {formatDate(request.createdAt, { month: "short", day: "numeric", year: "numeric" })}
                                        </p>
                                    </div>
                                    <span
                                        style={{
                                            ...labelMuted,
                                            background: status.bg,
                                            border: `0.5px solid ${status.border}`,
                                            color: status.color,
                                            padding: "2px 10px",
                                            borderRadius: "999px",
                                        }}
                                    >
                                        {t(`profileSpace.collaboration.status.${request.status}`)}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                    <div className="flex justify-center pt-1">
                        <button
                            onClick={() => navigate("/game/collaborate/connections")}
                            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 transition-all duration-200 hover:translate-y-[-0.5px]"
                            style={ceremonialPill}
                        >
                            {t("profileSpace.collaboration.viewConnections")}
                            <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center py-4">
                    <p className="italic" style={{ ...sourceSerifBody, fontStyle: "italic", fontSize: "14px", lineHeight: 1.55 }}>
                        {t("profileSpace.collaboration.emptyLine")}
                    </p>
                </div>
            )}
        </section>
    );
};

export default CollaborationCard;
