/**
 * Connections — the user's surface for "people I've expressed interest
 * in" + "people I've been introduced to."
 *
 * Day 66 wave §8 (Sasha 2026-05-16): refactored from the legacy
 * `connections` table (requester/receiver/pending/accepted) to the new
 * match-mechanic model.
 *
 * Two sections in the new model:
 *
 *   1. Mutual introductions — rows in `match_intros` where I'm one of
 *      the two parties. These are the success events: both sides opted
 *      in, intro email fired. Each row = a relationship the platform
 *      surfaced.
 *
 *   2. Your expressed interests (one-sided) — rows in `match_interests`
 *      where from_user_id = me AND there's NO corresponding match_intros
 *      row. These are the "I'd like to meet" clicks that haven't
 *      reciprocated yet. Privacy boundary: we do NOT surface incoming
 *      interest (where to_user_id = me and they expressed first). That
 *      would leak unilateral interest before mutuality, which the
 *      double-opt-in model intentionally prevents.
 *
 * Withdraw available on one-sided interests (deletes the from-direction
 * match_interests row). Mutual intros are not withdrawable from this
 * surface — they're a historical record of a real success event.
 */

import { useEffect, useMemo, useState } from "react";
import { formatDate } from "@/i18n/format";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UserPlus, Mail, X } from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/ui/EmptyState";
import SkeletonCard from "@/components/ui/SkeletonCard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import BackButton from "@/components/BackButton";

interface MutualIntroRow {
  id: string;
  user_a_id: string;
  user_b_id: string;
  ai_why_text: string | null;
  intro_sent_at: string;
}

interface InterestRow {
  id: string;
  to_user_id: string;
  ai_why_text: string | null;
  created_at: string;
}

interface ProfileSummary {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

const Connections = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [intros, setIntros] = useState<MutualIntroRow[]>([]);
  const [oneSidedInterests, setOneSidedInterests] = useState<InterestRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileSummary>>({});
  const [withdrawing, setWithdrawing] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUserId(user.id);

      // Mutual intros (success events)
      const { data: introRows } = await (supabase as any)
        .from("match_intros")
        .select("id, user_a_id, user_b_id, ai_why_text, intro_sent_at")
        .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
        .order("intro_sent_at", { ascending: false });

      const introList = (introRows as MutualIntroRow[] | null) ?? [];
      setIntros(introList);

      // Expressed interests (from-direction)
      const { data: interestRows } = await (supabase as any)
        .from("match_interests")
        .select("id, to_user_id, ai_why_text, created_at")
        .eq("from_user_id", user.id)
        .order("created_at", { ascending: false });

      const interestList = (interestRows as InterestRow[] | null) ?? [];

      // Filter out interests where the user is ALSO in a match_intros
      // row with the same person — those become mutuals, not one-sided.
      const mutualOtherIds = new Set(
        introList.map((row) =>
          row.user_a_id === user.id ? row.user_b_id : row.user_a_id
        )
      );
      const oneSided = interestList.filter((row) => !mutualOtherIds.has(row.to_user_id));
      setOneSidedInterests(oneSided);

      // Collect "other party" user_ids across both lists for profile lookup
      const otherUserIds = new Set<string>();
      introList.forEach((row) => {
        otherUserIds.add(row.user_a_id === user.id ? row.user_b_id : row.user_a_id);
      });
      oneSided.forEach((row) => otherUserIds.add(row.to_user_id));

      if (otherUserIds.size > 0) {
        const { data: profileRows } = await supabase
          .from("game_profiles")
          .select("user_id, first_name, last_name, avatar_url")
          .in("user_id", Array.from(otherUserIds));

        const nextProfiles: Record<string, ProfileSummary> = {};
        profileRows?.forEach((profile) => {
          if (profile.user_id) {
            nextProfiles[profile.user_id] = profile as ProfileSummary;
          }
        });
        setProfiles(nextProfiles);
      }

      setLoading(false);
    };
    load();
  }, []);

  const hasActivity = intros.length > 0 || oneSidedInterests.length > 0;

  const handleWithdraw = async (row: InterestRow) => {
    if (!userId) return;
    setWithdrawing(row.id);
    try {
      const { error } = await (supabase as any)
        .from("match_interests")
        .delete()
        .eq("id", row.id)
        .eq("from_user_id", userId);
      if (error) throw error;
      setOneSidedInterests((prev) => prev.filter((r) => r.id !== row.id));
      toast({ title: t('connections.toastWithdrawn') });
    } catch (err) {
      toast({
        title: t('connections.toastWithdrawError'),
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    } finally {
      setWithdrawing(null);
    }
  };

  if (!userId && !loading) {
    return (
      <GameShellV2>
        <div className="p-6 lg:p-8 max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-semibold text-foreground mb-3">{t('connections.signInTitle')}</h1>
          <Button onClick={() => navigate("/auth")}>{t('connections.signInButton')}</Button>
        </div>
      </GameShellV2>
    );
  }

  if (loading) {
    return (
      <GameShellV2>
        <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <SkeletonCard key={idx} className="h-20" />
          ))}
        </div>
      </GameShellV2>
    );
  }

  // Day 91 (Sasha 2026-06-09): row-card fills tokenized for Aurum — the
  // foreground/muted-foreground ink inside flips light under the dark
  // skins, so the white/85 fill must read the skin card token too.
  const renderIntroRow = (row: MutualIntroRow) => {
    if (!userId) return null;
    const otherId = row.user_a_id === userId ? row.user_b_id : row.user_a_id;
    const profile = profiles[otherId];
    const name = profile
      ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
      : t('connections.communityMember');
    return (
      <div key={row.id} className="rounded-xl border border-border bg-[var(--skin-card-fill,rgba(255,255,255,0.85))] backdrop-blur-sm p-4 shadow-[0_4px_16px_rgba(44,49,80,0.06)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-foreground">{name}</p>
            <p className="text-xs text-muted-foreground mt-0.5 inline-flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {t('connections.introSent', { date: formatDate(row.intro_sent_at) })}
            </p>
            {row.ai_why_text && (
              <p className="text-sm text-muted-foreground mt-2 italic">"{row.ai_why_text}"</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderInterestRow = (row: InterestRow) => {
    const profile = profiles[row.to_user_id];
    const name = profile
      ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
      : t('connections.communityMember');
    return (
      <div key={row.id} className="rounded-xl border border-border bg-[var(--skin-card-fill,rgba(255,255,255,0.85))] backdrop-blur-sm p-4 shadow-[0_4px_16px_rgba(44,49,80,0.06)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-foreground">{name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('connections.headsUpSent', { date: formatDate(row.created_at) })}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleWithdraw(row)}
            disabled={withdrawing === row.id}
          >
            <X className="w-3.5 h-3.5 mr-1" />
            {t('connections.withdraw')}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <GameShellV2>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <BackButton to="/game/collaborate/matches" className="mb-6" />

        <div className="flex items-center gap-3 mb-6">
          <UserPlus className="w-6 h-6 text-foreground" />
          <h1 className="text-2xl font-bold text-foreground">{t('connections.heading')}</h1>
        </div>

        {!hasActivity ? (
          <div className="rounded-xl border border-border bg-[var(--skin-card-fill,rgba(255,255,255,0.85))] backdrop-blur-sm p-6 shadow-[0_4px_16px_rgba(44,49,80,0.06)]">
            <EmptyState
              icon={<UserPlus className="w-6 h-6 text-muted-foreground" />}
              title={t('connections.emptyTitle')}
              description={t('connections.emptyDescription')}
              action={{
                label: t('connections.emptyAction'),
                onClick: () => navigate("/game/collaborate/matches"),
              }}
            />
          </div>
        ) : (
          <div className="space-y-8">
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground">
                {t('connections.introducedHeading', { count: intros.length })}
              </h2>
              {intros.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('connections.introducedEmpty')}</p>
              ) : (
                intros.map(renderIntroRow)
              )}
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground">
                {t('connections.interestsHeading', { count: oneSidedInterests.length })}
              </h2>
              {oneSidedInterests.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('connections.interestsEmpty')}</p>
              ) : (
                oneSidedInterests.map(renderInterestRow)
              )}
            </section>
          </div>
        )}
      </div>
    </GameShellV2>
  );
};

export default Connections;
