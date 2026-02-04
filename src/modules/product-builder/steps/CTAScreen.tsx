import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Target, ArrowRight, Phone, Laptop } from "lucide-react";
import { useProductBuilder, CTAConfig } from "../ProductBuilderContext";
import { PRODUCT_BUILDER_STEPS } from "../productBuilderRoutes";
import { cn } from "@/lib/utils";

const CTAScreen: React.FC = () => {
    const navigate = useNavigate();
    const { state, setCTAConfig, setCurrentStep } = useProductBuilder();
    const [selectedType, setSelectedType] = useState<"session" | "software">(
        state.ctaConfig?.type || "session"
    );

    useEffect(() => {
        setCurrentStep(6);
    }, []);

    const ctaOptions: { type: "session" | "software"; icon: React.ElementType; title: string; description: string; buttonText: string }[] = [
        {
            type: "session",
            icon: Phone,
            title: "Book a Session",
            description: "Offer 1:1 discovery calls or coaching sessions. Best for high-touch, personalized services.",
            buttonText: "Book a Discovery Call",
        },
        {
            type: "software",
            icon: Laptop,
            title: "Try the Software",
            description: "Offer access to a tool, course, or digital product. Best for scalable, self-serve solutions.",
            buttonText: "Get Started Free",
        },
    ];

    const handleSelect = (type: "session" | "software") => {
        setSelectedType(type);
        const option = ctaOptions.find(o => o.type === type);
        if (option) {
            setCTAConfig({
                type,
                buttonText: option.buttonText,
                description: option.description,
            });
        }
    };

    const handleContinue = () => {
        // Ensure CTA is set
        if (!state.ctaConfig) {
            const option = ctaOptions.find(o => o.type === selectedType);
            if (option) {
                setCTAConfig({
                    type: selectedType,
                    buttonText: option.buttonText,
                    description: option.description,
                });
            }
        }
        navigate(PRODUCT_BUILDER_STEPS[7].path); // Go to Published step
    };

    const handleSkip = () => {
        // Default to session
        setCTAConfig({
            type: "session",
            buttonText: "Book a Discovery Call",
            description: "1:1 session",
        });
        navigate(PRODUCT_BUILDER_STEPS[7].path);
    };

    return (
        <div className="py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white border border-gray-200 mb-4">
                    <Target className="w-8 h-8 text-primary-wabi" />
                </div>
                <h1 className="text-3xl font-bold text-primary-wabi mb-2">Call to Action</h1>
                <p className="text-primary-wabi">
                    How will clients work with you?
                </p>
            </div>

            {/* CTA Options */}
            <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
                {ctaOptions.map((option) => (
                    <Card
                        key={option.type}
                        className={cn(
                            "cursor-pointer transition-all",
                            selectedType === option.type
                                ? "border-primary ring-2 ring-primary/20"
                                : "hover:border-primary/50"
                        )}
                        onClick={() => handleSelect(option.type)}
                    >
                        <CardContent className="p-6 text-center">
                            <div className={cn(
                                "inline-flex items-center justify-center w-12 h-12 rounded-full mb-4",
                                selectedType === option.type ? "bg-primary text-primary-wabi-foreground" : "bg-muted"
                            )}>
                                <option.icon className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold text-primary-wabi mb-2">{option.title}</h3>
                            <p className="text-sm text-primary-wabi mb-4">{option.description}</p>
                            <div className={cn(
                                "inline-block px-4 py-2 rounded-lg text-sm font-medium",
                                selectedType === option.type
                                    ? "bg-primary text-primary-wabi-foreground"
                                    : "bg-muted text-primary-wabi"
                            )}>
                                {option.buttonText}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                    variant="outline"
                    onClick={handleSkip}
                    className="w-full sm:w-auto"
                >
                    Skip — use "Book a session"
                </Button>
                <Button
                    size="lg"
                    onClick={handleContinue}
                    className="px-8 w-full sm:w-auto"
                >
                    Publish
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    );
};

export default CTAScreen;
