export const PRODUCT_BUILDER_BASE = "/game/build/product-builder";

export const PRODUCT_BUILDER_STEPS = [
    { number: 0, label: "Get Started", path: `${PRODUCT_BUILDER_BASE}` },
    { number: 1, label: "Ideal Client", path: `${PRODUCT_BUILDER_BASE}/icp` },
    { number: 2, label: "Their Pain", path: `${PRODUCT_BUILDER_BASE}/pain` },
    { number: 3, label: "Your Promise", path: `${PRODUCT_BUILDER_BASE}/promise` },
    { number: 4, label: "Landing Page", path: `${PRODUCT_BUILDER_BASE}/landing` },
    { number: 5, label: "Blueprint", path: `${PRODUCT_BUILDER_BASE}/blueprint` },
    { number: 6, label: "Call to Action", path: `${PRODUCT_BUILDER_BASE}/cta` },
    { number: 7, label: "Published!", path: `${PRODUCT_BUILDER_BASE}/published` },
];

export const getProductBuilderStepPath = (step: number) =>
    PRODUCT_BUILDER_STEPS.find(s => s.number === step)?.path || PRODUCT_BUILDER_BASE;

export const getStepFromPath = (pathname: string): number => {
    const step = PRODUCT_BUILDER_STEPS.find(s => pathname === s.path);
    return step?.number ?? 0;
};

export const TOTAL_STEPS = PRODUCT_BUILDER_STEPS.length - 1; // Exclude entry step from count
