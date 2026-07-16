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

// Day 126 (Sasha 2026-07-16): profile AUDIENCE gate — WHO can see the
// profile at all, checked before the existing `visibility` content-depth
// dial. Fetched defensively in a separate query: `game_profiles.
// profile_visibility` / `visible_community_ids` are columns added by a
// migration that has NOT been applied to the live DB yet (goes through
// Lovable), and `communities` / `community_members` are new tables. On any
// fetch error this defaults to 'public' — today's behavior, unchanged.
// `types.ts` is generated and doesn't know about any of this yet, hence the
// `as any` casts rather than hand-editing the generated file.
type ProfileAudienceValue = "friends" | "communities" | "public";

const PRIVATE_AUDIENCE_COPY: Record<Exclude<ProfileAudienceValue, "public">, string> = {
  friends: "This profile is visible to connections only.",
  communities: "This profile is visible to selected communities only.",
};

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
  // Day 126 — audience gate result. `null` deny reason = allowed.
  const [audienceDenyReason, setAudienceDenyReason] = useState<Exclude<ProfileAudienceValue, "public"> | null>(null);
  const [isViewerLoggedIn, setIsViewerLoggedIn] = useState(false);

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

      // Day 126 — audience gate: WHO can see this profile at all, checked
      // before the content-depth `visibility` dial above. Defaults to
      // allowed ('public' behavior) on any error or missing data, so a
      // pre-migration DB behaves exactly as before.
      let denyReason: Exclude<ProfileAudienceValue, "public"> | null = null;
      try {
        const { data: { user: viewer } } = await supabase.auth.getUser();
        const viewerId = viewer?.id || null;
        const isOwnProfile = !!viewerId && !!resolvedUserId && viewerId === resolvedUserId;
        if (isMounted) setIsViewerLoggedIn(!!viewerId);

        if (!isOwnProfile) {
          let audience: ProfileAudienceValue = "public";
          let visibleCommunityIds: string[] = [];
          try {
            const { data: audienceData, error: audienceError } = await (supabase as any)
              .from("game_profiles")
              .select("profile_visibility, visible_community_ids")
              .eq("user_id", resolvedUserId)
              .maybeSingle();
            if (audienceError) throw audienceError;
            if (audienceData?.profile_visibility === "friends" || audienceData?.profile_visibility === "communities") {
              audience = audienceData.profile_visibility;
            }
            visibleCommunityIds = Array.isArray(audienceData?.visible_community_ids)
              ? audienceData.visible_community_ids
              : [];
          } catch (err) {
            // Column doesn't exist yet (pre-migration) — treat as public.
            console.warn("[PublicProfile] audience visibility not available yet", err);
          }

          if (audience === "friends") {
            let connected = false;
            if (viewerId) {
              try {
                const { data: connectionRows, error: connectionError } = await (supabase as any)
                  .from("connections")
                  .select("id")
                  .eq("status", "accepted")
                  .or(
                    `and(requester_id.eq.${viewerId},receiver_id.eq.${resolvedUserId}),and(requester_id.eq.${resolvedUserId},receiver_id.eq.${viewerId})`
                  )
                  .limit(1);
                if (connectionError) throw connectionError;
                connected = Array.isArray(connectionRows) && connectionRows.length > 0;
              } catch (err) {
                console.warn("[PublicProfile] connections check failed", err);
                connected = false;
              }
            }
            if (!connected) denyReason = "friends";
          } else if (audience === "communities") {
            let member = false;
            if (viewerId && visibleCommunityIds.length > 0) {
              try {
                const { data: memberRows, error: memberError } = await (supabase as any)
                  .from("community_members")
                  .select("community_id")
                  .eq("user_id", viewerId)
                  .in("community_id", visibleCommunityIds)
                  .limit(1);
                if (memberError) throw memberError;
                member = Array.isArray(memberRows) && memberRows.length > 0;
              } catch (err) {
                console.warn("[PublicProfile] community membership check failed", err);
                member = false;
              }
            }
            if (!member) denyReason = "communities";
          }
        }
      } catch (err) {
        // Never let the audience gate crash the page — fall back to allowed.
        console.warn("[PublicProfile] audience gate failed", err);
      }

      if (denyReason) {
        if (isMounted) {
          setAudienceDenyReason(denyReason);
          setProfile(null);
          setLoading(false);
        }
        return;
      }
      if (isMounted) {
        setAudienceDenyReason(null);
      }

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

  if (!profile || visibility === "hidden" || audienceDenyReason) {
    // Day 126 — the audience gate (WHO can see) reuses this same private
    // screen, with copy specific to the deny reason. `audienceDenyReason`
    // is null for the pre-existing hidden/missing-profile cases, which keep
    // their original generic copy.
    const audienceCopy = audienceDenyReason ? PRIVATE_AUDIENCE_COPY[audienceDenyReason] : null;
    return (
      <div className="min-h-dvh flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          {/* Day 91 (Sasha 2026-06-09): navy text tokenized for Aurum —
              hardcoded #2c3150 was invisible on the near-black skins. */}
          <h1 className="text-2xl font-semibold" style={{ color: "var(--skin-text-primary, #2c3150)" }}>Profile Private</h1>
          <p className="text-sm" style={{ color: "var(--skin-text-muted, rgba(44,49,80,0.6))" }}>
            {audienceCopy || "This profile is not available right now."}
          </p>
          {audienceDenyReason && !isViewerLoggedIn && (
            <Button onClick={() => navigate(`/auth?redirect=${encodeURIComponent(window.location.pathname)}`)}>
              Sign in
            </Button>
          )}
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
        <div className="rounded-3xl bg-[var(--skin-card-fill,rgba(255,255,255,0.8))] backdrop-blur p-6 sm:p-10 shadow-lg border border-[var(--skin-hairline,rgba(255,255,255,0.6))]">
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
            <div className="mt-8 rounded-2xl border border-[var(--skin-hairline,rgba(164,163,208,0.2))] bg-[var(--skin-card-fill,rgba(255,255,255,0.85))] backdrop-blur-sm p-5 text-center shadow-[0_4px_16px_rgba(44,49,80,0.06)]">
              <p className="text-sm uppercase tracking-wide" style={{ color: "var(--skin-text-muted, rgba(44,49,80,0.6))" }}>Bio</p>
              <p className="mt-2" style={{ color: "var(--skin-text-primary, #2c3150)" }}>{mission.intro_text}</p>
            </div>
          )}

          {canShowOffer && excalibur && (
            <div className="mt-8 rounded-2xl border border-[var(--skin-hairline,rgba(164,163,208,0.2))] bg-[var(--skin-card-fill,rgba(240,244,255,0.5))] p-5 shadow-[0_4px_16px_rgba(44,49,80,0.06)]">
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
