import { useEffect, useMemo, useState } from "react";
import { MapPin, Users, Languages } from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import EmptyState from "@/components/ui/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { AppleseedData } from "@/modules/zone-of-genius/appleseedGenerator";
import { areComplementary, getComplementarityLabel } from "@/lib/archetypeMatching";

interface MatchCandidate {
  id: string;
  name: string;
  archetype: string;
  tagline?: string | null;
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

  const Skeleton = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-slate-200 rounded ${className || ""}`} />
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
        .select("user_id, first_name, last_name, location, show_location, spoken_languages, last_zog_snapshot_id, visibility")
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
        const { data: participantRows } = await supabase
          .from("mission_participants")
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

  const hasAnyMatches =
    filteredGroups.similarGenius.length > 0 ||
    filteredGroups.complementaryGenius.length > 0 ||
    filteredGroups.similarMission.length > 0;

  const renderMatch = (match: MatchCandidate) => (
    <div key={match.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-[#2c3150]">{match.name}</h3>
          <p className="text-sm text-[rgba(44,49,80,0.7)]">✦ {match.archetype} ✦</p>
          {match.tagline && (
            <p className="text-xs text-slate-500 mt-1 italic">"{match.tagline}"</p>
          )}
        </div>
        <Badge variant="secondary">{match.similarityScore}% match</Badge>
      </div>
      <p className="text-sm text-[rgba(44,49,80,0.7)] mt-3">{match.matchReason}</p>
    </div>
  );

  return (
    <GameShellV2>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        {/* Epic Header */}
        <div className="relative overflow-hidden rounded-3xl mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-[#6d28d9] via-[#7c3aed] to-[#a78bfa]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.2)_0%,transparent_60%)]" />
          <div className="relative px-6 py-10 sm:px-10 sm:py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-white mb-2"
              style={{ textShadow: "0 0 40px rgba(255,255,255,0.3)" }}>
              Your Genius Matches
            </h1>
            <p className="text-white/70 max-w-md mx-auto">
              People in the network whose Zone of Genius complements yours
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-6">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-slate-500" />
              <div>
                <p className="text-sm font-medium text-[#2c3150]">Same location</p>
                <p className="text-xs text-slate-500">
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
              <Languages className="w-4 h-4 text-slate-500" />
              <div>
                <p className="text-sm font-medium text-[#2c3150]">Same language</p>
                <p className="text-xs text-slate-500">
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

        {loading && (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={idx} className="h-32 w-full" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && (locationBlocked || languageBlocked) && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-6 text-sm text-amber-800">
            {locationBlocked && "Add your location in your profile to use the location filter. "}
            {languageBlocked && "Add spoken languages in your profile to use the language filter."}
          </div>
        )}

        {!loading && !error && !hasAnyMatches && (
          <div className="rounded-xl border border-slate-200 bg-white p-8">
            <EmptyState
              icon={<Users className="w-6 h-6 text-slate-500" />}
              title="No matches yet"
              description="Complete your Zone of Genius to find your people."
            />
          </div>
        )}

        {!loading && !error && hasAnyMatches && (
          <div className="space-y-8">
            <section>
              <div className="mb-3">
                <h2 className="text-lg font-semibold text-[#2c3150]">Similar Genius</h2>
                <p className="text-sm text-slate-500">People who think and operate like you.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {filteredGroups.similarGenius.map(renderMatch)}
                {filteredGroups.similarGenius.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                    No similar genius matches yet.
                  </div>
                )}
              </div>
            </section>

            <section>
              <div className="mb-3">
                <h2 className="text-lg font-semibold text-[#2c3150]">Complementary Genius</h2>
                <p className="text-sm text-slate-500">Great co-founder or collaborator fit.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {filteredGroups.complementaryGenius.map(renderMatch)}
                {filteredGroups.complementaryGenius.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                    No complementary matches yet.
                  </div>
                )}
              </div>
            </section>

            <section>
              <div className="mb-3">
                <h2 className="text-lg font-semibold text-[#2c3150]">Similar Mission</h2>
                <p className="text-sm text-slate-500">People aligned with your current mission.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {filteredGroups.similarMission.map(renderMatch)}
                {filteredGroups.similarMission.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                    No mission matches yet.
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </GameShellV2>
  );
};

export default Matchmaking;
