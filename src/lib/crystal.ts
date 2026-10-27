/**
 * Your Crystal — pure helpers for the post-NEW-GAME reveal (`/game/crystal`).
 *
 * Source of truth: docs/02-strategy/game_of_being_you.md §3 (Spectrum
 * mechanic) and docs/02-strategy/game_design_almanac.md v0.4 (27th act: the
 * player's first move is writing their own quest). Kept free of React and
 * Supabase so the logic is unit-testable.
 */

export const CRYSTAL_PATH = "/game/crystal";
/** Where "Continue" lands: the existing game home for the Uniqueness space. */
export const CRYSTAL_CONTINUE_PATH = "/game/me/zone-of-genius/start-here";
export const CRYSTAL_QUEST_MAX = 140;
export const CRYSTAL_SHARE_COPY = "My crystal. What's yours?";
export const CRYSTAL_SITE_MARK = "findyourtoptalent.com";
/** Neutral ice-blue used by the title screen, the default world accent. */
export const DEFAULT_WORLD_ACCENT = "#bcd7e6";

export const WORLD_ACCENT_STORAGE_KEY = "fytt:world-accent";
const QUEST_STORAGE_PREFIX = "fytt:first-quest:";

export type SoulTriple = [string, string, string];

const HEX_RE = /^#[0-9a-f]{6}$/i;

export const isHex = (value: unknown): value is string =>
  typeof value === "string" && HEX_RE.test(value.trim());

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** Convert any `#rrggbb` or `hsl(h, s%, l%)` string into `#rrggbb`. */
export const toHex = (color: string): string | null => {
  const value = color.trim();
  if (isHex(value)) return value.toLowerCase();
  const m = value.match(/^hsl\(\s*(-?[\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)$/i);
  if (!m) return null;
  const h = (((Number(m[1]) % 360) + 360) % 360) / 360;
  const s = clamp(Number(m[2]), 0, 100) / 100;
  const l = clamp(Number(m[3]), 0, 100) / 100;
  const hue2rgb = (p: number, q: number, t: number) => {
    let x = t;
    if (x < 0) x += 1;
    if (x > 1) x -= 1;
    if (x < 1 / 6) return p + (q - p) * 6 * x;
    if (x < 1 / 2) return q;
    if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const channel = (t: number) =>
    Math.round(hue2rgb(p, q, t) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${channel(h + 1 / 3)}${channel(h)}${channel(h - 1 / 3)}`;
};

/**
 * Normalise a palette from the edge function / DB / deterministic fallback
 * into exactly three `#rrggbb` codes (dominant first). Returns null when
 * fewer than three usable colors are present.
 */
export const normalizeSoulColors = (colors: readonly string[] | null | undefined): SoulTriple | null => {
  if (!colors) return null;
  const hex = colors.map((c) => (typeof c === "string" ? toHex(c) : null)).filter((c): c is string => !!c);
  if (hex.length < 3) return null;
  return [hex[0], hex[1], hex[2]];
};

/** `r, g, b` triple for use inside `rgba(...)`. */
export const hexToRgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export const withAlpha = (hex: string, alpha: number): string => {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/** Soft conic spectrum leaving the crystal; low opacity, never neon. */
export const buildSpectrumGradient = (colors: SoulTriple, alpha = 0.34): string => {
  const [a, b, c] = colors.map((x) => withAlpha(x, alpha));
  return `conic-gradient(from 200deg at 50% 50%, ${a}, ${b}, ${c}, ${a})`;
};

const SENTINEL = "pending";

const firstSentence = (text: string): string => {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return "";
  const m = clean.match(/^(.+?[.!?])(\s|$)/);
  return (m ? m[1] : clean).trim();
};

const stripArticle = (title: string) => title.replace(/^(the|a|an)\s+/i, "").trim();

/**
 * One line of essence: archetype title + the first sentence of the core
 * pattern. Second-person openers ("You naturally...") are kept as-is, the
 * line reads as something said to the player.
 */
export const buildEssenceLine = (archetypeTitle?: string | null, corePattern?: string | null): string => {
  const title = archetypeTitle && archetypeTitle.trim().toLowerCase() !== SENTINEL ? stripArticle(archetypeTitle) : "";
  const line =
    corePattern && corePattern.trim().toLowerCase() !== SENTINEL ? firstSentence(corePattern) : "";
  const clipped = line.length > 160 ? `${line.slice(0, 157).trimEnd()}...` : line;
  if (title && clipped) return `${title}. ${clipped}`;
  return title || clipped;
};

/** Placeholder for the quest field, inspired by the player's top talents. */
export const buildQuestPlaceholder = (talents?: readonly string[] | null): string => {
  const names = (talents ?? []).map((t) => t?.trim()).filter(Boolean) as string[];
  if (names.length >= 2) return `Use ${names[0].toLowerCase()} and ${names[1].toLowerCase()} to make something real`;
  if (names.length === 1) return `Use ${names[0].toLowerCase()} to make something real`;
  return "Something only I can make";
};

/** Trim, collapse whitespace, cap at the quest limit. Empty string means invalid. */
export const sanitizeQuest = (raw: string): string =>
  raw.replace(/\s+/g, " ").trim().slice(0, CRYSTAL_QUEST_MAX);

export interface FirstQuest {
  text: string;
  written_at: string;
}

/** Key under `game_profiles.main_quest_progress` where the player's quest lives. */
export const FIRST_QUEST_PROGRESS_KEY = "player_first_quest";

export const parseFirstQuest = (progress: unknown): FirstQuest | null => {
  if (!progress || typeof progress !== "object") return null;
  const raw = (progress as Record<string, unknown>)[FIRST_QUEST_PROGRESS_KEY];
  if (!raw || typeof raw !== "object") return null;
  const { text, written_at } = raw as Record<string, unknown>;
  if (typeof text !== "string" || !text.trim()) return null;
  return { text: sanitizeQuest(text), written_at: typeof written_at === "string" ? written_at : "" };
};

export const questStorageKey = (profileId: string) => `${QUEST_STORAGE_PREFIX}${profileId}`;

/** Wrap the share-card headline so it fits `maxChars` per line. */
export const wrapLines = (text: string, maxChars: number, maxLines: number): string[] => {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = `${kept[maxLines - 1].replace(/[.,;:\s]+$/, "")}...`;
    return kept;
  }
  return lines;
};
