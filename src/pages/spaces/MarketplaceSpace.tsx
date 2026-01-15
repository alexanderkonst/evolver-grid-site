import { Link } from "react-router-dom";
import {
    Store,
    Sparkles,
    ExternalLink,
    Plus,
    ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import GameShellV2 from "@/components/game/GameShellV2";
import ErrorBoundary from "@/components/ErrorBoundary";

// Featured guides/creators with public pages
const FEATURED_GUIDES = [
    {
        id: "christopher-august",
        name: "Christopher August",
        title: "Integral Coach & Facilitator",
        slug: "christopher-august",
        tagline: "Unlock your Zone of Genius",
        color: "#4F46E5" // Indigo
    },
    {
        id: "breathe-with-sandy",
        name: "Breathe with Sandy",
        title: "Breathwork Facilitator",
        slug: "breathe-with-sandy",
        tagline: "Heal through breath",
        color: "#0EA5E9" // Sky
    },
    {
        id: "stephanie-kojic",
        name: "Stephanie Kojic",
        title: "Transformation Guide",
        slug: "stephanie-kojic",
        tagline: "Embodied transformation",
        color: "#EC4899" // Pink
    }
];

const MarketplaceSpace = () => {
    return (
        <GameShellV2>
            <ErrorBoundary>
                <div className="p-6 lg:p-8 max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <Store className="w-6 h-6 text-slate-700" />
                            <h1 className="text-2xl font-bold text-slate-900">Marketplace</h1>
                        </div>
                        <p className="text-slate-600">Monetize your genius. Create and sell offers.</p>
                    </div>

                    {/* My Offers Section */}
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">My Offers</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {/* Create Genius Offer */}
                            <div className="rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="p-2 rounded-lg bg-amber-100">
                                        <Sparkles className="w-6 h-6 text-amber-600" />
                                    </div>
                                </div>
                                <h3 className="font-semibold text-slate-900 mb-1">Genius Offer</h3>
                                <p className="text-sm text-slate-600 mb-4">Create your signature offer based on your Zone of Genius</p>
                                <Button asChild variant="outline" size="sm" className="w-full">
                                    <Link to="/genius-offer?from=marketplace">
                                        Create Offer <ArrowRight className="w-4 h-4 ml-2" />
                                    </Link>
                                </Button>
                            </div>

                            {/* Create Public Page */}
                            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 hover:border-slate-400 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="p-2 rounded-lg bg-slate-200">
                                        <Plus className="w-6 h-6 text-slate-600" />
                                    </div>
                                </div>
                                <h3 className="font-semibold text-slate-900 mb-1">Create Public Page</h3>
                                <p className="text-sm text-slate-600 mb-4">Build your creator page with your brand and products</p>
                                <Button asChild variant="outline" size="sm" className="w-full">
                                    <Link to="/marketplace/create-page">
                                        Get Started <ArrowRight className="w-4 h-4 ml-2" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Featured Guides */}
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Featured Guides</h2>
                        <div className="grid gap-4 sm:grid-cols-3">
                            {FEATURED_GUIDES.map(guide => (
                                <Link
                                    key={guide.id}
                                    to={`/p/${guide.slug}`}
                                    className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-sm transition-all group"
                                >
                                    <div
                                        className="w-12 h-12 rounded-full mb-3 flex items-center justify-center text-white font-bold text-lg"
                                        style={{ backgroundColor: guide.color }}
                                    >
                                        {guide.name.charAt(0)}
                                    </div>
                                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                                        {guide.name}
                                    </h3>
                                    <p className="text-xs text-slate-500 mb-1">{guide.title}</p>
                                    <p className="text-sm text-slate-600">{guide.tagline}</p>
                                    <div className="mt-3 flex items-center text-xs text-blue-600 font-medium">
                                        View Page <ExternalLink className="w-3 h-3 ml-1" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </ErrorBoundary>
        </GameShellV2>
    );
};

export default MarketplaceSpace;
