import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock, MapPin, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import RsvpButton from "@/components/events/RsvpButton";
import { useEvent, useEventRsvp } from "@/hooks/useEvents";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { event, attendees, loading, error, refetch } = useEvent(id);
  const { currentStatus, loading: rsvpLoading, updating, updateRsvp, removeRsvp } = useEventRsvp(id);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
  }, []);

  const handleRsvp = async (status: "going" | "maybe" | "not_going") => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to RSVP to events",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateRsvp(status);
      refetch();
      toast({
        title: "RSVP updated",
        description: `You're ${status === "going" ? "going" : status === "maybe" ? "maybe going" : "not going"} to this event`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update RSVP",
        variant: "destructive",
      });
    }
  };

  const handleRemoveRsvp = async () => {
    try {
      await removeRsvp();
      refetch();
      toast({
        title: "RSVP removed",
        description: "Your RSVP has been removed",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to remove RSVP",
        variant: "destructive",
      });
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  // Error State
  if (error || !event) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-6">
          <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Event Not Found</h2>
          <p className="text-slate-600 mb-4">{error || "This event doesn't exist or has been removed."}</p>
          <Button variant="outline" onClick={() => navigate("/game/events")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  const goingCount = attendees.filter((a) => a.status === "going").length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Image */}
      <div className="h-48 sm:h-64 bg-gradient-to-br from-amber-100 to-orange-100 relative">
        {event.photo_url ? (
          <img
            src={event.photo_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <CalendarDays className="w-16 h-16 text-amber-300" />
          </div>
        )}

        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/game/events")}
          className="absolute top-4 left-4 bg-white/80 hover:bg-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 -mt-8 relative z-10 pb-12">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Title & RSVP */}
          <div className="p-6 border-b border-slate-100">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">{event.title}</h1>

            {/* RSVP Buttons */}
            <RsvpButton
              currentStatus={currentStatus}
              onRsvp={handleRsvp}
              onRemove={handleRemoveRsvp}
              loading={updating}
              disabled={rsvpLoading || !isAuthenticated}
            />
            {!isAuthenticated && (
              <p className="text-xs text-slate-500 mt-2">Sign in to RSVP</p>
            )}
          </div>

          {/* Details */}
          <div className="p-6 space-y-4">
            {/* Date & Time */}
            <div className="flex items-start gap-3">
              <CalendarDays className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900">{formatDate(event.event_date)}</p>
                <p className="text-slate-600 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatTime(event.event_time)}
                </p>
              </div>
            </div>

            {/* Location */}
            {event.location && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-500 mt-0.5" />
                <p className="text-slate-900">{event.location}</p>
              </div>
            )}

            {/* Attendees */}
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-amber-500 mt-0.5" />
              <p className="text-slate-900">
                {goingCount} {goingCount === 1 ? "person" : "people"} going
              </p>
            </div>

            {/* Description */}
            {event.description && (
              <div className="pt-4 border-t border-slate-100">
                <h3 className="font-medium text-slate-900 mb-2">About this event</h3>
                <p className="text-slate-600 whitespace-pre-wrap">{event.description}</p>
              </div>
            )}
          </div>

          {/* Attendees List */}
          {attendees.length > 0 && (
            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <h3 className="font-medium text-slate-900 mb-3">Who's coming</h3>
              <div className="flex flex-wrap gap-2">
                {attendees
                  .filter((a) => a.status === "going")
                  .map((attendee, idx) => (
                    <div
                      key={attendee.user_id}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white text-xs font-medium"
                      title={`User ${idx + 1}`}
                    >
                      {idx + 1}
                    </div>
                  ))}
                {attendees.filter((a) => a.status === "maybe").length > 0 && (
                  <span className="text-sm text-slate-500 self-center ml-2">
                    +{attendees.filter((a) => a.status === "maybe").length} maybe
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
