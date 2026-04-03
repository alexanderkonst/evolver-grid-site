import { memo } from "react";
import { X, UserPlus, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MatchCardProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    archetype: string;
    tagline?: string | null;
  };
  matchReason: string;
  matchLabel?: string;
  secondaryReason?: string;
  secondaryLabel?: string;
  tertiaryReason?: string;
  tertiaryLabel?: string;
  matchTypeBadge?: string;
  connectLabel?: string;
  onPass: () => void;
  onConnect: () => void;
  /** Tinder-style navigation */
  currentIndex?: number;
  totalCount?: number;
  onPrev?: () => void;
  onNext?: () => void;
}

/** Strip ✦ symbols from archetype strings */
const stripSymbols = (s: string) => s.replace(/[✦★☆✧⬥◇◆⟐]/g, "").trim();

const MatchCard = ({
  user,
  matchReason,
  matchLabel,
  secondaryReason,
  secondaryLabel,
  tertiaryReason,
  tertiaryLabel,
  matchTypeBadge,
  connectLabel,
  onPass,
  onConnect,
  currentIndex,
  totalCount,
  onPrev,
  onNext,
}: MatchCardProps) => {
  const cleanArchetype = stripSymbols(user.archetype);

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* ─── Action Buttons (TOP) ─── */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <button
          onClick={onPass}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl liquid-glass ring-1 ring-white/10
                     text-white/50 hover:text-red-300 hover:ring-red-400/20 transition-all text-sm"
        >
          <X className="w-4 h-4" />
          Don't show again
        </button>

        {/* Navigation indicator */}
        {typeof currentIndex === "number" && typeof totalCount === "number" && (
          <div className="flex items-center gap-2">
            <button
              onClick={onPrev}
              disabled={currentIndex === 0}
              className="w-8 h-8 rounded-lg liquid-glass ring-1 ring-white/10 flex items-center justify-center
                         text-white/40 hover:text-white/80 disabled:opacity-20 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-white/30 font-mono tabular-nums">
              {currentIndex + 1}/{totalCount}
            </span>
            <button
              onClick={onNext}
              disabled={currentIndex === totalCount - 1}
              className="w-8 h-8 rounded-lg liquid-glass ring-1 ring-white/10 flex items-center justify-center
                         text-white/40 hover:text-white/80 disabled:opacity-20 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <button
          onClick={onConnect}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                     bg-gradient-to-r from-[#8460ea] to-[#6894d0] text-white
                     shadow-[0_0_20px_rgba(132,96,234,0.2)] hover:shadow-[0_0_30px_rgba(132,96,234,0.35)]
                     hover:scale-[1.02] active:scale-95 transition-all text-sm font-medium"
        >
          <UserPlus className="w-4 h-4" />
          {connectLabel || "Connect"}
        </button>
      </div>

      {/* ─── Profile Card ─── */}
      <div className="rounded-2xl liquid-glass ring-1 ring-white/10 overflow-hidden">
        {/* Photo + Identity */}
        <div className="flex flex-col items-center text-center p-6 pb-4">
          <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-white/15 mb-4 bg-white/5 flex items-center justify-center">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={`${user.firstName} ${user.lastName}`}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
                className="w-full h-full object-cover"
              />
            ) : (
              <Sparkles className="w-8 h-8 text-[#8460ea]/60" />
            )}
          </div>

          <h2 className="text-xl font-semibold text-white">
            {user.firstName} {user.lastName}
          </h2>
          <p className="text-white/50 text-sm mt-0.5">{cleanArchetype}</p>

          {matchTypeBadge && (
            <Badge className="mt-2 bg-emerald-500/15 text-emerald-300 border-emerald-500/20 ring-1 ring-emerald-500/15">
              {matchTypeBadge}
            </Badge>
          )}
          {user.tagline && (
            <p className="text-sm text-white/40 mt-2 italic max-w-sm">"{user.tagline}"</p>
          )}
        </div>

        {/* Collaboration Proposal */}
        <div className="px-6 pb-4 space-y-4">
          <div className="border-t border-white/5 pt-4">
            <p className="text-[10px] uppercase tracking-wider text-[#8460ea] mb-2 font-medium">
              {matchLabel || "Why you match"}
            </p>
            <p className="text-sm text-white/70 leading-relaxed">{matchReason}</p>
          </div>

          {secondaryReason && (
            <div className="border-t border-white/5 pt-4">
              <p className="text-[10px] uppercase tracking-wider text-[#8460ea] mb-2 font-medium">
                {secondaryLabel || "Also relevant"}
              </p>
              <p className="text-sm text-white/60 leading-relaxed">{secondaryReason}</p>
            </div>
          )}

          {tertiaryReason && (
            <div className="border-t border-white/5 pt-4">
              <p className="text-[10px] uppercase tracking-wider text-amber-400/80 mb-2 font-medium">
                {tertiaryLabel || "Context"}
              </p>
              <p className="text-sm text-white/50 leading-relaxed">{tertiaryReason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const areEqual = (prev: MatchCardProps, next: MatchCardProps) => (
  prev.user.id === next.user.id &&
  prev.user.avatarUrl === next.user.avatarUrl &&
  prev.user.archetype === next.user.archetype &&
  prev.user.tagline === next.user.tagline &&
  prev.matchReason === next.matchReason &&
  prev.matchLabel === next.matchLabel &&
  prev.secondaryReason === next.secondaryReason &&
  prev.secondaryLabel === next.secondaryLabel &&
  prev.tertiaryReason === next.tertiaryReason &&
  prev.connectLabel === next.connectLabel &&
  prev.matchTypeBadge === next.matchTypeBadge &&
  prev.currentIndex === next.currentIndex
);

export default memo(MatchCard, areEqual);
