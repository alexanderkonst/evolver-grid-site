import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CalendarDays, Clock, Globe, Lock, MapPin, UserCheck, Users, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import AddToCalendarButton from "@/components/events/AddToCalendarButton";
import { useEvent, useEventRsvp } from "@/hooks/useEvents";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { awardXp } from "@/lib/xpSystem";
import { awardFirstTimeBonus, getFirstTimeActionLabel } from "@/lib/xpService";
import BackButton from "@/components/BackButton";

const formatDateTime = (dateStr: string, timeStr: string, timeZone: string) => {
  const dateTime = new Date(`${dateStr}T${timeStr}`);
  const date = dateTime.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone,
  });
  const time = dateTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone,
  });
  return { date, time };
};

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { event, attendees, loading, error, refetch } = useEvent(id);
  const {
    currentStatus,
    reminderEmail,
    wantsReminder,
    setReminderEmail,
    setWantsReminder,
    loading: rsvpLoading,
    updating,
    updateRsvp,
  } = useEventRsvp(id);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showOriginalTime, setShowOriginalTime] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
  }, []);

  const handleRsvp = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to RSVP to events",
        variant: "destructive",
      });
      return;
    }

    try {
      const previousStatus = currentStatus;
      await updateRsvp("going");
      refetch();
      toast({
        title: "RSVP confirmed",
        description: "You're attending this event.",
      });

      const wasAttending = previousStatus === "going" || previousStatus === "maybe";
      const isAttending = true;
      if (isAttending && !wasAttending) {
        const profileId = await getOrCreateGameProfileId();
        const xpResult = await awardXp(profileId, 25, "spirit");
        if (xpResult.success) {
          toast({
            title: "🎉 +25 XP (Spirit)",
            description: "Thanks for committing to your community.",
          });
          const bonusResult = await awardFirstTimeBonus(profileId, "first_event_rsvp", 25, 2, "spirit");
          if (bonusResult.awarded) {
            toast({
              title: "🎉 FIRST TIME BONUS!",
              description: `+${bonusResult.xp} XP for your first ${getFirstTimeActionLabel("first_event_rsvp")}!`,
            });
          }
        }
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update RSVP",
        variant: "destructive",
      });
    }
  };

  const handleSaveReminder = async () => {
    if (!event || !currentStatus) return;

    if (wantsReminder && !reminderEmail) {
      toast({
        title: "Email required",
        description: "Add an email address to receive reminders.",
        variant: "destructive",
      });
      return;
    }

    setSendingReminder(true);
    try {
      await updateRsvp(currentStatus, {
        email: reminderEmail,
        wantsReminder,
      });

      if (wantsReminder && reminderEmail) {
        await supabase.functions.invoke("send-rsvp-confirmation", {
          body: {
            email: reminderEmail,
            event: {
              title: event.title,
              description: event.description,
              date: event.event_date,
              time: event.event_time,
              location: event.location,
              timezone: event.timezone || "UTC",
            },
          },
        });
      }

      toast({
        title: "Reminder updated",
        description: wantsReminder ? "We'll send you a confirmation email." : "Reminder disabled.",
      });
      refetch();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save reminder settings.",
        variant: "destructive",
      });
    } finally {
      setSendingReminder(false);
    }
  };


  // Loading State
  if (loading) {
    return (
      <div className="min-h-dvh bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  // Error State
  if (error || !event) {
    return (
      <div className="min-h-dvh bg-white flex items-center justify-center">
        <div className="text-center p-6">
          <CalendarDays className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Event Not Found</h2>
          <p className="text-slate-600 mb-4">{error || "This event doesn't exist or has been removed."}</p>
          <BackButton to="/game/events" />
        </div>
      </div>
    );
  }

  const userTimezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const eventTimezone = event.timezone || "UTC";
  const localDateTime = useMemo(
    () => formatDateTime(event.event_date, event.event_time, userTimezone),
    [event.event_date, event.event_time, userTimezone]
  );
  const originalDateTime = useMemo(
    () => formatDateTime(event.event_date, event.event_time, eventTimezone),
    [event.event_date, event.event_time, eventTimezone]
  );

  const goingAttendees = attendees.filter((a) => a.status === "going");
  const goingCount = goingAttendees.length;
  const maxAvatars = 5;
  const extraCount = Math.max(0, goingCount - maxAvatars);
  const hasRsvp = currentStatus === "going";
  const visibility = event.visibility ?? "public";
  const visibilityConfig = {
    public: { label: "Public", icon: Globe, className: "bg-slate-100 text-slate-700" },
    community: { label: "Community", icon: Users, className: "bg-blue-50 text-blue-700" },
    private: { label: "Private", icon: Lock, className: "bg-slate-100 text-slate-700" },
    team: { label: "Team", icon: UserCheck, className: "bg-emerald-50 text-emerald-700" },
  } as const;
  const visibilityBadge = visibilityConfig[visibility as keyof typeof visibilityConfig];

  return (
    <div className="min-h-dvh bg-slate-50">
      {/* Hero Image */}
      <div className="h-48 sm:h-64 bg-amber-100 relative">
        {event.photo_url ? (
          <img
            src={event.photo_url}
            alt={event.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <CalendarDays className="w-16 h-16 text-amber-300" />
          </div>
        )}

        {/* Back Button */}
        <BackButton
          to="/game/events"
          className="absolute top-4 left-4 bg-white/80 hover:bg-white"
        />
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 -mt-8 relative z-above pb-12">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Title & RSVP */}
          <div className="p-6 border-b border-slate-100">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">{event.title}</h1>
            {visibilityBadge && (
              <div className="mb-4">
                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${visibilityBadge.className}`}>
                  <visibilityBadge.icon className="w-4 h-4" />
                  {visibilityBadge.label}
                </span>
              </div>
            )}

            {/* RSVP Button */}
            <Button
              onClick={handleRsvp}
              disabled={rsvpLoading || updating || !isAuthenticated || currentStatus === "going"}
              className={currentStatus === "going" ? "bg-emerald-500 hover:bg-emerald-500" : ""}
            >
              {currentStatus === "going" ? "Attending" : "RSVP"}
            </Button>
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
                <p className="font-medium text-slate-900">{localDateTime.date}</p>
                <p className="text-slate-600 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {localDateTime.time}
                  <span className="text-xs text-slate-500">Your time</span>
                </p>
                <button
                  type="button"
                  className="text-xs text-amber-600 hover:text-amber-700 mt-1"
                  onClick={() => setShowOriginalTime((prev) => !prev)}
                >
                  {showOriginalTime ? "Hide original time" : "Show original time"}
                </button>
                {showOriginalTime && (
                  <p className="text-xs text-slate-500 mt-1">
                    {originalDateTime.date} · {originalDateTime.time} ({eventTimezone})
                  </p>
                )}
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

            {/* RSVP Reminder */}
            {hasRsvp && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <p className="text-sm font-medium text-slate-700">Email reminder</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rsvp-email">Email address</Label>
                  <Input
                    id="rsvp-email"
                    type="email"
                    placeholder="you@example.com"
                    value={reminderEmail}
                    onChange={(e) => setReminderEmail(e.target.value)}
                    disabled={sendingReminder}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="rsvp-reminder"
                    checked={wantsReminder}
                    onCheckedChange={(checked) => setWantsReminder(Boolean(checked))}
                    disabled={sendingReminder}
                  />
                  <Label htmlFor="rsvp-reminder" className="text-sm text-slate-600">
                    Send me a reminder
                  </Label>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSaveReminder}
                  disabled={sendingReminder}
                >
                  {sendingReminder ? "Saving..." : "Save reminder"}
                </Button>
              </div>
            )}

            {/* Add to Calendar */}
            {hasRsvp && (
              <AddToCalendarButton
                title={event.title}
                description={event.description || ""}
                date={event.event_date}
                time={event.event_time}
                location={event.location || ""}
                timezone={event.timezone || "UTC"}
              />
            )}

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
                {goingAttendees.slice(0, maxAvatars).map((attendee, idx) => (
                    <div
                      key={attendee.user_id}
                      className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-white text-xs font-medium"
                      title={`User ${idx + 1}`}
                    >
                      {idx + 1}
                    </div>
                ))}
                {extraCount > 0 && (
                  <span className="text-xs text-slate-500 self-center">
                    +{extraCount} more
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
