import { useEffect } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import GameShellV2 from "@/components/game/GameShellV2";
import { ProductBuilderProvider } from "@/modules/product-builder/ProductBuilderContext";
import { PRODUCT_BUILDER_STEPS, getStepFromPath, TOTAL_STEPS } from "@/modules/product-builder/productBuilderRoutes";
import ProgressIndicator from "@/components/ProgressIndicator";
import OnboardingProgress from "@/components/OnboardingProgress";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ProductBuilderPage - Renders Product Builder within GameShellV2 (3-panel layout)
 * Located in BUILD space > Product Builder section
 */
const ProductBuilderPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Adjust path parsing for new route structure
    const getAdjustedStep = () => {
        const path = location.pathname.replace("/game/build/product-builder", "");
        if (!path || path === "/" || path === "") return 0;
        const step = PRODUCT_BUILDER_STEPS.find(s => path.includes(s.path.split("/").pop() || ""));
        return step?.number || 0;
    };

    const currentStep = getAdjustedStep();
    const showProgress = currentStep > 0 && currentStep < 7;

    const handleBack = () => {
        if (currentStep > 0) {
            const prevStep = PRODUCT_BUILDER_STEPS.find(s => s.number === currentStep - 1);
            if (prevStep) {
                const stepPath = prevStep.path.replace("/product-builder", "/game/build/product-builder");
                navigate(stepPath);
            }
        } else {
            navigate("/game/build");
        }
    };

    return (
        <GameShellV2>
            <ProductBuilderProvider>
                <div className="py-8 px-4 sm:px-6 lg:px-8 h-full overflow-y-auto">
                    <div className="container mx-auto max-w-4xl">
                        {/* Back Button */}
                        {currentStep > 0 && currentStep < 7 && (
                            <div className="mb-6">
                                <button
                                    onClick={handleBack}
                                    className="flex items-center gap-2 text-primary-wabi hover:text-primary-wabi/80 transition-colors font-semibold"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    <span>Back</span>
                                </button>
                            </div>
                        )}

                        {/* Progress Section */}
                        {showProgress && (
                            <div className="text-center mb-8">
                                <ProgressIndicator current={currentStep} total={TOTAL_STEPS} className="text-primary-wabi/60" />
                                <OnboardingProgress
                                    current={currentStep}
                                    total={TOTAL_STEPS}
                                    className="mt-4 mb-0 max-w-lg"
                                />
                                {/* Step Indicator */}
                                <div className="mt-4 flex items-center justify-center gap-2 text-xs">
                                    {PRODUCT_BUILDER_STEPS.filter(s => s.number > 0 && s.number < 7).map((step, idx) => (
                                        <div key={step.number} className="flex items-center gap-2">
                                            <div
                                                className={cn(
                                                    "flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all",
                                                    currentStep >= step.number
                                                        ? "border-primary bg-primary text-primary-wabi-foreground"
                                                        : "border-border bg-background text-primary-wabi"
                                                )}
                                            >
                                                {step.number}
                                            </div>
                                            {idx < 5 && (
                                                <div
                                                    className={cn(
                                                        "w-4 h-0.5 transition-all",
                                                        currentStep > step.number ? "bg-primary" : "bg-border"
                                                    )}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step Content */}
                        <Outlet />
                    </div>
                </div>
            </ProductBuilderProvider>
        </GameShellV2>
    );
};

export default ProductBuilderPage;
