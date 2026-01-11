import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, MapPin, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AppleseedData } from "@/modules/zone-of-genius/appleseedGenerator";
import { ExcaliburData } from "@/modules/zone-of-genius/excaliburGenerator";

interface PublicProfileData {
  user_id?: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  location: string | null;
  visibility: "hidden" | "minimal" | "medium" | "full" | null;
  show_location: boolean | null;
  show_mission: boolean | null;
  show_offer: boolean | null;
  last_zog_snapshot_id: string | null;
}

interface MissionRow {
  mission_title: string;
  intro_text: string | null;
}

const resolveVisibility = (value: string | null) => {
  if (value === "hidden" || value === "minimal" || value === "medium" || value === "full") {
    return value;
  }
  return "full";
};

const PublicProfile = () => {
  const { userId, username } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [mission, setMission] = useState<MissionRow | null>(null);
  const [appleseed, setAppleseed] = useState<AppleseedData | null>(null);
  const [excalibur, setExcalibur] = useState<ExcaliburData | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!userId && !username) return;
      setLoading(true);

      let profileQuery = supabase
        .from("game_profiles")
        .select(
          "user_id, first_name, last_name, avatar_url, location, visibility, show_location, show_mission, show_offer, last_zog_snapshot_id"
        );

      if (username) {
        profileQuery = profileQuery.eq("username", username);
      } else if (userId) {
        profileQuery = profileQuery.eq("user_id", userId);
      }

      const { data: profileData } = await profileQuery.maybeSingle();

      if (!profileData) {
        if (isMounted) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      const visibility = resolveVisibility(profileData.visibility);

      let zogData: { appleseed_data: unknown | null; excalibur_data: unknown | null } | null = null;
      if (profileData.last_zog_snapshot_id) {
        const { data } = await supabase
          .from("zog_snapshots")
          .select("appleseed_data, excalibur_data")
          .eq("id", profileData.last_zog_snapshot_id)
          .maybeSingle();
        zogData = data || null;
      }

      const resolvedUserId = (profileData as { user_id?: string | null })?.user_id || userId || "";

      const { data: missionData } = await supabase
        .from("mission_participants")
        .select("mission_title, intro_text")
        .eq("user_id", resolvedUserId)
        .eq("share_consent", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (isMounted) {
        setProfile(profileData as PublicProfileData);
        setMission(missionData ? (missionData as MissionRow) : null);
        setAppleseed(zogData?.appleseed_data ? (zogData.appleseed_data as unknown as AppleseedData) : null);
        setExcalibur(zogData?.excalibur_data ? (zogData.excalibur_data as unknown as ExcaliburData) : null);
        setLoading(false);
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [userId, username]);

  useEffect(() => {
    if (!profile || loading) return;
    const title = `${fullName} | Evolver Grid`;
    const description =
      appleseed?.vibrationalKey?.tagline ||
      mission?.mission_title ||
      "Discover your Zone of Genius.";
    const image = profile.avatar_url || "";

    document.title = title;

    const setMeta = (key: string, value: string, attr: "name" | "property") => {
      let tag = document.querySelector(`meta[${attr}=\"${key}\"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attr, key);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", value);
    };

    setMeta("og:title", title, "property");
    setMeta("og:description", description, "property");
    if (image) {
      setMeta("og:image", image, "property");
    }
  }, [appleseed?.vibrationalKey?.tagline, fullName, loading, mission?.mission_title, profile]);

  const visibility = resolveVisibility(profile?.visibility ?? null);
  const fullName = useMemo(() => {
    const parts = [profile?.first_name, profile?.last_name].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "Community Member";
  }, [profile?.first_name, profile?.last_name]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!profile || visibility === "hidden") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-semibold text-slate-900">Profile Private</h1>
          <p className="text-sm text-slate-500">This profile is not available right now.</p>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>
    );
  }

  const canShowLocation = visibility !== "minimal" && (profile.show_location ?? true) && profile.location;
  const canShowMission = visibility !== "minimal" && (profile.show_mission ?? true) && mission;
  const canShowOffer = visibility === "full" && (profile.show_offer ?? true) && excalibur;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="px-4 py-6 max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-semibold text-slate-500">
                  {fullName
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 mt-4">{fullName}</h1>
            {appleseed && (
              <div className="mt-2 text-slate-600">
                <p className="text-sm">✦ {appleseed.vibrationalKey.name} ✦</p>
                <p className="text-sm italic mt-1">"{appleseed.vibrationalKey.tagline}"</p>
              </div>
            )}
            <div className="mt-4 space-y-2 text-sm text-slate-500">
              {canShowLocation && (
                <div className="flex items-center justify-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.location}</span>
                </div>
              )}
              {canShowMission && mission && (
                <div className="flex items-center justify-center gap-2">
                  <Target className="w-4 h-4" />
                  <span>{mission.mission_title}</span>
                </div>
              )}
            </div>
          </div>

          {canShowOffer && excalibur && (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-medium text-slate-500 mb-1">Unique Offer</p>
              <h2 className="text-lg font-semibold text-slate-900">{excalibur.sword.offer}</h2>
              <p className="text-sm text-slate-600 mt-2">{excalibur.sword.promise}</p>
              <p className="text-sm text-slate-600 mt-2">{excalibur.exchange.pricing}</p>
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <Button onClick={() => navigate("/connections")}>Connect</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
