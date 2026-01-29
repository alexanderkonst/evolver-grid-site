import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Flame, Compass, Heart, ArrowRight, Clock } from "lucide-react";
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
  celebration?: {
    title: string;
    detail?: string;
  } | null;
  recommendedAction?: NextMoveAction | null;
  isLoadingAction?: boolean;
  actionError?: string | null;
  onPrimaryAction?: () => void;
  onRetryAction?: () => void;
  onFreedomMode?: () => void;
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
  <div className="rounded-3xl border border-[#a4a3d0]/20 bg-white/85 backdrop-blur-sm p-6 sm:p-8 shadow-[0_4px_16px_rgba(44,49,80,0.06)]">
    <div className="flex items-center gap-3 mb-4">
      {icon}
      <h2 className="text-lg font-bold text-[#2c3150]">{title}</h2>
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
  celebration,
  recommendedAction,
  isLoadingAction,
  actionError,
  onPrimaryAction,
  onRetryAction,
  onFreedomMode,
  freedomModeUrl = "/library?from=daily-loop",
}: DailyLoopLayoutProps) => {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Me"
        icon={<Sparkles className="w-5 h-5 text-[#8460ea]" aria-hidden />}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-[#2c3150]/60">Welcome back</p>
            <p className="text-xl font-bold text-[#2c3150]">
              {profileName ? `${profileName}` : "Player"}
            </p>
            {archetypeTitle && (
              <p className="text-sm text-[rgba(44,49,80,0.7)] mt-1">{archetypeTitle}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-[#2c3150]">
            {typeof level === "number" && typeof xpTotal === "number" && (
              <span className="inline-flex items-center gap-2 rounded-full bg-[#a4a3d0]/20 px-3 py-1 font-semibold">
                <Compass className="w-4 h-4 text-[#2c3150]" aria-hidden />
                Level {level} · {xpTotal} XP
              </span>
            )}
            {streakDays && streakDays > 0 && (
              <span className="inline-flex items-center gap-2 rounded-full bg-[#cea4ae]/20 px-3 py-1 text-[#2c3150]">
                <Flame className="w-4 h-4 text-[#cea4ae]" aria-hidden />
                {streakDays}-day streak
              </span>
            )}
          </div>
        </div>
        {celebration && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#8460ea]/30 bg-[#8460ea]/5 px-4 py-3 text-[#2c3150] shadow-sm animate-pulse">
            <Sparkles className="h-5 w-5 text-[#8460ea]" aria-hidden />
            <div>
              <p className="text-sm font-semibold">{celebration.title}</p>
              {celebration.detail && (
                <p className="text-xs text-[#2c3150]/70">{celebration.detail}</p>
              )}
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="My Life"
        icon={<Heart className="w-5 h-5 text-[#cea4ae]" aria-hidden />}
      >
        {lowestDomains.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {lowestDomains.map((domain) => (
              <span
                key={domain}
                className="rounded-full border border-[#cea4ae]/30 bg-[#cea4ae]/10 px-3 py-1 text-sm font-semibold text-[#2c3150]"
              >
                {domain} focus
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#2c3150]/70">No QoL focus yet. Complete your snapshot to unlock guidance.</p>
        )}
      </SectionCard>

      <SectionCard
        title="My Next Move"
        icon={<Compass className="w-5 h-5 text-[#b1c9b6]" aria-hidden />}
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#b1c9b6]/30 bg-[#b1c9b6]/10 p-4 sm:p-5">
            {isLoadingAction ? (
              <div className="flex items-center gap-3 text-[#2c3150]">
                <span className="premium-spinner h-5 w-5" aria-hidden />
                <p className="font-semibold">Finding your next move...</p>
              </div>
            ) : actionError ? (
              <div className="space-y-3">
                <p className="text-lg font-semibold text-[#2c3150]">We hit a snag.</p>
                <p className="text-sm text-[#2c3150]/70">{actionError}</p>
                {onRetryAction && (
                  <Button variant="secondary" size="sm" onClick={onRetryAction}>
                    Try again
                  </Button>
                )}
              </div>
            ) : recommendedAction ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-[#2c3150]">{recommendedAction.tag || "Action"}</span>
                  {recommendedAction.durationLabel && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs font-semibold text-[#2c3150]/70">
                      <Clock className="h-3.5 w-3.5" aria-hidden />
                      {recommendedAction.durationLabel}
                    </span>
                  )}
                  {recommendedAction.loop && (
                    <span className="rounded-full bg-[#b1c9b6]/30 px-2 py-1 text-xs font-semibold text-[#2c3150]">
                      {recommendedAction.loop}
                    </span>
                  )}
                </div>
                <p className="text-lg font-bold text-[#2c3150]">{recommendedAction.title}</p>
                {recommendedAction.description && (
                  <p className="text-sm text-[#2c3150]/70 leading-relaxed">{recommendedAction.description}</p>
                )}
                {recommendedAction.rationale && (
                  <p className="text-sm text-[#2c3150]/60">Why: {recommendedAction.rationale}</p>
                )}
                {recommendedAction.alternates && recommendedAction.alternates.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-semibold text-[#2c3150] uppercase ">Alternatives</p>
                    <ul className="mt-1 space-y-1 text-sm text-[#2c3150]/70">
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
                    className="flex items-center gap-2"
                  >
                    <BoldText>Do it now</BoldText>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button asChild variant="secondary" size="sm">
                    <Link to={freedomModeUrl} onClick={onFreedomMode}>Freedom Mode</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-lg font-semibold text-[#2c3150]">No recommendation yet.</p>
                <p className="text-sm text-[#2c3150]/70">Open Freedom Mode to choose a quick win while we learn more about you.</p>
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
