import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import { Sparkles, ArrowRight } from "lucide-react";

interface CelebrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    xpEarned?: number;
    title?: string;
    message?: string;
}

/**
 * CelebrationModal - Shows celebration with confetti after action completion
 * Part of Daily Loop "Feel Progress" sub-result
 */
export default function CelebrationModal({
    isOpen,
    onClose,
    xpEarned = 15,
    title,
    message,
}: CelebrationModalProps) {
    const { t } = useTranslation();
    const resolvedTitle = title ?? t("gameCelebration.title");
    const resolvedMessage = message ?? t("gameCelebration.message");

    useEffect(() => {
        if (isOpen) {
            // Fire confetti
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ["#8460ea", "#6894d0", "#a4a3d0", "#f5b642"],
            });
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            {/* Day 91 (Sasha 2026-06-09): tokenized for Aurum - gradient classes moved to a
                style-prop token; lapis falls back to the exact same white > #f5f5ff > #ebe8f7 wash */}
            <DialogContent
                className="sm:max-w-md text-center border-none shadow-2xl"
                style={{
                    background:
                        "var(--skin-card-fill, linear-gradient(to bottom right, #ffffff 0%, #f5f5ff 50%, #ebe8f7 100%))",
                }}
            >
                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8460ea] to-[#6894d0] flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-[#2c3150] mb-2">
                    {resolvedTitle}
                </h2>

                {/* XP Badge */}
                <div className="inline-flex items-center justify-center gap-2 bg-[#8460ea]/10 text-[#8460ea] px-4 py-2 rounded-full text-lg font-semibold mb-4">
                    {t("gameCelebration.xpBadge", { count: xpEarned })}
                </div>

                {/* Progress bar visual */}
                <div className="w-full h-2 bg-[#a4a3d0]/20 rounded-full overflow-hidden mb-6">
                    <div
                        className="h-full bg-gradient-to-r from-[#8460ea] to-[#6894d0] rounded-full animate-pulse"
                        style={{ width: "100%" }}
                    />
                </div>

                {/* Message */}
                <p className="text-[#2c3150]/70 mb-6">{resolvedMessage}</p>

                {/* CTA */}
                <Button
                    onClick={onClose}
                    className="w-full h-12 bg-gradient-to-r from-[#8460ea] to-[#6894d0] text-white font-semibold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    {t("gameCelebration.continue")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </DialogContent>
        </Dialog>
    );
}
