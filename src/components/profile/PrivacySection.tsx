import { useState } from "react";
import { Shield, Loader2, Eye, EyeOff, MapPin, Target, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type VisibilityLevel = "hidden" | "minimal" | "medium" | "full";

interface PrivacySectionProps {
  userId: string;
  visibility: VisibilityLevel;
  showLocation: boolean;
  showMission: boolean;
  showOffer: boolean;
  onUpdate: (updates: Partial<{
    visibility: VisibilityLevel;
    show_location: boolean;
    show_mission: boolean;
    show_offer: boolean;
  }>) => void;
}

const VISIBILITY_OPTIONS: { value: VisibilityLevel; label: string; description: string }[] = [
  { value: "hidden", label: "Hidden", description: "Only I can see my profile" },
  { value: "minimal", label: "Minimal", description: "Name and archetype only" },
  { value: "medium", label: "Medium", description: "Plus mission, no offer" },
  { value: "full", label: "Full", description: "Show everything" },
];

const PrivacySection = ({
  userId,
  visibility,
  showLocation,
  showMission,
  showOffer,
  onUpdate,
}: PrivacySectionProps) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState<string | null>(null);

  const handleVisibilityChange = async (value: VisibilityLevel) => {
    const previousValue = visibility;
    onUpdate({ visibility: value });
    setSaving("visibility");

    try {
      const { error } = await supabase
        .from("game_profiles")
        .update({ visibility: value })
        .eq("user_id", userId);

      if (error) throw error;

      toast({ title: "Visibility updated" });
    } catch (error: any) {
      onUpdate({ visibility: previousValue });
      toast({
        title: "Update failed",
        description: error.message || "Unable to update visibility.",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const handleToggle = async (
    field: "show_location" | "show_mission" | "show_offer",
    value: boolean
  ) => {
    const fieldMap = {
      show_location: showLocation,
      show_mission: showMission,
      show_offer: showOffer,
    };
    const previousValue = fieldMap[field];
    onUpdate({ [field]: value });
    setSaving(field);

    try {
      const { error } = await supabase
        .from("game_profiles")
        .update({ [field]: value })
        .eq("user_id", userId);

      if (error) throw error;

      toast({ title: "Settings updated" });
    } catch (error: any) {
      onUpdate({ [field]: previousValue });
      toast({
        title: "Update failed",
        description: error.message || "Unable to update settings.",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-slate-100">
          <Shield className="w-5 h-5 text-slate-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Privacy & Visibility</h3>
          <p className="text-sm text-slate-500">Control who can see your profile</p>
        </div>
      </div>

      {/* Visibility Level */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-slate-700">Profile Visibility</Label>
        <RadioGroup
          value={visibility}
          onValueChange={(value) => handleVisibilityChange(value as VisibilityLevel)}
          className="space-y-2"
          disabled={saving === "visibility"}
        >
          {VISIBILITY_OPTIONS.map((option) => (
            <div
              key={option.value}
              className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <RadioGroupItem value={option.value} id={`visibility-${option.value}`} />
              <div className="flex-1">
                <Label
                  htmlFor={`visibility-${option.value}`}
                  className="text-sm font-medium text-slate-900 cursor-pointer"
                >
                  {option.label}
                </Label>
                <p className="text-xs text-slate-500">{option.description}</p>
              </div>
              {saving === "visibility" && visibility === option.value && (
                <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
              )}
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-200" />

      {/* Toggle Switches */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-slate-700">Show on Public Profile</Label>

        {/* Location Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-slate-500" />
            <div>
              <p className="text-sm font-medium text-slate-900">My location</p>
              <p className="text-xs text-slate-500">City and country</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {saving === "show_location" && (
              <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
            )}
            <Switch
              checked={showLocation}
              onCheckedChange={(checked) => handleToggle("show_location", checked)}
              disabled={saving === "show_location"}
            />
          </div>
        </div>

        {/* Mission Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
          <div className="flex items-center gap-3">
            <Target className="w-4 h-4 text-slate-500" />
            <div>
              <p className="text-sm font-medium text-slate-900">My mission</p>
              <p className="text-xs text-slate-500">Current mission focus</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {saving === "show_mission" && (
              <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
            )}
            <Switch
              checked={showMission}
              onCheckedChange={(checked) => handleToggle("show_mission", checked)}
              disabled={saving === "show_mission"}
            />
          </div>
        </div>

        {/* Offer Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-slate-500" />
            <div>
              <p className="text-sm font-medium text-slate-900">My unique offer</p>
              <p className="text-xs text-slate-500">Your genius offer</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {saving === "show_offer" && (
              <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
            )}
            <Switch
              checked={showOffer}
              onCheckedChange={(checked) => handleToggle("show_offer", checked)}
              disabled={saving === "show_offer"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacySection;
