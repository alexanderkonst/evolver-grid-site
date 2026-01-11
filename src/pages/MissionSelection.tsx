import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Target } from "lucide-react";
import GameShell from "@/components/game/GameShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MISSIONS } from "@/modules/mission-discovery/data/missions";
import { DESIRED_OUTCOMES } from "@/modules/mission-discovery/data/outcomes";
import { KEY_CHALLENGES } from "@/modules/mission-discovery/data/challenges";
import { FOCUS_AREAS } from "@/modules/mission-discovery/data/focusAreas";
import { PILLARS } from "@/modules/mission-discovery/data/pillars";

const MissionSelection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [pillarId, setPillarId] = useState<string>("all");
  const [focusAreaId, setFocusAreaId] = useState<string>("all");
  const [missionId, setMissionId] = useState<string>("all");
  const [missionNote, setMissionNote] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth?redirect=/game/mission");
        return;
      }
      setUserId(user.id);
      setUserEmail(user.email ?? null);
      setLoading(false);
    };

    loadUser();
  }, [navigate]);

  const focusOptions = useMemo(() => {
    if (pillarId === "all") return FOCUS_AREAS;
    return FOCUS_AREAS.filter((focus) => focus.pillarId === pillarId);
  }, [pillarId]);

  const missionsForFocus = useMemo(() => {
    if (focusAreaId === "all") return MISSIONS;

    const challengeIds = KEY_CHALLENGES.filter((challenge) => challenge.focusAreaId === focusAreaId).map(
      (challenge) => challenge.id
    );
    const outcomeIds = DESIRED_OUTCOMES.filter((outcome) => challengeIds.includes(outcome.challengeId)).map(
      (outcome) => outcome.id
    );
    return MISSIONS.filter((mission) => outcomeIds.includes(mission.outcomeId));
  }, [focusAreaId]);

  const selectedMission = useMemo(
    () => MISSIONS.find((mission) => mission.id === missionId) || null,
    [missionId]
  );

  useEffect(() => {
    setFocusAreaId("all");
    setMissionId("all");
  }, [pillarId]);

  useEffect(() => {
    setMissionId("all");
  }, [focusAreaId]);

  const handleSave = async () => {
    if (!userId || !userEmail) return;
    if (!selectedMission) {
      toast({ title: "Choose a mission to continue", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const outcome = DESIRED_OUTCOMES.find((item) => item.id === selectedMission.outcomeId) || null;
      const challenge = outcome
        ? KEY_CHALLENGES.find((item) => item.id === outcome.challengeId) || null
        : null;
      const focusArea = challenge
        ? FOCUS_AREAS.find((item) => item.id === challenge.focusAreaId) || null
        : null;
      const pillar = focusArea
        ? PILLARS.find((item) => item.id === focusArea.pillarId) || null
        : null;

      const baseParticipant = {
        user_id: userId,
        email: userEmail,
        first_name: null as string | null,
        mission_id: selectedMission.id,
        mission_title: selectedMission.title,
        outcome_id: outcome?.id ?? null,
        challenge_id: challenge?.id ?? null,
        focus_area_id: focusArea?.id ?? null,
        pillar_id: pillar?.id ?? null,
        intro_text: missionNote.trim() || null,
        share_consent: true,
      };

      const { data: existingParticipant } = await supabase
        .from("mission_participants")
        .select("id")
        .eq("user_id", userId)
        .eq("mission_id", selectedMission.id)
        .maybeSingle();

      if (existingParticipant?.id) {
        const { error } = await supabase
          .from("mission_participants")
          .update(baseParticipant)
          .eq("id", existingParticipant.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("mission_participants")
          .insert(baseParticipant);
        if (error) throw error;
      }

      toast({ title: "Mission saved" });
      navigate("/game/profile");
    } catch (err: any) {
      toast({
        title: "Save failed",
        description: err.message || "Unable to save your mission.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <GameShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell>
      <div className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex items-center gap-3 text-slate-900">
            <Target className="w-6 h-6" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold">Mission Selection</h1>
              <p className="text-sm text-slate-500">Choose a mission that reflects what you are here to build.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select value={pillarId} onValueChange={setPillarId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pillar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Choose a pillar</SelectItem>
                {PILLARS.map((pillar) => (
                  <SelectItem key={pillar.id} value={pillar.id}>
                    {pillar.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={focusAreaId} onValueChange={setFocusAreaId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Focus Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Choose a focus area</SelectItem>
                {focusOptions.map((focus) => (
                  <SelectItem key={focus.id} value={focus.id}>
                    {focus.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Select value={missionId} onValueChange={setMissionId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Mission" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Choose a mission</SelectItem>
              {missionsForFocus.map((mission) => (
                <SelectItem key={mission.id} value={mission.id}>
                  {mission.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-medium text-slate-700 mb-2">Describe your specific mission (optional)</p>
            <Textarea
              value={missionNote}
              onChange={(event) => setMissionNote(event.target.value)}
              placeholder="I'm building..."
              rows={4}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => navigate("/game/profile")}>Back</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Mission"}
            </Button>
          </div>
        </div>
      </div>
    </GameShell>
  );
};

export default MissionSelection;
