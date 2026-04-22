import { useEffect, useMemo, useState } from "react";
import { MapPin, Users, Languages, Boxes } from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import EmptyState from "@/components/ui/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { AppleseedData } from "@/modules/zone-of-genius/appleseedGenerator";
import { areComplementary, getComplementarityLabel } from "@/lib/archetypeMatching";
import MatchCard from "@/components/matchmaking/MatchCard";

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

  const Skeleton = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-white/10 rounded-xl ${className || ""}`} />
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

  const handleAiConnect = () => {
    // For now just advance to next profile
    if (clampedIndex < visibleAiMatches.length - 1) {
      setCurrentAiMatchIndex(clampedIndex + 1);
    }
  };

  const renderMatch = (match: MatchCandidate) => (
    <div key={match.id} className="rounded-2xl liquid-glass ring-1 ring-white/10 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-white/5 flex items-center justify-center ring-1 ring-white/10 flex-shrink-0">
            {match.avatarUrl ? (
              <img src={match.avatarUrl} alt={match.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm text-white/30">{match.name.charAt(0)}</span>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{match.name}</h3>
            <p className="text-xs text-white/40">{stripSymbols(match.archetype)}</p>
          </div>
        </div>
        <Badge className="bg-white/5 text-white/40 ring-1 ring-white/10 text-[10px]">
          {match.similarityScore}%
        </Badge>
      </div>
      {match.matchReason && (
        <p className="text-xs text-white/40 mt-2">{match.matchReason}</p>
      )}
    </div>
  );

  return (
    <GameShellV2>
      <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-8">

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl liquid-glass ring-1 ring-red-500/20 p-6 text-center">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Filter warnings */}
        {!loading && !error && (locationBlocked || languageBlocked) && (
          <div className="rounded-xl liquid-glass ring-1 ring-amber-500/20 p-4 text-sm text-amber-200">
            {locationBlocked && "Add your location in your profile to use the location filter. "}
            {languageBlocked && "Add spoken languages in your profile to use the language filter."}
          </div>
        )}

        {/* No matches */}
        {!loading && !error && !hasAnyMatches && (
          <div className="rounded-xl liquid-glass ring-1 ring-white/10 p-8">
            <EmptyState
              icon={<Users className="w-6 h-6 text-white/30" />}
              title="No matches yet"
              description="Complete your Zone of Genius to find your people."
            />
          </div>
        )}

        {!loading && !error && hasAnyMatches && (
          <>
            {/* ═════════════════════════════════════════
                SECTION 1: AI-POWERED MATCHES (TOP)
                Tinder-style: one profile at a time
                ═════════════════════════════════════════ */}
            <section>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Boxes className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-white">AI-Powered Matches</h2>
                </div>
                <p className="text-sm text-white/40">Win-win collaboration proposals powered by your full profile.</p>
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
                  connectLabel="Add Connection"
                  onPass={handleAiPass}
                  onConnect={handleAiConnect}
                  currentIndex={clampedIndex}
                  totalCount={visibleAiMatches.length}
                  onPrev={() => setCurrentAiMatchIndex(Math.max(0, clampedIndex - 1))}
                  onNext={() => setCurrentAiMatchIndex(Math.min(visibleAiMatches.length - 1, clampedIndex + 1))}
                />
              ) : (
                <div className="rounded-xl liquid-glass ring-1 ring-white/10 p-6 text-sm text-white/40 text-center">
                  {assetMatches.length > 0
                    ? "You've reviewed all AI matches. New ones will appear as more people join."
                    : "Complete your Zone of Genius and map your assets to unlock AI-powered matching."}
                </div>
              )}
            </section>

            {/* ═════════════════════════════════════════
                SECTION 2: GENIUS MATCHES (BOTTOM)
                Category-based list view
                ═════════════════════════════════════════ */}
            <section>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-white">Your Genius Matches</h2>
                </div>
                <p className="text-sm text-white/40">People in the network whose Zone of Genius complements yours.</p>
              </div>

              {/* Filters */}
              <div className="rounded-xl liquid-glass ring-1 ring-white/10 p-4 mb-6">
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-white/30" />
                    <div>
                      <p className="text-sm font-medium text-white/70">Same location</p>
                      <p className="text-xs text-white/30">
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
                    <Languages className="w-4 h-4 text-white/30" />
                    <div>
                      <p className="text-sm font-medium text-white/70">Same language</p>
                      <p className="text-xs text-white/30">
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

              {/* Similar Genius */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-white/60 mb-2">Similar Genius</h3>
                <p className="text-xs text-white/30 mb-3">People who think and operate like you.</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {filteredGroups.similarGenius.map(renderMatch)}
                  {filteredGroups.similarGenius.length === 0 && (
                    <div className="rounded-xl liquid-glass ring-1 ring-white/5 p-4 text-sm text-white/30">
                      No similar genius matches yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Complementary Genius */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-white/60 mb-2">Complementary Genius</h3>
                <p className="text-xs text-white/30 mb-3">Great co-founder or collaborator fit.</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {filteredGroups.complementaryGenius.map(renderMatch)}
                  {filteredGroups.complementaryGenius.length === 0 && (
                    <div className="rounded-xl liquid-glass ring-1 ring-white/5 p-4 text-sm text-white/30">
                      No complementary matches yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Similar Mission */}
              <div>
                <h3 className="text-sm font-semibold text-white/60 mb-2">Similar Mission</h3>
                <p className="text-xs text-white/30 mb-3">People aligned with your current mission.</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {filteredGroups.similarMission.map(renderMatch)}
                  {filteredGroups.similarMission.length === 0 && (
                    <div className="rounded-xl liquid-glass ring-1 ring-white/5 p-4 text-sm text-white/30">
                      No mission matches yet.
                    </div>
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </GameShellV2>
  );
};

export default Matchmaking;
