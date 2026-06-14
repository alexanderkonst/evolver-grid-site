import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { localizedOrigin } from "@/i18n/localeScope";
import {
    Sparkles,
    ExternalLink,
    Copy,
    Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import GameShellV2 from "@/components/game/GameShellV2";
import ErrorBoundary from "@/components/ErrorBoundary";
import { usePublishedGeniusBusiness } from "@/modules/product-builder/ProductBuilderContext";
import { useToast } from "@/hooks/use-toast";

const MyProductsPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const business = usePublishedGeniusBusiness();
    const { toast } = useToast();

    const handleCopyLink = async () => {
        if (business?.productUrl) {
            const fullUrl = `${localizedOrigin()}${business.productUrl}`;
            await navigator.clipboard.writeText(fullUrl);
            toast({ title: t('myProducts.toast.copied.title'), description: t('myProducts.toast.copied.description') });
        }
    };

    return (
        <GameShellV2>
            <ErrorBoundary>
                <div className="p-6 lg:p-8 max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <Package className="w-6 h-6 text-foreground" />
                            <h1 className="text-2xl font-bold text-foreground">{t('myProducts.title')}</h1>
                        </div>
                        <p className="text-muted-foreground">{t('myProducts.subtitle')}</p>
                    </div>

                    {business ? (
                        <div className="rounded-xl border border-border bg-white/85 backdrop-blur-sm p-5 shadow-[0_4px_16px_rgba(44,49,80,0.06)]">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-primary/20">
                                        <Sparkles className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">
                                            {business.landingContent?.headline || t('myProducts.fallbackHeadline')}
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {business.productUrl}
                                        </p>
                                    </div>
                                </div>
                                <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                                    {t('myProducts.statusLive')}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                                {business.deepTP?.promiseStatement || business.landingContent?.subheadline || t('myProducts.fallbackPromise')}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    size="sm"
                                    onClick={() => business.productUrl && navigate(business.productUrl)}
                                    className="bg-primary hover:bg-primary/80 text-white text-xs"
                                >
                                    <ExternalLink className="w-3.5 h-3.5 mr-1" />
                                    {t('myProducts.viewPage')}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCopyLink}
                                    className="text-xs border-border"
                                >
                                    <Copy className="w-3.5 h-3.5 mr-1" />
                                    {t('myProducts.copyLink')}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-border bg-muted/40 p-10 text-center">
                            <Package className="w-10 h-10 text-foreground/20 mx-auto mb-3" />
                            <p className="text-muted-foreground text-sm">{t('myProducts.empty.title')}</p>
                            <p className="text-muted-foreground text-xs mt-1">{t('myProducts.empty.cta')}</p>
                        </div>
                    )}
                </div>
            </ErrorBoundary>
        </GameShellV2>
    );
};

export default MyProductsPage;
