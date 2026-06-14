// =============================================================================
// DEAD CODE — Day 64 (Sasha 2026-05-07)
// =============================================================================
// This component is no longer routed. The /quality-of-life-map/growth-recipe
// route was retired in the Day 64 Results revamp (see
// docs/specs/quality-of-life-map/results_revamp_spec.md). The file is
// preserved in place — quick to revive if the call is reversed. Nothing
// in the running app imports this component.
// =============================================================================

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { TOP_PRIORITIES_COUNT, type DomainId } from "@/modules/quality-of-life-map/qolConfig";
// Day 63 (Sasha 2026-05-06): GameShellV2 import removed — shell now
// owned by QolLayout, not per-page.

type GrowthPath = {
  id: "uniqueness" | "mind" | "spirit" | "emotions" | "body";
  labelKey: string;
  emoji: string;
  descriptionKey: string;
};

type GrowthRecipe = {
  domainLabelKey: string;
  paths: GrowthPath[];
};

const DOMAIN_RECIPES: Record<DomainId, GrowthRecipe> = {
  wealth: {
    domainLabelKey: "qolRecipe.domain.wealth",
    paths: [
      { id: "uniqueness", labelKey: "qolRecipe.path.uniqueness", emoji: "✨", descriptionKey: "qolRecipe.wealth.uniqueness" },
      { id: "mind", labelKey: "qolRecipe.path.mind", emoji: "🧠", descriptionKey: "qolRecipe.wealth.mind" },
      { id: "spirit", labelKey: "qolRecipe.path.spirit", emoji: "🙏", descriptionKey: "qolRecipe.wealth.spirit" },
      { id: "emotions", labelKey: "qolRecipe.path.emotions", emoji: "💜", descriptionKey: "qolRecipe.wealth.emotions" },
      { id: "body", labelKey: "qolRecipe.path.body", emoji: "💪", descriptionKey: "qolRecipe.wealth.body" },
    ],
  },
  health: {
    domainLabelKey: "qolRecipe.domain.health",
    paths: [
      { id: "body", labelKey: "qolRecipe.path.body", emoji: "💪", descriptionKey: "qolRecipe.health.body" },
      { id: "spirit", labelKey: "qolRecipe.path.spirit", emoji: "🙏", descriptionKey: "qolRecipe.health.spirit" },
      { id: "emotions", labelKey: "qolRecipe.path.emotions", emoji: "💜", descriptionKey: "qolRecipe.health.emotions" },
      { id: "mind", labelKey: "qolRecipe.path.mind", emoji: "🧠", descriptionKey: "qolRecipe.health.mind" },
      { id: "uniqueness", labelKey: "qolRecipe.path.uniqueness", emoji: "✨", descriptionKey: "qolRecipe.health.uniqueness" },
    ],
  },
  happiness: {
    domainLabelKey: "qolRecipe.domain.happiness",
    paths: [
      { id: "emotions", labelKey: "qolRecipe.path.emotions", emoji: "💜", descriptionKey: "qolRecipe.happiness.emotions" },
      { id: "spirit", labelKey: "qolRecipe.path.spirit", emoji: "🙏", descriptionKey: "qolRecipe.happiness.spirit" },
      { id: "mind", labelKey: "qolRecipe.path.mind", emoji: "🧠", descriptionKey: "qolRecipe.happiness.mind" },
      { id: "body", labelKey: "qolRecipe.path.body", emoji: "💪", descriptionKey: "qolRecipe.happiness.body" },
      { id: "uniqueness", labelKey: "qolRecipe.path.uniqueness", emoji: "✨", descriptionKey: "qolRecipe.happiness.uniqueness" },
    ],
  },
  love: {
    domainLabelKey: "qolRecipe.domain.love",
    paths: [
      { id: "emotions", labelKey: "qolRecipe.path.emotions", emoji: "💜", descriptionKey: "qolRecipe.love.emotions" },
      { id: "spirit", labelKey: "qolRecipe.path.spirit", emoji: "🙏", descriptionKey: "qolRecipe.love.spirit" },
      { id: "mind", labelKey: "qolRecipe.path.mind", emoji: "🧠", descriptionKey: "qolRecipe.love.mind" },
      { id: "body", labelKey: "qolRecipe.path.body", emoji: "💪", descriptionKey: "qolRecipe.love.body" },
      { id: "uniqueness", labelKey: "qolRecipe.path.uniqueness", emoji: "✨", descriptionKey: "qolRecipe.love.uniqueness" },
    ],
  },
  impact: {
    domainLabelKey: "qolRecipe.domain.impact",
    paths: [
      { id: "uniqueness", labelKey: "qolRecipe.path.uniqueness", emoji: "✨", descriptionKey: "qolRecipe.impact.uniqueness" },
      { id: "spirit", labelKey: "qolRecipe.path.spirit", emoji: "🙏", descriptionKey: "qolRecipe.impact.spirit" },
      { id: "mind", labelKey: "qolRecipe.path.mind", emoji: "🧠", descriptionKey: "qolRecipe.impact.mind" },
      { id: "emotions", labelKey: "qolRecipe.path.emotions", emoji: "💜", descriptionKey: "qolRecipe.impact.emotions" },
      { id: "body", labelKey: "qolRecipe.path.body", emoji: "💪", descriptionKey: "qolRecipe.impact.body" },
    ],
  },
  growth: {
    domainLabelKey: "qolRecipe.domain.growth",
    paths: [
      { id: "spirit", labelKey: "qolRecipe.path.spirit", emoji: "🙏", descriptionKey: "qolRecipe.growth.spirit" },
      { id: "mind", labelKey: "qolRecipe.path.mind", emoji: "🧠", descriptionKey: "qolRecipe.growth.mind" },
      { id: "emotions", labelKey: "qolRecipe.path.emotions", emoji: "💜", descriptionKey: "qolRecipe.growth.emotions" },
      { id: "uniqueness", labelKey: "qolRecipe.path.uniqueness", emoji: "✨", descriptionKey: "qolRecipe.growth.uniqueness" },
      { id: "body", labelKey: "qolRecipe.path.body", emoji: "💪", descriptionKey: "qolRecipe.growth.body" },
    ],
  },
  socialTies: {
    domainLabelKey: "qolRecipe.domain.socialTies",
    paths: [
      { id: "emotions", labelKey: "qolRecipe.path.emotions", emoji: "💜", descriptionKey: "qolRecipe.socialTies.emotions" },
      { id: "spirit", labelKey: "qolRecipe.path.spirit", emoji: "🙏", descriptionKey: "qolRecipe.socialTies.spirit" },
      { id: "mind", labelKey: "qolRecipe.path.mind", emoji: "🧠", descriptionKey: "qolRecipe.socialTies.mind" },
      { id: "body", labelKey: "qolRecipe.path.body", emoji: "💪", descriptionKey: "qolRecipe.socialTies.body" },
      { id: "uniqueness", labelKey: "qolRecipe.path.uniqueness", emoji: "✨", descriptionKey: "qolRecipe.socialTies.uniqueness" },
    ],
  },
  home: {
    domainLabelKey: "qolRecipe.domain.home",
    paths: [
      { id: "body", labelKey: "qolRecipe.path.body", emoji: "💪", descriptionKey: "qolRecipe.home.body" },
      { id: "emotions", labelKey: "qolRecipe.path.emotions", emoji: "💜", descriptionKey: "qolRecipe.home.emotions" },
      { id: "mind", labelKey: "qolRecipe.path.mind", emoji: "🧠", descriptionKey: "qolRecipe.home.mind" },
      { id: "spirit", labelKey: "qolRecipe.path.spirit", emoji: "🙏", descriptionKey: "qolRecipe.home.spirit" },
      { id: "uniqueness", labelKey: "qolRecipe.path.uniqueness", emoji: "✨", descriptionKey: "qolRecipe.home.uniqueness" },
    ],
  },
};

const isDomainId = (value: string | null): value is DomainId =>
  value !== null && Object.prototype.hasOwnProperty.call(DOMAIN_RECIPES, value);

const QualityOfLifeGrowthRecipe = () => {
  const { t } = useTranslation();
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
        .slice(0, TOP_PRIORITIES_COUNT) as DomainId[];
      setTopThreeDomains(validPriorities.length > 0 ? validPriorities : ["growth"]);
      setLoading(false);
    };
    loadProfile();
  }, [topThreeDomains.length]);

  const primaryRecipe = topThreeDomains[0] ? DOMAIN_RECIPES[topThreeDomains[0]] : null;

  // Day 63 (Sasha 2026-05-06): shell removed — QolLayout now wraps in
  // GameShellV2 once for all four QoL pages.
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-[var(--wabi-text-muted)]">{t('qolRecipe.loading')}</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Header
            Day 63 (Sasha 2026-05-06): Cormorant editorial H1 + Source
            Serif 4 italic body subhead — matches landing's typographic
            register. */}
        <div className="text-center">
          <BookOpen className="w-10 h-10 mx-auto text-[var(--depth-violet)] mb-2" />
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 700,
              fontSize: "clamp(26px, 3.2vw, 32px)",
              letterSpacing: "-0.005em",
              lineHeight: 1.1,
              color: "var(--skin-text-primary, var(--wabi-text-primary, #0b2a5a))",
              textShadow: "var(--skin-text-halo-deep, 0 0 22px rgba(255,255,255,0.7), 0 1px 2px rgba(255,255,255,0.9), 0 0 1px rgba(11,42,90,0.45), 0 1px 0 rgba(11,42,90,0.25))",
            }}
            className="mb-2"
          >
            {t('qolRecipe.title')}
          </h1>
          <p
            style={{
              fontFamily: "'Source Serif 4', 'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontSize: "14px",
              lineHeight: 1.55,
            }}
            className="text-[var(--wabi-text-muted)]"
          >
            {t('qolRecipe.subhead')} <span className="text-[var(--depth-violet)] font-medium not-italic">{primaryRecipe ? t(primaryRecipe.domainLabelKey) : ""}</span>
          </p>
        </div>

        {/* Path Cards */}
        <div className="space-y-3">
          {/* Day 63 (Sasha 2026-05-06): path labels in Cormorant; FOCUS
              tag in Cormorant tracked-uppercase + gold accent; description
              in Source Serif 4 italic. Numbered badge stays sans for
              data-feel. */}
          {primaryRecipe?.paths.map((path, index) => {
            const isTop = index < TOP_PRIORITIES_COUNT;
            return (
              <div
                key={path.id}
                className={`rounded-xl border p-4 transition-all ${isTop
                    ? "border-[var(--depth-violet)]/50 bg-gradient-to-r from-[var(--depth-violet)]/10 to-[var(--wabi-text-muted)]/10"
                    : "border-[var(--wabi-text-muted)]/20 bg-white/50"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${isTop ? "bg-[var(--depth-violet)] text-white" : "bg-[var(--wabi-text-muted)]/20 text-[var(--wabi-text-muted)]"}`}
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span>{path.emoji}</span>
                      <h3
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontWeight: 600,
                          fontSize: "17px",
                          letterSpacing: "-0.005em",
                        }}
                        className={isTop ? "text-[var(--depth-violet)]" : "text-[var(--wabi-text-primary)]"}
                      >
                        {t(path.labelKey)}
                      </h3>
                      {isTop && (
                        <span
                          style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontWeight: 600,
                            fontSize: "10px",
                            letterSpacing: "0.20em",
                            textTransform: "uppercase",
                            color: "rgba(184, 134, 11, 1)",
                          }}
                          className="bg-[var(--depth-violet)]/15 px-2 py-0.5 rounded-full"
                        >
                          {t('qolRecipe.focus')}
                        </span>
                      )}
                    </div>
                    <p
                      style={{
                        fontFamily: "'Source Serif 4', serif",
                        fontStyle: "italic",
                        fontSize: "14px",
                        lineHeight: 1.5,
                      }}
                      className="text-[var(--wabi-text-muted)] mt-1"
                    >
                      {t(path.descriptionKey)}
                    </p>
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
          // Day 63 (Sasha 2026-05-06): /game retired (App.tsx:431
          // redirects to /game/journey). Mirror the same fix applied
          // to QualityOfLifePriorities's Skip button.
          onClick={() => navigate(returnTo === "/start" ? "/game/journey" : returnTo || "/game/journey")}
        >
          {t('qolRecipe.startImproving')} <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
  );
};

export default QualityOfLifeGrowthRecipe;
