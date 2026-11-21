import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { localizedOrigin } from "@/i18n/localeScope";
import {
    Sparkles,
    ExternalLink,
    Copy,
    Package,
    Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import GameShellV2 from "@/components/game/GameShellV2";
import ErrorBoundary from "@/components/ErrorBoundary";
import { usePublishedGeniusBusiness } from "@/modules/product-builder/ProductBuilderContext";
import { useToast } from "@/hooks/use-toast";
import { useMyClients } from "@/lib/myClients";

const MyProductsPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const business = usePublishedGeniusBusiness();
    const { toast } = useToast();
    const { loading: clientsLoading, signedIn, failed: clientsFailed, clients } = useMyClients();

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
                        <div className="rounded-xl border border-border bg-[color:rgba(var(--paper-rgb),0.85)] backdrop-blur-sm p-5 shadow-[0_4px_16px_rgba(var(--text-ink-rgb),0.06)]">
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
                            <p className="text-muted-foreground text-sm">{t('villagePlaces.market.empty')}</p>
                            <Button asChild className="mt-3"><Link to="/ubb">{t("villagePlaces.openWorkshop")}</Link></Button>
                        </div>
                    )}

                    {/* Clients: the seller's own sales_events rows, read-only */}
                    {signedIn && !clientsLoading && (
                        <section className="mt-8" aria-labelledby="my-clients-title">
                            <div className="flex items-center gap-3 mb-3">
                                <Users className="w-5 h-5 text-foreground" />
                                <h2 id="my-clients-title" className="text-lg font-semibold text-foreground">
                                    {t('myProducts.clients.title')}
                                </h2>
                            </div>
                            {clientsFailed ? (
                                <p className="text-sm text-muted-foreground">{t('myProducts.clients.error')}</p>
                            ) : clients.length === 0 ? (
                                <p className="text-sm text-muted-foreground">{t('myProducts.clients.empty')}</p>
                            ) : (
                                <ul className="space-y-2">
                                    {clients.map((client) => (
                                        <li
                                            key={client.id}
                                            className="rounded-xl border border-border bg-[color:rgba(var(--paper-rgb),0.85)] backdrop-blur-sm px-4 py-3 shadow-[0_4px_16px_rgba(var(--text-ink-rgb),0.06)] flex items-start justify-between gap-4"
                                        >
                                            <div className="min-w-0">
                                                <p className="font-medium text-foreground">
                                                    {client.buyer ?? t('myProducts.clients.anonymous')}
                                                </p>
                                                {client.offer && (
                                                    <p className="text-sm text-muted-foreground break-words">{client.offer}</p>
                                                )}
                                            </div>
                                            <div className="text-right shrink-0">
                                                {client.amount && (
                                                    <p className="font-medium text-foreground">{client.amount}</p>
                                                )}
                                                {client.date && (
                                                    <p className="text-xs text-muted-foreground">{client.date}</p>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    )}
                </div>
            </ErrorBoundary>
        </GameShellV2>
    );
};

export default MyProductsPage;
