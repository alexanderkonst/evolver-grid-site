import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Rocket, CheckCircle2, Sparkles } from "lucide-react";
import { PRODUCT_BUILDER_STEPS } from "./productBuilderRoutes";

const ProductBuilderEntry: React.FC = () => {
    const navigate = useNavigate();

    const handleStart = () => {
        navigate(PRODUCT_BUILDER_STEPS[1].path);
    };

    return (
        <div className="text-center py-12 px-4">
            {/* Hero */}
            <div className="mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full liquid-glass-strong mb-6">
                    <Rocket className="w-10 h-10 text-white" />
                </div>
                <h1
                    className="text-4xl sm:text-5xl font-bold text-white mb-4 uppercase tracking-wide"
                    style={{ textShadow: '0 0 30px rgba(255,255,255,0.4), 0 0 60px rgba(255,255,255,0.1)' }}
                >
                    Launch Your Genius Business
                </h1>
                <p className="text-xl text-white/70 max-w-2xl mx-auto">
                    Turn your Zone of Genius into a complete sales funnel — in 15 minutes.
                </p>
            </div>

            {/* What you'll get */}
            <div className="liquid-glass-strong rounded-2xl p-8 max-w-xl mx-auto mb-8">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-white/80" />
                    What you'll create:
                </h3>
                <ul className="space-y-3 text-left">
                    <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span className="text-white/80">
                            <strong className="text-white">Deep client understanding</strong> — know exactly who needs your gift
                        </span>
                    </li>
                    <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span className="text-white/80">
                            <strong className="text-white">Crystal-clear promise</strong> — articulate the transformation you create
                        </span>
                    </li>
                    <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span className="text-white/80">
                            <strong className="text-white">Landing page</strong> — a beautiful page that attracts ideal clients
                        </span>
                    </li>
                    <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span className="text-white/80">
                            <strong className="text-white">Blueprint</strong> — a methodology gift they can download
                        </span>
                    </li>
                    <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span className="text-white/80">
                            <strong className="text-white">Live on marketplace</strong> — ready for your first customer
                        </span>
                    </li>
                </ul>
            </div>

            {/* Bridge text */}
            <p className="text-white/70 mb-6 max-w-lg mx-auto">
                You've discovered your genius. You've defined your business.
                <br />
                <strong className="text-white">Now let's make it real.</strong>
            </p>

            {/* CTA */}
            <Button
                size="lg"
                onClick={handleStart}
                className="text-lg px-8 py-6 h-auto bg-[#8460ea] hover:bg-[#7350d0] text-white shadow-[0_0_30px_rgba(132,96,234,0.3)] hover:shadow-[0_0_40px_rgba(132,96,234,0.5)] transition-all duration-300 hover:scale-[1.02] active:scale-95"
            >
                <Rocket className="w-5 h-5 mr-2" />
                Build My Product
            </Button>

            {/* Time estimate */}
            <p className="text-sm text-white/40 mt-4">
                Takes about 15 minutes
            </p>
        </div>
    );
};

export default ProductBuilderEntry;
