import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CalendarDays, Loader2 } from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";
import EventCard from "@/components/events/EventCard";
import EmptyState from "@/components/ui/EmptyState";
import { useEvents } from "@/hooks/useEvents";
import BackButton from "@/components/BackButton";

const CommunityEvents = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();
  const { events, loading, error } = useEvents();

  const filteredEvents = useMemo(() => {
    if (!communityId) return [];
    return events.filter((event) => event.community_id === communityId);
  }, [communityId, events]);

  return (
    <GameShellV2>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <BackButton to="/game/events" className="mb-6" />

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <CalendarDays className="w-6 h-6 text-slate-700" />
            <h1 className="text-2xl font-bold text-slate-900">Community Events</h1>
          </div>
          <p className="text-slate-600">
            Community: {communityId}
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        )}

        {error && !loading && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && filteredEvents.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-8">
            <EmptyState
              icon={<CalendarDays className="w-6 h-6 text-slate-500" />}
              title="No events yet"
              description="Check back later for new community gatherings."
              action={{
                label: "Browse Events",
                onClick: () => navigate("/game/events"),
              }}
            />
          </div>
        )}

        {!loading && !error && filteredEvents.length > 0 && (
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
      </div>
    </GameShellV2>
  );
};

export default CommunityEvents;
