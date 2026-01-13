import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Clock, FileText, Globe, Image, Lock, MapPin, UserCheck, Users } from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateEvent } from "@/hooks/useEvents";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CreateEvent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createEvent, loading } = useCreateEvent();
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [communityOptions, setCommunityOptions] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventDateTime: "",
    location: "",
    community_id: "",
    photo_url: "",
    visibility: "public",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      setAuthLoading(false);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const loadCommunities = async () => {
      const { data } = await supabase
        .from("events")
        .select("community_id")
        .not("community_id", "is", null);

      const unique = new Set<string>();
      (data || []).forEach((row) => {
        if (row.community_id) {
          unique.add(row.community_id);
        }
      });
      setCommunityOptions(Array.from(unique).sort());
    };
    loadCommunities();
  }, []);

  const canSubmit = useMemo(
    () => Boolean(formData.title && formData.eventDateTime),
    [formData.title, formData.eventDateTime]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.title || !formData.eventDateTime) {
      toast({
        title: "Missing fields",
        description: "Please enter a title and date/time.",
        variant: "destructive",
      });
      return;
    }

    const [datePart, timePart] = formData.eventDateTime.split("T");
    const formattedTime = timePart?.length === 5 ? `${timePart}:00` : timePart;

    try {
      const newEvent = await createEvent({
        title: formData.title,
        description: formData.description || null,
        event_date: datePart,
        event_time: formattedTime,
        location: formData.location || null,
        community_id: formData.community_id || null,
        photo_url: formData.photo_url || null,
        visibility: formData.visibility,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      });

      toast({
        title: "Event created!",
        description: "Your event has been created successfully.",
      });
      navigate(`/events/${newEvent.id}`);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <GameShellV2>
        <div className="p-6 lg:p-8 max-w-2xl mx-auto text-center">
          <div className="flex flex-col items-center gap-3 mb-6">
            <Users className="w-10 h-10 text-slate-400" />
            <h1 className="text-2xl font-semibold text-slate-900">Sign in to create events</h1>
            <p className="text-slate-600">
              You need an account to publish events for the community.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button onClick={() => navigate("/auth")}>Sign in</Button>
            <Button variant="outline" onClick={() => navigate("/game/events")}>
              Back to events
            </Button>
          </div>
        </div>
      </GameShellV2>
    );
  }

  return (
    <GameShellV2>
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <CalendarDays className="w-6 h-6 text-slate-700" />
            <h1 className="text-2xl font-bold text-slate-900">Create Event</h1>
          </div>
          <p className="text-slate-600">Share a gathering with the community.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Event title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="What's this event about?"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="datetime" className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              Date & time *
            </Label>
            <Input
              id="datetime"
              type="datetime-local"
              value={formData.eventDateTime}
              onChange={(e) => setFormData((prev) => ({ ...prev, eventDateTime: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              Location
            </Label>
            <Input
              id="location"
              placeholder="Where will it take place?"
              value={formData.location}
              onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="community" className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              Community
            </Label>
            <select
              id="community"
              value={formData.community_id}
              onChange={(e) => setFormData((prev) => ({ ...prev, community_id: e.target.value }))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">No community</option>
              {communityOptions.map((communityId) => (
                <option key={communityId} value={communityId}>
                  {communityId}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              Visibility
            </Label>
            <Select
              value={formData.visibility}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, visibility: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Who can see this?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <span className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Public — Anyone
                  </span>
                </SelectItem>
                <SelectItem value="community">
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Community — Members only
                  </span>
                </SelectItem>
                <SelectItem value="private">
                  <span className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Private — Invite only
                  </span>
                </SelectItem>
                <SelectItem value="team">
                  <span className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    Team — My team only
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo" className="flex items-center gap-2">
              <Image className="w-4 h-4 text-slate-400" />
              Image URL
            </Label>
            <Input
              id="photo"
              type="url"
              placeholder="https://..."
              value={formData.photo_url}
              onChange={(e) => setFormData((prev) => ({ ...prev, photo_url: e.target.value }))}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => navigate("/game/events")}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !canSubmit} className="bg-amber-500 hover:bg-amber-600">
              {loading ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </form>
      </div>
    </GameShellV2>
  );
};

export default CreateEvent;
