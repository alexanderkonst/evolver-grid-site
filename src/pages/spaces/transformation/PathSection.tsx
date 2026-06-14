import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Activity, Brain, Heart, Sparkles, Zap } from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";

const PATH_INFO = {
  body: {
    labelKey: "pathSection.bodyLabel",
    icon: Activity,
    descriptionKey: "pathSection.bodyDescription",
  },
  emotions: {
    labelKey: "pathSection.emotionsLabel",
    icon: Heart,
    descriptionKey: "pathSection.emotionsDescription",
  },
  mind: {
    labelKey: "pathSection.mindLabel",
    icon: Brain,
    descriptionKey: "pathSection.mindDescription",
  },
  genius: {
    labelKey: "pathSection.geniusLabel",
    icon: Zap,
    descriptionKey: "pathSection.geniusDescription",
  },
  spirit: {
    labelKey: "pathSection.spiritLabel",
    icon: Sparkles,
    descriptionKey: "pathSection.spiritDescription",
  },
};

const PathSection = () => {
  const { t } = useTranslation();
  const { pathId } = useParams<{ pathId: string }>();
  const pathInfo = PATH_INFO[pathId as keyof typeof PATH_INFO];

  if (!pathInfo) {
    return (
      <GameShellV2>
        <div className="p-6 lg:p-8 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-foreground">{t('pathSection.notFoundTitle')}</h1>
          <p className="text-muted-foreground mt-2">{t('pathSection.notFoundBody')}</p>
        </div>
      </GameShellV2>
    );
  }

  const Icon = pathInfo.icon;
  const label = t(pathInfo.labelKey);

  return (
    <GameShellV2>
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Icon className="w-6 h-6 text-foreground" />
            <h1 className="text-2xl font-bold text-foreground">{label}</h1>
          </div>
          <p className="text-muted-foreground">{t(pathInfo.descriptionKey)}</p>
        </div>

        <div className="rounded-xl border border-border bg-white/85 backdrop-blur-sm p-6 shadow-[0_4px_16px_rgba(44,49,80,0.06)]">
          <p className="text-muted-foreground">
            {t('pathSection.comingSoon', { label })}
          </p>
        </div>
      </div>
    </GameShellV2>
  );
};

export default PathSection;
