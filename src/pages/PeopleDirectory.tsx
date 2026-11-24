import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MapPin, Search, Sparkles, Target, Users } from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";
import WriteButton from "@/components/game/WriteButton";
import { Button } from "@/components/ui/button";
import SkeletonCard from "@/components/ui/SkeletonCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { directoryProfilePath, matchesDirectoryQuery, residentDisplayName } from "@/lib/peopleDirectory";
import { MISSIONS } from "@/modules/mission-discovery/data/missions";
import { DESIRED_OUTCOMES } from "@/modules/mission-discovery/data/outcomes";
import { KEY_CHALLENGES } from "@/modules/mission-discovery/data/challenges";
import { FOCUS_AREAS } from "@/modules/mission-discovery/data/focusAreas";
import { PILLARS } from "@/modules/mission-discovery/data/pillars";

const PAGE_SIZE = 12;

type VisibilityLevel = "hidden" | "minimal" | "medium" | "full";

/** One row of public.list_directory_players(): already filtered to what this viewer may see. */
interface DirectoryProfileRow {
  user_id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  location: string | null;
  visibility: VisibilityLevel | null;
  show_location: boolean | null;
  show_mission: boolean | null;
  archetype: string | null;
  tagline: string | null;
  top_talent: string | null;
  can_write: boolean | null;
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
  profilePath: string;
  canWrite: boolean;
  topTalent: string | null;
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
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [people, setPeople] = useState<DirectoryPerson[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [query, setQuery] = useState("");

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
        // Spec A6: game_profiles is owner-readable only, so the directory reads through a narrow
        // SECURITY DEFINER function that applies each profile's audience (public / friends /
        // communities / hidden) for this viewer. Not in the generated types until it is deployed.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profileRows, error: profileError } = await (supabase as any).rpc(
          "list_directory_players"
        );

        if (profileError) {
          const missing =
            profileError.code === "PGRST202" ||
            profileError.code === "42883" ||
            /list_directory_players/.test(profileError.message || "");
          throw new Error(missing ? t("peopleDir.notAvailable") : profileError.message);
        }

        const usableProfiles = ((profileRows || []) as DirectoryProfileRow[]).filter(
          (row) => !!row.user_id
        );

        const userIds = usableProfiles.map((row) => row.user_id);
        if (userIds.length === 0) {
          if (isMounted) {
            setPeople([]);
            setLoading(false);
          }
          return;
        }

        const directoryPeople: DirectoryPerson[] = usableProfiles.map((row) => {
          const visibility = resolveVisibility(row.visibility);
          const name =
            residentDisplayName(row.username, row.first_name, row.last_name) ||
            t("peopleDir.fallbackName");

          return {
            userId: row.user_id,
            name,
            avatarUrl: row.avatar_url,
            location: row.location,
            visibility,
            showLocation: row.show_location ?? true,
            showMission: row.show_mission ?? true,
            profilePath: directoryProfilePath(row.username, row.user_id),
            canWrite: row.can_write ?? false,
            topTalent: row.top_talent || null,
            archetype: row.archetype || t("peopleDir.unknownArchetype"),
            tagline: row.tagline || null,
            mission: null,
          };
        });

        // Issue #438: the cards need only the RPC above. Paint them now; the mission lines and
        // mission filters fill in when the second read lands, instead of the whole grid waiting
        // on it behind a skeleton.
        if (!isMounted) return;
        setPeople(directoryPeople);
        setLoading(false);

        // A failed missions read leaves the cards as they are: never an error over a painted grid.
        try {
          // Use the email-free public view for cross-team reads
          const { data: missionRows } = await (supabase as any)
            .from("mission_participants_public")
            .select(
              "user_id, mission_id, mission_title, outcome_id, challenge_id, focus_area_id, pillar_id, created_at"
            )
            .in("user_id", userIds)
            .eq("share_consent", true)
            .order("created_at", { ascending: false });

          const missionByUser = new Map<string, MissionRow>();
          ((missionRows || []) as MissionRow[]).forEach((row) => {
            if (!missionByUser.has(row.user_id)) {
              missionByUser.set(row.user_id, row);
            }
          });

          if (isMounted && missionByUser.size > 0) {
            setPeople((prev) =>
              prev.map((person) => ({ ...person, mission: missionByUser.get(person.userId) ?? null }))
            );
          }
        } catch {
          // mission lines stay empty
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || t("peopleDir.loadError"));
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
      if (!matchesDirectoryQuery(person, query)) return false;

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
    query,
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
    query,
    pillarFilter,
    focusFilter,
    challengeFilter,
    outcomeFilter,
    missionFilter,
    locationFilter,
    archetypeFilter,
  ]);

  return (
    <GameShellV2>
      <div className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <div className="flex items-center gap-3 text-foreground">
              <Users className="w-6 h-6" />
              <h1 className="text-2xl sm:text-3xl font-semibold">{t("peopleDir.title")}</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {t("peopleDir.subtitle")}
            </p>
          </div>

          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("peopleDir.searchPlaceholder")}
              aria-label={t("peopleDir.searchPlaceholder")}
              className="pl-9"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            <Select value={pillarFilter} onValueChange={setPillarFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("peopleDir.filterPillar")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("peopleDir.allPillars")}</SelectItem>
                {PILLARS.map((pillar) => (
                  <SelectItem key={pillar.id} value={pillar.id}>
                    {pillar.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={focusFilter} onValueChange={setFocusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("peopleDir.filterFocus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("peopleDir.allFocusAreas")}</SelectItem>
                {focusOptions.map((focus) => (
                  <SelectItem key={focus.id} value={focus.id}>
                    {focus.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={challengeFilter} onValueChange={setChallengeFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("peopleDir.filterChallenge")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("peopleDir.allChallenges")}</SelectItem>
                {challengeOptions.map((challenge) => (
                  <SelectItem key={challenge.id} value={challenge.id}>
                    {challenge.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("peopleDir.filterOutcome")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("peopleDir.allOutcomes")}</SelectItem>
                {outcomeOptions.map((outcome) => (
                  <SelectItem key={outcome.id} value={outcome.id}>
                    {outcome.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={missionFilter} onValueChange={setMissionFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("peopleDir.filterMission")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("peopleDir.allMissions")}</SelectItem>
                {missionOptions.map((mission) => (
                  <SelectItem key={mission.id} value={mission.id}>
                    {mission.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("peopleDir.filterLocation")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("peopleDir.allLocations")}</SelectItem>
                {availableLocations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={archetypeFilter} onValueChange={setArchetypeFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("peopleDir.filterArchetype")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("peopleDir.allArchetypes")}</SelectItem>
                {availableArchetypes.map((archetype) => (
                  <SelectItem key={archetype} value={archetype}>
                    {archetype}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <SkeletonCard key={idx} className="h-40" />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              {error}
            </div>
          )}

          {!loading && !error && filteredPeople.length === 0 && (
            <div className="rounded-xl border border-border bg-[var(--skin-card-fill,rgba(255,255,255,0.85))] backdrop-blur-sm p-6 text-center text-sm text-muted-foreground">
              {t("peopleDir.emptyState")}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visiblePeople.map((person) => {
              const canShowMission =
                person.visibility !== "minimal" && person.showMission && !!person.mission;
              const canShowLocation =
                person.visibility !== "minimal" && person.showLocation && !!person.location;

              // Write only where the person's audience settings allow it (A6): the database says so.
              const canWrite = person.canWrite;

              // Day 91 (Sasha 2026-06-09): tokenized for Aurum — raw white/85
              // cards put cream muted-foreground text on white (invisible).
              return (
                <div
                  key={person.userId}
                  className="flex flex-col rounded-2xl border border-border bg-[var(--skin-card-fill,rgba(255,255,255,0.85))] backdrop-blur-sm p-4 shadow-[0_4px_16px_rgba(44,49,80,0.06)] transition hover:border-primary/40 hover:shadow-md"
                >
                <button
                  type="button"
                  onClick={() => navigate(person.profilePath)}
                  className="flex-1 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-muted overflow-hidden flex items-center justify-center">
                      {person.avatarUrl ? (
                        <img
                          src={person.avatarUrl}
                          alt={person.name}
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg";
                          }}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-muted-foreground">
                          {person.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-foreground truncate">{person.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">✦ {person.archetype} ✦</p>
                    </div>
                  </div>
                  {person.topTalent && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-foreground">
                      <Sparkles className="w-3 h-3" />
                      <span className="truncate">{person.topTalent}</span>
                    </div>
                  )}
                  {person.tagline && (
                    <p className="mt-3 text-sm text-muted-foreground italic line-clamp-2">
                      "{person.tagline}"
                    </p>
                  )}
                  <div className="mt-4 space-y-2 text-xs text-muted-foreground">
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
                {canWrite && (
                  <div className="mt-4">
                    <WriteButton recipientUserId={person.userId} size="sm" variant="outline" />
                  </div>
                )}
                </div>
              );
            })}
          </div>

          {!loading && filteredPeople.length > visibleCount && (
            <div className="flex justify-center mt-6">
              <Button variant="outline" onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}>
                {t("peopleDir.loadMore")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </GameShellV2>
  );
};

export default PeopleDirectory;
