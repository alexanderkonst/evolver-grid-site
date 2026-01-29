import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Download, Phone, Laptop, Sparkles } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

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
        // For now, just log
        console.log("CTA clicked:", product?.cta_config?.type);
    };

    const handleDownloadBlueprint = () => {
        // For now, just log
        console.log("Download blueprint");
    };

    if (loading) {
        return (
            <div className="min-h-dvh flex flex-col">
                <Navigation />
                <main className="flex-1 pt-24 flex items-center justify-center">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-dvh flex flex-col">
                <Navigation />
                <main className="flex-1 pt-24 flex flex-col items-center justify-center px-4">
                    <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
                    <p className="text-muted-foreground mb-6">{error}</p>
                    <Button onClick={() => navigate("/game/marketplace")}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Marketplace
                    </Button>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-dvh flex flex-col">
            <Navigation />

            <main className="flex-1 pt-24">
                {/* Landing Section - Dark Theme */}
                <section className="bg-gradient-to-b from-[#2c3150] to-[#1f2336] text-white py-16 px-4">
                    <div className="container mx-auto max-w-3xl text-center">
                        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                            {product.title}
                        </h1>

                        {/* CTA Button */}
                        {product.cta_config && (
                            <Button
                                size="lg"
                                className="bg-amber-500 hover:bg-amber-600 text-[#2c3150] font-semibold px-8 mt-8"
                                onClick={handleCTA}
                            >
                                {product.cta_config.type === "session" ? (
                                    <Phone className="w-4 h-4 mr-2" />
                                ) : (
                                    <Laptop className="w-4 h-4 mr-2" />
                                )}
                                {product.cta_config.buttonText}
                            </Button>
                        )}
                    </div>
                </section>

                {/* Blueprint Section */}
                {product.blueprint_content && (
                    <section className="py-16 px-4 bg-muted/30">
                        <div className="container mx-auto max-w-2xl">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <Sparkles className="w-6 h-6 text-primary" />
                                        <h2 className="text-xl font-bold text-foreground">
                                            {product.blueprint_content.title}
                                        </h2>
                                    </div>

                                    <div className="space-y-4 mb-6">
                                        {product.blueprint_content.steps.map((step, index) => (
                                            <div key={index} className="flex gap-4">
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <span className="text-sm font-semibold text-primary">{index + 1}</span>
                                                </div>
                                                <p className="text-foreground/80 leading-relaxed pt-1">{step}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={handleDownloadBlueprint}
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Download Blueprint
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </section>
                )}

                {/* CTA Section */}
                <section className="py-16 px-4">
                    <div className="container mx-auto max-w-lg text-center">
                        <h3 className="text-2xl font-bold text-foreground mb-4">
                            Ready to Transform?
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            {product.cta_config?.description}
                        </p>
                        {product.cta_config && (
                            <Button
                                size="lg"
                                onClick={handleCTA}
                            >
                                {product.cta_config.type === "session" ? (
                                    <Phone className="w-4 h-4 mr-2" />
                                ) : (
                                    <Laptop className="w-4 h-4 mr-2" />
                                )}
                                {product.cta_config.buttonText}
                            </Button>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default MarketplaceProductPage;
