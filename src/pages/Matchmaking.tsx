import { useEffect, useMemo, useState } from "react";
import { MapPin, Users, Languages } from "lucide-react";
import { toast } from "sonner";
import GameShellV2 from "@/components/game/GameShellV2";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { AppleseedData } from "@/modules/zone-of-genius/appleseedGenerator";
import { areComplementary, getComplementarityLabel } from "@/lib/archetypeMatching";
import MatchCard from "@/components/matchmaking/MatchCard";
import { GOLD_TEXT_STYLE, Ornament } from "@/lib/landingDesign";

// ─────────────────────────────────────────────────────────────────────
// Day 63 night (Sasha 2026-05-07) — Aurora register reskin + Strong
// cocktail legibility per docs/03-playbooks/ui_playbook.md Part VIII.
// Page-level surfaces (the cream wash from GameShellV2) get halo-deep
// + weight 700; card-level surfaces (parchment) get halo-soft + weight
// 600. No more `text-white/40` muted on busy bg — that's the v1 → v2
// fight the playbook resolves.
// ─────────────────────────────────────────────────────────────────────

const cormorantTitle: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 700,
    letterSpacing: "-0.005em",
    color: "var(--skin-text-primary, #0b2a5a)",
    textShadow:
        "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
};

const sourceSerifBody: React.CSSProperties = {
    fontFamily: "'Source Serif 4', serif",
    fontWeight: 600,
    color: "var(--skin-text-primary, #0b2a5a)",
};

const legibleHeadlineHalo =
    "var(--skin-text-halo-deep, 0 0 28px rgba(255,255,255,0.85), 0 1px 2px rgba(255,255,255,0.95), 0 0 1px rgba(11,42,90,0.65), 0 1px 0 rgba(11,42,90,0.45))";

const legibleItalicEcho: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond', serif",
    fontStyle: "italic",
    fontWeight: 700,
    letterSpacing: "0.01em",
    color: "var(--skin-text-primary, #0a1628)",
    textShadow: legibleHeadlineHalo,
};

const eyebrowSmall: React.CSSProperties = {
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontWeight: 500,
    fontSize: "10.5px",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: "var(--skin-accent-gold, #b8860b)",
};

// Day 65 (Sasha 2026-05-09) — bumped both parchment surfaces from
// 0.68 / 0.55 → 0.92 / 0.82 because GameShellV2's video bg can hit
// bright sun-glare frames. At those frames, low-alpha parchment lets
// the bright luminance bleed through and washes out navy text rendered
// ON the card. Per ui_playbook Part VIII: text contrast must hold
// against the card surface, not the bleed. Also strengthened gold
// hairline + shadow so the card still reads as parchment, not a flat
// opaque slab.
const parchmentCard: React.CSSProperties = {
    background: "var(--skin-card-bg, rgba(255, 252, 245, 0.92))",
    border: "0.5px solid rgba(212, 175, 55, 0.55)",
    boxShadow:
        "0 0 22px -8px rgba(212, 175, 55, 0.30), 0 16px 40px -20px rgba(10, 22, 40, 0.22)",
};

const parchmentCardSubtle: React.CSSProperties = {
    background: "rgba(255, 252, 245, 0.82)",
    border: "0.5px solid rgba(212, 175, 55, 0.30)",
    boxShadow: "0 6px 20px -10px rgba(10, 22, 40, 0.16)",
};

interface MatchCandidate {
  id: string;
  name: string;
  archetype: string;
  tagline?: string | null;
  avatarUrl?: string | null;
  similarityScore: number;
  location: string | null;
  showLocation: boolean;
  spokenLanguages: string[];
  matchReason?: string;
  complementary: boolean;
}

interface CandidateWithReasons extends Omit<MatchCandidate, "matchReason"> {
  matchReasons: {
    similar: string;
    complementary: string;
    mission: string;
  };
}

interface MatchGroups {
  similarGenius: MatchCandidate[];
  complementaryGenius: MatchCandidate[];
  similarMission: MatchCandidate[];
}

interface AssetMatchResult {
  userId: string;
  firstName: string;
  lastName: string;
  archetype: string | null;
  tagline: string | null;
  avatarUrl?: string | null;
  resonanceScore: number;
  matchType: string;
  collaborationProposal: string;
  suggestedAction: string;
  alignment: string;
  complementarity: string;
  friction: string;
  theirAssets: { typeId: string; title: string }[];
}

const SUGGESTED_ACTION_LABELS: Record<string, string> = {
  intro: "Request Intro",
  "micro-collab": "Start Project",
  "practice-together": "Practice Together",
  wait: "Revisit Later",
};

const MATCH_TYPE_LABELS: Record<string, string> = {
  "co-founder": "Co-founder Fit",
  collaborator: "Collaborator",
  peer: "Peer",
  mentor: "Mentor",
  "client-fit": "Client Fit",
};

interface CurrentProfile {
  id: string;
  name: string;
  archetype: string;
  location: string | null;
  spokenLanguages: string[];
}

const normalizeKey = (value: string | null | undefined) => (value || "").trim().toLowerCase();

const getSharedActions = (current: AppleseedData, candidate: AppleseedData) => {
  const currentActions = current.threeLenses?.actions?.map((action) => normalizeKey(action)) ?? [];
  const candidateActions = new Set(candidate.threeLenses?.actions?.map((action) => normalizeKey(action)) ?? []);
  return currentActions.filter((action) => action && candidateActions.has(action));
};

const buildSimilarity = (current: AppleseedData, candidate: AppleseedData) => {
  const currentArchetype = normalizeKey(current.vibrationalKey?.name);
  const candidateArchetype = normalizeKey(candidate.vibrationalKey?.name);
  const currentDriver = normalizeKey(current.threeLenses?.primeDriver);
  const candidateDriver = normalizeKey(candidate.threeLenses?.primeDriver);
  const currentCore = normalizeKey(current.threeLenses?.archetype);
  const candidateCore = normalizeKey(candidate.threeLenses?.archetype);

  const archetypeMatch = !!currentArchetype && currentArchetype === candidateArchetype;
  const primeDriverMatch = !!currentDriver && currentDriver === candidateDriver;
  const corePatternMatch = !!currentCore && currentCore === candidateCore;
  const sharedActions = getSharedActions(current, candidate);

  const score = Math.min(
    100,
    (archetypeMatch ? 45 : 0) +
    (primeDriverMatch ? 25 : 0) +
    (corePatternMatch ? 15 : 0) +
    sharedActions.length * 5
  );

  return {
    score,
    archetypeMatch,
    primeDriverMatch,
    corePatternMatch,
    sharedActions,
  };
};

const hasLanguageOverlap = (base: string[], candidate: string[]) => {
  const baseSet = new Set(base.map((lang) => normalizeKey(lang)));
  return candidate.some((lang) => baseSet.has(normalizeKey(lang)));
};

/** Strip ✦ symbols from archetype strings */
const stripSymbols = (s: string) => s.replace(/[✦★☆✧⬥◇◆⟐]/g, "").trim();

const Matchmaking = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<MatchGroups>({
    similarGenius: [],
    complementaryGenius: [],
    similarMission: [],
  });
  const [currentProfile, setCurrentProfile] = useState<CurrentProfile | null>(null);
  const [sameLocationOnly, setSameLocationOnly] = useState(false);
  const [sameLanguageOnly, setSameLanguageOnly] = useState(false);
  const [assetMatches, setAssetMatches] = useState<AssetMatchResult[]>([]);
  const [assetMatchesLoading, setAssetMatchesLoading] = useState(false);

  // Tinder-style: track current AI match index
  const [currentAiMatchIndex, setCurrentAiMatchIndex] = useState(0);
  // Track hidden profiles
  const [hiddenProfiles, setHiddenProfiles] = useState<Set<string>>(new Set());

  // Day 66 wave §8 (Sasha 2026-05-16): match-mechanic state.
  //
  //   interestedUserIds — userIds the current user has expressed interest
  //   in (from-direction match_interests rows). Drives the
  //   "interest-expressed" state on the MatchCard.
  //
  //   mutualUserIds — userIds that are in a match_intros row with the
  //   current user (either canonical direction). Drives the "mutual"
  //   state on the MatchCard.
  //
  //   These get loaded on mount and updated locally on every successful
  //   interest click (avoiding a roundtrip per re-render).
  const [interestedUserIds, setInterestedUserIds] = useState<Set<string>>(new Set());
  const [mutualUserIds, setMutualUserIds] = useState<Set<string>>(new Set());

  // Day 63 night: Skeleton bg matched to parchment-card surface so the
  // shimmer reads against the cream wash, not against an inverted dark.
  const Skeleton = ({ className }: { className?: string }) => (
    <div
      className={`animate-pulse rounded-2xl ${className || ""}`}
      style={{
        background: "rgba(255, 255, 255, 0.45)",
        border: "0.5px solid var(--skin-rule-hairline, rgba(26, 30, 58, 0.08))",
      }}
    />
  );

  useEffect(() => {
    const loadMatches = async () => {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Sign in to view matches.");
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("game_profiles")
        .select("user_id, first_name, last_name, location, show_location, spoken_languages, last_zog_snapshot_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile?.last_zog_snapshot_id) {
        setGroups({ similarGenius: [], complementaryGenius: [], similarMission: [] });
        setLoading(false);
        return;
      }

      const { data: currentMission } = await supabase
        .from("mission_participants")
        .select("mission_id, mission_title")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: profileRows } = await supabase
        .from("game_profiles")
        .select("user_id, first_name, last_name, avatar_url, location, show_location, spoken_languages, last_zog_snapshot_id, visibility")
        .neq("user_id", user.id)
        .neq("visibility", "hidden");

      const snapshotIds = [
        profile.last_zog_snapshot_id,
        ...((profileRows || []).map((row) => row.last_zog_snapshot_id).filter(Boolean) as string[]),
      ];

      const { data: snapshots } = await supabase
        .from("zog_snapshots")
        .select("id, appleseed_data")
        .in("id", snapshotIds);

      const snapshotMap = new Map<string, AppleseedData>();
      (snapshots || []).forEach((snapshot) => {
        if (snapshot.appleseed_data) {
          snapshotMap.set(snapshot.id, snapshot.appleseed_data as unknown as AppleseedData);
        }
      });

      const currentSnapshot = snapshotMap.get(profile.last_zog_snapshot_id);
      if (!currentSnapshot) {
        setGroups({ similarGenius: [], complementaryGenius: [], similarMission: [] });
        setLoading(false);
        return;
      }

      const currentArchetype = currentSnapshot.vibrationalKey?.name || "Unknown archetype";
      const currentProfileName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "You";

      setCurrentProfile({
        id: profile.user_id || "",
        name: currentProfileName,
        archetype: currentArchetype,
        location: profile.location || null,
        spokenLanguages: Array.isArray(profile.spoken_languages) ? profile.spoken_languages : [],
      });

      let missionParticipants = new Set<string>();
      if (currentMission?.mission_id) {
        // Use the email-free public view for cross-team reads
        const { data: participantRows } = await (supabase as any)
          .from("mission_participants_public")
          .select("user_id")
          .eq("mission_id", currentMission.mission_id)
          .eq("share_consent", true)
          .neq("user_id", user.id);
        missionParticipants = new Set(
          (participantRows || []).map((row) => row.user_id).filter(Boolean) as string[]
        );
      }

      const candidates: CandidateWithReasons[] = (profileRows || [])
        .filter((row) => row.user_id && row.last_zog_snapshot_id)
        .map((row) => {
          const snapshot = row.last_zog_snapshot_id ? snapshotMap.get(row.last_zog_snapshot_id) : null;
          if (!snapshot) return null;
          const archetype = snapshot.vibrationalKey?.name || "Unknown archetype";
          const tagline = snapshot.vibrationalKey?.tagline || null;
          const similarity = buildSimilarity(currentSnapshot, snapshot);
          const sharedActionLabel = similarity.sharedActions.length
            ? `Shared actions: ${similarity.sharedActions.length}`
            : "Aligned patterns";
          const similarReason = similarity.archetypeMatch
            ? `Same archetype · ${sharedActionLabel}`
            : similarity.primeDriverMatch || similarity.corePatternMatch
              ? `Shared core patterns · ${sharedActionLabel}`
              : sharedActionLabel;

          const complementary = areComplementary(currentArchetype, archetype);
          const complementaryLabel = complementary
            ? getComplementarityLabel(currentArchetype, archetype)
            : null;
          const complementaryReason = complementaryLabel
            ? `Complementary genius · ${complementaryLabel}`
            : "Complementary genius";

          const missionLabel = currentMission?.mission_title
            ? `Same mission · ${currentMission.mission_title}`
            : "Shared mission";

          const displayName = `${row.first_name || ""} ${row.last_name || ""}`.trim() || "Community Member";
          const spokenLanguages = Array.isArray(row.spoken_languages) ? row.spoken_languages : [];

          return {
            id: row.user_id!,
            name: displayName,
            archetype,
            tagline,
            avatarUrl: (row as any).avatar_url || null,
            similarityScore: similarity.score,
            location: row.location || null,
            showLocation: row.show_location ?? true,
            spokenLanguages,
            matchReasons: {
              similar: similarReason,
              complementary: complementaryReason,
              mission: missionLabel,
            },
            complementary,
          };
        })
        .filter(Boolean) as CandidateWithReasons[];

      const similarGenius = [...candidates]
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, 3)
        .map(({ matchReasons, ...candidate }) => ({
          ...candidate,
          matchReason: matchReasons.similar,
        }));

      const complementaryGenius = candidates
        .filter((candidate) => candidate.complementary)
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, 3)
        .map(({ matchReasons, ...candidate }) => ({
          ...candidate,
          similarityScore: Math.max(candidate.similarityScore, 60),
          matchReason: matchReasons.complementary,
        }));

      const similarMission = currentMission?.mission_id
        ? candidates
          .filter((candidate) => missionParticipants.has(candidate.id))
          .sort((a, b) => b.similarityScore - a.similarityScore)
          .slice(0, 3)
          .map(({ matchReasons, ...candidate }) => ({
            ...candidate,
            similarityScore: Math.max(candidate.similarityScore, 50),
            matchReason: matchReasons.mission,
          }))
        : [];

      setGroups({
        similarGenius,
        complementaryGenius,
        similarMission,
      });
      setLoading(false);
    };

    loadMatches();
  }, []);

  // Load asset matches from edge function
  useEffect(() => {
    const loadAssetMatches = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setAssetMatchesLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("suggest-asset-matches", {
          body: { userId: user.id },
        });

        if (error) {
          console.warn("[AssetMatching] Edge function error:", error.message);
          return;
        }

        if (data?.matches) {
          // Fetch avatar URLs for matched users
          const userIds = data.matches.map((m: any) => m.userId);
          const { data: avatarRows } = await supabase
            .from("game_profiles")
            .select("user_id, avatar_url")
            .in("user_id", userIds);

          const avatarMap = new Map<string, string | null>();
          (avatarRows || []).forEach((row: any) => {
            avatarMap.set(row.user_id, row.avatar_url);
          });

          const enriched = data.matches.map((m: any) => ({
            ...m,
            avatarUrl: avatarMap.get(m.userId) || null,
          }));

          setAssetMatches(enriched);
        }
      } catch (err) {
        console.warn("[AssetMatching] Exception:", err);
      } finally {
        setAssetMatchesLoading(false);
      }
    };

    loadAssetMatches();
  }, []);

  // Day 66 wave §8 (Sasha 2026-05-16): load the current user's
  // match-mechanic state — which userIds they've expressed interest in
  // (match_interests.from_user_id = me) and which they're in a mutual
  // intro with (match_intros where either user_a_id or user_b_id = me).
  // Used to drive the MatchCard's interactionState.
  useEffect(() => {
    const loadMatchState = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      try {
        // Interest the current user has expressed (from-direction only)
        const { data: interestRows, error: interestErr } = await (supabase as any)
          .from("match_interests")
          .select("to_user_id")
          .eq("from_user_id", user.id);
        if (!interestErr && Array.isArray(interestRows)) {
          setInterestedUserIds(
            new Set(interestRows.map((r: { to_user_id: string }) => r.to_user_id))
          );
        }

        // Mutual intros (either side)
        const { data: introRows, error: introErr } = await (supabase as any)
          .from("match_intros")
          .select("user_a_id, user_b_id")
          .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`);
        if (!introErr && Array.isArray(introRows)) {
          const otherIds = new Set<string>();
          for (const row of introRows as Array<{ user_a_id: string; user_b_id: string }>) {
            otherIds.add(row.user_a_id === user.id ? row.user_b_id : row.user_a_id);
          }
          setMutualUserIds(otherIds);
        }
      } catch (err) {
        // Tables may not exist yet (pre-migration). Silent — UI falls
        // back to "default" state on all cards.
        console.warn("[Matchmaking] match-state load failed (pre-migration?):", err);
      }
    };
    loadMatchState();
  }, []);

  const locationBlocked = sameLocationOnly && !currentProfile?.location;
  const languageBlocked = sameLanguageOnly && (!currentProfile || currentProfile.spokenLanguages.length === 0);

  const applyFilters = (list: MatchCandidate[]) => {
    if (!currentProfile) return list;
    return list.filter((candidate) => {
      if (sameLocationOnly) {
        if (!currentProfile.location || !candidate.location || !candidate.showLocation) return false;
        if (normalizeKey(candidate.location) !== normalizeKey(currentProfile.location)) return false;
      }
      if (sameLanguageOnly) {
        if (currentProfile.spokenLanguages.length === 0) return false;
        if (!hasLanguageOverlap(currentProfile.spokenLanguages, candidate.spokenLanguages)) return false;
      }
      return true;
    });
  };

  const filteredGroups = useMemo(
    () => ({
      similarGenius: applyFilters(groups.similarGenius),
      complementaryGenius: applyFilters(groups.complementaryGenius),
      similarMission: applyFilters(groups.similarMission),
    }),
    [groups, sameLocationOnly, sameLanguageOnly, currentProfile]
  );

  // Filter out hidden AI matches
  const visibleAiMatches = assetMatches.filter(m => !hiddenProfiles.has(m.userId));

  const hasAnyMatches =
    filteredGroups.similarGenius.length > 0 ||
    filteredGroups.complementaryGenius.length > 0 ||
    filteredGroups.similarMission.length > 0 ||
    visibleAiMatches.length > 0 ||
    assetMatchesLoading;

  // Clamp index
  const clampedIndex = Math.min(currentAiMatchIndex, Math.max(0, visibleAiMatches.length - 1));
  const currentAiMatch = visibleAiMatches[clampedIndex];

  const handleAiPass = () => {
    if (currentAiMatch) {
      setHiddenProfiles(prev => new Set([...prev, currentAiMatch.userId]));
      // Stay at same index (next profile slides in)
      if (clampedIndex >= visibleAiMatches.length - 1) {
        setCurrentAiMatchIndex(Math.max(0, clampedIndex - 1));
      }
    }
  };

  // Day 66 wave §8 (Sasha 2026-05-16): Express Interest replaces the
  // prior single-side Add Connection. New flow:
  //
  //   1. INSERT into match_interests (from = me, to = match.userId,
  //      with score / compound / why-text from the AI engine output).
  //   2. SELECT match_interests reverse direction (from = them, to = me).
  //   3. If found → mutual interest. INSERT match_intros (canonical
  //      ordering) + call send-mutual-intro-email (both A and B as
  //      recipients of equal standing).
  //   4. If not found → quiet "interest recorded" state. They'll see
  //      this user's interest in their own match feed; if they opt in,
  //      the mutual-intro fires at that point.
  //
  // Card stays in view through state transitions — no profile-hiding,
  // no pager advance. The user can see what just happened.
  //
  // Legacy `connections` table no longer written by this flow; the
  // matchmaking schema migration drops that table (Day 66 wave §8 deploy).
  const handleExpressInterest = async () => {
    if (!currentAiMatch) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Sign in to express interest in a match.");
        return;
      }

      const targetUserId = currentAiMatch.userId;
      const whyText = [
        currentAiMatch.collaborationProposal,
        currentAiMatch.alignment,
        currentAiMatch.complementarity,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();
      const compoundType = currentAiMatch.matchType || null;

      // (1) Insert match_interests (from = me, to = target).
      const { error: insertError } = await (supabase as any)
        .from("match_interests")
        .insert({
          from_user_id: user.id,
          to_user_id: targetUserId,
          match_score: currentAiMatch.resonanceScore ?? null,
          compound_type: compoundType,
          ai_why_text: whyText,
        });

      if (insertError) {
        // 23505 = unique_violation = already expressed interest.
        // Surface a gentle confirmation but don't fail.
        if ((insertError as { code?: string }).code !== "23505") {
          throw insertError;
        }
      }

      // Local state: this user is now "interest-expressed."
      setInterestedUserIds((prev) => new Set([...prev, targetUserId]));

      // (2) Reverse-direction check: did they already express interest
      // in me?
      const { data: reverseRow } = await (supabase as any)
        .from("match_interests")
        .select("ai_why_text, compound_type, match_score")
        .eq("from_user_id", targetUserId)
        .eq("to_user_id", user.id)
        .maybeSingle();

      if (!reverseRow) {
        // (3a) One-sided: their interest hasn't been expressed yet.
        toast.success(
          `Interest in ${currentAiMatch.firstName} recorded. We'll introduce you both if they say yes.`,
        );
        return;
      }

      // (3b) Mutual! Insert match_intros + fire the bilateral intro email.
      const userA = user.id < targetUserId ? user.id : targetUserId;
      const userB = user.id < targetUserId ? targetUserId : user.id;
      const introWhyText = (reverseRow as { ai_why_text: string | null }).ai_why_text || whyText;
      const introCompound =
        (reverseRow as { compound_type: string | null }).compound_type || compoundType;
      const introScore =
        (reverseRow as { match_score: number | null }).match_score ??
        currentAiMatch.resonanceScore ?? null;

      const { error: introInsertError } = await (supabase as any)
        .from("match_intros")
        .insert({
          user_a_id: userA,
          user_b_id: userB,
          match_score: introScore,
          compound_type: introCompound,
          ai_why_text: introWhyText,
        });
      // Tolerate unique_violation on intros (the other side may have
      // raced us to the same insert in a different tab).
      if (introInsertError && (introInsertError as { code?: string }).code !== "23505") {
        console.warn("[handleExpressInterest] match_intros insert failed:", introInsertError);
      }

      // Local state: this is now "mutual."
      setMutualUserIds((prev) => new Set([...prev, targetUserId]));

      // (4) Fire the bilateral intro email — best-effort. The intro
      // record exists in the DB regardless; email is the user-visible
      // artifact, the row is the engine-facing artifact.
      try {
        const { error: emailErr } = await supabase.functions.invoke(
          "send-mutual-intro-email",
          {
            body: {
              user_a_id: userA,
              user_b_id: userB,
              ai_why_text: introWhyText,
            },
          },
        );
        if (emailErr) throw emailErr;
        toast.success(
          `Mutual interest with ${currentAiMatch.firstName}. Introduction sent to both your inboxes.`,
        );
      } catch (emailErr) {
        console.warn("[handleExpressInterest] mutual intro email failed:", emailErr);
        toast.success(
          `Mutual interest with ${currentAiMatch.firstName}! (Intro email may be delayed; the match is recorded.)`,
        );
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Couldn't record your interest.";
      toast.error(message);
    }
  };

  // Day 66 wave §8: withdraw expressed interest. Deletes the from→to
  // row in match_interests so the card returns to "default" state.
  // Does NOT delete any existing match_intros (the mutual event, if
  // already fired, stands as a recorded event).
  const handleWithdrawInterest = async () => {
    if (!currentAiMatch) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await (supabase as any)
        .from("match_interests")
        .delete()
        .eq("from_user_id", user.id)
        .eq("to_user_id", currentAiMatch.userId);
      if (error) throw error;
      setInterestedUserIds((prev) => {
        const next = new Set(prev);
        next.delete(currentAiMatch.userId);
        return next;
      });
      toast.info(`Withdrew your interest in ${currentAiMatch.firstName}.`);
    } catch (err) {
      console.warn("[handleWithdrawInterest] failed:", err);
      toast.error("Couldn't withdraw interest. Try again.");
    }
  };

  const renderMatch = (match: MatchCandidate) => (
    <div
      key={match.id}
      className="rounded-2xl p-4"
      style={parchmentCardSubtle}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
            style={{
              background: "rgba(212, 175, 55, 0.10)",
              border: "0.5px solid rgba(212, 175, 55, 0.45)",
            }}
          >
            {match.avatarUrl ? (
              <img src={match.avatarUrl} alt={match.name} className="w-full h-full object-cover" />
            ) : (
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 700,
                  fontSize: "16px",
                  color: "var(--skin-goldDeep, #5d4307)",
                }}
              >
                {match.name.charAt(0)}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <h3
              style={{
                ...cormorantTitle,
                fontSize: "15px",
                fontWeight: 700,
              }}
              className="truncate"
            >
              {match.name}
            </h3>
            <p
              style={{
                fontFamily: "'Source Serif 4', serif",
                fontStyle: "italic",
                fontWeight: 600,
                fontSize: "12.5px",
                color: "var(--skin-text-primary, #0b2a5a)",
              }}
              className="truncate"
            >
              {stripSymbols(match.archetype)}
            </p>
          </div>
        </div>
        <span
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: "10.5px",
            fontWeight: 500,
            fontVariantNumeric: "tabular-nums lining-nums",
            padding: "2px 8px",
            borderRadius: "999px",
            color: "var(--skin-goldDeep, #5d4307)",
            background: "rgba(212, 175, 55, 0.10)",
            border: "0.5px solid rgba(212, 175, 55, 0.40)",
            flexShrink: 0,
          }}
        >
          {match.similarityScore}%
        </span>
      </div>
      {match.matchReason && (
        <p
          className="mt-2 italic"
          style={{
            fontFamily: "'Source Serif 4', serif",
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: "13px",
            lineHeight: 1.55,
            color: "var(--skin-text-primary, #0b2a5a)",
          }}
        >
          {match.matchReason}
        </p>
      )}
    </div>
  );

  return (
    <GameShellV2>
      <div className="p-6 lg:p-8 max-w-3xl mx-auto">

        {/* ═══════ HEADER — Aurora editorial register ═══════ */}
        {/* Cormorant headline with GOLD_TEXT_STYLE accent + italic echo
            + Ornament — same rhythm as `/`, `/zone-of-genius`, dossier. */}
        <header className="text-center mb-8">
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.1] tracking-[-0.018em] mb-3 sm:mb-4"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "var(--skin-text-primary, #0a1628)",
              textShadow: legibleHeadlineHalo,
            }}
          >
            Genius{" "}
            <span className="bg-clip-text text-transparent" style={GOLD_TEXT_STYLE}>
              Matches
            </span>
          </h1>
          <p
            className="text-lg sm:text-xl md:text-2xl leading-[1.32]"
            style={{
              ...legibleItalicEcho,
              fontSize: "clamp(16px, 1.7vw, 20px)",
            }}
          >
            People whose work resonates with yours
          </p>
          <Ornament className="my-6 sm:my-7" />
        </header>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            className="rounded-2xl px-5 py-5 text-center"
            style={{
              background: "rgba(184, 60, 60, 0.06)",
              border: "0.5px solid rgba(184, 60, 60, 0.30)",
              boxShadow: "0 4px 16px -8px rgba(184, 60, 60, 0.18)",
            }}
          >
            <p
              style={{
                fontFamily: "'Source Serif 4', serif",
                fontStyle: "italic",
                fontWeight: 600,
                fontSize: "15px",
                color: "rgba(140, 60, 60, 0.95)",
              }}
            >
              {error}
            </p>
          </div>
        )}

        {/* Filter warnings — gold-tinted parchment */}
        {!loading && !error && (locationBlocked || languageBlocked) && (
          <div
            className="rounded-2xl px-5 py-4 mb-6"
            style={{
              background: "rgba(212, 175, 55, 0.08)",
              border: "0.5px solid rgba(212, 175, 55, 0.40)",
            }}
          >
            <p
              className="italic"
              style={{
                fontFamily: "'Source Serif 4', serif",
                fontStyle: "italic",
                fontWeight: 600,
                fontSize: "13.5px",
                lineHeight: 1.55,
                color: "var(--skin-goldDeep, #5d4307)",
              }}
            >
              {locationBlocked && "Add your location in your profile to use the location filter. "}
              {languageBlocked && "Add spoken languages in your profile to use the language filter."}
            </p>
          </div>
        )}

        {/* No-matches state — Aurora ceremonial empty */}
        {!loading && !error && !hasAnyMatches && (
          <div
            className="rounded-2xl px-6 py-10 text-center"
            style={parchmentCard}
          >
            <h2
              style={{
                ...cormorantTitle,
                fontSize: "22px",
                fontWeight: 700,
                textShadow: legibleHeadlineHalo,
              }}
              className="mb-2"
            >
              No matches yet
            </h2>
            <p
              className="italic"
              style={{
                ...legibleItalicEcho,
                fontSize: "16px",
                lineHeight: 1.55,
              }}
            >
              Complete your Top Talent reveal so the right people can find you.
            </p>
          </div>
        )}

        {!loading && !error && hasAnyMatches && (
          <div className="space-y-10">
            {/* ═════════════════════════════════════════
                SECTION 1: AI-POWERED MATCHES (TOP)
                Tinder-style: one profile at a time
                ═════════════════════════════════════════ */}
            <section>
              {/* Day 65 (Sasha 2026-05-09): eyebrow + intro copy bumped
                  for legibility — was reading as "small / barely visible
                  on background" against the bright sun-glare frames of
                  the GameShellV2 video. Eyebrow: 10.5px → 12px, weight
                  500 → 700, halo-soft added. Intro italic: 15px → 17px,
                  lineHeight 1.55 → 1.5. */}
              <div className="mb-5">
                <div
                  style={{
                    ...eyebrowSmall,
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "var(--skin-goldDeep, #5d4307)",
                    textShadow:
                      "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
                  }}
                  className="mb-2"
                >
                  ✦ AI-Powered Matches
                </div>
                <h2
                  style={{
                    ...cormorantTitle,
                    fontSize: "28px",
                    fontWeight: 700,
                    textShadow: legibleHeadlineHalo,
                  }}
                  className="leading-[1.2] mb-1.5"
                >
                  Collaboration Proposals
                </h2>
                <p
                  className="italic"
                  style={{
                    ...legibleItalicEcho,
                    fontSize: "17px",
                    lineHeight: 1.5,
                  }}
                >
                  Win-win collaboration proposals powered by your full profile.
                </p>
              </div>

              {assetMatchesLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : visibleAiMatches.length > 0 && currentAiMatch ? (
                <MatchCard
                  key={currentAiMatch.userId}
                  user={{
                    id: currentAiMatch.userId,
                    firstName: currentAiMatch.firstName,
                    lastName: currentAiMatch.lastName,
                    archetype: currentAiMatch.archetype || "Community Member",
                    tagline: currentAiMatch.tagline,
                    avatarUrl: currentAiMatch.avatarUrl || null,
                  }}
                  matchLabel="Collaboration Proposal"
                  matchReason={currentAiMatch.collaborationProposal}
                  matchTypeBadge={MATCH_TYPE_LABELS[currentAiMatch.matchType] || currentAiMatch.matchType}
                  secondaryLabel="Why this works"
                  secondaryReason={`${currentAiMatch.alignment} ${currentAiMatch.complementarity}`}
                  tertiaryLabel={currentAiMatch.friction !== "None identified" ? "Watch out for" : undefined}
                  tertiaryReason={currentAiMatch.friction !== "None identified" ? currentAiMatch.friction : undefined}
                  connectLabel="I'd like to meet"
                  onPass={handleAiPass}
                  onConnect={handleExpressInterest}
                  onWithdraw={handleWithdrawInterest}
                  interactionState={
                    mutualUserIds.has(currentAiMatch.userId)
                      ? "mutual"
                      : interestedUserIds.has(currentAiMatch.userId)
                        ? "interest-expressed"
                        : "default"
                  }
                  currentIndex={clampedIndex}
                  totalCount={visibleAiMatches.length}
                  onPrev={() => setCurrentAiMatchIndex(Math.max(0, clampedIndex - 1))}
                  onNext={() => setCurrentAiMatchIndex(Math.min(visibleAiMatches.length - 1, clampedIndex + 1))}
                />
              ) : (
                <div
                  className="rounded-2xl px-5 py-6 text-center"
                  style={parchmentCardSubtle}
                >
                  <p
                    className="italic"
                    style={{
                      fontFamily: "'Source Serif 4', serif",
                      fontStyle: "italic",
                      fontWeight: 600,
                      fontSize: "14px",
                      lineHeight: 1.55,
                      color: "var(--skin-text-primary, #0b2a5a)",
                    }}
                  >
                    {assetMatches.length > 0
                      ? "You've reviewed all AI matches. New ones will appear as more people join."
                      : "Complete your Top Talent reveal and map your assets to unlock AI-powered matching."}
                  </p>
                </div>
              )}
            </section>

            {/* ═════════════════════════════════════════
                SECTION 2: GENIUS MATCHES (BOTTOM)
                Category-based list view
                ═════════════════════════════════════════ */}
            <section>
              {/* Day 65 (Sasha 2026-05-09): same eyebrow + intro bumps as
                  Section 1 above for legibility consistency. */}
              <div className="mb-5">
                <div
                  style={{
                    ...eyebrowSmall,
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "var(--skin-goldDeep, #5d4307)",
                    textShadow:
                      "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
                  }}
                  className="mb-2"
                >
                  <Users className="w-3.5 h-3.5 inline-block mr-1.5 align-[-2px]" />
                  Your network
                </div>
                <h2
                  style={{
                    ...cormorantTitle,
                    fontSize: "28px",
                    fontWeight: 700,
                    textShadow: legibleHeadlineHalo,
                  }}
                  className="leading-[1.2] mb-1.5"
                >
                  Genius Matches
                </h2>
                <p
                  className="italic"
                  style={{
                    ...legibleItalicEcho,
                    fontSize: "17px",
                    lineHeight: 1.5,
                  }}
                >
                  People in the network whose Top Talent complements yours.
                </p>
              </div>

              {/* Filters — parchment with editorial labels */}
              <div
                className="rounded-2xl px-5 py-4 mb-6"
                style={parchmentCard}
              >
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4" style={{ color: "var(--skin-accent-gold, #b8860b)" }} />
                    <div>
                      <p
                        style={{
                          fontFamily: "'DM Sans', system-ui, sans-serif",
                          fontWeight: 500,
                          fontSize: "11px",
                          letterSpacing: "0.16em",
                          textTransform: "uppercase",
                          color: "var(--skin-text-muted, rgba(11, 42, 90, 0.93))",
                        }}
                      >
                        Same location
                      </p>
                      <p
                        style={{
                          ...sourceSerifBody,
                          fontSize: "13px",
                          lineHeight: 1.45,
                        }}
                      >
                        {currentProfile?.location ? currentProfile.location : "Add your location to enable"}
                      </p>
                    </div>
                    <Switch
                      checked={sameLocationOnly}
                      onCheckedChange={setSameLocationOnly}
                      aria-label="Filter matches by same location"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Languages className="w-4 h-4" style={{ color: "var(--skin-accent-gold, #b8860b)" }} />
                    <div>
                      <p
                        style={{
                          fontFamily: "'DM Sans', system-ui, sans-serif",
                          fontWeight: 500,
                          fontSize: "11px",
                          letterSpacing: "0.16em",
                          textTransform: "uppercase",
                          color: "var(--skin-text-muted, rgba(11, 42, 90, 0.93))",
                        }}
                      >
                        Same language
                      </p>
                      <p
                        style={{
                          ...sourceSerifBody,
                          fontSize: "13px",
                          lineHeight: 1.45,
                        }}
                      >
                        {currentProfile?.spokenLanguages?.length
                          ? currentProfile.spokenLanguages.join(", ")
                          : "Add languages to enable"}
                      </p>
                    </div>
                    <Switch
                      checked={sameLanguageOnly}
                      onCheckedChange={setSameLanguageOnly}
                      aria-label="Filter matches by shared language"
                    />
                  </div>
                </div>
              </div>

              {/* Three sub-groups — Similar / Complementary / Similar Mission */}
              {([
                {
                  title: "Similar Genius",
                  copy: "People who think and operate like you.",
                  matches: filteredGroups.similarGenius,
                  empty: "No similar genius matches yet.",
                },
                {
                  title: "Complementary Genius",
                  copy: "Great co-founder or collaborator fit.",
                  matches: filteredGroups.complementaryGenius,
                  empty: "No complementary matches yet.",
                },
                {
                  title: "Similar Mission",
                  copy: "People aligned with your current mission.",
                  matches: filteredGroups.similarMission,
                  empty: "No mission matches yet.",
                },
              ] as const).map((group) => (
                <div key={group.title} className="mb-6 last:mb-0">
                  <div className="mb-3">
                    <h3
                      style={{
                        ...cormorantTitle,
                        fontSize: "18px",
                        fontWeight: 700,
                      }}
                    >
                      {group.title}
                    </h3>
                    <p
                      className="italic"
                      style={{
                        fontFamily: "'Source Serif 4', serif",
                        fontStyle: "italic",
                        fontWeight: 500,
                        fontSize: "13px",
                        color: "var(--skin-text-muted, rgba(11, 42, 90, 0.93))",
                      }}
                    >
                      {group.copy}
                    </p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {group.matches.map(renderMatch)}
                    {group.matches.length === 0 && (
                      <div
                        className="rounded-2xl px-4 py-3.5 italic"
                        style={{
                          ...parchmentCardSubtle,
                          fontFamily: "'Source Serif 4', serif",
                          fontStyle: "italic",
                          fontWeight: 500,
                          fontSize: "13.5px",
                          color: "var(--skin-text-muted, rgba(11, 42, 90, 0.93))",
                        }}
                      >
                        {group.empty}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </section>
          </div>
        )}
      </div>
    </GameShellV2>
  );
};

export default Matchmaking;
