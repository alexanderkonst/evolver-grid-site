import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CalendarDays } from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";
import EventCard from "@/components/events/EventCard";
import { MASTERMIND_LIVE_SESSION_URL } from "@/data/mastermindSession";
import CreateEventForm from "@/components/events/CreateEventForm";
import { useEvents } from "@/hooks/useEvents";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import SkeletonCard from "@/components/ui/SkeletonCard";
import ErrorBoundary from "@/components/ErrorBoundary";

const EventsSpace = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { events, loading, error, refetch } = useEvents();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [filterMode, setFilterMode] = useState<"all" | "location" | "community">("all");
  const [selectedCommunity, setSelectedCommunity] = useState("all");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
  }, []);

  const communityOptions = useMemo(() => {
    const ids = new Set<string>();
    events.forEach((event) => {
      if (event.community_id) {
        ids.add(event.community_id);
      }
    });
    return Array.from(ids);
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (filterMode === "community" && selectedCommunity !== "all") {
      return events.filter((event) => event.community_id === selectedCommunity);
    }
    return events;
  }, [events, filterMode, selectedCommunity]);

  const eventsByLocation = useMemo(() => {
    if (filterMode !== "location") return {};
    return filteredEvents.reduce<Record<string, typeof events>>((acc, event) => {
      const key = event.location || t("eventsSpace.otherLocations");
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(event);
      return acc;
    }, {});
  }, [filterMode, filteredEvents, events, t]);

  return (
    <GameShellV2>
      <ErrorBoundary>
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <CalendarDays className="w-6 h-6 text-foreground" />
                <h1 className="text-2xl font-bold text-foreground">{t("eventsSpace.title")}</h1>
              </div>
              <p className="text-muted-foreground">{t("eventsSpace.subtitle")}</p>
            </div>

            {/* Create Event Button */}
            {isAuthenticated && (
              <CreateEventForm onSuccess={refetch} />
            )}
          </div>

          {/* The free Mastermind session: always here, so the Café is never empty (issue #215). */}
          <a
            href={MASTERMIND_LIVE_SESSION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-6 block rounded-xl border border-border bg-[var(--skin-card-fill,rgba(255,255,255,0.85))] p-5 shadow-[0_4px_16px_rgba(44,49,80,0.06)] transition-shadow hover:shadow-[0_12px_32px_rgba(132,96,234,0.22)]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {t("eventsSpace.mastermind.when")}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">{t("eventsSpace.mastermind.title")}</h2>
            <span className="mt-3 inline-block text-sm font-semibold text-foreground underline underline-offset-4">
              {t("eventsSpace.mastermind.cta")}
            </span>
          </a>

          {/* Loading State */}
          {loading && (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, idx) => (
                <SkeletonCard key={idx} className="h-48" />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Filters */}
          {!loading && !error && events.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="flex items-center gap-2">
                <label htmlFor="events-filter" className="text-xs text-muted-foreground">
                  {t("eventsSpace.filter")}
                </label>
                <select
                  id="events-filter"
                  value={filterMode}
                  onChange={(e) => setFilterMode(e.target.value as "all" | "location" | "community")}
                  className="rounded-md border border-border bg-[var(--skin-input-fill,#fff)] px-2 py-1 text-sm"
                >
                  <option value="all">{t("eventsSpace.filterAll")}</option>
                  <option value="location">{t("eventsSpace.filterByLocation")}</option>
                  <option value="community">{t("eventsSpace.filterByCommunity")}</option>
                </select>
              </div>
              {filterMode === "community" && (
                <div className="flex items-center gap-2">
                  <label htmlFor="community-filter" className="text-xs text-muted-foreground">
                    {t("eventsSpace.community")}
                  </label>
                  <select
                    id="community-filter"
                    value={selectedCommunity}
                    onChange={(e) => setSelectedCommunity(e.target.value)}
                    className="rounded-md border border-border bg-[var(--skin-input-fill,#fff)] px-2 py-1 text-sm"
                  >
                    <option value="all">{t("eventsSpace.allCommunities")}</option>
                    {communityOptions.map((communityId) => (
                      <option key={communityId} value={communityId}>
                        {communityId}
                      </option>
                    ))}
                  </select>
                  {selectedCommunity !== "all" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/events/community/${selectedCommunity}`)}
                    >
                      {t("eventsSpace.viewPage")}
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* No empty state: the Mastermind card above is the content when there are no other events,
              and the one «Create Event» button is the one in the header (issue #215). */}

          {/* Events Grid */}
          {!loading && !error && events.length > 0 && (
            <>
              {filterMode === "location" ? (
                <div className="space-y-6">
                  {Object.entries(eventsByLocation).map(([location, grouped]) => (
                    <div key={location}>
                      <h3 className="text-sm font-semibold text-foreground mb-3">{location}</h3>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {grouped.map((event) => (
                          <EventCard
                            key={event.id}
                            event={event}
                            onClick={() => navigate(`/events/${event.id}`)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {filteredEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onClick={() => navigate(`/events/${event.id}`)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </ErrorBoundary>
    </GameShellV2>
  );
};

export default EventsSpace;
