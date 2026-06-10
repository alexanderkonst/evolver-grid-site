import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapPin, Target } from "lucide-react";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AppleseedData } from "@/modules/zone-of-genius/appleseedGenerator";
import { ExcaliburData } from "@/modules/zone-of-genius/excaliburGenerator";
import BackButton from "@/components/BackButton";

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
  const [topTalents, setTopTalents] = useState<string[]>([]);

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
        profileQuery = profileQuery.or(`user_id.eq.${userId},id.eq.${userId}`);
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

      let zogData: {
        appleseed_data: unknown | null;
        excalibur_data: unknown | null;
        top_three_talents: unknown | null;
      } | null = null;
      if (profileData.last_zog_snapshot_id) {
        const { data } = await supabase
          .from("zog_snapshots")
          .select("appleseed_data, excalibur_data, top_three_talents")
          .eq("id", profileData.last_zog_snapshot_id)
          .maybeSingle();
        zogData = data ? { ...data } : null;
      }

      const resolvedUserId = (profileData as { user_id?: string | null })?.user_id || userId || "";

      // Use the email-free public view for cross-user public profile reads
      const { data: missionData } = await (supabase as any)
        .from("mission_participants_public")
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
        setTopTalents(Array.isArray(zogData?.top_three_talents) ? (zogData.top_three_talents as string[]) : []);
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
    const title = `${fullName} | Planetary OS`;
    const description =
      appleseed?.vibrationalKey?.name ||
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
  }, [appleseed?.vibrationalKey?.tagline, loading, mission?.mission_title, profile]);

  const fullName = useMemo(() => {
    const parts = [profile?.first_name, profile?.last_name].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "Community Member";
  }, [profile?.first_name, profile?.last_name]);

  const visibility = resolveVisibility(profile?.visibility ?? null);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <PremiumLoader size="lg" />
      </div>
    );
  }

  if (!profile || visibility === "hidden") {
    return (
      <div className="min-h-dvh flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          {/* Day 91 (Sasha 2026-06-09): navy text tokenized for Aurum —
              hardcoded #2c3150 was invisible on the near-black skins. */}
          <h1 className="text-2xl font-semibold" style={{ color: "var(--skin-text-primary, #2c3150)" }}>Profile Private</h1>
          <p className="text-sm" style={{ color: "var(--skin-text-muted, rgba(44,49,80,0.6))" }}>This profile is not available right now.</p>
          <BackButton />
        </div>
      </div>
    );
  }

  const canShowLocation = visibility !== "minimal" && (profile.show_location ?? true) && profile.location;
  const canShowMission = visibility !== "minimal" && (profile.show_mission ?? true) && mission;
  const canShowOffer = visibility === "full" && (profile.show_offer ?? true) && excalibur;
  const archetypeTitle = appleseed?.threeLenses?.archetype || appleseed?.vibrationalKey?.name;
  const coreVibration = excalibur?.essenceAnchor?.geniusAppleSeed || null;

  return (
    // Day 91 (Sasha 2026-06-09): tokenized for Aurum. This page predates
    // the skin system and hardcoded its own light radial wash + navy ink —
    // a full bright island under the dark skins. The wash moves to the
    // --skin-page-wash token (style prop — Tailwind can't infer
    // background-image from a var()) and the ink to --skin-text-primary;
    // both fall back to the exact original literals, so lapis is
    // pixel-identical.
    <div
      className="min-h-dvh"
      style={{
        background:
          "var(--skin-page-wash, radial-gradient(circle at top,#f8f4ff,transparent 45%),radial-gradient(circle at bottom,#fff6ea,transparent 50%))",
        color: "var(--skin-text-primary, #2c3150)",
      }}
    >
      <div className="px-4 py-6 max-w-4xl mx-auto">
        <BackButton />
      </div>
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <div className="rounded-3xl bg-[var(--skin-card-fill,rgba(255,255,255,0.8))] backdrop-blur p-6 sm:p-10 shadow-lg border border-[var(--skin-card-border,rgba(255,255,255,0.6))]">
          <div className="flex flex-col items-center text-center">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-[var(--skin-input-fill,#f0f4ff)] flex items-center justify-center">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={fullName}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-semibold" style={{ color: "var(--skin-text-muted, rgba(44,49,80,0.6))" }}>
                  {fullName
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-semibold mt-5">{fullName}</h1>
            {archetypeTitle && (
              <p className="mt-3 text-lg font-medium" style={{ color: "var(--skin-text-primary, #2c3150)" }}>✦ {archetypeTitle} ✦</p>
            )}
            {appleseed?.vibrationalKey?.tagline && (
              <p className="mt-2 text-sm italic max-w-xl" style={{ color: "var(--skin-text-muted, rgba(44,49,80,0.6))" }}>
                "{appleseed.vibrationalKey.tagline}"
              </p>
            )}
            {coreVibration && (
              <p className="mt-3 text-sm font-medium" style={{ color: "var(--skin-text-muted, rgba(44,49,80,0.7))" }}>
                Core Vibration: <span style={{ color: "var(--skin-text-primary, #2c3150)" }}>{coreVibration}</span>
              </p>
            )}
            <div className="mt-4 space-y-2 text-sm" style={{ color: "var(--skin-text-muted, rgba(44,49,80,0.6))" }}>
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

          {topTalents.length > 0 && (
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {topTalents.map((talent) => (
                <span
                  key={talent}
                  className="rounded-full bg-amber-100 px-4 py-1 text-xs font-semibold text-amber-900"
                >
                  {talent}
                </span>
              ))}
            </div>
          )}

          {mission?.intro_text && (
            <div className="mt-8 rounded-2xl border border-[var(--skin-card-border,rgba(164,163,208,0.2))] bg-[var(--skin-card-fill,rgba(255,255,255,0.85))] backdrop-blur-sm p-5 text-center shadow-[0_4px_16px_rgba(44,49,80,0.06)]">
              <p className="text-sm uppercase tracking-wide" style={{ color: "var(--skin-text-muted, rgba(44,49,80,0.6))" }}>Bio</p>
              <p className="mt-2" style={{ color: "var(--skin-text-primary, #2c3150)" }}>{mission.intro_text}</p>
            </div>
          )}

          {canShowOffer && excalibur && (
            <div className="mt-8 rounded-2xl border border-[var(--skin-card-border,rgba(164,163,208,0.2))] bg-[var(--skin-card-fill,rgba(240,244,255,0.5))] p-5 shadow-[0_4px_16px_rgba(44,49,80,0.06)]">
              <p className="text-xs font-medium mb-1" style={{ color: "var(--skin-text-muted, rgba(44,49,80,0.6))" }}>Unique Offer</p>
              <h2 className="text-lg font-semibold" style={{ color: "var(--skin-text-primary, #2c3150)" }}>{excalibur.offer?.statement || excalibur.businessIdentity?.tagline || "Genius Offer"}</h2>
              <p className="text-sm mt-2" style={{ color: "var(--skin-text-muted, rgba(44,49,80,0.7))" }}>{excalibur.offer?.deliverable || ""}</p>
              <p className="text-sm mt-2" style={{ color: "var(--skin-text-muted, rgba(44,49,80,0.7))" }}>{excalibur.offer?.form || ""}</p>
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
