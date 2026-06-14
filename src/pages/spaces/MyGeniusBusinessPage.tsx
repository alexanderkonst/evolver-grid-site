import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ExternalLink,
    Copy,
    Edit,
    Sparkles,
    ArrowRight,
    BookOpen,
    Target,
    Users,
    Zap,
    RefreshCw,
    Eye,
} from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";
import ErrorBoundary from "@/components/ErrorBoundary";
import { usePublishedGeniusBusiness } from "@/modules/product-builder/ProductBuilderContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const MyGeniusBusinessPage: React.FC = () => {
    const navigate = useNavigate();
    const business = usePublishedGeniusBusiness();
    const { toast } = useToast();
    const { t } = useTranslation();

    const handleCopyLink = async () => {
        if (business?.productUrl) {
            const fullUrl = `${window.location.origin}${business.productUrl}`;
            await navigator.clipboard.writeText(fullUrl);
            toast({ title: t("myGeniusBusiness.toastCopiedTitle"), description: t("myGeniusBusiness.toastCopiedDescription") });
        }
    };

    // No published business yet
    if (!business) {
        return (
            <GameShellV2>
                <ErrorBoundary>
                    <div className="p-6 lg:p-8 max-w-2xl mx-auto text-center py-20">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/15 ring-1 ring-white/10 mb-6">
                            <Sparkles className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-3">
                            {t("myGeniusBusiness.emptyTitle")}
                        </h1>
                        <p className="text-white/50 mb-8 max-w-md mx-auto">
                            {t("myGeniusBusiness.emptyDescription")}
                        </p>
                        <button
                            onClick={() => navigate("/game/build/product-builder")}
                            className="px-8 py-3 rounded-xl liquid-glass-strong ring-1 ring-white/20 text-white font-semibold
                                       shadow-[0_0_30px_rgba(132,96,234,0.2)] hover:shadow-[0_0_40px_rgba(132,96,234,0.3)]
                                       hover:scale-[1.02] active:scale-95 transition-all duration-300
                                       flex items-center gap-2 mx-auto"
                        >
                            <Sparkles className="w-4 h-4" />
                            {t("myGeniusBusiness.startBuilding")}
                        </button>
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
                            <Sparkles className="w-6 h-6 text-primary" />
                            <h1 className="text-2xl font-bold text-white">{t("myGeniusBusiness.pageTitle")}</h1>
                        </div>
                        <p className="text-white/50">{t("myGeniusBusiness.pageSubtitle")}</p>
                    </div>

                    {/* Product Card */}
                    <div className="liquid-glass rounded-xl ring-1 ring-white/10 p-6 mb-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-1">
                                    {business.landingContent?.headline || t("myGeniusBusiness.productHeadlineFallback")}
                                </h2>
                                <p className="text-white/50 text-sm">
                                    {business.landingContent?.subheadline || ""}
                                </p>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-green-500/15 text-green-300 text-xs font-semibold ring-1 ring-green-500/20">
                                {t("myGeniusBusiness.liveBadge")}
                            </span>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="text-center p-3 rounded-lg bg-white/[0.02] ring-1 ring-white/5">
                                <Users className="w-5 h-5 text-primary mx-auto mb-1" />
                                <p className="text-xs text-white/30">{t("myGeniusBusiness.statIcpLabel")}</p>
                                <p className="text-sm font-medium text-white/80 truncate">
                                    {business.deepICP?.who?.split('.')[0]?.slice(0, 30) || t("myGeniusBusiness.statDefined")}
                                </p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-white/[0.02] ring-1 ring-white/5">
                                <Target className="w-5 h-5 text-primary mx-auto mb-1" />
                                <p className="text-xs text-white/30">{t("myGeniusBusiness.statPromiseLabel")}</p>
                                <p className="text-sm font-medium text-white/80 truncate">
                                    {business.deepTP?.promiseStatement?.slice(0, 30) || t("myGeniusBusiness.statDefined")}
                                </p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-white/[0.02] ring-1 ring-white/5">
                                <BookOpen className="w-5 h-5 text-primary mx-auto mb-1" />
                                <p className="text-xs text-white/30">{t("myGeniusBusiness.statBlueprintLabel")}</p>
                                <p className="text-sm font-medium text-white/80 truncate">
                                    {t("myGeniusBusiness.statSteps", { count: business.blueprintContent?.steps?.length || 0 })}
                                </p>
                            </div>
                        </div>

                        {/* URL */}
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex-1 bg-white/[0.03] rounded-lg px-4 py-2.5 text-sm font-mono text-white/60 truncate ring-1 ring-white/5">
                                {business.productUrl}
                            </div>
                            <button
                                onClick={handleCopyLink}
                                className="flex-shrink-0 w-9 h-9 rounded-lg liquid-glass ring-1 ring-white/10 flex items-center justify-center hover:bg-white/5 transition-colors"
                            >
                                <Copy className="w-4 h-4 text-white/50" />
                            </button>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => business.productUrl && navigate(business.productUrl)}
                                className="px-4 py-2 rounded-lg bg-primary/20 ring-1 ring-[#8460ea]/30 text-muted-foreground hover:bg-primary/30 transition-all text-sm font-medium flex items-center gap-1"
                            >
                                <ExternalLink className="w-4 h-4" />
                                {t("myGeniusBusiness.viewPage")}
                            </button>
                            <button
                                onClick={() => navigate("/game/build/product-builder")}
                                className="px-4 py-2 rounded-lg liquid-glass ring-1 ring-white/15 text-white/70 hover:bg-white/5 transition-all text-sm font-medium flex items-center gap-1"
                            >
                                <Edit className="w-4 h-4" />
                                {t("myGeniusBusiness.edit")}
                            </button>
                        </div>
                    </div>

                    {/* Refine Section */}
                    <div className="liquid-glass-strong rounded-xl ring-1 ring-[#8460ea]/15 p-6 mb-4">
                        <div className="flex items-start gap-4">
                            <div className="p-2.5 rounded-xl bg-primary/15 flex-shrink-0">
                                <RefreshCw className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-white mb-1">{t("myGeniusBusiness.refineTitle")}</h3>
                                <p className="text-sm text-white/50 mb-4">
                                    {t("myGeniusBusiness.refineDescription")}
                                </p>
                                <button
                                    onClick={() => navigate("/game/build/refine")}
                                    className="px-4 py-2 rounded-lg liquid-glass ring-1 ring-[#8460ea]/30 text-muted-foreground hover:bg-primary/10 transition-all text-sm font-medium flex items-center gap-1"
                                >
                                    <Zap className="w-4 h-4" />
                                    {t("myGeniusBusiness.startRefinement")}
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Canvas Link */}
                    <div className="p-4 liquid-glass rounded-xl ring-1 ring-white/10 hover:ring-[#8460ea]/20 transition-all cursor-pointer group"
                         onClick={() => navigate("/game/me/canvas")}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/15 flex-shrink-0">
                                <Eye className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-white text-sm group-hover:text-white transition-colors">{t("myGeniusBusiness.canvasTitle")}</h3>
                                <p className="text-xs text-white/40">{t("myGeniusBusiness.canvasDescription")}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
                        </div>
                    </div>
                </div>
            </ErrorBoundary>
        </GameShellV2>
    );
};

export default MyGeniusBusinessPage;
