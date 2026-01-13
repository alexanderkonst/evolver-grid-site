import { useParams } from "react-router-dom";
import { Activity, Brain, Heart, Sparkles, Zap } from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";

const PATH_INFO = {
  body: {
    label: "Body",
    icon: Activity,
    description: "Physical vitality, energy, and health",
  },
  emotions: {
    label: "Emotions",
    icon: Heart,
    description: "Emotional regulation and shadow work",
  },
  mind: {
    label: "Mind",
    icon: Brain,
    description: "Worldview, beliefs, and mental clarity",
  },
  genius: {
    label: "Genius",
    icon: Zap,
    description: "Authenticity and self-expression",
  },
  spirit: {
    label: "Spirit",
    icon: Sparkles,
    description: "Awareness, presence, and sensitivity",
  },
};

const PathSection = () => {
  const { pathId } = useParams<{ pathId: string }>();
  const pathInfo = PATH_INFO[pathId as keyof typeof PATH_INFO];

  if (!pathInfo) {
    return (
      <GameShellV2>
        <div className="p-6 lg:p-8 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-900">Path not found</h1>
          <p className="text-slate-600 mt-2">This growth path does not exist.</p>
        </div>
      </GameShellV2>
    );
  }

  const Icon = pathInfo.icon;

  return (
    <GameShellV2>
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Icon className="w-6 h-6 text-slate-700" />
            <h1 className="text-2xl font-bold text-slate-900">{pathInfo.label}</h1>
          </div>
          <p className="text-slate-600">{pathInfo.description}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-slate-600">
            Coming soon: practices and content for the {pathInfo.label} path.
          </p>
        </div>
      </div>
    </GameShellV2>
  );
};

export default PathSection;
