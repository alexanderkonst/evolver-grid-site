import { useCallback, useEffect, useMemo, useState } from "react";
import { MapPin, Users, Languages } from "lucide-react";
import { toast } from "sonner";
import GameShellV2 from "@/components/game/GameShellV2";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
// Day 80 (Sasha 2026-05-22): removed imports that the retired
// client-side similarity loop depended on (AppleseedData,
// areComplementary, getComplementarityLabel). Matching v3 lives in the
// suggest-asset-matches edge function — see §5 of the strategy doc.
import MatchCard from "@/components/matchmaking/MatchCard";
import MatchExplainer, { useMatchExplainerState } from "@/components/matchmaking/MatchExplainer";
import { GOLD_TEXT_STYLE, Ornament } from "@/lib/landingDesign";

// ─────────────────────────────────────────────────────────────────────
// Day 63 night (Sasha 2026-05-07) — Aurora register reskin + Strong
// cocktail legibility per docs/03-playbooks/ui_playbook.md Part VIII.
// Page-level surfaces (the cream wash from GameShellV2) get halo-deep
// + weight 700; card-level surfaces (parchment) get halo-soft + weight
// 600. No more `text-white/40` muted on busy bg — that's the v1 → v2
// fight the playbook resolves.
// ─────────────────────────────────────────────────────────────────────

const cormorantTitle: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 700,
    letterSpacing: "-0.005em",
    color: "var(--skin-text-primary, #0b2a5a)",
    textShadow:
        "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
};

// Day 87 (Sasha 2026-05-29) — Strong cocktail applied (ui_playbook
// Part VIII). Mirrors the MatchCard's identical token so page body
// blocks (filter warnings, no-matches state, pagination prose) read
// at the same legibility tier as the cards. Bumped:
//   • weight 600 → 700 (lever 1)
//   • added halo-strong (lever 3 — page body sits over parchment
//     panels with mild video bleed, halo-strong is the right floor)
//   • +0.003em letter-spacing (lever 4 micro)
const sourceSerifBody: React.CSSProperties = {
    fontFamily: "'Source Serif 4', serif",
    fontWeight: 700,
    letterSpacing: "0.003em",
    color: "var(--skin-text-primary, #0b2a5a)",
    textShadow:
        "var(--skin-text-halo-strong, 0 0 12px rgba(255,255,255,0.55), 0 1px 1px rgba(255,255,255,0.85))",
};

const legibleHeadlineHalo =
    "var(--skin-text-halo-deep, 0 0 28px rgba(255,255,255,0.85), 0 1px 2px rgba(255,255,255,0.95), 0 0 1px rgba(11,42,90,0.65), 0 1px 0 rgba(11,42,90,0.45))";

const legibleItalicEcho: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond', serif",
    fontStyle: "italic",
    fontWeight: 700,
    letterSpacing: "0.01em",
    color: "var(--skin-text-primary, #0a1628)",
    textShadow: legibleHeadlineHalo,
};

const eyebrowSmall: React.CSSProperties = {
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontWeight: 500,
    fontSize: "10.5px",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: "var(--skin-accent-gold, #b8860b)",
};

// Day 65 (Sasha 2026-05-09) — bumped both parchment surfaces from
// 0.68 / 0.55 → 0.92 / 0.82 because GameShellV2's video bg can hit
// bright sun-glare frames. At those frames, low-alpha parchment lets
// the bright luminance bleed through and washes out navy text rendered
// ON the card. Per ui_playbook Part VIII: text contrast must hold
// against the card surface, not the bleed. Also strengthened gold
// hairline + shadow so the card still reads as parchment, not a flat
// opaque slab.
const parchmentCard: React.CSSProperties = {
    background: "var(--skin-card-bg, rgba(255, 252, 245, 0.92))",
    border: "0.5px solid rgba(212, 175, 55, 0.55)",
    boxShadow:
        "0 0 22px -8px rgba(212, 175, 55, 0.30), 0 16px 40px -20px rgba(10, 22, 40, 0.22)",
};

const parchmentCardSubtle: React.CSSProperties = {
    background: "rgba(255, 252, 245, 0.82)",
    border: "0.5px solid rgba(212, 175, 55, 0.30)",
    boxShadow: "0 6px 20px -10px rgba(10, 22, 40, 0.16)",
};

interface MatchCandidate {
  id: string;
  name: string;
  archetype: string;
  tagline?: string | null;
  avatarUrl?: string | null;
  similarityScore: number;
  location: string | null;
  showLocation: boolean;
  spokenLanguages: string[];
  matchReason?: string;
  complementary: boolean;
}

interface CandidateWithReasons extends Omit<MatchCandidate, "matchReason"> {
  matchReasons: {
    similar: string;
    complementary: string;
    mission: string;
  };
}

interface MatchGroups {
  similarGenius: MatchCandidate[];
  complementaryGenius: MatchCandidate[];
  similarMission: MatchCandidate[];
}

interface AssetMatchResult {
  userId: string;
  firstName: string;
  lastName: string;
  archetype: string | null;
  tagline: string | null;
  avatarUrl?: string | null;
  resonanceScore: number;
  matchType: string;
  /** Day 80 (Sasha 2026-05-23): three distinct collaboration proposals,
   *  each from a different taxonomy root where possible. The card
   *  renders them stacked one after another. */
  proposals?: Array<{ type: string; proposal: string; evolutionLine?: string }>;
  /** Legacy single-proposal field kept for backward compat with the
   *  pre-triplet pipeline. The card prefers `proposals` when present. */
  collaborationProposal: string;
  suggestedAction: string;
  alignment: string;
  complementarity: string;
  friction: string;
  theirAssets: { typeId: string; title: string }[];
  /** Day 80 (Sasha 2026-05-23): sub-scores surfaced when ?debug=1
   *  is in the URL. Helps testers / Sasha give precise feedback
   *  ("rank 3 felt better than rank 1 — why did the engine flip
   *  them?"). Admin-debug only; not shown in production UI. */
  subScores?: {
    topTalent: number;
    mission: number;
    assets: number;
    qol: number;
  };
}

const SUGGESTED_ACTION_LABELS: Record<string, string> = {
  intro: "Request Intro",
  "micro-collab": "Start Project",
  "practice-together": "Practice Together",
  wait: "Revisit Later",
};

// Day 80 (Sasha 2026-05-23): match-type vocabulary moved from the old
// "co-founder / collaborator / peer / mentor / client-fit" shape labels
// to the 5 layer-1 roots from the collaboration taxonomy. The roots
// are already user-facing (per docs/03-playbooks/collaboration_taxonomy.md);
// no translation needed. Dict kept as a display-tweak hook in case
// we ever want to expand a root into a longer badge label.
const MATCH_TYPE_LABELS: Record<string, string> = {
  "Co-Build": "Co-Build",
  "Co-Learn": "Co-Learn",
  "Co-Distribute": "Co-Distribute",
  "Co-Resource": "Co-Resource",
  "Co-Steward": "Co-Steward",
};

interface CurrentProfile {
  id: string;
  name: string;
  archetype: string;
  location: string | null;
  spokenLanguages: string[];
}

// Day 80 (Sasha 2026-05-22): client-side similarity helpers retired.
// `buildSimilarity`, `getSharedActions`, `hasLanguageOverlap`,
// `normalizeKey` powered the (now-hidden) Section 2 "Collaborators by
// Genius" grouping. Matching v3 moved scoring to the
// `suggest-asset-matches` edge function with the 4-input geometric-mean
// algorithm (see docs/02-strategy/matchmaking_strategy.md §5). The
// helpers were doing N×N work on every page load to populate state that
// never reached the DOM — that compute is now reclaimed.

/** Strip ✦ symbols from archetype strings (still used by MatchCard's
 *  archetype label). */
const stripSymbols = (s: string) => s.replace(/[✦★☆✧⬥◇◆⟐]/g, "").trim();

/**
 * Day 80 (Sasha 2026-05-23, reversal): "See more matches" now does
 * real pagination — fetches additional matches from the engine and
 * appends them to the visible list. The earlier "Fresh matches
 * Monday" scarcity panel is parked at the bottom of this file for
 * post-validation production use. Validation-stage testers need to
 * see the distribution, not a curated three.
 */
interface SeeMoreMatchesPanelProps {
  currentCount: number;
  onLoadMore: () => Promise<number>;
}

const SeeMoreMatchesPanel = ({
  currentCount,
  onLoadMore,
}: SeeMoreMatchesPanelProps) => {
  const [loading, setLoading] = useState(false);
  const [exhausted, setExhausted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (exhausted) {
    return (
      <div className="mt-6 text-center">
        <p
          className="italic"
          style={{
            fontFamily: "'Source Serif 4', serif",
            fontWeight: 500,
            fontSize: "13px",
            color: "var(--skin-text-muted, rgba(11,42,90,0.65))",
          }}
        >
          You've seen everyone the engine has for you this round. As more people complete their profiles, fresh matches will surface.
        </p>
      </div>
    );
  }

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const newCount = await onLoadMore();
      if (newCount <= currentCount) {
        setExhausted(true);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load more matches.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full px-5 py-3 transition-all duration-200 hover:translate-y-[-1px] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 600,
          fontSize: "13px",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--skin-text-primary, #0b2a5a)",
          background: "rgba(255, 252, 245, 0.92)",
          border: "1px solid rgba(212, 175, 55, 0.55)",
          boxShadow:
            "0 6px 20px -10px rgba(10, 22, 40, 0.20), 0 0 0 1px rgba(212, 175, 55, 0.18)",
        }}
      >
        {loading ? "Loading…" : "See more matches →"}
      </button>
      {error && (
        <p
          className="italic"
          style={{
            fontFamily: "'Source Serif 4', serif",
            fontSize: "12px",
            color: "rgba(180, 50, 50, 0.85)",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
};

/**
 * Production-mature "Fresh matches Monday" scarcity panel. Parked here
 * for post-validation use. When the matching engine is producing
 * proven collaborations at volume, re-introduce this in place of the
 * pagination panel above per matchmaking_strategy.md §8.7-§8.8.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _ParkedFreshMatchesMondayPanel = () => (
  <div
    className="mt-6 rounded-2xl px-6 py-5 text-center"
    style={{
      background: "rgba(245, 241, 232, 0.75)",
      border: "0.5px solid rgba(212, 175, 55, 0.40)",
      boxShadow: "0 6px 20px -10px rgba(10, 22, 40, 0.18)",
    }}
  >
    <p
      style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontWeight: 700,
        fontSize: "13px",
        letterSpacing: "0.28em",
        textTransform: "uppercase",
        color: "var(--skin-goldDeep, #5d4307)",
        marginBottom: "8px",
      }}
    >
      Fresh matches Monday
    </p>
    <p
      className="italic mx-auto max-w-md"
      style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontWeight: 700,
        fontSize: "clamp(1.05rem, 2vw, 1.25rem)",
        lineHeight: 1.5,
        color: "var(--skin-text-primary, #0a1628)",
        textShadow:
          "var(--skin-text-halo-deep, 0 0 22px rgba(255,255,255,0.7), 0 1px 2px rgba(255,255,255,0.9), 0 0 1px rgba(11,42,90,0.45), 0 1px 0 rgba(11,42,90,0.25))",
      }}
    >
      Your next matches are warming up. We'll surface them Monday morning, sent straight to your inbox.
    </p>
  </div>
);

const Matchmaking = () => {
  // Day 80 (Sasha 2026-05-23): ?debug=1 in the URL surfaces the four
  // sub-scores below each match card. Validation-only — lets testers
  // give precise feedback on the algorithm ("rank 3 felt better than
  // rank 1; the scores show why"). Never shown to production users.
  const debugMode =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("debug") === "1";

  // Day 79 (Sasha 2026-05-22): explainer state lifted out of the
  // accordion component so we can render it in two positions (top
  // for first-visit, bottom for already-dismissed). See JSX below for
  // the slot pattern.
  const {
    seenAt,
    dismiss: dismissExplainer,
    dismissing: explainerDismissing,
  } = useMatchExplainerState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<MatchGroups>({
    similarGenius: [],
    complementaryGenius: [],
    similarMission: [],
  });
  const [currentProfile, setCurrentProfile] = useState<CurrentProfile | null>(null);
  const [sameLocationOnly, setSameLocationOnly] = useState(false);
  const [sameLanguageOnly, setSameLanguageOnly] = useState(false);
  const [assetMatches, setAssetMatches] = useState<AssetMatchResult[]>([]);
  const [assetMatchesLoading, setAssetMatchesLoading] = useState(false);
  // Day 80 (Sasha 2026-05-23): surface the edge function's contextual
  // message in the empty-state card. Previously the empty state was
  // hardcoded "Complete your Top Talent reveal", which read wrong for
  // users who HAD completed it (they just had no candidates above the
  // 40 threshold yet). The edge function returns a `message` field for
  // each empty-state cause; we render that when present.
  const [matchesMessage, setMatchesMessage] = useState<string | null>(null);

  // Tinder-style: track current AI match index
  const [currentAiMatchIndex, setCurrentAiMatchIndex] = useState(0);
  // Track hidden profiles
  const [hiddenProfiles, setHiddenProfiles] = useState<Set<string>>(new Set());

  // Day 66 wave §8 (Sasha 2026-05-16): match-mechanic state.
  //
  //   interestedUserIds — userIds the current user has expressed interest
  //   in (from-direction match_interests rows). Drives the
  //   "interest-expressed" state on the MatchCard.
  //
  //   mutualUserIds — userIds that are in a match_intros row with the
  //   current user (either canonical direction). Drives the "mutual"
  //   state on the MatchCard.
  //
  //   These get loaded on mount and updated locally on every successful
  //   interest click (avoiding a roundtrip per re-render).
  const [interestedUserIds, setInterestedUserIds] = useState<Set<string>>(new Set());
  const [mutualUserIds, setMutualUserIds] = useState<Set<string>>(new Set());

  // Day 63 night: Skeleton bg matched to parchment-card surface so the
  // shimmer reads against the cream wash, not against an inverted dark.
  const Skeleton = ({ className }: { className?: string }) => (
    <div
      className={`animate-pulse rounded-2xl ${className || ""}`}
      style={{
        background: "rgba(255, 255, 255, 0.45)",
        border: "0.5px solid var(--skin-rule-hairline, rgba(26, 30, 58, 0.08))",
      }}
    />
  );

  // Day 80 (Sasha 2026-05-23): close Pane 2 on mount. The COLLABORATE
  // sub-nav (Find Collaborators / Connections / People Directory /
  // Mission Groups) wasn't adding signal on the matches page itself,
  // and the open pane was visually crowding the match card. The user
  // can re-open it from the rail any time.
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("fytt:close-sections-panel"));
  }, []);

  // Day 80 (Sasha 2026-05-22): the giant loadMatches useEffect that
  // built the (now-hidden) "Collaborators by Genius" three-group view
  // via client-side similarity scoring has been retired. The work it
  // did — fetch all profiles + snapshots + missions + compute N×N
  // similarity — was redundant with the new v3 matching engine that
  // runs in the `suggest-asset-matches` edge function (see
  // docs/02-strategy/matchmaking_strategy.md §5). This useEffect just
  // wires the loading + currentProfile state so the AI matches block
  // still renders correctly.
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Sign in to view matches.");
        setLoading(false);
        return;
      }
      const { data: profile } = await supabase
        .from("game_profiles")
        .select("user_id, first_name, last_name, location, spoken_languages")
        .eq("user_id", user.id)
        .maybeSingle();
      if (profile) {
        setCurrentProfile({
          id: profile.user_id || "",
          name: `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "You",
          archetype: "",
          location: profile.location || null,
          spokenLanguages: Array.isArray(profile.spoken_languages)
            ? profile.spoken_languages
            : [],
        });
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // Load asset matches from edge function
  useEffect(() => {
    const loadAssetMatches = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setAssetMatchesLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("suggest-asset-matches", {
          body: { userId: user.id },
        });

        if (error) {
          console.warn("[AssetMatching] Edge function error:", error.message);
          setMatchesMessage("We hit a snag loading matches. Try again in a moment.");
          return;
        }

        // Capture any contextual empty-state message the edge function returns.
        if (typeof data?.message === "string") {
          setMatchesMessage(data.message);
        }

        if (data?.matches) {
          // Fetch avatar URLs for matched users
          const userIds = data.matches.map((m: any) => m.userId);
          const { data: avatarRows } = await supabase
            .from("game_profiles")
            .select("user_id, avatar_url")
            .in("user_id", userIds);

          const avatarMap = new Map<string, string | null>();
          (avatarRows || []).forEach((row: any) => {
            avatarMap.set(row.user_id, row.avatar_url);
          });

          const enriched = data.matches.map((m: any) => ({
            ...m,
            avatarUrl: avatarMap.get(m.userId) || null,
          }));

          setAssetMatches(enriched);
        }
      } catch (err) {
        console.warn("[AssetMatching] Exception:", err);
      } finally {
        setAssetMatchesLoading(false);
      }
    };

    loadAssetMatches();
  }, []);

  // Day 80 (Sasha 2026-05-23): re-fetch with a higher cap when the
  // user clicks "See more matches". Returns the new total count so
  // the panel knows whether to mark itself exhausted (no growth →
  // engine returned everything it has).
  const loadMoreMatches = useCallback(async (): Promise<number> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return assetMatches.length;
    const targetLimit = Math.min(assetMatches.length + 5, 25);
    const { data, error } = await supabase.functions.invoke(
      "suggest-asset-matches",
      { body: { userId: user.id, limit: targetLimit } },
    );
    if (error || !data?.matches) {
      throw new Error(error?.message || "Could not load more matches.");
    }
    const userIds = data.matches.map((m: any) => m.userId);
    const { data: avatarRows } = await supabase
      .from("game_profiles")
      .select("user_id, avatar_url")
      .in("user_id", userIds);
    const avatarMap = new Map<string, string | null>();
    (avatarRows || []).forEach((row: any) => {
      avatarMap.set(row.user_id, row.avatar_url);
    });
    const enriched = data.matches.map((m: any) => ({
      ...m,
      avatarUrl: avatarMap.get(m.userId) || null,
    }));
    setAssetMatches(enriched);
    return enriched.length;
  }, [assetMatches.length]);

  // Day 66 wave §8 (Sasha 2026-05-16): load the current user's
  // match-mechanic state — which userIds they've expressed interest in
  // (match_interests.from_user_id = me) and which they're in a mutual
  // intro with (match_intros where either user_a_id or user_b_id = me).
  // Used to drive the MatchCard's interactionState.
  useEffect(() => {
    const loadMatchState = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      try {
        // Interest the current user has expressed (from-direction only)
        const { data: interestRows, error: interestErr } = await (supabase as any)
          .from("match_interests")
          .select("to_user_id")
          .eq("from_user_id", user.id);
        if (!interestErr && Array.isArray(interestRows)) {
          setInterestedUserIds(
            new Set(interestRows.map((r: { to_user_id: string }) => r.to_user_id))
          );
        }

        // Mutual intros (either side)
        const { data: introRows, error: introErr } = await (supabase as any)
          .from("match_intros")
          .select("user_a_id, user_b_id")
          .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`);
        if (!introErr && Array.isArray(introRows)) {
          const otherIds = new Set<string>();
          for (const row of introRows as Array<{ user_a_id: string; user_b_id: string }>) {
            otherIds.add(row.user_a_id === user.id ? row.user_b_id : row.user_a_id);
          }
          setMutualUserIds(otherIds);
        }
      } catch (err) {
        // Tables may not exist yet (pre-migration). Silent — UI falls
        // back to "default" state on all cards.
        console.warn("[Matchmaking] match-state load failed (pre-migration?):", err);
      }
    };
    loadMatchState();
  }, []);

  // Day 80 (Sasha 2026-05-22): location + language filters retired
  // alongside the client-side similarity loop. They only operated on
  // the (now-hidden) Section 2 groups. AI matches from the v3 engine
  // carry their own friction signal — LLM-detected timezone/language
  // mismatch lives in match.friction prose.

  // Filter out hidden AI matches.
  const visibleAiMatches = assetMatches.filter((m) => !hiddenProfiles.has(m.userId));
  const hasAnyMatches = visibleAiMatches.length > 0 || assetMatchesLoading;

  // Compile-only stand-ins for the still-in-file (but `false &&` gated)
  // Section 2 JSX. When that block is fully deleted (next pass),
  // remove these and the filter row JSX referencing them too.
  const filteredGroups = {
    similarGenius: [] as MatchCandidate[],
    complementaryGenius: [] as MatchCandidate[],
    similarMission: [] as MatchCandidate[],
  };
  const locationBlocked = false;
  const languageBlocked = false;

  // Clamp index
  const clampedIndex = Math.min(currentAiMatchIndex, Math.max(0, visibleAiMatches.length - 1));
  const currentAiMatch = visibleAiMatches[clampedIndex];

  const handleAiPass = () => {
    if (currentAiMatch) {
      setHiddenProfiles(prev => new Set([...prev, currentAiMatch.userId]));
      // Stay at same index (next profile slides in)
      if (clampedIndex >= visibleAiMatches.length - 1) {
        setCurrentAiMatchIndex(Math.max(0, clampedIndex - 1));
      }
    }
  };

  // Day 67 §8.6 (Sasha 2026-05-19): Active Introduction layer.
  //
  // The §8 client-side reverse-check + mutual-detection-on-click flow
  // is replaced by the email-consent flow. New shape:
  //
  //   1. INSERT into match_interests (from = me, to = target).
  //   2. INVOKE send-match-headsup-email — fires a heads-up email to
  //      the other person with two magic-link buttons (Yes / Not now).
  //   3. The match-consent edge function handles the click — it owns
  //      mutual detection, match_intros insertion, and bilateral intro
  //      email firing. Server-side, single source of truth.
  //
  // The card flips to "interest-expressed" state immediately. The
  // "mutual" state arrives when (and if) the other party clicks Yes
  // in their email — that happens out-of-band; the user can come
  // back later to see the state has updated.
  const handleExpressInterest = async () => {
    if (!currentAiMatch) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Sign in to express interest in a match.");
        return;
      }

      const targetUserId = currentAiMatch.userId;
      const whyText = [
        currentAiMatch.collaborationProposal,
        currentAiMatch.alignment,
        currentAiMatch.complementarity,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();
      const compoundType = currentAiMatch.matchType || null;

      // (1) Insert match_interests (from = me, to = target). On
      // unique_violation we treat it as "you already expressed interest
      // — heads-up was sent before" and still surface the calm state.
      const { data: insertedRow, error: insertError } = await (supabase as any)
        .from("match_interests")
        .insert({
          from_user_id: user.id,
          to_user_id: targetUserId,
          match_score: currentAiMatch.resonanceScore ?? null,
          compound_type: compoundType,
          ai_why_text: whyText,
        })
        .select("id")
        .maybeSingle();

      let matchInterestId: string | null =
        (insertedRow as { id?: string } | null)?.id ?? null;

      if (insertError) {
        if ((insertError as { code?: string }).code === "23505") {
          // Already exists — fetch the existing row id so we can re-fire
          // the heads-up if the prior one didn't reach its destination.
          const { data: existing } = await (supabase as any)
            .from("match_interests")
            .select("id, headsup_email_status")
            .eq("from_user_id", user.id)
            .eq("to_user_id", targetUserId)
            .maybeSingle();
          matchInterestId = (existing as { id?: string } | null)?.id ?? null;
        } else {
          throw insertError;
        }
      }

      // Local state: this user is now "interest-expressed."
      setInterestedUserIds((prev) => new Set([...prev, targetUserId]));

      // (2) Fire heads-up email — server handles all the gating
      // (opt-out, suppression, no-email, already-connected, rate-limit).
      if (matchInterestId) {
        try {
          const { error: headsupErr } = await supabase.functions.invoke(
            "send-match-headsup-email",
            { body: { match_interest_id: matchInterestId } },
          );
          if (headsupErr) throw headsupErr;
          toast.success(
            `Heads-up email sent to ${currentAiMatch.firstName}. We'll introduce you both if they say yes.`,
          );
        } catch (emailErr) {
          console.warn("[handleExpressInterest] heads-up email failed:", emailErr);
          toast.success(
            `Interest in ${currentAiMatch.firstName} recorded. (Heads-up email may be delayed; we'll retry.)`,
          );
        }
      } else {
        toast.success(
          `Interest in ${currentAiMatch.firstName} recorded.`,
        );
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Couldn't record your interest.";
      toast.error(message);
    }
  };

  // Day 66 wave §8: withdraw expressed interest. Deletes the from→to
  // row in match_interests so the card returns to "default" state.
  // Does NOT delete any existing match_intros (the mutual event, if
  // already fired, stands as a recorded event).
  const handleWithdrawInterest = async () => {
    if (!currentAiMatch) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await (supabase as any)
        .from("match_interests")
        .delete()
        .eq("from_user_id", user.id)
        .eq("to_user_id", currentAiMatch.userId);
      if (error) throw error;
      setInterestedUserIds((prev) => {
        const next = new Set(prev);
        next.delete(currentAiMatch.userId);
        return next;
      });
      toast.info(`Withdrew your interest in ${currentAiMatch.firstName}.`);
    } catch (err) {
      console.warn("[handleWithdrawInterest] failed:", err);
      toast.error("Couldn't withdraw interest. Try again.");
    }
  };

  const renderMatch = (match: MatchCandidate) => (
    <div
      key={match.id}
      className="rounded-2xl p-4"
      style={parchmentCardSubtle}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
            style={{
              background: "rgba(212, 175, 55, 0.10)",
              border: "0.5px solid rgba(212, 175, 55, 0.45)",
            }}
          >
            {match.avatarUrl ? (
              <img src={match.avatarUrl} alt={match.name} className="w-full h-full object-cover" />
            ) : (
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 700,
                  fontSize: "16px",
                  color: "var(--skin-goldDeep, #5d4307)",
                }}
              >
                {match.name.charAt(0)}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <h3
              style={{
                ...cormorantTitle,
                fontSize: "15px",
                fontWeight: 700,
              }}
              className="truncate"
            >
              {match.name}
            </h3>
            <p
              style={{
                fontFamily: "'Source Serif 4', serif",
                fontStyle: "italic",
                fontWeight: 700,
                letterSpacing: "0.01em",
                fontSize: "12.5px",
                color: "var(--skin-text-primary, #0b2a5a)",
                textShadow:
                  "var(--skin-text-halo-strong, 0 0 12px rgba(255,255,255,0.55), 0 1px 1px rgba(255,255,255,0.85))",
              }}
              className="truncate"
            >
              {stripSymbols(match.archetype)}
            </p>
          </div>
        </div>
        <span
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: "10.5px",
            fontWeight: 500,
            fontVariantNumeric: "tabular-nums lining-nums",
            padding: "2px 8px",
            borderRadius: "999px",
            color: "var(--skin-goldDeep, #5d4307)",
            background: "rgba(212, 175, 55, 0.10)",
            border: "0.5px solid rgba(212, 175, 55, 0.40)",
            flexShrink: 0,
          }}
        >
          {match.similarityScore}%
        </span>
      </div>
      {match.matchReason && (
        <p
          className="mt-2 italic"
          style={{
            fontFamily: "'Source Serif 4', serif",
            fontStyle: "italic",
            fontWeight: 700,
            letterSpacing: "0.01em",
            fontSize: "13px",
            lineHeight: 1.55,
            color: "var(--skin-text-primary, #0b2a5a)",
            textShadow:
              "var(--skin-text-halo-strong, 0 0 12px rgba(255,255,255,0.55), 0 1px 1px rgba(255,255,255,0.85))",
          }}
        >
          {match.matchReason}
        </p>
      )}
    </div>
  );

  return (
    <GameShellV2>
      <div className="p-6 lg:p-8 max-w-3xl mx-auto">

        {/* ═══════ HEADER — Aurora editorial register ═══════ */}
        {/* Cormorant headline with GOLD_TEXT_STYLE accent + italic echo
            + Ornament — same rhythm as `/`, `/zone-of-genius`, dossier.
            Day 79 (Sasha 2026-05-22) — title broadened to include
            co-founders (match-path users are often founders looking
            for co-founders, not just collaborators); subtitle promoted
            from "resonates" to "complements" because the matching
            mechanic is built on complementarity (different top talents
            that fit together), not similarity. Subtitle font bumped
            from clamp(16px,1.7vw,20px) → clamp(18px,2vw,22px) to read
            as a real sub-promise, not an afterthought. */}
        <header className="text-center mb-8">
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.1] tracking-[-0.018em] mb-3 sm:mb-4"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "var(--skin-text-primary, #0a1628)",
              textShadow: legibleHeadlineHalo,
            }}
          >
            Find{" "}
            <span className="bg-clip-text text-transparent" style={GOLD_TEXT_STYLE}>
              collaborators
            </span>
            {" "}and{" "}
            <span className="bg-clip-text text-transparent" style={GOLD_TEXT_STYLE}>
              co-founders
            </span>
          </h1>
          <p
            className="text-lg sm:text-xl md:text-2xl leading-[1.32]"
            style={{
              ...legibleItalicEcho,
              fontSize: "clamp(18px, 2vw, 22px)",
            }}
          >
            People whose work complements yours
          </p>
          <Ornament className="my-6 sm:my-7" />
        </header>

        {/* Day 79 (Sasha 2026-05-22): "How introductions work" explainer
            now uses a slot pattern. First-visit users see it
            auto-expanded at the TOP (before the matches content). Once
            they click "Got it", the top instance hides and the bottom
            instance below the matches content takes its place,
            collapsed. State is lifted via useMatchExplainerState so the
            two slots share one source of truth — clicking Got it in
            the top instance triggers the bottom instance to mount on
            the next render. */}
        {seenAt === null && (
          <MatchExplainer
            seenAt={seenAt}
            onDismiss={dismissExplainer}
            dismissing={explainerDismissing}
          />
        )}

        {/* Loading — only show the page-level skeleton while we have
            NO data and the matches engine is still in flight. Previously
            this was gated on the unrelated `loading` flag from initAuth,
            which kept the skeleton visible even after match data had
            arrived if the auth/profile fetch was slow. */}
        {assetMatchesLoading && assetMatches.length === 0 && !error && (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}

        {/* Error */}
        {!!error && (
          <div
            className="rounded-2xl px-5 py-5 text-center"
            style={{
              background: "rgba(184, 60, 60, 0.06)",
              border: "0.5px solid rgba(184, 60, 60, 0.30)",
              boxShadow: "0 4px 16px -8px rgba(184, 60, 60, 0.18)",
            }}
          >
            <p
              style={{
                fontFamily: "'Source Serif 4', serif",
                fontStyle: "italic",
                fontWeight: 700,
                letterSpacing: "0.01em",
                fontSize: "15px",
                color: "rgba(140, 60, 60, 0.95)",
                textShadow:
                  "var(--skin-text-halo-strong, 0 0 12px rgba(255,255,255,0.55), 0 1px 1px rgba(255,255,255,0.85))",
              }}
            >
              {error}
            </p>
          </div>
        )}

        {/* Filter warnings — gold-tinted parchment */}
        {!loading && !error && (locationBlocked || languageBlocked) && (
          <div
            className="rounded-2xl px-5 py-4 mb-6"
            style={{
              background: "rgba(212, 175, 55, 0.08)",
              border: "0.5px solid rgba(212, 175, 55, 0.40)",
            }}
          >
            <p
              className="italic"
              style={{
                fontFamily: "'Source Serif 4', serif",
                fontStyle: "italic",
                fontWeight: 700,
                letterSpacing: "0.01em",
                fontSize: "13.5px",
                lineHeight: 1.55,
                color: "var(--skin-goldDeep, #5d4307)",
                textShadow:
                  "var(--skin-text-halo-strong, 0 0 12px rgba(255,255,255,0.55), 0 1px 1px rgba(255,255,255,0.85))",
              }}
            >
              {locationBlocked && "Add your location in your profile to use the location filter. "}
              {languageBlocked && "Add spoken languages in your profile to use the language filter."}
            </p>
          </div>
        )}

        {/* No-matches state — Aurora ceremonial empty */}
        {!loading && !error && !hasAnyMatches && (
          <div
            className="rounded-2xl px-6 py-10 text-center"
            style={parchmentCard}
          >
            <h2
              style={{
                ...cormorantTitle,
                fontSize: "22px",
                fontWeight: 700,
                textShadow: legibleHeadlineHalo,
              }}
              className="mb-2"
            >
              No matches yet
            </h2>
            <p
              className="italic"
              style={{
                ...legibleItalicEcho,
                fontSize: "16px",
                lineHeight: 1.55,
              }}
            >
              {matchesMessage ||
                "As more people complete their profiles, this fills in."}
            </p>
          </div>
        )}

        {!loading && !error && hasAnyMatches && (
          <div className="space-y-10">
            {/* ═════════════════════════════════════════
                SECTION 1: AI-POWERED MATCHES (TOP)
                Tinder-style: one profile at a time
                ═════════════════════════════════════════ */}
            {/* Day 79 (Sasha 2026-05-22): "✦ AI-Powered Matches"
                eyebrow + "Collaboration Proposals" h2 + "Win-win
                collaboration proposals powered by your full profile"
                subtitle all removed. Sasha: the page header already
                names the surface ("Find collaborators and co-founders
                / People whose work complements yours"), and the
                MatchExplainer accordion below it explains the
                mechanic. The section-level repeat was visual weight
                without payload — and the "AI-powered" framing
                undercut the editorial register by leaning on the
                tech-buzzword. The card carries everything the user
                needs from here. */}
            <section>
              {assetMatchesLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : visibleAiMatches.length > 0 && currentAiMatch ? (
                <MatchCard
                  key={currentAiMatch.userId}
                  user={{
                    id: currentAiMatch.userId,
                    firstName: currentAiMatch.firstName,
                    lastName: currentAiMatch.lastName,
                    archetype: currentAiMatch.archetype || "Community Member",
                    tagline: currentAiMatch.tagline,
                    avatarUrl: currentAiMatch.avatarUrl || null,
                  }}
                  // Day 80 (Sasha 2026-05-23): prefer the new triplet
                  // shape when present; fall back to the legacy single
                  // proposal for any in-flight match objects that
                  // pre-date the edge fn redeploy.
                  proposals={
                    currentAiMatch.proposals && currentAiMatch.proposals.length > 0
                      ? currentAiMatch.proposals
                      : currentAiMatch.collaborationProposal
                        ? [{ type: "Collaboration", proposal: currentAiMatch.collaborationProposal }]
                        : undefined
                  }
                  matchTypeBadge={MATCH_TYPE_LABELS[currentAiMatch.matchType] || currentAiMatch.matchType}
                  resonanceScore={currentAiMatch.resonanceScore}
                  secondaryLabel="Why this works"
                  secondaryReason={`${currentAiMatch.alignment} ${currentAiMatch.complementarity}`}
                  tertiaryLabel={currentAiMatch.friction !== "None identified" ? "Watch out for" : undefined}
                  tertiaryReason={currentAiMatch.friction !== "None identified" ? currentAiMatch.friction : undefined}
                  connectLabel="I'd like to meet"
                  onPass={handleAiPass}
                  onConnect={handleExpressInterest}
                  onWithdraw={handleWithdrawInterest}
                  interactionState={
                    mutualUserIds.has(currentAiMatch.userId)
                      ? "mutual"
                      : interestedUserIds.has(currentAiMatch.userId)
                        ? "interest-expressed"
                        : "default"
                  }
                  currentIndex={clampedIndex}
                  totalCount={visibleAiMatches.length}
                  onPrev={() => setCurrentAiMatchIndex(Math.max(0, clampedIndex - 1))}
                  onNext={() => setCurrentAiMatchIndex(Math.min(visibleAiMatches.length - 1, clampedIndex + 1))}
                />
              ) : null}
              {/* Day 80 (Sasha 2026-05-23): debug strip — only visible
                  when ?debug=1. Surfaces the four sub-scores so testers
                  can give precise feedback on the algorithm's ranking. */}
              {debugMode && currentAiMatch?.subScores && (
                <div
                  className="mt-3 rounded-xl px-4 py-3 mx-auto"
                  style={{
                    maxWidth: "32rem",
                    background: "rgba(11, 42, 90, 0.85)",
                    color: "rgba(245, 245, 250, 0.95)",
                    fontFamily: "'DM Sans', system-ui, monospace",
                    fontSize: "11.5px",
                    letterSpacing: "0.04em",
                    boxShadow: "0 4px 16px -8px rgba(10, 22, 40, 0.4)",
                  }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span style={{ opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.18em", fontSize: "10px" }}>
                      Debug · sub-scores
                    </span>
                    <span style={{ fontWeight: 700 }}>
                      composite: {currentAiMatch.resonanceScore}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <span>
                      top_talent: <strong>{currentAiMatch.subScores.topTalent.toFixed(2)}</strong>
                    </span>
                    <span>
                      mission: <strong>{currentAiMatch.subScores.mission.toFixed(2)}</strong>
                    </span>
                    <span>
                      assets: <strong>{currentAiMatch.subScores.assets.toFixed(2)}</strong>
                    </span>
                    <span>
                      qol: <strong>{currentAiMatch.subScores.qol.toFixed(2)}</strong>
                    </span>
                  </div>
                </div>
              )}
              {/* Empty state when the engine returned no matches but
                  the user is loaded. Was previously the else-branch
                  of the MatchCard render; lifted out as a sibling so
                  the debug strip (above) can render between MatchCard
                  and the empty state without nesting hell. */}
              {!assetMatchesLoading &&
                !(visibleAiMatches.length > 0 && currentAiMatch) && (
                <div
                  className="rounded-2xl px-5 py-6 text-center"
                  style={parchmentCardSubtle}
                >
                  <p
                    className="italic"
                    style={{
                      fontFamily: "'Source Serif 4', serif",
                      fontStyle: "italic",
                      fontWeight: 700,
                      letterSpacing: "0.01em",
                      fontSize: "14px",
                      lineHeight: 1.55,
                      color: "var(--skin-text-primary, #0b2a5a)",
                      textShadow:
                        "var(--skin-text-halo-strong, 0 0 12px rgba(255,255,255,0.55), 0 1px 1px rgba(255,255,255,0.85))",
                    }}
                  >
                    {assetMatches.length > 0
                      ? "You've reviewed all AI matches. New ones will appear as more people join."
                      : "Complete your Top Talent reveal and map your assets to unlock AI-powered matching."}
                  </p>
                </div>
              )}

              {/* Day 80 (Sasha 2026-05-23, reversal): "See more matches"
                  does real pagination — re-fetches the engine with a
                  higher `limit` and replaces state. Validation-stage
                  testers need to see the distribution. */}
              {!assetMatchesLoading && visibleAiMatches.length > 0 && (
                <SeeMoreMatchesPanel
                  currentCount={assetMatches.length}
                  onLoadMore={loadMoreMatches}
                />
              )}
            </section>

            {/* ═════════════════════════════════════════
                SECTION 2: GENIUS MATCHES (BOTTOM)
                Category-based list view
                ═════════════════════════════════════════ */}
            {/* Day 79 (Sasha 2026-05-22): entire "Collaborators by
                Genius" section hidden (Similar Genius / Complementary
                Genius / Similar Mission three-group list + filter
                row). Sasha: this is work we never completed, so it
                shouldn't be on the page. Surfacing it with "No
                matches yet" placeholders for every sub-group reads as
                ghosted-unfinished UI — same anti-pattern as locked
                nav with fog-of-war. Hide-don't-show is correct.
                The JSX is preserved below behind a `false &&` gate so
                the layout / styles / data wiring are intact for when
                we actually finish the network-side matching. */}
            {false && (
            <section>
              {/* Day 65 (Sasha 2026-05-09): same eyebrow + intro bumps as
                  Section 1 above for legibility consistency. */}
              <div className="mb-5">
                <div
                  style={{
                    ...eyebrowSmall,
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "var(--skin-goldDeep, #5d4307)",
                    textShadow:
                      "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
                  }}
                  className="mb-2"
                >
                  <Users className="w-3.5 h-3.5 inline-block mr-1.5 align-[-2px]" />
                  Your network
                </div>
                <h2
                  style={{
                    ...cormorantTitle,
                    fontSize: "28px",
                    fontWeight: 700,
                    textShadow: legibleHeadlineHalo,
                  }}
                  className="leading-[1.2] mb-1.5"
                >
                  Collaborators by Genius
                </h2>
                <p
                  className="italic"
                  style={{
                    ...legibleItalicEcho,
                    fontSize: "17px",
                    lineHeight: 1.5,
                  }}
                >
                  People in the network whose Top Talent complements yours.
                </p>
              </div>

              {/* Filters — parchment with editorial labels */}
              <div
                className="rounded-2xl px-5 py-4 mb-6"
                style={parchmentCard}
              >
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4" style={{ color: "var(--skin-accent-gold, #b8860b)" }} />
                    <div>
                      <p
                        style={{
                          fontFamily: "'DM Sans', system-ui, sans-serif",
                          fontWeight: 500,
                          fontSize: "11px",
                          letterSpacing: "0.16em",
                          textTransform: "uppercase",
                          color: "var(--skin-text-muted, rgba(11, 42, 90, 0.93))",
                        }}
                      >
                        Same location
                      </p>
                      <p
                        style={{
                          ...sourceSerifBody,
                          fontSize: "13px",
                          lineHeight: 1.45,
                        }}
                      >
                        {currentProfile?.location ? currentProfile.location : "Add your location to enable"}
                      </p>
                    </div>
                    <Switch
                      checked={sameLocationOnly}
                      onCheckedChange={setSameLocationOnly}
                      aria-label="Filter matches by same location"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Languages className="w-4 h-4" style={{ color: "var(--skin-accent-gold, #b8860b)" }} />
                    <div>
                      <p
                        style={{
                          fontFamily: "'DM Sans', system-ui, sans-serif",
                          fontWeight: 500,
                          fontSize: "11px",
                          letterSpacing: "0.16em",
                          textTransform: "uppercase",
                          color: "var(--skin-text-muted, rgba(11, 42, 90, 0.93))",
                        }}
                      >
                        Same language
                      </p>
                      <p
                        style={{
                          ...sourceSerifBody,
                          fontSize: "13px",
                          lineHeight: 1.45,
                        }}
                      >
                        {currentProfile?.spokenLanguages?.length
                          ? currentProfile.spokenLanguages.join(", ")
                          : "Add languages to enable"}
                      </p>
                    </div>
                    <Switch
                      checked={sameLanguageOnly}
                      onCheckedChange={setSameLanguageOnly}
                      aria-label="Filter matches by shared language"
                    />
                  </div>
                </div>
              </div>

              {/* Three sub-groups — Similar / Complementary / Similar Mission */}
              {([
                {
                  title: "Similar Genius",
                  copy: "People who think and operate like you.",
                  matches: filteredGroups.similarGenius,
                  empty: "No similar genius matches yet.",
                },
                {
                  title: "Complementary Genius",
                  copy: "Great co-founder or collaborator fit.",
                  matches: filteredGroups.complementaryGenius,
                  empty: "No complementary matches yet.",
                },
                {
                  title: "Similar Mission",
                  copy: "People aligned with your current mission.",
                  matches: filteredGroups.similarMission,
                  empty: "No mission matches yet.",
                },
              ] as const).map((group) => (
                <div key={group.title} className="mb-6 last:mb-0">
                  <div className="mb-3">
                    <h3
                      style={{
                        ...cormorantTitle,
                        fontSize: "18px",
                        fontWeight: 700,
                      }}
                    >
                      {group.title}
                    </h3>
                    <p
                      className="italic"
                      style={{
                        fontFamily: "'Source Serif 4', serif",
                        fontStyle: "italic",
                        fontWeight: 500,
                        fontSize: "13px",
                        color: "var(--skin-text-muted, rgba(11, 42, 90, 0.93))",
                      }}
                    >
                      {group.copy}
                    </p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {group.matches.map(renderMatch)}
                    {group.matches.length === 0 && (
                      <div
                        className="rounded-2xl px-4 py-3.5 italic"
                        style={{
                          ...parchmentCardSubtle,
                          fontFamily: "'Source Serif 4', serif",
                          fontStyle: "italic",
                          fontWeight: 500,
                          fontSize: "13.5px",
                          color: "var(--skin-text-muted, rgba(11, 42, 90, 0.93))",
                        }}
                      >
                        {group.empty}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </section>
            )}

            {/* Day 79 (Sasha 2026-05-22): MatchExplainer bottom slot.
                Renders only after the user has dismissed the top
                instance (seenAt is a string, not null). Stays
                collapsed by default — the user already saw the
                content; this is a "rules of engagement" reference
                that they can re-expand at the bottom of the page if
                they need a refresher. */}
            {typeof seenAt === "string" && (
              <div className="mt-10">
                <MatchExplainer
                  seenAt={seenAt}
                  onDismiss={dismissExplainer}
                  dismissing={explainerDismissing}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </GameShellV2>
  );
};

export default Matchmaking;
