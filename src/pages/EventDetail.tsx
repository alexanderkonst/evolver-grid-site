import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { CalendarDays, Clock, Globe, Lock, MapPin, UserCheck, Users, Mail } from "lucide-react";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
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
import { formatDate } from "@/i18n/format";

const formatDateTime = (dateStr: string, timeStr: string, timeZone: string) => {
  const dateTime = new Date(`${dateStr}T${timeStr}`);
  const date = formatDate(dateTime, {
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
  const { t } = useTranslation();
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
        title: t('eventDetail.toastSignInRequiredTitle'),
        description: t('eventDetail.toastSignInRequiredDesc'),
        variant: "destructive",
      });
      return;
    }

    try {
      const previousStatus = currentStatus;
      await updateRsvp("going");
      refetch();
      toast({
        title: t('eventDetail.toastRsvpConfirmedTitle'),
        description: t('eventDetail.toastRsvpConfirmedDesc'),
      });

      const wasAttending = previousStatus === "going" || previousStatus === "maybe";
      const isAttending = true;
      if (isAttending && !wasAttending) {
        const profileId = await getOrCreateGameProfileId();
        const xpResult = await awardXp(profileId, 25, "spirit");
        if (xpResult.success) {
          toast({
            title: t('eventDetail.toastXpTitle'),
            description: t('eventDetail.toastXpDesc'),
          });
          const bonusResult = await awardFirstTimeBonus(profileId, "first_event_rsvp", 25, 2, "spirit");
          if (bonusResult.awarded) {
            toast({
              title: t('eventDetail.toastFirstTimeBonusTitle'),
              description: t('eventDetail.toastFirstTimeBonusDesc', { xp: bonusResult.xp, action: getFirstTimeActionLabel("first_event_rsvp") }),
            });
          }
        }
      }
    } catch (err) {
      toast({
        title: t('eventDetail.toastErrorTitle'),
        description: t('eventDetail.toastRsvpFailedDesc'),
        variant: "destructive",
      });
    }
  };

  const handleSaveReminder = async () => {
    if (!event || !currentStatus) return;

    if (wantsReminder && !reminderEmail) {
      toast({
        title: t('eventDetail.toastEmailRequiredTitle'),
        description: t('eventDetail.toastEmailRequiredDesc'),
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
        title: t('eventDetail.toastReminderUpdatedTitle'),
        description: wantsReminder ? t('eventDetail.toastReminderEnabledDesc') : t('eventDetail.toastReminderDisabledDesc'),
      });
      refetch();
    } catch (err) {
      toast({
        title: t('eventDetail.toastErrorTitle'),
        description: t('eventDetail.toastReminderFailedDesc'),
        variant: "destructive",
      });
    } finally {
      setSendingReminder(false);
    }
  };


  // Day 91 (Sasha 2026-06-09): tokenized for Aurum — loading/error washes,
  // hero fallback band, and the main content card now read skin tokens with
  // the exact original literals as fallbacks (lapis pixel-identical). The
  // card going dark under dark skins is what makes the cream --foreground
  // text inside it legible again.
  // Loading State
  if (loading) {
    return (
      <div className="min-h-dvh bg-[var(--skin-page-bg,#fff)] flex items-center justify-center">
        <PremiumLoader size="lg" />
      </div>
    );
  }

  // Error State
  if (error || !event) {
    return (
      <div className="min-h-dvh bg-[var(--skin-page-bg,#fff)] flex items-center justify-center">
        <div className="text-center p-6">
          <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">{t('eventDetail.notFoundTitle')}</h2>
          <p className="text-muted-foreground mb-4">{error || t('eventDetail.notFoundDesc')}</p>
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
    public: { labelKey: "eventDetail.visibilityPublic", icon: Globe, className: "bg-muted text-foreground" },
    community: { labelKey: "eventDetail.visibilityCommunity", icon: Users, className: "bg-primary/10 text-primary" },
    private: { labelKey: "eventDetail.visibilityPrivate", icon: Lock, className: "bg-muted text-foreground" },
    team: { labelKey: "eventDetail.visibilityTeam", icon: UserCheck, className: "bg-muted/40 text-foreground" },
  } as const;
  const visibilityBadge = visibilityConfig[visibility as keyof typeof visibilityConfig];

  return (
    <div className="min-h-dvh bg-background">
      {/* Hero Image */}
      <div className="h-48 sm:h-64 bg-[var(--skin-card-fill,#fef3c7)] relative">
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
          className="absolute top-4 left-4 bg-card/80 hover:bg-[var(--skin-card-fill,#fff)]"
        />
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 -mt-8 relative z-above pb-12">
        <div className="bg-[var(--skin-card-fill,rgba(255,255,255,0.85))] backdrop-blur-sm rounded-xl shadow-[0_4px_16px_rgba(44,49,80,0.06)] border border-border overflow-hidden">
          {/* Title & RSVP */}
          <div className="p-6 border-b border-border/10">"
            <h1 className="text-2xl font-bold text-foreground mb-4">{event.title}</h1>
            {visibilityBadge && (
              <div className="mb-4">
                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${visibilityBadge.className}`}>
                  <visibilityBadge.icon className="w-4 h-4" />
                  {t(visibilityBadge.labelKey)}
                </span>
              </div>
            )}

            {/* RSVP Button */}
            <Button
              onClick={handleRsvp}
              disabled={rsvpLoading || updating || !isAuthenticated || currentStatus === "going"}
              className={currentStatus === "going" ? "bg-emerald-500 hover:bg-emerald-500" : ""}
            >
              {currentStatus === "going" ? t('eventDetail.rsvpButtonAttending') : t('eventDetail.rsvpButtonDefault')}
            </Button>
            {!isAuthenticated && (
              <p className="text-xs text-muted-foreground mt-2">{t('eventDetail.signInToRsvp')}</p>
            )}
          </div>

          {/* Details */}
          <div className="p-6 space-y-4">
            {/* Date & Time */}
            <div className="flex items-start gap-3">
              <CalendarDays className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">{localDateTime.date}</p>
                <p className="text-muted-foreground flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {localDateTime.time}
                  <span className="text-xs text-muted-foreground">{t('eventDetail.yourTime')}</span>
                </p>
                <button
                  type="button"
                  className="text-xs text-amber-600 hover:text-amber-700 mt-1"
                  onClick={() => setShowOriginalTime((prev) => !prev)}
                >
                  {showOriginalTime ? t('eventDetail.hideOriginalTime') : t('eventDetail.showOriginalTime')}
                </button>
                {showOriginalTime && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {originalDateTime.date} · {originalDateTime.time} ({eventTimezone})
                  </p>
                )}
              </div>
            </div>

            {/* Location */}
            {event.location && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-500 mt-0.5" />
                <p className="text-foreground">{event.location}</p>
              </div>
            )}

            {/* Attendees */}
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-amber-500 mt-0.5" />
              <p className="text-foreground">
                {t('eventDetail.attendeesGoing', { count: goingCount })}
              </p>
            </div>

            {/* RSVP Reminder */}
            {hasRsvp && (
              <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">{t('eventDetail.emailReminderHeading')}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rsvp-email">{t('eventDetail.emailAddressLabel')}</Label>
                  <Input
                    id="rsvp-email"
                    type="email"
                    placeholder={t('eventDetail.emailPlaceholder')}
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
                  <Label htmlFor="rsvp-reminder" className="text-sm text-muted-foreground">
                    {t('eventDetail.sendMeReminder')}
                  </Label>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSaveReminder}
                  disabled={sendingReminder}
                >
                  {sendingReminder ? t('eventDetail.savingReminder') : t('eventDetail.saveReminder')}
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
              <div className="pt-4 border-t border-border">
                <h3 className="font-medium text-foreground mb-2">{t('eventDetail.aboutThisEvent')}</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
              </div>
            )}
          </div>

          {/* Attendees List */}
          {attendees.length > 0 && (
            <div className="p-6 bg-muted/40 border-t border-border/10">
              <h3 className="font-medium text-foreground mb-3">{t('eventDetail.whosComing')}</h3>
              <div className="flex flex-wrap gap-2">
                {goingAttendees.slice(0, maxAvatars).map((attendee, idx) => (
                  <div
                    key={attendee.user_id}
                    className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-white text-xs font-medium"
                    title={t('eventDetail.attendeeTitle', { num: idx + 1 })}
                  >
                    {idx + 1}
                  </div>
                ))}
                {extraCount > 0 && (
                  <span className="text-xs text-muted-foreground self-center">
                    {t('eventDetail.attendeesExtraMore', { count: extraCount })}
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
