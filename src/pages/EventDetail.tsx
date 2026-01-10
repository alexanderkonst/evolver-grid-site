import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    CalendarDays,
    MapPin,
    Clock,
    Users,
    ArrowLeft,
    ExternalLink,
    Check,
    HelpCircle,
    X
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
}

interface RsvpStatus {
    status: "going" | "maybe" | "not_going" | null;
}

const EventDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [rsvpCount, setRsvpCount] = useState(0);
    const [userRsvp, setUserRsvp] = useState<RsvpStatus["status"]>(null);
    const [user, setUser] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            setLoading(true);

            // Get current user
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            setUser(currentUser);

            // Fetch event details
            const { data: eventData, error: eventError } = await supabase
                .from("events")
                .select("*")
                .eq("id", id)
                .single();

            if (eventError || !eventData) {
                console.error("Error loading event:", eventError);
                setLoading(false);
                return;
            }

            setEvent(eventData);

            // Fetch RSVP count (only "going")
            const { count } = await supabase
                .from("event_rsvps")
                .select("*", { count: "exact", head: true })
                .eq("event_id", id)
                .eq("status", "going");

            setRsvpCount(count || 0);

            // Fetch user's RSVP if logged in
            if (currentUser) {
                const { data: rsvpData } = await supabase
                    .from("event_rsvps")
                    .select("status")
                    .eq("event_id", id)
                    .eq("user_id", currentUser.id)
                    .maybeSingle();

                if (rsvpData) {
                    setUserRsvp(rsvpData.status as RsvpStatus["status"]);
                }
            }

            setLoading(false);
        };

        loadData();
    }, [id]);

    const handleRsvp = async (status: "going" | "maybe" | "not_going") => {
        if (!user) {
            navigate("/auth?return=" + encodeURIComponent(`/events/${id}`));
            return;
        }

        if (!event) return;

        setSubmitting(true);

        try {
            // Check if user already has an RSVP
            const { data: existing } = await supabase
                .from("event_rsvps")
                .select("id")
                .eq("event_id", event.id)
                .eq("user_id", user.id)
                .maybeSingle();

            if (existing) {
                // Update existing RSVP
                await supabase
                    .from("event_rsvps")
                    .update({ status })
                    .eq("id", existing.id);
            } else {
                // Create new RSVP
                await supabase
                    .from("event_rsvps")
                    .insert({
                        event_id: event.id,
                        user_id: user.id,
                        status
                    });
            }

            setUserRsvp(status);

            // Refresh count
            const { count } = await supabase
                .from("event_rsvps")
                .select("*", { count: "exact", head: true })
                .eq("event_id", event.id)
                .eq("status", "going");

            setRsvpCount(count || 0);

            toast({
                title: status === "going" ? "You're going!" : status === "maybe" ? "Marked as maybe" : "RSVP updated",
                description: status === "going" ? "See you there!" : undefined
            });
        } catch (error) {
            console.error("Error saving RSVP:", error);
            toast({
                title: "Error",
                description: "Failed to save your RSVP. Please try again.",
                variant: "destructive"
            });
        } finally {
            setSubmitting(false);
        }
    };

    const getGoogleCalendarUrl = () => {
        if (!event) return "#";

        const startDate = parseISO(`${event.event_date}T${event.event_time}`);
        const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Default 2 hour duration

        const formatForGoogle = (date: Date) =>
            date.toISOString().replace(/-|:|\.\d{3}/g, "");

        const params = new URLSearchParams({
            action: "TEMPLATE",
            text: event.title,
            dates: `${formatForGoogle(startDate)}/${formatForGoogle(endDate)}`,
            details: event.description || "",
            location: event.location || ""
        });

        return `https://calendar.google.com/calendar/render?${params.toString()}`;
    };

    const formatEventDate = (dateStr: string) => {
        try {
            return format(parseISO(dateStr), "EEEE, MMMM d, yyyy");
        } catch {
            return dateStr;
        }
    };

    const formatEventTime = (timeStr: string) => {
        try {
            const [hours, minutes] = timeStr.split(":");
            const date = new Date();
            date.setHours(parseInt(hours), parseInt(minutes));
            return format(date, "h:mm a");
        } catch {
            return timeStr;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <div className="max-w-2xl mx-auto p-6">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 w-32 bg-slate-200 rounded" />
                        <div className="aspect-video bg-slate-200 rounded-xl" />
                        <div className="h-8 bg-slate-200 rounded w-3/4" />
                        <div className="space-y-2">
                            <div className="h-4 bg-slate-200 rounded w-1/2" />
                            <div className="h-4 bg-slate-200 rounded w-1/3" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-slate-900 mb-2">Event not found</h2>
                    <p className="text-slate-600 mb-4">This event may have been removed.</p>
                    <Button asChild variant="outline">
                        <Link to="/game/events">Back to Events</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-2xl mx-auto p-6">
                {/* Back Button */}
                <Link
                    to="/game/events"
                    className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Events</span>
                </Link>

                {/* Event Photo */}
                <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden mb-6">
                    {event.photo_url ? (
                        <img
                            src={event.photo_url}
                            alt={event.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <CalendarDays className="w-16 h-16 text-slate-300" />
                        </div>
                    )}
                </div>

                {/* Event Title */}
                <h1 className="text-2xl font-bold text-slate-900 mb-4">{event.title}</h1>

                {/* Event Meta */}
                <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-slate-700">
                        <CalendarDays className="w-5 h-5 text-slate-400" />
                        <span>{formatEventDate(event.event_date)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-700">
                        <Clock className="w-5 h-5 text-slate-400" />
                        <span>{formatEventTime(event.event_time)}</span>
                    </div>
                    {event.location && (
                        <div className="flex items-center gap-3 text-slate-700">
                            <MapPin className="w-5 h-5 text-slate-400" />
                            <span>{event.location}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-3 text-slate-700">
                        <Users className="w-5 h-5 text-slate-400" />
                        <span>
                            {rsvpCount === 0
                                ? "Be the first to RSVP"
                                : rsvpCount === 1
                                    ? "1 person going"
                                    : `${rsvpCount} people going`}
                        </span>
                    </div>
                </div>

                {/* RSVP Buttons */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <Button
                        onClick={() => handleRsvp("going")}
                        disabled={submitting}
                        variant={userRsvp === "going" ? "default" : "outline"}
                        className={userRsvp === "going" ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                        <Check className="w-4 h-4 mr-2" />
                        {userRsvp === "going" ? "Going" : "I'm Going"}
                    </Button>
                    <Button
                        onClick={() => handleRsvp("maybe")}
                        disabled={submitting}
                        variant={userRsvp === "maybe" ? "default" : "outline"}
                        className={userRsvp === "maybe" ? "bg-amber-500 hover:bg-amber-600" : ""}
                    >
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Maybe
                    </Button>
                    <Button
                        onClick={() => handleRsvp("not_going")}
                        disabled={submitting}
                        variant={userRsvp === "not_going" ? "default" : "outline"}
                        className={userRsvp === "not_going" ? "bg-slate-500 hover:bg-slate-600" : ""}
                    >
                        <X className="w-4 h-4 mr-2" />
                        Can't Go
                    </Button>
                </div>

                {/* Add to Calendar */}
                <a
                    href={getGoogleCalendarUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-8 transition-colors"
                >
                    <CalendarDays className="w-4 h-4" />
                    <span>Add to Google Calendar</span>
                    <ExternalLink className="w-3 h-3" />
                </a>

                {/* Description */}
                {event.description && (
                    <div className="border-t border-slate-200 pt-6">
                        <h2 className="font-semibold text-slate-900 mb-3">About this event</h2>
                        <p className="text-slate-700 whitespace-pre-wrap">{event.description}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventDetail;
