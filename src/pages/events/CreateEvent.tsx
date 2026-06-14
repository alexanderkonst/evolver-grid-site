import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
        title: t('createEvent.toast.missingFields.title'),
        description: t('createEvent.toast.missingFields.description'),
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
        title: t('createEvent.toast.created.title'),
        description: t('createEvent.toast.created.description'),
      });
      navigate(`/events/${newEvent.id}`);
    } catch (err) {
      toast({
        title: t('createEvent.toast.error.title'),
        description: t('createEvent.toast.error.description'),
        variant: "destructive",
      });
    }
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <GameShellV2>
        <div className="p-6 lg:p-8 max-w-2xl mx-auto text-center">
          <div className="flex flex-col items-center gap-3 mb-6">
            <Users className="w-10 h-10 text-muted-foreground" />
            <h1 className="text-2xl font-semibold text-foreground">{t('createEvent.auth.heading')}</h1>
            <p className="text-muted-foreground">
              {t('createEvent.auth.body')}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button onClick={() => navigate("/auth")}>{t('createEvent.auth.signIn')}</Button>
            <Button variant="outline" onClick={() => navigate("/game/events")}>
              {t('createEvent.auth.backToEvents')}
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
            <CalendarDays className="w-6 h-6 text-foreground" />
            <h1 className="text-2xl font-bold text-foreground">{t('createEvent.header.title')}</h1>
          </div>
          <p className="text-muted-foreground">{t('createEvent.header.subtitle')}</p>
        </div>

        {/* Day 91 (Sasha 2026-06-09): form-card fill tokenized for Aurum — shadcn Label/Input ink flips light under the dark skins, so the white/85 surface must read the skin card token too. */}
        <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-border bg-[var(--skin-card-fill,rgba(255,255,255,0.85))] backdrop-blur-sm p-6 shadow-[0_4px_16px_rgba(44,49,80,0.06)]">
          <div className="space-y-2">
            <Label htmlFor="title">{t('createEvent.fields.title.label')}</Label>
            <Input
              id="title"
              placeholder={t('createEvent.fields.title.placeholder')}
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              {t('createEvent.fields.description.label')}
            </Label>
            <Textarea
              id="description"
              placeholder={t('createEvent.fields.description.placeholder')}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="datetime" className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              {t('createEvent.fields.dateTime.label')}
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
              <MapPin className="w-4 h-4 text-muted-foreground" />
              {t('createEvent.fields.location.label')}
            </Label>
            <Input
              id="location"
              placeholder={t('createEvent.fields.location.placeholder')}
              value={formData.location}
              onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="community" className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              {t('createEvent.fields.community.label')}
            </Label>
            <select
              id="community"
              value={formData.community_id}
              onChange={(e) => setFormData((prev) => ({ ...prev, community_id: e.target.value }))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">{t('createEvent.fields.community.none')}</option>
              {communityOptions.map((communityId) => (
                <option key={communityId} value={communityId}>
                  {communityId}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              {t('createEvent.fields.visibility.label')}
            </Label>
            <Select
              value={formData.visibility}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, visibility: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('createEvent.fields.visibility.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <span className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    {t('createEvent.fields.visibility.public')}
                  </span>
                </SelectItem>
                <SelectItem value="community">
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {t('createEvent.fields.visibility.community')}
                  </span>
                </SelectItem>
                <SelectItem value="private">
                  <span className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    {t('createEvent.fields.visibility.private')}
                  </span>
                </SelectItem>
                <SelectItem value="team">
                  <span className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    {t('createEvent.fields.visibility.team')}
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo" className="flex items-center gap-2">
              <Image className="w-4 h-4 text-muted-foreground" />
              {t('createEvent.fields.image.label')}
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
              {t('createEvent.actions.cancel')}
            </Button>
            <Button type="submit" disabled={loading || !canSubmit} className="bg-primary hover:bg-primary/90">
              {loading ? t('createEvent.actions.creating') : t('createEvent.actions.submit')}
            </Button>
          </div>
        </form>
      </div>
    </GameShellV2>
  );
};

export default CreateEvent;
