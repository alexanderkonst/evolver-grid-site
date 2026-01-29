import { useEffect } from "react";
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
    title = "Well done!",
    message = "Your next move is ready",
}: CelebrationModalProps) {
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
            <DialogContent className="sm:max-w-md text-center border-none bg-gradient-to-br from-white via-[#f5f5ff] to-[#ebe8f7] shadow-2xl">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8460ea] to-[#6894d0] flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-[#2c3150] mb-2">
                    {title}
                </h2>

                {/* XP Badge */}
                <div className="inline-flex items-center justify-center gap-2 bg-[#8460ea]/10 text-[#8460ea] px-4 py-2 rounded-full text-lg font-semibold mb-4">
                    +{xpEarned} XP
                </div>

                {/* Progress bar visual */}
                <div className="w-full h-2 bg-[#a4a3d0]/20 rounded-full overflow-hidden mb-6">
                    <div
                        className="h-full bg-gradient-to-r from-[#8460ea] to-[#6894d0] rounded-full animate-pulse"
                        style={{ width: "100%" }}
                    />
                </div>

                {/* Message */}
                <p className="text-[#2c3150]/70 mb-6">{message}</p>

                {/* CTA */}
                <Button
                    onClick={onClose}
                    className="w-full h-12 bg-gradient-to-r from-[#8460ea] to-[#6894d0] text-white font-semibold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </DialogContent>
        </Dialog>
    );
}
