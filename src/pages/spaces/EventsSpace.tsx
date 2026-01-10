import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, MapPin, Clock, Users, ArrowRight } from "lucide-react";
import { format, parseISO, isAfter, startOfToday } from "date-fns";
import GameShell from "@/components/game/GameShell";
import { supabase } from "@/integrations/supabase/client";

interface Event {
    id: string;
    title: string;
    description: string | null;
    photo_url: string | null;
    event_date: string;
    event_time: string;
    location: string | null;
    created_by: string | null;
    created_at: string;
    rsvp_count?: number;
}

const EventsSpace = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadEvents = async () => {
            setLoading(true);

            // Fetch events with RSVP counts
            const { data: eventsData, error } = await supabase
                .from("events")
                .select(`
                    id,
                    title,
                    description,
                    photo_url,
                    event_date,
                    event_time,
                    location,
                    created_by,
                    created_at
                `)
                .gte("event_date", startOfToday().toISOString().split("T")[0])
                .order("event_date", { ascending: true })
                .order("event_time", { ascending: true });

            if (error) {
                console.error("Error loading events:", error);
                setLoading(false);
                return;
            }

            // Fetch RSVP counts for each event
            const eventsWithCounts = await Promise.all(
                (eventsData || []).map(async (event) => {
                    const { count } = await supabase
                        .from("event_rsvps")
                        .select("*", { count: "exact", head: true })
                        .eq("event_id", event.id)
                        .eq("status", "going");

                    return {
                        ...event,
                        rsvp_count: count || 0
                    };
                })
            );

            setEvents(eventsWithCounts);
            setLoading(false);
        };

        loadEvents();
    }, []);

    const formatEventDate = (dateStr: string) => {
        try {
            return format(parseISO(dateStr), "EEE, MMM d, yyyy");
        } catch {
            return dateStr;
        }
    };

    const formatEventTime = (timeStr: string) => {
        try {
            // Parse time string like "14:30:00" to display as "2:30 PM"
            const [hours, minutes] = timeStr.split(":");
            const date = new Date();
            date.setHours(parseInt(hours), parseInt(minutes));
            return format(date, "h:mm a");
        } catch {
            return timeStr;
        }
    };

    return (
        <GameShell>
            <div className="p-6 lg:p-8 max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <CalendarDays className="w-6 h-6 text-slate-700" />
                        <h1 className="text-2xl font-bold text-slate-900">Events</h1>
                    </div>
                    <p className="text-slate-600">Community gatherings and experiences</p>
                </div>

                {/* Events List */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="rounded-xl border border-slate-200 bg-white p-5 animate-pulse"
                            >
                                <div className="flex gap-4">
                                    <div className="w-24 h-24 bg-slate-200 rounded-lg shrink-0" />
                                    <div className="flex-1 space-y-3">
                                        <div className="h-5 bg-slate-200 rounded w-2/3" />
                                        <div className="h-4 bg-slate-200 rounded w-1/2" />
                                        <div className="h-4 bg-slate-200 rounded w-1/3" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : events.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
                        <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            No upcoming events
                        </h3>
                        <p className="text-slate-600">
                            Check back soon for community gatherings and experiences.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {events.map((event) => (
                            <Link
                                key={event.id}
                                to={`/events/${event.id}`}
                                className="block rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 hover:shadow-sm transition-all"
                            >
                                <div className="flex gap-4">
                                    {/* Event Photo */}
                                    <div className="w-24 h-24 bg-slate-100 rounded-lg shrink-0 overflow-hidden">
                                        {event.photo_url ? (
                                            <img
                                                src={event.photo_url}
                                                alt={event.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <CalendarDays className="w-8 h-8 text-slate-300" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Event Details */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-slate-900 mb-2 truncate">
                                            {event.title}
                                        </h3>

                                        <div className="space-y-1 text-sm text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <CalendarDays className="w-4 h-4 text-slate-400" />
                                                <span>{formatEventDate(event.event_date)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-slate-400" />
                                                <span>{formatEventTime(event.event_time)}</span>
                                            </div>
                                            {event.location && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-slate-400" />
                                                    <span className="truncate">{event.location}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* RSVP Count & Arrow */}
                                    <div className="flex flex-col items-end justify-between shrink-0">
                                        {event.rsvp_count !== undefined && event.rsvp_count > 0 && (
                                            <div className="flex items-center gap-1 text-sm text-slate-500">
                                                <Users className="w-4 h-4" />
                                                <span>{event.rsvp_count}</span>
                                            </div>
                                        )}
                                        <ArrowRight className="w-5 h-5 text-slate-400" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </GameShell>
    );
};

export default EventsSpace;
