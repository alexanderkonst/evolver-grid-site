/**
 * Your AI player card and traces — client-side only (ai-familiar_tracker.md §20.2 a, d; §20.4 step 1).
 *
 * The card is a compact profile that rides in every turn prompt: the saved ZoG snapshot (if
 * the player has one) plus their last traces. A trace is written to localStorage on every
 * button tap. Server-side `player_cards` / `player_traces` come with step 2 (Lovable batch).
 * Nothing here touches the database.
 */
import type { CachedZogSnapshot } from "@/lib/zogSnapshotCache";

export type TraceKind = "action" | "route" | "practice" | "technology";
export type YourAiTrace = {
  /** ISO timestamp. */
  at: string;
  kind: TraceKind;
  /** Catalog id of the tapped button. */
  payload_id: string;
  /** What happened: "tapped" now; later steps can write "completed" / "skipped". */
  outcome: string;
};

export type PlayerCard = {
  card_version: string;
  top_talent: null | { archetype: string | null; core_pattern: string | null; talents: string[] };
  traces: YourAiTrace[];
};

const TRACES_KEY = "fytt:your-ai-traces:v1";
const MAX_STORED_TRACES = 30;
/** Traces that go into the prompt. Keeps the card in the ~1–2k token budget. */
export const MAX_CARD_TRACES = 6;
const MAX_FIELD_CHARS = 240;

type StorageLike = Pick<Storage, "getItem" | "setItem">;

const defaultStorage = (): StorageLike | null => {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
};

/** Traces are per player on a device, so a shared browser never mixes two players. */
const keyFor = (owner: string | null | undefined) => `${TRACES_KEY}:${owner || "guest"}`;

const isTrace = (x: unknown): x is YourAiTrace => {
  if (!x || typeof x !== "object") return false;
  const t = x as Record<string, unknown>;
  return (
    typeof t.at === "string" &&
    typeof t.kind === "string" &&
    typeof t.payload_id === "string" &&
    typeof t.outcome === "string"
  );
};

export const readTraces = (owner?: string | null, storage: StorageLike | null = defaultStorage()): YourAiTrace[] => {
  if (!storage) return [];
  try {
    const raw = storage.getItem(keyFor(owner));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isTrace) : [];
  } catch {
    return [];
  }
};

/** Append one trace; best-effort (storage may be full or disabled). Returns the updated list. */
export const writeTrace = (
  trace: Omit<YourAiTrace, "at"> & { at?: string },
  owner?: string | null,
  storage: StorageLike | null = defaultStorage(),
): YourAiTrace[] => {
  const next = [...readTraces(owner, storage), { ...trace, at: trace.at ?? new Date().toISOString() }].slice(-MAX_STORED_TRACES);
  if (!storage) return next;
  try {
    storage.setItem(keyFor(owner), JSON.stringify(next));
  } catch (err) {
    console.warn("[yourAiCard] trace write failed", err);
  }
  return next;
};

const clip = (s: string | null | undefined): string | null => {
  const text = (s ?? "").trim();
  if (!text) return null;
  return text.length > MAX_FIELD_CHARS ? `${text.slice(0, MAX_FIELD_CHARS - 1)}…` : text;
};

/** Small stable hash so any change to the card is a new version. */
const hashOf = (s: string): string => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
};

export const buildPlayerCard = (
  snapshot: Pick<CachedZogSnapshot, "archetypeTitle" | "corePattern" | "topThreeTalentsLong"> | null | undefined,
  traces: YourAiTrace[],
): PlayerCard => {
  const talents = (snapshot?.topThreeTalentsLong ?? []).map(clip).filter((t): t is string => Boolean(t)).slice(0, 3);
  const archetype = clip(snapshot?.archetypeTitle);
  const corePattern = clip(snapshot?.corePattern);
  const top_talent = archetype || corePattern || talents.length ? { archetype, core_pattern: corePattern, talents } : null;
  const recent = traces.slice(-MAX_CARD_TRACES);
  const body = { top_talent, traces: recent };
  return { card_version: hashOf(JSON.stringify(body)), ...body };
};

/** The card as prompt text. Empty string when there is nothing to say (new guest, no traces). */
export const cardToPrompt = (card: PlayerCard | null | undefined): string => {
  if (!card || (!card.top_talent && card.traces.length === 0)) return "";
  const lines: string[] = [`PLAYER CARD (v${card.card_version}; background only):`];
  if (card.top_talent) {
    const { archetype, core_pattern, talents } = card.top_talent;
    lines.push("- Has a saved top talent result.");
    if (archetype) lines.push(`- Archetype: ${archetype}`);
    if (core_pattern) lines.push(`- Core pattern: ${core_pattern}`);
    if (talents.length) lines.push(`- Top talents: ${talents.join(" | ")}`);
  } else {
    lines.push("- No saved top talent result yet.");
  }
  if (card.traces.length) {
    lines.push("- Recent taps (oldest first):");
    for (const t of card.traces) lines.push(`  - ${t.at.slice(0, 10)} ${t.payload_id} (${t.outcome})`);
  }
  return lines.join("\n");
};
