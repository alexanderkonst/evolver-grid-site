import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { type DomainId } from "@/modules/quality-of-life-map/qolConfig";
import GameShellV2 from "@/components/game/GameShellV2";

type GrowthPath = {
  id: "uniqueness" | "mind" | "spirit" | "emotions" | "body";
  label: string;
  emoji: string;
  description: string;
};

type GrowthRecipe = {
  domainLabel: string;
  paths: GrowthPath[];
};

const DOMAIN_RECIPES: Record<DomainId, GrowthRecipe> = {
  wealth: {
    domainLabel: "💰 Wealth",
    paths: [
      { id: "uniqueness", label: "Uniqueness", emoji: "✨", description: "Monetize your genius and signature value." },
      { id: "mind", label: "Mind", emoji: "🧠", description: "Rewire money beliefs and sharpen business thinking." },
      { id: "spirit", label: "Spirit", emoji: "🙏", description: "Anchor wealth in service and aligned contribution." },
      { id: "emotions", label: "Emotions", emoji: "💜", description: "Clear fear or scarcity patterns around money." },
      { id: "body", label: "Body", emoji: "💪", description: "Build the energy to execute and sustain momentum." },
    ],
  },
  health: {
    domainLabel: "💪 Health",
    paths: [
      { id: "body", label: "Body", emoji: "💪", description: "Strengthen the physical foundation first." },
      { id: "spirit", label: "Spirit", emoji: "🙏", description: "Reconnect to meaning, purpose, and self-care." },
      { id: "emotions", label: "Emotions", emoji: "💜", description: "Release stress cycles and emotional eating." },
      { id: "mind", label: "Mind", emoji: "🧠", description: "Shift health beliefs and mental habits." },
      { id: "uniqueness", label: "Uniqueness", emoji: "✨", description: "Express health through your authentic rhythm." },
    ],
  },
  happiness: {
    domainLabel: "😊 Happiness",
    paths: [
      { id: "emotions", label: "Emotions", emoji: "💜", description: "Build resilience and emotional regulation." },
      { id: "spirit", label: "Spirit", emoji: "🙏", description: "Reconnect to joy, meaning, and inner peace." },
      { id: "mind", label: "Mind", emoji: "🧠", description: "Reframe thought loops and mental narratives." },
      { id: "body", label: "Body", emoji: "💪", description: "Stabilize energy through sleep, movement, and nourishment." },
      { id: "uniqueness", label: "Uniqueness", emoji: "✨", description: "Create happiness through your natural gifts." },
    ],
  },
  love: {
    domainLabel: "❤️ Love",
    paths: [
      { id: "emotions", label: "Emotions", emoji: "💜", description: "Heal patterns that block intimacy and trust." },
      { id: "spirit", label: "Spirit", emoji: "🙏", description: "Lead with compassion, forgiveness, and heart." },
      { id: "mind", label: "Mind", emoji: "🧠", description: "Learn new relationship skills and communication." },
      { id: "body", label: "Body", emoji: "💪", description: "Ground connection through presence and embodiment." },
      { id: "uniqueness", label: "Uniqueness", emoji: "✨", description: "Show up as your truest self in love." },
    ],
  },
  impact: {
    domainLabel: "🌍 Impact",
    paths: [
      { id: "uniqueness", label: "Uniqueness", emoji: "✨", description: "Lead with what only you can build." },
      { id: "spirit", label: "Spirit", emoji: "🙏", description: "Anchor impact in mission and service." },
      { id: "mind", label: "Mind", emoji: "🧠", description: "Strengthen strategy, systems, and execution." },
      { id: "emotions", label: "Emotions", emoji: "💜", description: "Build courage and emotional leadership." },
      { id: "body", label: "Body", emoji: "💪", description: "Sustain impact with strong energy." },
    ],
  },
  growth: {
    domainLabel: "🌱 Growth",
    paths: [
      { id: "spirit", label: "Spirit", emoji: "🙏", description: "Deepen self-connection and purpose." },
      { id: "mind", label: "Mind", emoji: "🧠", description: "Expand learning and self-awareness." },
      { id: "emotions", label: "Emotions", emoji: "💜", description: "Integrate shadow work and emotional clarity." },
      { id: "uniqueness", label: "Uniqueness", emoji: "✨", description: "Evolve by expressing your gifts." },
      { id: "body", label: "Body", emoji: "💪", description: "Ground growth with daily practices." },
    ],
  },
  socialTies: {
    domainLabel: "🤝 Social",
    paths: [
      { id: "emotions", label: "Emotions", emoji: "💜", description: "Build trust, openness, and empathy." },
      { id: "spirit", label: "Spirit", emoji: "🙏", description: "Show up in community with purpose." },
      { id: "mind", label: "Mind", emoji: "🧠", description: "Learn collaboration and social skills." },
      { id: "body", label: "Body", emoji: "💪", description: "Bring presence and consistency to relationships." },
      { id: "uniqueness", label: "Uniqueness", emoji: "✨", description: "Contribute your distinct gifts to the group." },
    ],
  },
  home: {
    domainLabel: "🏠 Home",
    paths: [
      { id: "body", label: "Body", emoji: "💪", description: "Create a stable physical foundation and routines." },
      { id: "emotions", label: "Emotions", emoji: "💜", description: "Make home a place of calm and safety." },
      { id: "mind", label: "Mind", emoji: "🧠", description: "Design systems that keep things orderly." },
      { id: "spirit", label: "Spirit", emoji: "🙏", description: "Infuse your space with meaning and beauty." },
      { id: "uniqueness", label: "Uniqueness", emoji: "✨", description: "Shape home to reflect who you are." },
    ],
  },
};

const isDomainId = (value: string | null): value is DomainId =>
  value !== null && Object.prototype.hasOwnProperty.call(DOMAIN_RECIPES, value);

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

  const primaryRecipe = topThreeDomains[0] ? DOMAIN_RECIPES[topThreeDomains[0]] : null;

  if (loading) {
    return (
      <GameShellV2>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-[#a4a3d0]">Loading growth recipe...</div>
        </div>
      </GameShellV2>
    );
  }

  return (
    <GameShellV2>
      <div className="max-w-2xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <BookOpen className="w-10 h-10 mx-auto text-[#8460ea] mb-2" />
          <h1 className="text-2xl font-bold text-[#2c3150] mb-2">Your Growth Recipe</h1>
          <p className="text-sm text-[#a4a3d0]">
            Optimal development sequence for <span className="text-[#8460ea] font-medium">{primaryRecipe?.domainLabel}</span>
          </p>
        </div>

        {/* Path Cards */}
        <div className="space-y-3">
          {primaryRecipe?.paths.map((path, index) => {
            const isTop = index < 3;
            return (
              <div
                key={path.id}
                className={`rounded-xl border p-4 transition-all ${isTop
                    ? "border-[#8460ea]/50 bg-gradient-to-r from-[#8460ea]/10 to-[#a4a3d0]/10"
                    : "border-[#a4a3d0]/20 bg-white/50"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${isTop ? "bg-[#8460ea] text-white" : "bg-[#a4a3d0]/20 text-[#a4a3d0]"
                    }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span>{path.emoji}</span>
                      <h3 className={`font-medium ${isTop ? "text-[#8460ea]" : "text-[#2c3150]"}`}>{path.label}</h3>
                      {isTop && <span className="text-xs bg-[#8460ea]/20 text-[#8460ea] px-2 py-0.5 rounded-full">Focus</span>}
                    </div>
                    <p className="text-sm text-[#a4a3d0] mt-1">{path.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action */}
        <Button
          variant="wabi-primary"
          className="w-full"
          onClick={() => navigate(returnTo === "/start" ? "/game" : returnTo || "/game")}
        >
          Start Improving <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </GameShellV2>
  );
};

export default QualityOfLifeGrowthRecipe;
