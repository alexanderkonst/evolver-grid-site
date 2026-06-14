import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
    RefreshCw,
    Users,
    Target,
    Flame,
    BookOpen,
    Sparkles,
    ArrowRight,
    Lock,
} from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";
import ErrorBoundary from "@/components/ErrorBoundary";
import { usePublishedGeniusBusiness } from "@/modules/product-builder/ProductBuilderContext";

const REFINEMENT_OPTIONS = [
    {
        id: "icp",
        icon: Users,
        titleKey: "refineBusiness.options.icp.title",
        descKey: "refineBusiness.options.icp.description",
        available: true,
    },
    {
        id: "pain",
        icon: Flame,
        titleKey: "refineBusiness.options.pain.title",
        descKey: "refineBusiness.options.pain.description",
        available: true,
    },
    {
        id: "promise",
        icon: Target,
        titleKey: "refineBusiness.options.promise.title",
        descKey: "refineBusiness.options.promise.description",
        available: true,
    },
    {
        id: "blueprint",
        icon: BookOpen,
        titleKey: "refineBusiness.options.blueprint.title",
        descKey: "refineBusiness.options.blueprint.description",
        available: false,
    },
    {
        id: "landing",
        icon: Sparkles,
        titleKey: "refineBusiness.options.landing.title",
        descKey: "refineBusiness.options.landing.description",
        available: false,
    },
];

const RefineBusinessPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const business = usePublishedGeniusBusiness();

    if (!business) {
        return (
            <GameShellV2>
                <ErrorBoundary>
                    <div className="p-6 lg:p-8 max-w-2xl mx-auto text-center py-20">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                            <RefreshCw className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground mb-3">
                            {t("refineBusiness.empty.title")}
                        </h1>
                        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                            {t("refineBusiness.empty.description")}
                        </p>
                        <Button
                            size="lg"
                            onClick={() => navigate("/game/build/product-builder")}
                            className="bg-primary hover:bg-primary/80 text-white px-8"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            {t("refineBusiness.empty.buildCta")}
                        </Button>
                    </div>
                </ErrorBoundary>
            </GameShellV2>
        );
    }

    return (
        <GameShellV2>
            <ErrorBoundary>
                <div className="p-6 lg:p-8 max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <RefreshCw className="w-6 h-6 text-primary" />
                            <h1 className="text-2xl font-bold text-foreground">{t("refineBusiness.header.title")}</h1>
                        </div>
                        <p className="text-muted-foreground">
                            {t("refineBusiness.header.subtitle")}
                        </p>
                    </div>

                    {/* Current Product Summary
                        Day 91 (Sasha 2026-06-09): bg-white tokenized for Aurum —
                        full-opacity white card was a light-leak island under the
                        dark skins; lapis keeps its light card via the token. */}
                    <div className="bg-[var(--skin-card-fill,#fff)] rounded-xl border border-border shadow-sm p-4 mb-8 flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground truncate">
                                {business.landingContent?.headline || t("refineBusiness.summary.fallbackName")}
                            </p>
                            <p className="text-xs text-muted-foreground">{t("refineBusiness.summary.status")}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold flex-shrink-0">
                            {t("refineBusiness.summary.live")}
                        </span>
                    </div>

                    {/* Refinement Options */}
                    <div className="space-y-3">
                        {REFINEMENT_OPTIONS.map((option) => (
                            <button
                                key={option.id}
                                disabled={!option.available}
                                onClick={() => {
                                    if (option.available) {
                                        // For now, redirect to product builder — future: targeted refinement flows
                                        navigate("/game/build/product-builder");
                                    }
                                }}
                                className={`w-full text-left rounded-xl border p-5 transition-all ${option.available
                                        ? "bg-[var(--skin-card-fill,#fff)] border-border hover:border-primary/40 hover:shadow-sm cursor-pointer"
                                        : "bg-muted/30 border-border/10 opacity-60 cursor-not-allowed"
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-2.5 rounded-xl flex-shrink-0 ${option.available ? "bg-primary/10" : "bg-muted/30"
                                        }`}>
                                        <option.icon className={`w-5 h-5 ${option.available ? "text-primary" : "text-muted-foreground"
                                            }`} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-foreground">{t(option.titleKey)}</h3>
                                            {!option.available && (
                                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Lock className="w-3 h-3" /> {t("refineBusiness.options.comingSoon")}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{t(option.descKey)}</p>
                                    </div>
                                    {option.available && (
                                        <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Info */}
                    <div className="mt-8 text-center">
                        <p className="text-xs text-muted-foreground">
                            {t("refineBusiness.footer.info")}
                        </p>
                    </div>
                </div>
            </ErrorBoundary>
        </GameShellV2>
    );
};

export default RefineBusinessPage;
