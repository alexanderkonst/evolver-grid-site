import { memo } from "react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  onPass: () => void;
  onConnect: () => void;
}

const MatchCard = ({
  user,
  matchReason,
  matchLabel,
  secondaryReason,
  secondaryLabel,
  onPass,
  onConnect,
}: MatchCardProps) => {
  return (
    <div className="w-full max-w-md mx-auto rounded-3xl border border-[#a4a3d0]/30 bg-gradient-to-br from-[#e7e9e5] to-[#dcdde2] p-6 shadow-[0_8px_24px_rgba(164,163,208,0.18)] transition-shadow hover:shadow-[0_12px_32px_rgba(132,96,234,0.22)]">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-28 h-28 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
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
            <Sparkles className="w-10 h-10 text-amber-500" />
          )}
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-[#2c3150]">
            {user.firstName} {user.lastName}
          </h2>
          <p className="text-[#2c3150] mt-1">✦ {user.archetype} ✦</p>
          {user.tagline && (
            <p className="text-sm text-slate-500 mt-2 italic break-words">"{user.tagline}"</p>
          )}
        </div>

        <div className="w-full border-t border-slate-100 pt-4">
          <p className="text-xs uppercase text-slate-500 mb-2">
            {matchLabel || "Why you match"}
          </p>
          <p className="text-sm text-[#2c3150] break-words">{matchReason}</p>
        </div>

        {secondaryReason && (
          <div className="w-full border-t border-slate-100 pt-4">
            <p className="text-xs uppercase text-slate-500 mb-2">
              {secondaryLabel || "Also relevant"}
            </p>
            <p className="text-sm text-[#2c3150] break-words">{secondaryReason}</p>
          </div>
        )}

        <div className="flex w-full gap-3 pt-4">
          <Button variant="outline" className="flex-1" onClick={onPass}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Pass
          </Button>
          <Button className="flex-1" onClick={onConnect}>
            Connect
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
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
  prev.secondaryLabel === next.secondaryLabel
);

export default memo(MatchCard, areEqual);
