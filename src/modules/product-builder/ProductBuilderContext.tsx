import React, { createContext, useContext, useState, ReactNode } from "react";

// Types for Product Builder state
interface DeepICP {
    who: string;
    struggles: string;
    desires: string;
    rawData?: Record<string, unknown>;
}

interface DeepPain {
    pressure: string;
    consequences: string;
    costOfInaction: string;
    stakes: string;
    rawData?: Record<string, unknown>;
}

interface DeepTP {
    pointA: string;
    pointB: string;
    promiseStatement: string;
    rawData?: Record<string, unknown>;
}

interface LandingContent {
    headline: string;
    subheadline: string;
    painSection: string;
    promiseSection: string;
    ctaText: string;
    rawData?: Record<string, unknown>;
}

interface BlueprintContent {
    title: string;
    steps: string[];
    ctaSection: string;
    rawData?: Record<string, unknown>;
}

interface CTAConfig {
    type: "session" | "software";
    buttonText: string;
    description: string;
}

interface ResonanceRatings {
    icp?: number;
    pain?: number;
    tp?: number;
    landing?: number;
}

interface ProductBuilderState {
    currentStep: number;
    deepICP: DeepICP | null;
    deepPain: DeepPain | null;
    deepTP: DeepTP | null;
    landingContent: LandingContent | null;
    blueprintContent: BlueprintContent | null;
    ctaConfig: CTAConfig | null;
    resonanceRatings: ResonanceRatings;
    isPublished: boolean;
    productUrl: string | null;
}

interface ProductBuilderContextType {
    state: ProductBuilderState;
    setCurrentStep: (step: number) => void;
    setDeepICP: (icp: DeepICP) => void;
    setDeepPain: (pain: DeepPain) => void;
    setDeepTP: (tp: DeepTP) => void;
    setLandingContent: (content: LandingContent) => void;
    setBlueprintContent: (content: BlueprintContent) => void;
    setCTAConfig: (config: CTAConfig) => void;
    setResonanceRating: (key: keyof ResonanceRatings, value: number) => void;
    setPublished: (url: string) => void;
    resetState: () => void;
}

const initialState: ProductBuilderState = {
    currentStep: 0,
    deepICP: null,
    deepPain: null,
    deepTP: null,
    landingContent: null,
    blueprintContent: null,
    ctaConfig: null,
    resonanceRatings: {},
    isPublished: false,
    productUrl: null,
};

const ProductBuilderContext = createContext<ProductBuilderContextType | undefined>(undefined);

interface ProductBuilderProviderProps {
    children: ReactNode;
}

export const ProductBuilderProvider: React.FC<ProductBuilderProviderProps> = ({ children }) => {
    const [state, setState] = useState<ProductBuilderState>(initialState);

    const setCurrentStep = (step: number) => {
        setState(prev => ({ ...prev, currentStep: step }));
    };

    const setDeepICP = (icp: DeepICP) => {
        setState(prev => ({ ...prev, deepICP: icp }));
    };

    const setDeepPain = (pain: DeepPain) => {
        setState(prev => ({ ...prev, deepPain: pain }));
    };

    const setDeepTP = (tp: DeepTP) => {
        setState(prev => ({ ...prev, deepTP: tp }));
    };

    const setLandingContent = (content: LandingContent) => {
        setState(prev => ({ ...prev, landingContent: content }));
    };

    const setBlueprintContent = (content: BlueprintContent) => {
        setState(prev => ({ ...prev, blueprintContent: content }));
    };

    const setCTAConfig = (config: CTAConfig) => {
        setState(prev => ({ ...prev, ctaConfig: config }));
    };

    const setResonanceRating = (key: keyof ResonanceRatings, value: number) => {
        setState(prev => ({
            ...prev,
            resonanceRatings: { ...prev.resonanceRatings, [key]: value },
        }));
    };

    const setPublished = (url: string) => {
        setState(prev => ({ ...prev, isPublished: true, productUrl: url }));
    };

    const resetState = () => {
        setState(initialState);
    };

    return (
        <ProductBuilderContext.Provider
            value={{
                state,
                setCurrentStep,
                setDeepICP,
                setDeepPain,
                setDeepTP,
                setLandingContent,
                setBlueprintContent,
                setCTAConfig,
                setResonanceRating,
                setPublished,
                resetState,
            }}
        >
            {children}
        </ProductBuilderContext.Provider>
    );
};

export const useProductBuilder = (): ProductBuilderContextType => {
    const context = useContext(ProductBuilderContext);
    if (!context) {
        throw new Error("useProductBuilder must be used within a ProductBuilderProvider");
    }
    return context;
};

export type {
    DeepICP,
    DeepPain,
    DeepTP,
    LandingContent,
    BlueprintContent,
    CTAConfig,
    ResonanceRatings,
    ProductBuilderState,
};
