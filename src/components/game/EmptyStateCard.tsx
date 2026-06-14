import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

type EmptyStateType = "zog" | "qol" | "action";

interface EmptyStateCardProps {
    type: EmptyStateType;
}

const EMPTY_STATE_CONFIG: Record<
    EmptyStateType,
    { icon: string; messageKey: string; ctaKey: string; href: string }
> = {
    zog: {
        icon: "🌟",
        messageKey: "emptyState.zog.message",
        ctaKey: "emptyState.zog.cta",
        href: "/zone-of-genius/entry?return=/game",
    },
    qol: {
        icon: "📊",
        messageKey: "emptyState.qol.message",
        ctaKey: "emptyState.qol.cta",
        href: "/game/transformation/qol-assessment?return=/game",
    },
    action: {
        icon: "✨",
        messageKey: "emptyState.action.message",
        ctaKey: "emptyState.action.cta",
        href: "/game/transformation/library",
    },
};

/**
 * EmptyStateCard - Graceful handling of missing data
 * Inviting, not guilt-inducing
 */
export default function EmptyStateCard({ type }: EmptyStateCardProps) {
    const { t } = useTranslation();
    const config = EMPTY_STATE_CONFIG[type];

    // Day 91 (Sasha 2026-06-09): tokenized for Aurum - gradient classes moved to a style-prop
    // token; lapis falls back to the exact same lavender/20 > white wash
    return (
        <div
            className="rounded-2xl p-8 text-center"
            style={{
                background:
                    "var(--skin-card-fill, linear-gradient(to bottom right, rgba(164, 163, 208, 0.2) 0%, #ffffff 100%))",
            }}
        >
            <div className="text-4xl mb-4">{config.icon}</div>
            <p className="text-lg text-[rgba(44,49,80,0.7)] mb-6">{t(config.messageKey)}</p>
            <Link to={config.href}>
                <Button
                    variant="outline"
                    className="border-2 border-[#8460ea] text-[#8460ea] hover:bg-[#8460ea]/10 px-6 py-3 rounded-xl"
                >
                    {t(config.ctaKey)} →
                </Button>
            </Link>
        </div>
    );
}
