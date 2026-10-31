import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MapPin, Target } from "lucide-react";
import ShareCard from "@/components/game/ShareCard";
import { pickGift } from "@/lib/shareCard";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AppleseedData } from "@/modules/zone-of-genius/appleseedGenerator";
import { ExcaliburData } from "@/modules/zone-of-genius/excaliburGenerator";
import BackButton from "@/components/BackButton";
import NotFound from "@/pages/NotFound";

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
  // The player's own gift sentence (uniqueness phrase, else tagline). The RPC does not
  // return it until docs/specs/share-card/share_card.proposed.sql is applied; absent = null.
  gift_line?: string | null;
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

const PRIVATE_AUDIENCE_COPY_KEY: Record<Exclude<ProfileAudienceValue, "public">, string> = {
  friends: "publicProfile.audienceFriends",
  communities: "publicProfile.audienceCommunities",
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
  const { t } = useTranslation();
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

      let profileData: any = null;
      let zogData: {
        appleseed_data: unknown | null;
        excalibur_data: unknown | null;
        top_three_talents: unknown | null;
      } | null = null;

      if (username) {
        // Root-slug pages use a narrow SECURITY DEFINER projection. Never
        // expose the private game_profiles row (email, entitlements, tokens)
        // merely to render a public profile.
        // The RPC returns a table projection. Read the array directly rather
        // than coercing it to an object with `.maybeSingle()`: PostgREST emits
        // HTTP 406 for the expected zero-row case, polluting the console when
        // a visitor follows an unused username.
        const { data } = await supabase
          .rpc("get_public_profile_by_username", { p_username: username });
        const publicRow = Array.isArray(data) ? data[0] ?? null : data;
        profileData = publicRow;
        if (publicRow) {
          zogData = {
            appleseed_data: publicRow.appleseed_data,
            excalibur_data: publicRow.excalibur_data,
            top_three_talents: publicRow.top_three_talents,
          };
        }
      } else if (userId) {
        // Legacy ID route remains available for signed-in internal links.
        const { data } = await supabase
          .from("game_profiles")
          .select(
            "user_id, first_name, last_name, avatar_url, location, visibility, show_location, show_mission, show_offer, last_zog_snapshot_id"
          )
          .or(`user_id.eq.${userId},id.eq.${userId}`)
          .maybeSingle();
        profileData = data;
      }

      if (!profileData) {
        if (isMounted) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      const visibility = resolveVisibility(profileData.visibility);

      if (!zogData && profileData.last_zog_snapshot_id) {
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
                  .from("match_intros")
                  .select("id")
                  .or(
                    `and(user_a_id.eq.${viewerId},user_b_id.eq.${resolvedUserId}),and(user_a_id.eq.${resolvedUserId},user_b_id.eq.${viewerId})`
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
        setProfile({
          ...profileData,
          last_zog_snapshot_id: profileData.last_zog_snapshot_id ?? null,
          gift_line: typeof profileData.gift_line === "string" ? profileData.gift_line : null,
        } as PublicProfileData);
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

  const fullName = useMemo(() => {
    const parts = [profile?.first_name, profile?.last_name].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : t("publicProfile.communityMember");
  }, [profile?.first_name, profile?.last_name, t]);

  const archetypeTitle = appleseed?.threeLenses?.archetype || appleseed?.vibrationalKey?.name;

  // Visitor gift line: the player's own sentence if the RPC returns it, else the archetype
  // name, else the Top Talent. Never level, never generated filler.
  const gift = useMemo(
    () =>
      pickGift({
        uniquenessPhrase: profile?.gift_line,
        tagline: null,
        topTalent: archetypeTitle || topTalents[0],
      }),
    [profile?.gift_line, archetypeTitle, topTalents],
  );

  useEffect(() => {
    if (!profile || loading) return;
    const title = `${fullName} | Find Your Top Talent`;
    const description =
      gift?.gift ||
      mission?.mission_title ||
      t("publicProfile.metaDescription");
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
  }, [fullName, gift?.gift, loading, mission?.mission_title, profile, t]);

  const visibility = resolveVisibility(profile?.visibility ?? null);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <PremiumLoader size="lg" />
      </div>
    );
  }

  // A root slug that is no username at all (/spaces, /build, /xyz) is a missing page, not a private profile.
  if (!profile && username && !audienceDenyReason) {
    return <NotFound />;
  }

  if (!profile || visibility === "hidden" || audienceDenyReason) {
    // Day 126 — the audience gate (WHO can see) reuses this same private
    // screen, with copy specific to the deny reason. `audienceDenyReason`
    // is null for the pre-existing hidden/missing-profile cases, which keep
    // their original generic copy.
    const audienceCopy = audienceDenyReason ? t(PRIVATE_AUDIENCE_COPY_KEY[audienceDenyReason]) : null;
    return (
      <div className="min-h-dvh flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          {/* Day 91 (Sasha 2026-06-09): navy text tokenized for Aurum —
              hardcoded #2c3150 was invisible on the near-black skins. */}
          <h1 className="text-2xl font-semibold" style={{ color: "var(--skin-text-primary, #2c3150)" }}>{t("publicProfile.privateTitle")}</h1>
          <p className="text-sm" style={{ color: "var(--skin-text-muted, rgba(44,49,80,0.6))" }}>
            {audienceCopy || t("publicProfile.unavailable")}
          </p>
          {audienceDenyReason && !isViewerLoggedIn && (
            <Button onClick={() => navigate(`/auth?redirect=${encodeURIComponent(window.location.pathname)}`)}>
              {t("publicProfile.signIn")}
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
          {/* Share card slice 1: the page leads with the same card the player sends
              (name, photo, gift line, the question). Never level. The one door below
              is the visitor's own start. Answer buttons are slice 2. */}
          <ShareCard
            variant="visitor"
            name={fullName}
            avatarUrl={profile.avatar_url}
            gift={gift?.gift ?? null}
          />
          <div className="mt-5 flex justify-center">
            <Button asChild variant="outline">
              <Link to="/zone-of-genius">{t("publicProfile.door")}</Link>
            </Button>
          </div>

          <div className="mt-8 flex flex-col items-center text-center">
            {archetypeTitle && gift?.giftSource !== "topTalent" && (
              <p className="text-lg font-medium" style={{ color: "var(--skin-text-primary, #2c3150)" }}>✦ {archetypeTitle} ✦</p>
            )}
            {appleseed?.vibrationalKey?.tagline && (
              <p className="mt-2 text-sm italic max-w-xl" style={{ color: "var(--skin-text-muted, rgba(44,49,80,0.6))" }}>
                "{appleseed.vibrationalKey.tagline}"
              </p>
            )}
            {coreVibration && (
              <p className="mt-3 text-sm font-medium" style={{ color: "var(--skin-text-muted, rgba(44,49,80,0.7))" }}>
                {t("publicProfile.coreVibration")}: <span style={{ color: "var(--skin-text-primary, #2c3150)" }}>{coreVibration}</span>
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
              <p className="text-sm uppercase tracking-wide" style={{ color: "var(--skin-text-muted, rgba(44,49,80,0.6))" }}>{t("publicProfile.bio")}</p>
              <p className="mt-2" style={{ color: "var(--skin-text-primary, #2c3150)" }}>{mission.intro_text}</p>
            </div>
          )}

          {canShowOffer && excalibur && (
            <div className="mt-8 rounded-2xl border border-[var(--skin-hairline,rgba(164,163,208,0.2))] bg-[var(--skin-card-fill,rgba(240,244,255,0.5))] p-5 shadow-[0_4px_16px_rgba(44,49,80,0.06)]">
              <p className="text-xs font-medium mb-1" style={{ color: "var(--skin-text-muted, rgba(44,49,80,0.6))" }}>{t("publicProfile.uniqueOffer")}</p>
              <h2 className="text-lg font-semibold" style={{ color: "var(--skin-text-primary, #2c3150)" }}>{excalibur.offer?.statement || excalibur.businessIdentity?.tagline || t("publicProfile.geniusOffer")}</h2>
              <p className="text-sm mt-2" style={{ color: "var(--skin-text-muted, rgba(44,49,80,0.7))" }}>{excalibur.offer?.deliverable || ""}</p>
              <p className="text-sm mt-2" style={{ color: "var(--skin-text-muted, rgba(44,49,80,0.7))" }}>{excalibur.offer?.form || ""}</p>
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <Button onClick={() => navigate("/connections")}>{t("publicProfile.connect")}</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
