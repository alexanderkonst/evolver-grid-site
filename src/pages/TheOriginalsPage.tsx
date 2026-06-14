import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Users, ExternalLink, Sparkles, ArrowRight } from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";

interface Founder {
  name: string;
  archetypeKey: string;
  taglineKey: string;
  status: "active" | "in-progress";
}

const FOUNDERS: Founder[] = [
  {
    name: "Alexander",
    archetypeKey: "theOriginals.founders.alexander.archetype",
    taglineKey: "theOriginals.founders.alexander.tagline",
    status: "active",
  },
  {
    name: "Oyi",
    archetypeKey: "theOriginals.founders.oyi.archetype",
    taglineKey: "theOriginals.founders.oyi.tagline",
    status: "active",
  },
  {
    name: "Sergey",
    archetypeKey: "theOriginals.founders.sergey.archetype",
    taglineKey: "theOriginals.founders.sergey.tagline",
    status: "in-progress",
  },
];

const TheOriginalsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <GameShellV2>
      <div className="max-w-2xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Hero */}
        <div className="text-center py-10 bg-gradient-to-br from-[#c8b7d8] via-[#d4d1e8] to-[#e7e9f5] rounded-2xl px-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/60 mb-4">
            <Users className="w-7 h-7 text-[#8460ea]" />
          </div>
          <h1 className="text-3xl font-display font-bold text-[#2c3150] mb-3">
            {t('theOriginals.hero.title')}
          </h1>
          <p className="text-[#2c3150]/70 max-w-md mx-auto">
            {t('theOriginals.hero.subtitle')}
          </p>
        </div>

        {/* Founder Cards */}
        {/* Day 91 (Sasha 2026-06-09): card fills tokenized for Aurum — lapis fallback = exact prior literal. */}
        <div className="space-y-3">
          {FOUNDERS.map((founder) => (
            <div
              key={founder.name}
              className="p-5 bg-[var(--skin-card-fill,rgba(255,255,255,0.6))] rounded-xl border border-[#a4a3d0]/20 hover:border-[#8460ea]/30 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-[#2c3150] text-lg">
                      {founder.name}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        founder.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {founder.status === "active"
                        ? t('theOriginals.status.active')
                        : t('theOriginals.status.building')}
                    </span>
                  </div>
                  <p className="text-xs text-[#8460ea] uppercase tracking-wide mb-1">
                    {t(founder.archetypeKey)}
                  </p>
                  <p className="text-[#2c3150]/60 text-sm">{t(founder.taglineKey)}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8460ea]/20 to-[#c8b7d8]/30 flex items-center justify-center flex-shrink-0 ml-4">
                  <span className="text-lg font-bold text-[#8460ea]">
                    {founder.name[0]}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* What Is This */}
        <div className="p-5 bg-[var(--skin-card-fill,rgba(255,255,255,0.6))] rounded-xl border border-[#a4a3d0]/20">
          <h2 className="font-semibold text-[#2c3150] mb-2">
            {t('theOriginals.about.heading')}
          </h2>
          <p className="text-sm text-[#2c3150]/70 leading-relaxed mb-3">
            {t('theOriginals.about.body1')}
          </p>
          <p className="text-sm text-[#2c3150]/70 leading-relaxed">
            {t('theOriginals.about.body2')}
          </p>
        </div>

        {/* Assembly Progress */}
        <div className="p-5 bg-gradient-to-r from-[#8460ea]/5 to-[#c8b7d8]/10 rounded-xl border border-[#8460ea]/15">
          <p className="text-xs text-[#8460ea] uppercase tracking-wide font-medium mb-3">
            {t('theOriginals.journey.label')}
          </p>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { step: 0, labelKey: "theOriginals.journey.steps.0", done: true },
              { step: 1, labelKey: "theOriginals.journey.steps.1", done: true },
              { step: 2, labelKey: "theOriginals.journey.steps.2", current: true },
              { step: 3, labelKey: "theOriginals.journey.steps.3" },
              { step: 4, labelKey: "theOriginals.journey.steps.4", done: true },
              { step: 5, labelKey: "theOriginals.journey.steps.5", current: true },
              { step: 6, labelKey: "theOriginals.journey.steps.6" },
              { step: 7, labelKey: "theOriginals.journey.steps.7" },
              { step: 8, labelKey: "theOriginals.journey.steps.8" },
              { step: 9, labelKey: "theOriginals.journey.steps.9" },
              { step: 10, labelKey: "theOriginals.journey.steps.10" },
              { step: 11, labelKey: "theOriginals.journey.steps.11" },
              { step: 12, labelKey: "theOriginals.journey.steps.12" },
            ].map((s) => (
              <div
                key={s.step}
                className={`flex items-center justify-center w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                  s.current
                    ? "bg-[#8460ea] text-white shadow-md shadow-[#8460ea]/30"
                    : s.done
                    ? "bg-[#8460ea]/20 text-[#8460ea]"
                    : "bg-[#a4a3d0]/10 text-[#a4a3d0]"
                }`}
                title={t('theOriginals.journey.stepTitle', {
                  step: s.step,
                  label: t(s.labelKey),
                })}
              >
                {s.done ? "✓" : s.step}
              </div>
            ))}
          </div>
          <p className="text-xs text-[#2c3150]/50 mt-2">
            {t('theOriginals.journey.statusLine')}
          </p>
        </div>

        {/* Join CTA */}
        <div className="text-center py-4">
          <a
            href="https://t.me/+example"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-lg"
            style={{ backgroundColor: "hsl(210, 70%, 15%)", color: "white" }}
          >
            <ExternalLink className="w-4 h-4" />
            {t('theOriginals.cta.joinTelegram')}
          </a>
        </div>

        {/* Back to ZoG CTA */}
        <div className="text-center p-4 bg-gradient-to-br from-white via-[#f5f5ff] to-[#ebe8f7] rounded-xl border border-[#a4a3d0]/20">
          <p className="text-sm text-[#a4a3d0] mb-3">
            {t('theOriginals.cta.notFoundYet')}
          </p>
          <button
            onClick={() => navigate("/zone-of-genius/entry")}
            className="inline-flex items-center gap-2 text-[#8460ea] text-sm font-medium hover:underline"
          >
            <Sparkles className="w-4 h-4" />
            {t('theOriginals.cta.discoverZoG')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </GameShellV2>
  );
};

export default TheOriginalsPage;
