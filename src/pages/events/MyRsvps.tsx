import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Loader2 } from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";
import EventCard from "@/components/events/EventCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface RsvpWithEvent {
  status: string | null;
  events: {
    id: string;
    title: string;
    description: string | null;
    event_date: string;
    event_time: string;
    location: string | null;
    photo_url: string | null;
    timezone: string | null;
  } | null;
}

const MyRsvps = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rsvps, setRsvps] = useState<RsvpWithEvent[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadRsvps = async () => {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUserId(null);
        setLoading(false);
        return;
      }
      setUserId(user.id);

      try {
        const { data, error: fetchError } = await supabase
          .from("event_rsvps")
          .select("status, events(*)")
          .eq("user_id", user.id);

        if (fetchError) throw fetchError;

        const rows = (data || []) as RsvpWithEvent[];
        const eventsWithCounts = await Promise.all(
          rows.map(async (row) => {
            if (!row.events) {
              return { ...row, rsvp_count: 0 };
            }
            const { count } = await supabase
              .from("event_rsvps")
              .select("*", { count: "exact", head: true })
              .eq("event_id", row.events.id)
              .eq("status", "going");
            return { ...row, rsvp_count: count || 0 };
          })
        );

        setRsvps(eventsWithCounts);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load RSVPs.");
      } finally {
        setLoading(false);
      }
    };

    loadRsvps();
  }, []);

  const displayRsvps = useMemo(
    () => rsvps.filter((row) => row.events),
    [rsvps]
  );

  if (!loading && !userId) {
    return (
      <GameShellV2>
        <div className="p-6 lg:p-8 max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-semibold text-slate-900 mb-3">Sign in to view RSVPs</h1>
          <Button onClick={() => navigate("/auth")}>Sign in</Button>
        </div>
      </GameShellV2>
    );
  }

  return (
    <GameShellV2>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <CalendarDays className="w-6 h-6 text-slate-700" />
            <h1 className="text-2xl font-bold text-slate-900">My RSVPs</h1>
          </div>
          <p className="text-slate-600">Events you have RSVP’d to.</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && displayRsvps.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <CalendarDays className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-slate-900 mb-2">No RSVPs yet</h2>
            <p className="text-slate-600 mb-4">Browse events and join one to see it here.</p>
            <Button onClick={() => navigate("/game/events")}>Browse Events</Button>
          </div>
        )}

        {!loading && !error && displayRsvps.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {displayRsvps.map((row) => {
              if (!row.events) return null;
              return (
                <div key={row.events.id} className="space-y-2">
                  <EventCard
                    event={{
                      ...row.events,
                      rsvp_count: (row as any).rsvp_count ?? 0,
                    }}
                    onClick={() => navigate(`/events/${row.events?.id}`)}
                  />
                  <p className="text-xs text-slate-500">
                    RSVP status: <span className="font-medium text-slate-700">{row.status || "going"}</span>
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </GameShellV2>
  );
};

export default MyRsvps;
