import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Loader2 } from "lucide-react";
import GameShell from "@/components/game/GameShell";
import EventCard from "@/components/events/EventCard";
import CreateEventForm from "@/components/events/CreateEventForm";
import { useEvents } from "@/hooks/useEvents";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const EventsSpace = () => {
  const navigate = useNavigate();
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
      const key = event.location || "Other locations";
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(event);
      return acc;
    }, {});
  }, [filterMode, filteredEvents, events]);

  return (
    <GameShell>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <CalendarDays className="w-6 h-6 text-slate-700" />
              <h1 className="text-2xl font-bold text-slate-900">Events</h1>
            </div>
            <p className="text-slate-600">Gatherings and experiences</p>
          </div>

          {/* Create Event Button */}
          {isAuthenticated && (
            <CreateEventForm onSuccess={refetch} />
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
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
              <label htmlFor="events-filter" className="text-xs text-slate-500">
                Filter
              </label>
              <select
                id="events-filter"
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value as "all" | "location" | "community")}
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm"
              >
                <option value="all">All Events</option>
                <option value="location">By Location</option>
                <option value="community">By Community</option>
              </select>
            </div>
            {filterMode === "community" && (
              <div className="flex items-center gap-2">
                <label htmlFor="community-filter" className="text-xs text-slate-500">
                  Community
                </label>
                <select
                  id="community-filter"
                  value={selectedCommunity}
                  onChange={(e) => setSelectedCommunity(e.target.value)}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm"
                >
                  <option value="all">All Communities</option>
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
                    View page
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && events.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No Upcoming Events
            </h3>
            <p className="text-slate-600">
              {isAuthenticated
                ? "Be the first to create an event for the community!"
                : "Check back later for upcoming community events."}
            </p>
          </div>
        )}

        {/* Events Grid */}
        {!loading && !error && events.length > 0 && (
          <>
            {filterMode === "location" ? (
              <div className="space-y-6">
                {Object.entries(eventsByLocation).map(([location, grouped]) => (
                  <div key={location}>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">{location}</h3>
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
    </GameShell>
  );
};

export default EventsSpace;
