import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import BoldText from "@/components/BoldText";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/BackButton";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { type DomainId } from "@/modules/quality-of-life-map/qolConfig";

type GrowthPath = {
  id: "uniqueness" | "mind" | "spirit" | "emotions" | "body";
  label: string;
  description: string;
};

type GrowthRecipe = {
  domainLabel: string;
  paths: GrowthPath[];
};

const DOMAIN_RECIPES: Record<DomainId, GrowthRecipe> = {
  wealth: {
    domainLabel: "Wealth",
    paths: [
      { id: "uniqueness", label: "Uniqueness", description: "Monetize your genius and signature value." },
      { id: "mind", label: "Mind", description: "Rewire money beliefs and sharpen business thinking." },
      { id: "spirit", label: "Spirit", description: "Anchor wealth in service and aligned contribution." },
      { id: "emotions", label: "Emotions", description: "Clear fear or scarcity patterns around money." },
      { id: "body", label: "Body", description: "Build the energy to execute and sustain momentum." },
    ],
  },
  health: {
    domainLabel: "Health",
    paths: [
      { id: "body", label: "Body", description: "Strengthen the physical foundation first." },
      { id: "spirit", label: "Spirit", description: "Reconnect to meaning, purpose, and self-care." },
      { id: "emotions", label: "Emotions", description: "Release stress cycles and emotional eating." },
      { id: "mind", label: "Mind", description: "Shift health beliefs and mental habits." },
      { id: "uniqueness", label: "Uniqueness", description: "Express health through your authentic rhythm." },
    ],
  },
  happiness: {
    domainLabel: "Happiness",
    paths: [
      { id: "emotions", label: "Emotions", description: "Build resilience and emotional regulation." },
      { id: "spirit", label: "Spirit", description: "Reconnect to joy, meaning, and inner peace." },
      { id: "mind", label: "Mind", description: "Reframe thought loops and mental narratives." },
      { id: "body", label: "Body", description: "Stabilize energy through sleep, movement, and nourishment." },
      { id: "uniqueness", label: "Uniqueness", description: "Create happiness through your natural gifts." },
    ],
  },
  love: {
    domainLabel: "Love & Relationships",
    paths: [
      { id: "emotions", label: "Emotions", description: "Heal patterns that block intimacy and trust." },
      { id: "spirit", label: "Spirit", description: "Lead with compassion, forgiveness, and heart." },
      { id: "mind", label: "Mind", description: "Learn new relationship skills and communication." },
      { id: "body", label: "Body", description: "Ground connection through presence and embodiment." },
      { id: "uniqueness", label: "Uniqueness", description: "Show up as your truest self in love." },
    ],
  },
  impact: {
    domainLabel: "Impact",
    paths: [
      { id: "uniqueness", label: "Uniqueness", description: "Lead with what only you can build." },
      { id: "spirit", label: "Spirit", description: "Anchor impact in mission and service." },
      { id: "mind", label: "Mind", description: "Strengthen strategy, systems, and execution." },
      { id: "emotions", label: "Emotions", description: "Build courage and emotional leadership." },
      { id: "body", label: "Body", description: "Sustain impact with strong energy." },
    ],
  },
  growth: {
    domainLabel: "Growth",
    paths: [
      { id: "spirit", label: "Spirit", description: "Deepen self-connection and purpose." },
      { id: "mind", label: "Mind", description: "Expand learning and self-awareness." },
      { id: "emotions", label: "Emotions", description: "Integrate shadow work and emotional clarity." },
      { id: "uniqueness", label: "Uniqueness", description: "Evolve by expressing your gifts." },
      { id: "body", label: "Body", description: "Ground growth with daily practices." },
    ],
  },
  socialTies: {
    domainLabel: "Social Ties",
    paths: [
      { id: "emotions", label: "Emotions", description: "Build trust, openness, and empathy." },
      { id: "spirit", label: "Spirit", description: "Show up in community with purpose." },
      { id: "mind", label: "Mind", description: "Learn collaboration and social skills." },
      { id: "body", label: "Body", description: "Bring presence and consistency to relationships." },
      { id: "uniqueness", label: "Uniqueness", description: "Contribute your distinct gifts to the group." },
    ],
  },
  home: {
    domainLabel: "Home",
    paths: [
      { id: "body", label: "Body", description: "Create a stable physical foundation and routines." },
      { id: "emotions", label: "Emotions", description: "Make home a place of calm and safety." },
      { id: "mind", label: "Mind", description: "Design systems that keep things orderly." },
      { id: "spirit", label: "Spirit", description: "Infuse your space with meaning and beauty." },
      { id: "uniqueness", label: "Uniqueness", description: "Shape home to reflect who you are." },
    ],
  },
};

const isDomainId = (value: string | null): value is DomainId => {
  if (!value) return false;
  return Object.prototype.hasOwnProperty.call(DOMAIN_RECIPES, value);
};

const QualityOfLifeGrowthRecipe = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("return");
  const domainParam = searchParams.get("domain");
  const [topThreeDomains, setTopThreeDomains] = useState<DomainId[]>(
    isDomainId(domainParam) ? [domainParam] : []
  );
  const [loading, setLoading] = useState(topThreeDomains.length === 0);

  useEffect(() => {
    if (topThreeDomains.length > 0) return;
    const loadProfile = async () => {
      setLoading(true);
      const profileId = await getOrCreateGameProfileId();
      const { data } = await supabase
        .from("game_profiles")
        .select("qol_priorities")
        .eq("id", profileId)
        .maybeSingle();
      const priorities = Array.isArray(data?.qol_priorities) ? data.qol_priorities : [];
      const validPriorities = priorities
        .filter((entry: unknown) => typeof entry === 'string' && isDomainId(entry))
        .slice(0, 3) as DomainId[];
      setTopThreeDomains(validPriorities.length > 0 ? validPriorities : ["growth"]);
      setLoading(false);
    };
    loadProfile();
  }, [topThreeDomains.length]);

  // Get top 3 domain labels for header
  const topThreeLabels = topThreeDomains
    .map(id => DOMAIN_RECIPES[id]?.domainLabel)
    .filter(Boolean);

  // Get the primary recipe (first priority) for the path order
  const primaryRecipe = topThreeDomains[0] ? DOMAIN_RECIPES[topThreeDomains[0]] : null;

  return (
    <div className="min-h-dvh">
      <Navigation />

      <div className="pt-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "hsl(220, 30%, 12%)" }}>
        <div className="container mx-auto max-w-4xl">
          <BackButton
            to="/quality-of-life-map/priorities"
            label={<BoldText>BACK</BoldText>}
            className="text-white/60 hover:text-white transition-colors font-semibold"
          />
        </div>
      </div>

      <section className="py-20 px-6 min-h-dvh" style={{ backgroundColor: "hsl(220, 30%, 12%)" }}>
        <div className="container mx-auto max-w-4xl">
          {loading && (
            <div className="text-center text-white/70">Loading growth recipe...</div>
          )}

          {!loading && primaryRecipe && (
            <>
              <div className="text-center mb-10">
                <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-3 text-white">
                  <BoldText>GROWTH RECIPE</BoldText>
                </h1>
                <p className="text-white/70 mb-4">
                  Your top {topThreeLabels.length} priorities: <span className="text-white font-semibold">{topThreeLabels.join(", ")}</span>
                </p>
                <p className="text-white/50 text-sm">
                  Here's the optimal development sequence for your primary focus: <span className="text-amber-400 font-semibold">{primaryRecipe.domainLabel}</span>
                </p>
              </div>

              <div className="space-y-4">
                {primaryRecipe.paths.map((path, index) => {
                  // Create combined description based on top 3 foci
                  const relatedDescriptions = topThreeDomains
                    .slice(1) // skip primary
                    .map(domainId => {
                      const recipe = DOMAIN_RECIPES[domainId];
                      const matchingPath = recipe?.paths.find(p => p.id === path.id);
                      return matchingPath?.description;
                    })
                    .filter(Boolean);

                  const isTopThree = index < 3;

                  return (
                    <div
                      key={path.id}
                      className={`rounded-2xl border p-5 transition-colors ${isTopThree
                        ? "border-amber-300 bg-amber-500/10"
                        : "border-white/10 bg-white/5"
                        }`}
                    >
                      <div className="flex items-center gap-4 mb-2">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${isTopThree ? "bg-amber-500 text-slate-900" : "bg-white/20 text-white/70"
                          }`}>
                          {index + 1}
                        </div>
                        <h3 className="text-lg font-semibold text-white">{path.label}</h3>
                        {isTopThree && <span className="text-xs bg-amber-500/30 text-amber-200 px-2 py-0.5 rounded-full">Primary focus</span>}
                      </div>
                      <p className="text-sm text-white/70 mb-2">{path.description}</p>
                      {relatedDescriptions.length > 0 && isTopThree && (
                        <p className="text-xs text-white/50 italic">
                          Also helps with: {relatedDescriptions.slice(0, 2).join(" • ")}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center mt-12">
                <Button
                  onClick={() => {
                    const destination = returnTo === "/start" ? "/game" : returnTo || "/game";
                    navigate(destination);
                  }}
                  className="text-lg px-8"
                  style={{
                    backgroundColor: "hsl(var(--destiny-gold))",
                    color: "hsl(var(--destiny-dark))",
                  }}
                >
                  Continue Improving My Quality of Life
                </Button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default QualityOfLifeGrowthRecipe;
