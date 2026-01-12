import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import BoldText from "@/components/BoldText";
import { Button } from "@/components/ui/button";
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
  const [selectedDomain, setSelectedDomain] = useState<DomainId | null>(
    isDomainId(domainParam) ? domainParam : null
  );
  const [loading, setLoading] = useState(!selectedDomain);

  useEffect(() => {
    if (selectedDomain) return;
    const loadProfile = async () => {
      setLoading(true);
      const profileId = await getOrCreateGameProfileId();
      const { data } = await supabase
        .from("game_profiles")
        .select("qol_priorities")
        .eq("id", profileId)
        .maybeSingle();
      const priorities = Array.isArray(data?.qol_priorities) ? data.qol_priorities : [];
      const firstPriority = priorities.find((entry: unknown) => typeof entry === 'string' && isDomainId(entry));
      setSelectedDomain(firstPriority || "growth");
      setLoading(false);
    };
    loadProfile();
  }, [selectedDomain]);

  const recipe = useMemo(() => {
    if (!selectedDomain) return null;
    return DOMAIN_RECIPES[selectedDomain];
  }, [selectedDomain]);

  const handleContinue = () => {
    const destination = returnTo === "/start" ? "/game" : returnTo || "/game";
    navigate(destination);
  };

  return (
    <div className="min-h-dvh">
      <Navigation />

      <div className="pt-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "hsl(220, 30%, 12%)" }}>
        <div className="container mx-auto max-w-4xl">
          <Link to="/quality-of-life-map/priorities" className="inline-flex items-center text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <BoldText>BACK</BoldText>
          </Link>
        </div>
      </div>

      <section className="py-20 px-6 min-h-dvh" style={{ backgroundColor: "hsl(220, 30%, 12%)" }}>
        <div className="container mx-auto max-w-4xl">
          {loading && (
            <div className="text-center text-white/70">Loading growth recipe...</div>
          )}

          {!loading && recipe && (
            <>
              <div className="text-center mb-10">
                <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-3 text-white">
                  <BoldText>GROWTH RECIPE</BoldText>
                </h1>
                <p className="text-white/70">
                  To grow in <span className="text-white font-semibold">{recipe.domainLabel}</span>, develop these five paths in this order.
                </p>
              </div>

              <div className="space-y-4">
                {recipe.paths.map((path, index) => (
                  <div
                    key={path.id}
                    className={`rounded-2xl border p-5 transition-colors ${
                      index === 0
                        ? "border-amber-300 bg-amber-500/10"
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-slate-900 font-bold">
                        {index + 1}
                      </div>
                      <h3 className="text-lg font-semibold text-white">{path.label}</h3>
                    </div>
                    <p className="text-sm text-white/70">{path.description}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-center mt-12">
                <Button
                  onClick={handleContinue}
                  className="text-lg px-8"
                  style={{
                    backgroundColor: "hsl(var(--destiny-gold))",
                    color: "hsl(var(--destiny-dark))",
                  }}
                >
                  Continue to Daily Loop
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
