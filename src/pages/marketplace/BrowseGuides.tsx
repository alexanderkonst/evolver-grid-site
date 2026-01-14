import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ExternalLink, Loader2, Sparkles } from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface PublicOffer {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  genius_statement: string | null;
  unique_offer_headline: string | null;
}

const BrowseGuides = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<PublicOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOffers = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url, genius_statement, unique_offer_headline")
          .not("unique_offer_headline", "is", null)
          .eq("visibility_genius", true);

        if (fetchError) throw fetchError;
        setOffers((data || []) as PublicOffer[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load guides.");
      } finally {
        setLoading(false);
      }
    };

    loadOffers();
  }, []);

  const sortedOffers = useMemo(
    () => offers.slice().sort((a, b) => (a.display_name || "").localeCompare(b.display_name || "")),
    [offers]
  );

  return (
    <GameShellV2>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-6 h-6 text-slate-700" />
            <h1 className="text-2xl font-bold text-slate-900">Browse Guides</h1>
          </div>
          <p className="text-slate-600">Discover public genius offers from the community.</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && sortedOffers.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <Sparkles className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-slate-900 mb-2">No public offers yet</h2>
            <p className="text-slate-600">Check back soon for new guides.</p>
          </div>
        )}

        {!loading && !error && sortedOffers.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedOffers.map((offer) => (
              <div
                key={offer.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center">
                    {offer.avatar_url ? (
                      <img
                        src={offer.avatar_url}
                        alt={offer.display_name || "Guide"}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Sparkles className="w-5 h-5 text-amber-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">
                      {offer.display_name || "Community Guide"}
                    </p>
                    {offer.unique_offer_headline && (
                      <p className="text-xs text-slate-500 line-clamp-1">{offer.unique_offer_headline}</p>
                    )}
                  </div>
                </div>

                {offer.genius_statement && (
                  <p className="text-sm text-slate-600 mb-4 line-clamp-3">"{offer.genius_statement}"</p>
                )}

                <Button
                  variant="outline"
                  className="mt-auto"
                  onClick={() => navigate(`/profile/${offer.id}`)}
                >
                  View Profile
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </GameShellV2>
  );
};

export default BrowseGuides;
