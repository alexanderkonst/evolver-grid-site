import { CalendarDays, MapPin, Users } from "lucide-react";
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

const EventCard = ({ event, onClick }: EventCardProps) => {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow border-slate-200 bg-white"
      onClick={onClick}
    >
      {/* Photo placeholder */}
      <div className="h-32 bg-amber-100 rounded-t-lg overflow-hidden">
        {event.photo_url ? (
          <img
            src={event.photo_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <CalendarDays className="w-10 h-10 text-amber-400" />
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">
          {event.title}
        </h3>

        <div className="space-y-1.5 text-sm text-slate-600">
          {/* Date & Time */}
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-slate-400" />
            <span>
              {formatDate(event.event_date)} at {formatTime(event.event_time)}
            </span>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span className="truncate">{event.location}</span>
            </div>
          )}

          {/* RSVP Count */}
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <span>
              {event.rsvp_count} {event.rsvp_count === 1 ? "person" : "people"} going
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;
