import { memo } from "react";
import { CalendarDays, Lock, MapPin, UserCheck, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EventWithRsvpCount } from "@/hooks/useEvents";

interface EventCardProps {
  event: EventWithRsvpCount;
  onClick: () => void;
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
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

const VISIBILITY_BADGES = {
  community: {
    label: "Community",
    icon: Users,
    className: "bg-blue-50 text-blue-700",
  },
  private: {
    label: "Private",
    icon: Lock,
    className: "bg-slate-100 text-[#2c3150]",
  },
  team: {
    label: "Team",
    icon: UserCheck,
    className: "bg-emerald-50 text-emerald-700",
  },
} as const;

const EventCard = ({ event, onClick }: EventCardProps) => {
  const visibility = event.visibility ?? "public";
  const badge = VISIBILITY_BADGES[visibility as keyof typeof VISIBILITY_BADGES];

  return (
    <Card
      variant="wabi"
      className="cursor-pointer transition-shadow hover:shadow-[0_12px_32px_rgba(132,96,234,0.22)]"
      onClick={onClick}
    >
      {/* Photo placeholder */}
      <div className="h-32 bg-amber-100 rounded-t-lg overflow-hidden">
        {event.photo_url ? (
          <img
            src={event.photo_url}
            alt={event.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <CalendarDays className="w-10 h-10 text-amber-400" />
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {badge && (
          <div className="mb-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
              <badge.icon className="w-3 h-3" />
              {badge.label}
            </span>
          </div>
        )}
        <h3 className="font-semibold text-[#2c3150] mb-2 line-clamp-2">
          {event.title}
        </h3>

        <div className="space-y-1.5 text-sm text-[rgba(44,49,80,0.7)]">
          {/* Date & Time */}
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-slate-500" />
            <span>
              {formatDate(event.event_date)} at {formatTime(event.event_time)}
            </span>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-500" />
              <span className="truncate">{event.location}</span>
            </div>
          )}

          {/* RSVP Count */}
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-500" />
            <span>
              {event.rsvp_count} {event.rsvp_count === 1 ? "person" : "people"} going
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const areEqual = (prev: EventCardProps, next: EventCardProps) => (
  prev.event.id === next.event.id &&
  prev.event.title === next.event.title &&
  prev.event.event_date === next.event.event_date &&
  prev.event.event_time === next.event.event_time &&
  prev.event.location === next.event.location &&
  prev.event.photo_url === next.event.photo_url &&
  prev.event.rsvp_count === next.event.rsvp_count &&
  prev.event.visibility === next.event.visibility
);

export default memo(EventCard, areEqual);
