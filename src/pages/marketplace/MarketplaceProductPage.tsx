import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Phone, Laptop, Sparkles, ArrowRight } from "lucide-react";

interface MarketplaceProduct {
    id: string;
    slug: string;
    title: string;
    landing_html: string | null;
    blueprint_content: {
        title: string;
        steps: string[];
        ctaSection: string;
    } | null;
    cta_config: {
        type: "session" | "software";
        buttonText: string;
        description: string;
    } | null;
    user_id: string;
}

const MarketplaceProductPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<MarketplaceProduct | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadProduct();
    }, [slug]);

    const loadProduct = async () => {
        if (!slug) {
            setError("Product not found");
            setLoading(false);
            return;
        }

        // For demo: use mock data until migration is applied
        // TODO: Replace with actual database query after migration
        const mockProduct: MarketplaceProduct = {
            id: "demo-1",
            slug: slug,
            title: "Transform Your Genius Into a Thriving Business",
            landing_html: null,
            blueprint_content: {
                title: "The Genius Business Blueprint",
                steps: [
                    "Identify your unique Zone of Genius — the intersection of what you love, what you're great at, and what feels effortless",
                    "Define your Ideal Client — the person who needs exactly what you offer and is ready to pay for it",
                    "Craft your Transformational Promise — the clear Point A → Point B journey you guide clients through",
                    "Build your minimum viable product — start with 1:1 sessions before scaling",
                    "Launch with authenticity — your story is your marketing"
                ],
                ctaSection: "Ready to build your Genius Business with expert guidance?"
            },
            cta_config: {
                type: "session",
                buttonText: "Book a Discovery Call",
                description: "Let's explore how I can help you fast-track your transformation from stuck professional to thriving Genius Business owner."
            },
            user_id: "demo-user"
        };

        // Simulate loading
        await new Promise(resolve => setTimeout(resolve, 500));
        setProduct(mockProduct);
        setLoading(false);
    };

    const handleCTA = () => {
        console.log("CTA clicked:", product?.cta_config?.type);
    };

    const handleDownloadBlueprint = () => {
        console.log("Download blueprint");
    };

    if (loading) {
        return (
            <div className="min-h-dvh bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 border-4 border-[#8460ea]/20 rounded-full" />
                        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-[#8460ea] border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="text-[#2c3150]/60 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-dvh bg-white flex flex-col items-center justify-center px-4">
                <h1 className="text-2xl font-bold text-[#2c3150] mb-4">Product Not Found</h1>
                <p className="text-[#2c3150]/60 mb-6">{error}</p>
                <Button
                    onClick={() => navigate("/")}
                    className="bg-[#8460ea] hover:bg-[#7350d0] text-white"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Home
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-dvh bg-white">
            {/* Hero Section — Brandbook gradient */}
            <section className="relative overflow-hidden">
                {/* Background gradient with brandbook colors */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#2c3150] via-[#3a3f6a] to-[#8460ea]/80" />
                {/* Subtle overlay pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(132,96,234,0.15),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(164,163,208,0.1),transparent_50%)]" />

                <div className="relative container mx-auto max-w-3xl text-center px-6 py-24 sm:py-32">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
                        {product.title}
                    </h1>

                    {product.cta_config && (
                        <Button
                            size="lg"
                            className="bg-white hover:bg-white/90 text-[#2c3150] font-semibold px-8 py-6 text-lg rounded-xl shadow-lg shadow-black/10 transition-all hover:shadow-xl hover:scale-[1.02] mt-4"
                            onClick={handleCTA}
                        >
                            {product.cta_config.type === "session" ? (
                                <Phone className="w-5 h-5 mr-2" />
                            ) : (
                                <Laptop className="w-5 h-5 mr-2" />
                            )}
                            {product.cta_config.buttonText}
                        </Button>
                    )}
                </div>
            </section>

            {/* Blueprint Section */}
            {product.blueprint_content && (
                <section className="py-20 px-6">
                    <div className="container mx-auto max-w-2xl">
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#8460ea]/10 mb-4">
                                <Sparkles className="w-6 h-6 text-[#8460ea]" />
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-[#2c3150] mb-2">
                                {product.blueprint_content.title}
                            </h2>
                            <p className="text-[#2c3150]/60">
                                Your step-by-step transformation framework
                            </p>
                        </div>

                        <div className="bg-white rounded-xl border border-[#a4a3d0]/20 shadow-sm p-6 sm:p-8 mb-8">
                            <div className="space-y-6">
                                {product.blueprint_content.steps.map((step, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#8460ea]/10 border border-[#8460ea]/20 flex items-center justify-center">
                                            <span className="text-sm font-semibold text-[#8460ea]">{index + 1}</span>
                                        </div>
                                        <p className="text-[#2c3150]/80 leading-relaxed pt-1">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="text-center">
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={handleDownloadBlueprint}
                                className="border-[#8460ea]/30 text-[#8460ea] hover:bg-[#8460ea]/5 px-8"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Blueprint
                            </Button>
                        </div>
                    </div>
                </section>
            )}

            {/* Final CTA Section */}
            <section className="py-20 px-6 bg-gradient-to-b from-white to-[#8460ea]/5">
                <div className="container mx-auto max-w-lg text-center">
                    <h3 className="text-2xl sm:text-3xl font-bold text-[#2c3150] mb-4">
                        Ready to Transform?
                    </h3>
                    <p className="text-[#2c3150]/60 mb-8 leading-relaxed">
                        {product.cta_config?.description}
                    </p>
                    {product.cta_config && (
                        <Button
                            size="lg"
                            onClick={handleCTA}
                            className="bg-[#8460ea] hover:bg-[#7350d0] text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-[#8460ea]/20 transition-all hover:shadow-xl hover:scale-[1.02]"
                        >
                            {product.cta_config.type === "session" ? (
                                <Phone className="w-5 h-5 mr-2" />
                            ) : (
                                <Laptop className="w-5 h-5 mr-2" />
                            )}
                            {product.cta_config.buttonText}
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    )}
                </div>
            </section>

            {/* Minimal Footer */}
            <footer className="py-8 px-6 text-center">
                <p className="text-[#2c3150]/30 text-sm">
                    Built with Evolver
                </p>
            </footer>
        </div>
    );
};

export default MarketplaceProductPage;
