import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Rocket, CheckCircle2, Sparkles } from "lucide-react";
import { PRODUCT_BUILDER_STEPS } from "./productBuilderRoutes";

const ProductBuilderEntry: React.FC = () => {
    const navigate = useNavigate();

    const handleStart = () => {
        navigate(PRODUCT_BUILDER_STEPS[1].path); // Go to ICP step
    };

    return (
        <div className="text-center py-12">
            {/* Hero */}
            <div className="mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                    <Rocket className="w-10 h-10 text-primary" />
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                    Launch Your Genius Business
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Turn your Zone of Genius into a complete sales funnel — in 15 minutes.
                </p>
            </div>

            {/* What you'll get */}
            <div className="bg-card border border-border rounded-xl p-8 max-w-xl mx-auto mb-8">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    What you'll create:
                </h3>
                <ul className="space-y-3 text-left">
                    <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">
                            <strong className="text-foreground">Deep client understanding</strong> — know exactly who needs your gift
                        </span>
                    </li>
                    <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">
                            <strong className="text-foreground">Crystal-clear promise</strong> — articulate the transformation you create
                        </span>
                    </li>
                    <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">
                            <strong className="text-foreground">Landing page</strong> — a beautiful page that attracts ideal clients
                        </span>
                    </li>
                    <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">
                            <strong className="text-foreground">Blueprint</strong> — a methodology gift they can download
                        </span>
                    </li>
                    <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">
                            <strong className="text-foreground">Live on marketplace</strong> — ready for your first customer
                        </span>
                    </li>
                </ul>
            </div>

            {/* Bridge text */}
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                You've discovered your genius. You've defined your business.
                <br />
                <strong className="text-foreground">Now let's make it real.</strong>
            </p>

            {/* CTA */}
            <Button
                size="lg"
                onClick={handleStart}
                className="text-lg px-8 py-6 h-auto"
            >
                <Rocket className="w-5 h-5 mr-2" />
                Build My Product
            </Button>

            {/* Time estimate */}
            <p className="text-sm text-muted-foreground mt-4">
                Takes about 15 minutes
            </p>
        </div>
    );
};

export default ProductBuilderEntry;
