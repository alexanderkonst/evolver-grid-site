import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, MapPin, Target, Users } from "lucide-react";
import GameShell from "@/components/game/GameShell";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { AppleseedData } from "@/modules/zone-of-genius/appleseedGenerator";
import { MISSIONS } from "@/modules/mission-discovery/data/missions";
import { DESIRED_OUTCOMES } from "@/modules/mission-discovery/data/outcomes";
import { KEY_CHALLENGES } from "@/modules/mission-discovery/data/challenges";
import { FOCUS_AREAS } from "@/modules/mission-discovery/data/focusAreas";
import { PILLARS } from "@/modules/mission-discovery/data/pillars";

const PAGE_SIZE = 12;

type VisibilityLevel = "hidden" | "minimal" | "medium" | "full";

interface DirectoryProfileRow {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  location: string | null;
  visibility: VisibilityLevel | null;
  show_location: boolean | null;
  show_mission: boolean | null;
  show_offer: boolean | null;
  last_zog_snapshot_id: string | null;
}

interface MissionRow {
  user_id: string;
  mission_id: string;
  mission_title: string;
  outcome_id: string | null;
  challenge_id: string | null;
  focus_area_id: string | null;
  pillar_id: string | null;
  created_at: string;
}

interface DirectoryPerson {
  userId: string;
  name: string;
  avatarUrl: string | null;
  location: string | null;
  visibility: VisibilityLevel;
  showLocation: boolean;
  showMission: boolean;
  showOffer: boolean;
  archetype: string;
  tagline: string | null;
  mission: MissionRow | null;
}

const resolveVisibility = (value: string | null): VisibilityLevel => {
  if (value === "hidden" || value === "minimal" || value === "medium" || value === "full") {
    return value;
  }
  return "full";
};

const PeopleDirectory = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [people, setPeople] = useState<DirectoryPerson[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [pillarFilter, setPillarFilter] = useState<string>("all");
  const [focusFilter, setFocusFilter] = useState<string>("all");
  const [challengeFilter, setChallengeFilter] = useState<string>("all");
  const [outcomeFilter, setOutcomeFilter] = useState<string>("all");
  const [missionFilter, setMissionFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [archetypeFilter, setArchetypeFilter] = useState<string>("all");

  useEffect(() => {
    let isMounted = true;

    const loadDirectory = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: profileRows, error: profileError } = await supabase
          .from("game_profiles")
          .select(
            "user_id, first_name, last_name, avatar_url, location, visibility, show_location, show_mission, show_offer, last_zog_snapshot_id"
          )
          .neq("visibility", "hidden");

        if (profileError) throw profileError;

        const usableProfiles = (profileRows || []).filter(
          (row): row is DirectoryProfileRow => !!row.user_id
        );

        const userIds = usableProfiles.map((row) => row.user_id);
        if (userIds.length === 0) {
          if (isMounted) {
            setPeople([]);
            setLoading(false);
          }
          return;
        }

        const { data: missionRows } = await supabase
          .from("mission_participants")
          .select(
            "user_id, mission_id, mission_title, outcome_id, challenge_id, focus_area_id, pillar_id, created_at"
          )
          .in("user_id", userIds)
          .eq("share_consent", true)
          .order("created_at", { ascending: false });

        const missionByUser = new Map<string, MissionRow>();
        (missionRows || []).forEach((row) => {
          if (!missionByUser.has(row.user_id)) {
            missionByUser.set(row.user_id, row as MissionRow);
          }
        });

        const snapshotIds = usableProfiles
          .map((row) => row.last_zog_snapshot_id)
          .filter(Boolean) as string[];

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

        const directoryPeople = usableProfiles.map((row) => {
          const visibility = resolveVisibility(row.visibility);
          const appleseed = row.last_zog_snapshot_id
            ? snapshotMap.get(row.last_zog_snapshot_id)
            : null;
          const firstName = row.first_name || "";
          const lastName = row.last_name || "";
          const name = `${firstName} ${lastName}`.trim() || "Community Member";

          return {
            userId: row.user_id,
            name,
            avatarUrl: row.avatar_url,
            location: row.location,
            visibility,
            showLocation: row.show_location ?? true,
            showMission: row.show_mission ?? true,
            showOffer: row.show_offer ?? true,
            archetype: appleseed?.vibrationalKey?.name || "Unknown archetype",
            tagline: appleseed?.vibrationalKey?.tagline || null,
            mission: missionByUser.get(row.user_id) ?? null,
          };
        });

        if (isMounted) {
          setPeople(directoryPeople);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Unable to load directory.");
          setLoading(false);
        }
      }
    };

    loadDirectory();

    return () => {
      isMounted = false;
    };
  }, []);

  const availableLocations = useMemo(() => {
    const locations = new Set<string>();
    people.forEach((person) => {
      if (person.location && person.showLocation && person.visibility !== "minimal") {
        locations.add(person.location);
      }
    });
    return Array.from(locations).sort();
  }, [people]);

  const availableArchetypes = useMemo(() => {
    const archetypes = new Set<string>();
    people.forEach((person) => {
      if (person.archetype && person.visibility !== "hidden") {
        archetypes.add(person.archetype);
      }
    });
    return Array.from(archetypes).sort();
  }, [people]);

  const focusOptions = useMemo(() => {
    if (pillarFilter === "all") return FOCUS_AREAS;
    return FOCUS_AREAS.filter((area) => area.pillarId === pillarFilter);
  }, [pillarFilter]);

  const challengeOptions = useMemo(() => {
    if (focusFilter === "all") return KEY_CHALLENGES;
    return KEY_CHALLENGES.filter((challenge) => challenge.focusAreaId === focusFilter);
  }, [focusFilter]);

  const outcomeOptions = useMemo(() => {
    if (challengeFilter === "all") return DESIRED_OUTCOMES;
    return DESIRED_OUTCOMES.filter((outcome) => outcome.challengeId === challengeFilter);
  }, [challengeFilter]);

  const missionOptions = useMemo(() => {
    if (outcomeFilter === "all") return MISSIONS;
    return MISSIONS.filter((mission) => mission.outcomeId === outcomeFilter);
  }, [outcomeFilter]);

  const filteredPeople = useMemo(() => {
    return people.filter((person) => {
      if (person.visibility === "hidden") return false;

      const canShowMission =
        person.visibility !== "minimal" && person.showMission && !!person.mission;
      const canShowLocation =
        person.visibility !== "minimal" && person.showLocation && !!person.location;

      if (pillarFilter !== "all") {
        if (!canShowMission || person.mission?.pillar_id !== pillarFilter) return false;
      }
      if (focusFilter !== "all") {
        if (!canShowMission || person.mission?.focus_area_id !== focusFilter) return false;
      }
      if (challengeFilter !== "all") {
        if (!canShowMission || person.mission?.challenge_id !== challengeFilter) return false;
      }
      if (outcomeFilter !== "all") {
        if (!canShowMission || person.mission?.outcome_id !== outcomeFilter) return false;
      }
      if (missionFilter !== "all") {
        if (!canShowMission || person.mission?.mission_id !== missionFilter) return false;
      }
      if (locationFilter !== "all") {
        if (!canShowLocation || person.location !== locationFilter) return false;
      }
      if (archetypeFilter !== "all") {
        if (person.archetype !== archetypeFilter) return false;
      }

      return true;
    });
  }, [
    people,
    pillarFilter,
    focusFilter,
    challengeFilter,
    outcomeFilter,
    missionFilter,
    locationFilter,
    archetypeFilter,
  ]);

  const visiblePeople = filteredPeople.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [
    pillarFilter,
    focusFilter,
    challengeFilter,
    outcomeFilter,
    missionFilter,
    locationFilter,
    archetypeFilter,
  ]);

  return (
    <GameShell>
      <div className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <div className="flex items-center gap-3 text-slate-900">
              <Users className="w-6 h-6" />
              <h1 className="text-2xl sm:text-3xl font-semibold">People Directory</h1>
            </div>
            <p className="text-sm text-slate-500 mt-2">
              Find people who share your mission, focus, and location.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            <Select value={pillarFilter} onValueChange={setPillarFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pillar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All pillars</SelectItem>
                {PILLARS.map((pillar) => (
                  <SelectItem key={pillar.id} value={pillar.id}>
                    {pillar.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={focusFilter} onValueChange={setFocusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Focus Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All focus areas</SelectItem>
                {focusOptions.map((focus) => (
                  <SelectItem key={focus.id} value={focus.id}>
                    {focus.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={challengeFilter} onValueChange={setChallengeFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Challenge" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All challenges</SelectItem>
                {challengeOptions.map((challenge) => (
                  <SelectItem key={challenge.id} value={challenge.id}>
                    {challenge.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Outcome" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All outcomes</SelectItem>
                {outcomeOptions.map((outcome) => (
                  <SelectItem key={outcome.id} value={outcome.id}>
                    {outcome.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={missionFilter} onValueChange={setMissionFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Mission" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All missions</SelectItem>
                {missionOptions.map((mission) => (
                  <SelectItem key={mission.id} value={mission.id}>
                    {mission.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All locations</SelectItem>
                {availableLocations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={archetypeFilter} onValueChange={setArchetypeFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Archetype" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All archetypes</SelectItem>
                {availableArchetypes.map((archetype) => (
                  <SelectItem key={archetype} value={archetype}>
                    {archetype}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              {error}
            </div>
          )}

          {!loading && !error && filteredPeople.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
              No profiles match these filters yet.
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visiblePeople.map((person) => {
              const canShowMission =
                person.visibility !== "minimal" && person.showMission && !!person.mission;
              const canShowLocation =
                person.visibility !== "minimal" && person.showLocation && !!person.location;

              return (
                <button
                  key={person.userId}
                  onClick={() => navigate(`/profile/${person.userId}`)}
                  className="text-left rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-amber-200 hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center">
                      {person.avatarUrl ? (
                        <img
                          src={person.avatarUrl}
                          alt={person.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-slate-500">
                          {person.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-slate-900 truncate">{person.name}</h3>
                      <p className="text-sm text-slate-500 truncate">✦ {person.archetype} ✦</p>
                    </div>
                  </div>
                  {person.tagline && (
                    <p className="mt-3 text-sm text-slate-600 italic line-clamp-2">
                      "{person.tagline}"
                    </p>
                  )}
                  <div className="mt-4 space-y-2 text-xs text-slate-500">
                    {canShowLocation && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{person.location}</span>
                      </div>
                    )}
                    {canShowMission && (
                      <div className="flex items-center gap-2">
                        <Target className="w-3 h-3" />
                        <span className="truncate">{person.mission?.mission_title}</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {!loading && filteredPeople.length > visibleCount && (
            <div className="flex justify-center mt-6">
              <Button variant="outline" onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}>
                Load more
              </Button>
            </div>
          )}
        </div>
      </div>
    </GameShell>
  );
};

export default PeopleDirectory;
