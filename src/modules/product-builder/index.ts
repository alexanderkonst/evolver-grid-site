// Product Builder Module
// Exports for use in other parts of the application

export { default as ProductBuilderLayout } from "./ProductBuilderLayout";
export { default as ProductBuilderEntry } from "./ProductBuilderEntry";
export { default as ProductBuilderLoading, LOADING_MESSAGES } from "./ProductBuilderLoading";

export {
    ProductBuilderProvider,
    useProductBuilder,
    type DeepICP,
    type DeepPain,
    type DeepTP,
    type LandingContent,
    type BlueprintContent,
    type CTAConfig,
    type ResonanceRatings,
    type ProductBuilderState,
} from "./ProductBuilderContext";

export {
    PRODUCT_BUILDER_BASE,
    PRODUCT_BUILDER_STEPS,
    getProductBuilderStepPath,
    getStepFromPath,
    TOTAL_STEPS,
} from "./productBuilderRoutes";
