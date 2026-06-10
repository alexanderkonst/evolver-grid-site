import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

type EmptyStateType = "zog" | "qol" | "action";

interface EmptyStateCardProps {
    type: EmptyStateType;
}

const EMPTY_STATE_CONFIG: Record<
    EmptyStateType,
    { icon: string; message: string; cta: string; href: string }
> = {
    zog: {
        icon: "🌟",
        message: "Let's discover who you are",
        cta: "Discover My Genius",
        href: "/zone-of-genius/entry?return=/game",
    },
    qol: {
        icon: "📊",
        message: "See where you are across 8 life areas",
        cta: "Map My Life",
        href: "/game/transformation/qol-assessment?return=/game",
    },
    action: {
        icon: "✨",
        message: "You've completed all recommended actions!",
        cta: "Explore More",
        href: "/game/transformation/library",
    },
};

/**
 * EmptyStateCard - Graceful handling of missing data
 * Inviting, not guilt-inducing
 */
export default function EmptyStateCard({ type }: EmptyStateCardProps) {
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
            <p className="text-lg text-[rgba(44,49,80,0.7)] mb-6">{config.message}</p>
            <Link to={config.href}>
                <Button
                    variant="outline"
                    className="border-2 border-[#8460ea] text-[#8460ea] hover:bg-[#8460ea]/10 px-6 py-3 rounded-xl"
                >
                    {config.cta} →
                </Button>
            </Link>
        </div>
    );
}
