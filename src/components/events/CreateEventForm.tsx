import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, MapPin, Clock, Image, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateEvent } from "@/hooks/useEvents";
import { useToast } from "@/hooks/use-toast";

interface CreateEventFormProps {
  onSuccess?: () => void;
}

const COMMON_TIMEZONES = [
  "UTC",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

const CreateEventForm = ({ onSuccess }: CreateEventFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createEvent, loading } = useCreateEvent();
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    event_time: "",
    location: "",
    photo_url: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.event_date || !formData.event_time) {
      toast({
        title: "Missing fields",
        description: "Please fill in title, date, and time",
        variant: "destructive",
      });
      return;
    }

    try {
      // Ensure time has seconds for PostgreSQL TIME type
      const formattedTime = formData.event_time.includes(':')
        ? (formData.event_time.split(':').length === 2
          ? `${formData.event_time}:00`
          : formData.event_time)
        : formData.event_time;

      const event = await createEvent({
        title: formData.title,
        description: formData.description || null,
        event_date: formData.event_date,
        event_time: formattedTime,
        location: formData.location || null,
        photo_url: formData.photo_url || null,
        timezone: formData.timezone || "UTC",
      });

      toast({
        title: "Event created!",
        description: "Your event has been created successfully",
      });

      setOpen(false);
      setFormData({
        title: "",
        description: "",
        event_date: "",
        event_time: "",
        location: "",
        photo_url: "",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        navigate(`/events/${event.id}`);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-amber-500 hover:bg-amber-600 text-white">
          <CalendarDays className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Event title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="What's this event about?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-slate-400" />
                Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                Time *
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.event_time}
                onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <Label htmlFor="timezone" className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              Timezone
            </Label>
            <select
              id="timezone"
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {Array.from(new Set([formData.timezone, ...COMMON_TIMEZONES])).map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              Location
            </Label>
            <Input
              id="location"
              placeholder="Where will it take place?"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          {/* Photo URL */}
          <div className="space-y-2">
            <Label htmlFor="photo" className="flex items-center gap-2">
              <Image className="w-4 h-4 text-slate-400" />
              Photo URL
            </Label>
            <Input
              id="photo"
              type="url"
              placeholder="https://..."
              value={formData.photo_url}
              onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Event"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventForm;
