import { Building2 } from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";
import ErrorBoundary from "@/components/ErrorBoundary";

const CoopSpace = () => {
    return (
        <GameShellV2>
            <ErrorBoundary>
                <div className="p-6 lg:p-8 max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <Building2 className="w-6 h-6 text-foreground" />
                            <h1 className="text-2xl font-bold text-foreground">Business Incubator</h1>
                        </div>
                        <p className="text-muted-foreground">Build together. Create collective wealth.</p>
                    </div>

                    {/* Coming Soon */}
                    <div className="rounded-xl border-2 border-dashed border-border bg-muted/40 p-12 text-center">
                        <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-foreground mb-2">Coming Soon</h2>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            The Business Incubator will enable you to build products, join collective ventures, contribute your genius,
                            and share in the wealth created by the community.
                        </p>
                    </div>
                </div>
            </ErrorBoundary>
        </GameShellV2>
    );
};

export default CoopSpace;
