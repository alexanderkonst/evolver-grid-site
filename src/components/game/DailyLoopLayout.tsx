import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Flame, Compass, Heart, Loader2, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import BoldText from "@/components/BoldText";

interface NextMoveAction {
  id?: string;
  title: string;
  description?: string;
  tag?: string;
  durationLabel?: string;
  rationale?: string;
  loop?: string;
  growthPath?: string;
  alternates?: string[];
}

interface DailyLoopLayoutProps {
  profileName?: string | null;
  level?: number;
  xpTotal?: number;
  streakDays?: number;
  archetypeTitle?: string | null;
  lowestDomains?: string[];
  recommendedAction?: NextMoveAction | null;
  isLoadingAction?: boolean;
  actionError?: string | null;
  onPrimaryAction?: () => void;
  onRetryAction?: () => void;
  freedomModeUrl?: string;
}

const SectionCard = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 sm:p-8 shadow-lg">
    <div className="flex items-center gap-3 mb-4">
      {icon}
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
    </div>
    {children}
  </div>
);

export const DailyLoopLayout = ({
  profileName,
  level,
  xpTotal,
  streakDays,
  archetypeTitle,
  lowestDomains = [],
  recommendedAction,
  isLoadingAction,
  actionError,
  onPrimaryAction,
  onRetryAction,
  freedomModeUrl = "/library?from=daily-loop",
}: DailyLoopLayoutProps) => {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Me"
        icon={<Sparkles className="w-5 h-5 text-amber-500" aria-hidden />}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">Welcome back</p>
            <p className="text-xl font-bold text-slate-900">
              {profileName ? `${profileName}` : "Player"}
            </p>
            {archetypeTitle && (
              <p className="text-sm text-slate-600 mt-1">{archetypeTitle}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
            {typeof level === "number" && typeof xpTotal === "number" && (
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-semibold">
                <Compass className="w-4 h-4 text-slate-700" aria-hidden />
                Level {level} · {xpTotal} XP
              </span>
            )}
            {streakDays && streakDays > 0 && (
              <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-orange-700">
                <Flame className="w-4 h-4" aria-hidden />
                {streakDays}-day streak
              </span>
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="My Life"
        icon={<Heart className="w-5 h-5 text-rose-500" aria-hidden />}
      >
        {lowestDomains.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {lowestDomains.map((domain) => (
              <span
                key={domain}
                className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-700"
              >
                {domain} focus
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-600">No QoL focus yet. Complete your snapshot to unlock guidance.</p>
        )}
      </SectionCard>

      <SectionCard
        title="My Next Move"
        icon={<Compass className="w-5 h-5 text-emerald-600" aria-hidden />}
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 sm:p-5">
            {isLoadingAction ? (
              <div className="flex items-center gap-3 text-emerald-700">
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                <p className="font-semibold">Finding your next move...</p>
              </div>
            ) : actionError ? (
              <div className="space-y-3">
                <p className="text-lg font-semibold text-emerald-900">We hit a snag.</p>
                <p className="text-sm text-emerald-800">{actionError}</p>
                {onRetryAction && (
                  <Button variant="secondary" size="sm" onClick={onRetryAction}>
                    Try again
                  </Button>
                )}
              </div>
            ) : recommendedAction ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-emerald-800">{recommendedAction.tag || "Action"}</span>
                  {recommendedAction.durationLabel && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs font-semibold text-emerald-700">
                      <Clock className="h-3.5 w-3.5" aria-hidden />
                      {recommendedAction.durationLabel}
                    </span>
                  )}
                  {recommendedAction.loop && (
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">
                      {recommendedAction.loop}
                    </span>
                  )}
                </div>
                <p className="text-lg font-bold text-emerald-900">{recommendedAction.title}</p>
                {recommendedAction.description && (
                  <p className="text-sm text-emerald-800 leading-relaxed">{recommendedAction.description}</p>
                )}
                {recommendedAction.rationale && (
                  <p className="text-sm text-emerald-700">Why: {recommendedAction.rationale}</p>
                )}
                {recommendedAction.alternates && recommendedAction.alternates.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">Alternatives</p>
                    <ul className="mt-1 space-y-1 text-sm text-emerald-800">
                      {recommendedAction.alternates.map((alt) => (
                        <li key={alt} className="flex items-center gap-2">
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                          {alt}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={onPrimaryAction}
                    disabled={!onPrimaryAction}
                  >
                    <BoldText className="flex items-center gap-2">
                      Do it now
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </BoldText>
                  </Button>
                  <Button asChild variant="secondary" size="sm">
                    <Link to={freedomModeUrl}>Freedom Mode</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-lg font-semibold text-emerald-900">No recommendation yet.</p>
                <p className="text-sm text-emerald-800">Open Freedom Mode to choose a quick win while we learn more about you.</p>
                <Button asChild variant="secondary" size="sm">
                  <Link to={freedomModeUrl}>Open Freedom Mode</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </SectionCard>
    </div>
  );
};

export default DailyLoopLayout;
