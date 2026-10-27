import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { markMainQuestProgress } from "@/lib/mainQuestApi";
import { useSoulColors } from "@/hooks/useSoulColors";
import {
  CRYSTAL_CONTINUE_PATH,
  CRYSTAL_QUEST_MAX,
  CRYSTAL_SHARE_COPY,
  FIRST_QUEST_PROGRESS_KEY,
  WORLD_ACCENT_STORAGE_KEY,
  buildEssenceLine,
  buildQuestPlaceholder,
  buildSpectrumGradient,
  normalizeSoulColors,
  parseFirstQuest,
  questStorageKey,
  sanitizeQuest,
  type FirstQuest,
  type SoulTriple,
} from "@/lib/crystal";
import { canvasToPngBlob, renderCrystalCard } from "@/lib/crystalCard";
import "./GameTitle.css";
import "./GameCrystal.css";

/**
 * GameCrystal — "Your Crystal", the character-creation reveal after NEW GAME.
 *
 * Source of truth: docs/02-strategy/game_of_being_you.md §3 (Spectrum
 * mechanic) and docs/02-strategy/game_design_almanac.md v0.4 (27th act: the
 * player's first move is writing their own quest). Same visual language as
 * GameTitle. Copy says "Uniqueness", never "Genius".
 */

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=IBM+Plex+Mono:wght@300;400&display=swap";
const GEM_SRC = "/game/gems/gem_dodeca.png";
const RITUAL_MS = 2000;
const COLORS_TIMEOUT_MS = 6000;

type Phase = "loading" | "ritual" | "revealed";

interface CrystalData {
  profileId: string | null;
  name: string;
  archetypeTitle: string | null;
  corePattern: string | null;
  talents: string[];
  savedColors: string[] | null;
  quest: FirstQuest | null;
}

const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> =>
  new Promise((resolve, reject) => {
    const id = window.setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(
      (v) => {
        window.clearTimeout(id);
        resolve(v);
      },
      (e) => {
        window.clearTimeout(id);
        reject(e);
      },
    );
  });

const usePrefersReducedMotion = () => {
  const [reduce, setReduce] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduce;
};

const readLocalQuest = (profileId: string | null): FirstQuest | null => {
  if (!profileId) return null;
  try {
    const raw = window.localStorage.getItem(questStorageKey(profileId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<FirstQuest>;
    const text = typeof parsed.text === "string" ? sanitizeQuest(parsed.text) : "";
    return text ? { text, written_at: typeof parsed.written_at === "string" ? parsed.written_at : "" } : null;
  } catch {
    return null;
  }
};

const GameCrystal = () => {
  const reduceMotion = usePrefersReducedMotion();
  const [data, setData] = useState<CrystalData | null>(null);
  const [aiColors, setAiColors] = useState<string[] | null>(null);
  const [colorsSettled, setColorsSettled] = useState(false);
  const [ritualDone, setRitualDone] = useState(false);
  const [phase, setPhase] = useState<Phase>("loading");

  const [draft, setDraft] = useState("");
  const [quest, setQuest] = useState<FirstQuest | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveNote, setSaveNote] = useState<string | null>(null);

  const [cardUrl, setCardUrl] = useState<string | null>(null);
  const [cardError, setCardError] = useState(false);
  const cardBlob = useRef<Blob | null>(null);
  const [shareNote, setShareNote] = useState<string | null>(null);

  // Deterministic palette (archetype title, else the profile id) used when the
  // edge function fails or returns fewer than three colors.
  const fallback = useSoulColors(null, data?.archetypeTitle || data?.profileId || "crystal");

  const colors: SoulTriple | null = useMemo(() => {
    if (!data || !colorsSettled) return null;
    return (
      normalizeSoulColors(data.savedColors) ??
      normalizeSoulColors(aiColors) ??
      normalizeSoulColors(fallback.colors) ??
      null
    );
  }, [data, colorsSettled, aiColors, fallback.colors]);

  const essence = useMemo(
    () => (data ? buildEssenceLine(data.archetypeTitle, data.corePattern) : ""),
    [data],
  );

  // Fonts + tab title, scoped to this page (same approach as GameTitle).
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONTS_HREF;
    document.head.appendChild(link);
    const prevTitle = document.title;
    document.title = "Your Crystal · FindYourTopTalent";
    return () => {
      link.remove();
      document.title = prevTitle;
    };
  }, []);

  // Load the player, their snapshot, saved colors and any saved first quest.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let profileId: string | null = null;
      try {
        profileId = await getOrCreateGameProfileId();
      } catch {
        profileId = null;
      }

      let row: Record<string, unknown> | null = null;
      if (profileId) {
        const { data: profile } = await supabase
          .from("game_profiles")
          .select("*")
          .eq("id", profileId)
          .maybeSingle();
        row = (profile as unknown as Record<string, unknown>) ?? null;
      }

      // Snapshot: the pointer first, newest row as a safety net.
      type SnapshotRow = { archetype_title: string | null; core_pattern: string | null; top_three_talents: string[] | null };
      let snapshot: SnapshotRow | null = null;
      const pointer = row?.last_zog_snapshot_id as string | null | undefined;
      if (pointer) {
        const { data: s } = await supabase
          .from("zog_snapshots")
          .select("archetype_title, core_pattern, top_three_talents")
          .eq("id", pointer)
          .maybeSingle();
        snapshot = (s as SnapshotRow | null) ?? null;
      }
      if (!snapshot && profileId) {
        const { data: s } = await supabase
          .from("zog_snapshots")
          .select("archetype_title, core_pattern, top_three_talents")
          .eq("profile_id", profileId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        snapshot = (s as SnapshotRow | null) ?? null;
      }

      const first = typeof row?.first_name === "string" ? row.first_name : "";
      const last = typeof row?.last_name === "string" ? row.last_name : "";
      const savedQuest = parseFirstQuest(row?.main_quest_progress) ?? readLocalQuest(profileId);
      const loaded: CrystalData = {
        profileId,
        name: `${first} ${last}`.trim() || "Player",
        archetypeTitle: snapshot?.archetype_title ?? null,
        corePattern: snapshot?.core_pattern ?? null,
        talents: Array.isArray(snapshot?.top_three_talents) ? (snapshot!.top_three_talents as string[]) : [],
        savedColors: Array.isArray(row?.soul_colors) ? (row!.soul_colors as string[]) : null,
        quest: savedQuest,
      };
      if (cancelled) return;
      setData(loaded);
      setQuest(loaded.quest);

      // Colors: saved palette wins; otherwise ask the existing edge function
      // (it also stores the palette on the profile). Any failure falls back to
      // the deterministic palette, resolved above.
      if (!normalizeSoulColors(loaded.savedColors) && (loaded.archetypeTitle || loaded.talents.length)) {
        try {
          const { data: res, error } = await withTimeout(
            supabase.functions.invoke("generate-soul-colors", {
              body: {
                archetype: loaded.archetypeTitle,
                topTalents: loaded.talents,
                corePattern: loaded.corePattern,
              },
            }),
            COLORS_TIMEOUT_MS,
          );
          if (!cancelled && !error && Array.isArray(res?.colors)) setAiColors(res.colors);
        } catch {
          // Deterministic fallback takes over.
        }
      }
      if (!cancelled) setColorsSettled(true);
    })().catch(() => {
      if (!cancelled) {
        setData((d) =>
          d ?? { profileId: null, name: "Player", archetypeTitle: null, corePattern: null, talents: [], savedColors: null, quest: null },
        );
        setColorsSettled(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // The ritual: a white beam, about two seconds, then the spectrum. Reduced
  // motion skips the wait.
  useEffect(() => {
    if (reduceMotion) {
      setRitualDone(true);
      return;
    }
    const id = window.setTimeout(() => setRitualDone(true), RITUAL_MS);
    return () => window.clearTimeout(id);
  }, [reduceMotion]);

  useEffect(() => {
    if (colors && ritualDone) setPhase("revealed");
    else if (data) setPhase("ritual");
  }, [colors, ritualDone, data]);

  // The world takes your colors: dominant hue becomes --gt-accent on game
  // screens (GameShellV2 re-applies it from the stored value).
  useEffect(() => {
    if (!colors || phase !== "revealed") return;
    document.documentElement.style.setProperty("--gt-accent", colors[0]);
    try {
      window.localStorage.setItem(WORLD_ACCENT_STORAGE_KEY, colors[0]);
    } catch {
      // Storage unavailable: the profile's soul_colors still carries it.
    }
  }, [colors, phase]);

  // Render the share card once the reveal is done.
  useEffect(() => {
    if (!data || !colors || phase !== "revealed") return;
    let cancelled = false;
    let url: string | null = null;
    renderCrystalCard({ name: data.name, essence, colors, gemSrc: GEM_SRC })
      .then(canvasToPngBlob)
      .then((blob) => {
        if (cancelled) return;
        cardBlob.current = blob;
        url = URL.createObjectURL(blob);
        setCardUrl(url);
        setCardError(false);
      })
      .catch(() => {
        if (!cancelled) setCardError(true);
      });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [data, colors, essence, phase]);

  const saveQuest = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const text = sanitizeQuest(draft);
      if (!text || saving) return;
      setSaving(true);
      setSaveNote(null);
      const next: FirstQuest = { text, written_at: new Date().toISOString() };
      let saved = false;
      if (data?.profileId) {
        saved = await markMainQuestProgress(data.profileId, { [FIRST_QUEST_PROGRESS_KEY]: next });
        // Keep a device copy either way: it covers a failed write and the
        // gap before the next profile read.
        try {
          window.localStorage.setItem(questStorageKey(data.profileId), JSON.stringify(next));
        } catch {
          // Ignore storage errors.
        }
      }
      setQuest(next);
      setEditing(false);
      setSaving(false);
      if (!saved) setSaveNote("Saved on this device. It will sync when your profile is reachable.");
    },
    [draft, saving, data?.profileId],
  );

  const shareCard = useCallback(async () => {
    const blob = cardBlob.current;
    if (!blob) return;
    setShareNote(null);
    const file = new File([blob], "my-crystal.png", { type: "image/png" });
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    if (nav.share && nav.canShare?.({ files: [file] })) {
      try {
        await nav.share({ files: [file], text: CRYSTAL_SHARE_COPY });
        return;
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
        // Fall through to download.
      }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-crystal.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    setShareNote("Your card was saved as an image.");
  }, []);

  const accent = colors?.[0];
  const revealed = phase === "revealed" && !!colors;
  const showQuestForm = !quest || editing;
  const placeholder = buildQuestPlaceholder(data?.talents);

  return (
    <div
      className="gt-root gc-root"
      style={
        accent
          ? ({ "--gt-accent": accent, "--gc-glow": `${accent}33` } as React.CSSProperties)
          : undefined
      }
    >
      <div className="gt-grain" aria-hidden="true" />
      <main className="gc-main" aria-label="Your Crystal">
        <p className="gt-mono">Your Crystal</p>

        <div className="gc-stage">
          <span className="gc-beam" aria-hidden="true" />
          <span
            className={`gc-spectrum gc-spectrum--white${revealed ? " is-gone" : ""}`}
            aria-hidden="true"
          />
          {colors && (
            <span
              className={`gc-spectrum gc-spectrum--color${revealed ? " is-on" : ""}`}
              style={{ background: buildSpectrumGradient(colors) }}
              aria-hidden="true"
            />
          )}
          <img className="gc-gem" src={GEM_SRC} alt="A clear crystal dodecahedron refracting a beam of light" decoding="async" />
          {!revealed && <p className="gc-ritual" aria-live="polite">Reading your spectrum</p>}
        </div>

        <div className={`gc-reveal${revealed ? " is-on" : ""}`} aria-hidden={!revealed}>
          {revealed && colors && data && (
            <>
              <h1 className="gc-name">{data.name}</h1>
              <hr className="gc-rule" />
              {essence && <p className="gc-essence">{essence}</p>}
              <ul className="gc-colors" aria-label="Your three soul colors">
                {colors.map((hex, i) => (
                  <li key={`${i}-${hex}`}>
                    <span className="gc-chip" style={{ background: hex }} aria-hidden="true" />
                    <span className="gc-hex">{hex.toUpperCase()}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {revealed && colors && data && (
          <>
            <section className="gc-sec" aria-labelledby="gc-quest-h">
              <p className="gt-mono">Your first quest</p>
              <h2 id="gc-quest-h">What will your uniqueness create in the next 7 days?</h2>
              {showQuestForm ? (
                <form className="gc-form" onSubmit={saveQuest}>
                  <textarea
                    className="gc-input"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value.slice(0, CRYSTAL_QUEST_MAX))}
                    placeholder={placeholder}
                    maxLength={CRYSTAL_QUEST_MAX}
                    rows={3}
                    aria-label="Your first quest"
                  />
                  <p className="gc-count">{draft.length} / {CRYSTAL_QUEST_MAX}</p>
                  <button className="gc-btn" type="submit" disabled={!sanitizeQuest(draft) || saving}>
                    {saving ? "Writing" : "Write my first quest"}
                  </button>
                </form>
              ) : (
                <>
                  <p className="gc-quest">{quest?.text}</p>
                  {saveNote && <p className="gc-note">{saveNote}</p>}
                  <button
                    type="button"
                    className="gc-link"
                    onClick={() => {
                      setDraft(quest?.text ?? "");
                      setEditing(true);
                    }}
                  >
                    Rewrite
                  </button>
                </>
              )}
            </section>

            <section className="gc-sec" aria-labelledby="gc-card-h">
              <p className="gt-mono">Share</p>
              <h2 id="gc-card-h">Your Crystal card</h2>
              {cardUrl ? (
                <img
                  className="gc-card"
                  src={cardUrl}
                  alt={`Crystal card for ${data.name} with colors ${colors.map((c) => c.toUpperCase()).join(", ")}`}
                />
              ) : (
                <div className="gc-card gc-card--wait">
                  <p className="gt-mono">{cardError ? "Card unavailable" : "Preparing"}</p>
                </div>
              )}
              <div className="gc-actions">
                <button type="button" className="gc-btn" onClick={shareCard} disabled={!cardUrl}>
                  Share your crystal
                </button>
                {shareNote && <p className="gc-note" role="status">{shareNote}</p>}
              </div>
            </section>

            <div className="gc-continue">
              <Link className="gc-btn gc-btn--quiet" to={CRYSTAL_CONTINUE_PATH}>
                Continue →
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default GameCrystal;
