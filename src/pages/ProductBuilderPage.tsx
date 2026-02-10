
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import GameShellV2 from "@/components/game/GameShellV2";
import { ProductBuilderProvider } from "@/modules/product-builder/ProductBuilderContext";
import { PRODUCT_BUILDER_STEPS } from "@/modules/product-builder/productBuilderRoutes";
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
                navigate(prevStep.path);
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

                        {/* Progress Section — Circle indicators only */}
                        {showProgress && (
                            <div className="text-center mb-8">
                                <div className="flex items-center justify-center gap-2 text-xs">
                                    {PRODUCT_BUILDER_STEPS.filter(s => s.number > 0 && s.number < 7).map((step, idx) => (
                                        <div key={step.number} className="flex items-center gap-2">
                                            <div
                                                className={cn(
                                                    "flex items-center justify-center w-7 h-7 rounded-full border-2 transition-all text-xs font-semibold",
                                                    currentStep >= step.number
                                                        ? "border-[#8460ea] bg-[#8460ea] text-white"
                                                        : "border-[#a4a3d0]/40 bg-white text-[#2c3150]/50"
                                                )}
                                            >
                                                {step.number}
                                            </div>
                                            {idx < 5 && (
                                                <div
                                                    className={cn(
                                                        "w-4 h-0.5 transition-all",
                                                        currentStep > step.number ? "bg-[#8460ea]" : "bg-[#a4a3d0]/30"
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
