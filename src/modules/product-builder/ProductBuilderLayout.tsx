import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ProductBuilderProvider } from "./ProductBuilderContext";
import { cn } from "@/lib/utils";
import { PRODUCT_BUILDER_STEPS, getStepFromPath, TOTAL_STEPS } from "./productBuilderRoutes";
import ProgressIndicator from "@/components/ProgressIndicator";
import OnboardingProgress from "@/components/OnboardingProgress";
import BackButton from "@/components/BackButton";
import { ChevronLeft } from "lucide-react";

interface ProductBuilderLayoutProps {
    renderMode?: "standalone" | "embedded";
}

const ProductBuilderLayout: React.FC<ProductBuilderLayoutProps> = ({
    renderMode = "standalone",
}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const currentStep = getStepFromPath(location.pathname);

    // Don't show progress on entry (step 0) or published (step 7)
    const showProgress = currentStep > 0 && currentStep < 7;

    const handleBack = () => {
        if (currentStep > 0) {
            const prevStep = PRODUCT_BUILDER_STEPS.find(s => s.number === currentStep - 1);
            if (prevStep) {
                navigate(prevStep.path);
            }
        } else {
            navigate("/game/me/genius-business");
        }
    };

    const progressSection = showProgress && (
        <div className="text-center mb-8">
            <ProgressIndicator current={currentStep} total={TOTAL_STEPS} className="text-primary-wabi/60" />
            <OnboardingProgress
                current={currentStep}
                total={TOTAL_STEPS}
                className="mt-4 mb-0 max-w-lg"
            />

            {/* Step Indicator - Condensed for mobile */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs">
                {PRODUCT_BUILDER_STEPS.filter(s => s.number > 0 && s.number < 7).map((step, idx) => (
                    <React.Fragment key={step.number}>
                        <div
                            className={cn(
                                "flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all text-xs font-semibold",
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
                    </React.Fragment>
                ))}
            </div>
        </div>
    );

    if (renderMode === "embedded") {
        return (
            <ProductBuilderProvider>
                <div className="py-8 px-4 sm:px-6 lg:px-8">
                    <div className="container mx-auto max-w-4xl">
                        {progressSection}
                        <Outlet />
                    </div>
                </div>
            </ProductBuilderProvider>
        );
    }

    return (
        <ProductBuilderProvider>
            <div className="min-h-dvh flex flex-col bg-white font-sans">
                <main className="flex-1 pt-8 pb-16 px-4 sm:px-6 lg:px-8">
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

                        {progressSection}

                        {/* Step Content */}
                        <Outlet />
                    </div>
                </main>
            </div>
        </ProductBuilderProvider>
    );
};

export default ProductBuilderLayout;
