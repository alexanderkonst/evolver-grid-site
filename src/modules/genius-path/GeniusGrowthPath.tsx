import { useMemo } from "react";
import { CheckCircle2, Lock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AppleseedData } from "@/modules/zone-of-genius/appleseedGenerator";
import { ExcaliburData } from "@/modules/zone-of-genius/excaliburGenerator";

interface GeniusGrowthPathProps {
  appleseed?: AppleseedData | null;
  excalibur?: ExcaliburData | null;
}

const GeniusGrowthPath = ({ appleseed, excalibur }: GeniusGrowthPathProps) => {
  const navigate = useNavigate();
  const hasAppleseed = !!appleseed;
  const hasExcalibur = !!excalibur;

  const stages = useMemo(
    () => [
      {
        id: "appleseed",
        title: "Zone of Genius",
        description: appleseed?.vibrationalKey?.name
          ? `✦ ${appleseed.vibrationalKey.name} ✦`
          : "Discover your Appleseed",
        status: hasAppleseed ? "complete" : "current",
        actionLabel: hasAppleseed ? "View" : "Start",
        onClick: () => navigate(hasAppleseed ? "/zone-of-genius/appleseed" : "/zone-of-genius/entry"),
      },
      {
        id: "excalibur",
        title: "Unique Genius Offering",
        description: hasExcalibur ? "Your Excalibur is ready" : "Craft your Excalibur",
        status: hasExcalibur ? "complete" : hasAppleseed ? "current" : "locked",
        actionLabel: hasExcalibur ? "View" : "Create",
        onClick: () => navigate(hasExcalibur ? "/zone-of-genius/excalibur" : "/zone-of-genius/entry"),
      },
      {
        id: "business",
        title: "Genius Business",
        description: "Coming soon",
        status: "locked",
      },
      {
        id: "ecosystem",
        title: "Genius Ecosystem",
        description: "Coming soon",
        status: "locked",
      },
    ],
    [appleseed, hasAppleseed, hasExcalibur, navigate]
  );

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <h3 className="text-sm font-semibold text-amber-200 mb-4">GENIUS GROWTH PATH</h3>
      <div className="space-y-4">
        {stages.map((stage, index) => {
          const isLocked = stage.status === "locked";
          const isComplete = stage.status === "complete";

          return (
            <div key={stage.id} className="relative">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {isComplete ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : isLocked ? (
                    <Lock className="h-5 w-5 text-slate-500" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-amber-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className={`text-sm font-semibold ${isLocked ? "text-slate-500" : "text-white"}`}>
                        {stage.title}
                      </p>
                      <p className={`text-xs ${isLocked ? "text-[rgba(44,49,80,0.7)]" : "text-slate-300"}`}>
                        {stage.description}
                      </p>
                    </div>
                    {stage.onClick && (
                      <Button
                        size="sm"
                        variant={isComplete ? "outline" : "secondary"}
                        onClick={stage.onClick}
                        disabled={isLocked}
                        className={isComplete ? "border-emerald-500/50 text-emerald-200" : ""}
                      >
                        {stage.actionLabel}
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {index < stages.length - 1 && (
                <div className="ml-2.5 mt-3 h-6 border-l border-slate-700" />
              )}
            </div>
          );
        })}
      </div>
      {(!hasAppleseed || !hasExcalibur) && (
        <p className="mt-4 text-xs text-slate-400">
          {hasAppleseed
            ? "Finish Excalibur to unlock the next stages."
            : "Start with your Zone of Genius to activate this path."}
        </p>
      )}
    </div>
  );
};

export default GeniusGrowthPath;
