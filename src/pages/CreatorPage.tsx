import { useParams } from "react-router-dom";
import { ExternalLink, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

// Creator data - later will come from database
const CREATORS: Record<string, {
    name: string;
    title: string;
    bio: string;
    color: string;
    logo?: string;
    offers: { id: string; title: string; description: string; price?: string; link?: string }[];
}> = {
    "christopher-august": {
        name: "Christopher August",
        title: "Integral Coach & Facilitator",
        bio: "I help multi-talented founders unlock their Zone of Genius and create offers that feel true to who they are.",
        color: "#4F46E5",
        offers: [
            {
                id: "zog-session",
                title: "Zone of Genius Session",
                description: "90-minute deep dive into your unique genius",
                price: "$250"
            },
            {
                id: "genius-offer",
                title: "Genius Offer Creation",
                description: "48-hour turnaround on your signature offer",
                price: "$497"
            }
        ]
    },
    "breathe-with-sandy": {
        name: "Breathe with Sandy",
        title: "Breathwork Facilitator",
        bio: "Guiding you back to your body through the power of conscious breath.",
        color: "#0EA5E9",
        offers: [
            {
                id: "group-session",
                title: "Group Breathwork",
                description: "Weekly online group sessions",
                price: "$25/session"
            },
            {
                id: "private",
                title: "Private Session",
                description: "1:1 personalized breathwork journey",
                price: "$150"
            }
        ]
    },
    "stephanie-kojic": {
        name: "Stephanie Kojic",
        title: "Transformation Guide",
        bio: "Embodied transformation for those ready to live from their deepest truth.",
        color: "#EC4899",
        offers: [
            {
                id: "coaching",
                title: "Transformation Coaching",
                description: "3-month embodied transformation container",
                price: "$2,500"
            }
        ]
    }
};

const CreatorPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const creator = slug ? CREATORS[slug] : null;

    if (!creator) {
        return (
            <div className="min-h-dvh bg-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h1>
                    <p className="text-slate-600">This creator page doesn't exist yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-dvh bg-white">
            {/* Header with brand color */}
            <div
                className="h-32"
                style={{ backgroundColor: creator.color }}
            />

            {/* Profile */}
            <div className="max-w-2xl mx-auto px-4 -mt-16">
                <div
                    className="w-24 h-24 rounded-full border-4 border-white flex items-center justify-center text-white font-bold text-3xl shadow-lg mb-4"
                    style={{ backgroundColor: creator.color }}
                >
                    {creator.name.charAt(0)}
                </div>

                <h1 className="text-2xl font-bold text-slate-900">{creator.name}</h1>
                <p className="text-slate-600 mb-4">{creator.title}</p>
                <p className="text-slate-700 mb-8">{creator.bio}</p>

                {/* Offers */}
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Offers</h2>
                <div className="space-y-4 mb-12">
                    {creator.offers.map(offer => (
                        <div
                            key={offer.id}
                            className="rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold text-slate-900">{offer.title}</h3>
                                    <p className="text-sm text-slate-600 mt-1">{offer.description}</p>
                                </div>
                                {offer.price && (
                                    <span className="text-lg font-bold text-slate-900">{offer.price}</span>
                                )}
                            </div>
                            <Button className="w-full mt-4" style={{ backgroundColor: creator.color }}>
                                Get This Offer
                            </Button>
                        </div>
                    ))}
                </div>

                {/* Contact */}
                <div className="border-t border-slate-200 pt-8 pb-12">
                    <Button variant="outline" className="w-full">
                        <Mail className="w-4 h-4 mr-2" />
                        Contact {creator.name.split(' ')[0]}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CreatorPage;
