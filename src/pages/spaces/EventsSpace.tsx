import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Loader2 } from "lucide-react";
import GameShell from "@/components/game/GameShell";
import EventCard from "@/components/events/EventCard";
import CreateEventForm from "@/components/events/CreateEventForm";
import { useEvents } from "@/hooks/useEvents";
import { supabase } from "@/integrations/supabase/client";

const EventsSpace = () => {
  const navigate = useNavigate();
  const { events, loading, error, refetch } = useEvents();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
  }, []);

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
            <p className="text-slate-600">Community gatherings and experiences</p>
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
          <div className="grid gap-4 sm:grid-cols-2">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => navigate(`/events/${event.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </GameShell>
  );
};

export default EventsSpace;
