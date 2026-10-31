/**
 * Your AI daily free dialogue limit — client-side only (product_brief.md §6, Sasha 2026-10-30).
 *
 * Counts normal dialogue turns per player per local calendar day in localStorage. No database,
 * no edge function. The profile and the first step (reveal) are never counted or blocked here.
 * This is a soft client cap: clearing site data resets it. The server-side model is unchanged.
 */

/** Free dialogue turns per player per local day. Sasha may change this one number. */
export const YOUR_AI_DAILY_FREE_TURNS = 20;

const KEY_PREFIX = "fytt:your-ai-daily-turns:v1";

type StorageLike = Pick<Storage, "getItem" | "setItem">;

const defaultStorage = (): StorageLike | null => {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
};

/** Local calendar day as YYYY-MM-DD (not UTC: the limit resets at the player's midnight). */
export const localDayKey = (now: Date = new Date()): string => {
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${mm}-${dd}`;
};

/** Per player on a device, so a shared browser never mixes two players. Guests use "guest". */
const keyFor = (owner: string | null | undefined) => `${KEY_PREFIX}:${owner || "guest"}`;

/** Turns used today. A stored count from another day, or corrupted storage, reads as 0. */
export const getTurnsUsedToday = (
  owner?: string | null,
  storage: StorageLike | null = defaultStorage(),
  now: Date = new Date(),
): number => {
  if (!storage) return 0;
  try {
    const raw = storage.getItem(keyFor(owner));
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { day?: unknown; count?: unknown };
    if (parsed?.day !== localDayKey(now)) return 0;
    const count = Number(parsed.count);
    return Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  } catch {
    return 0;
  }
};

export const isDailyLimitReached = (
  owner?: string | null,
  storage: StorageLike | null = defaultStorage(),
  now: Date = new Date(),
  limit: number = YOUR_AI_DAILY_FREE_TURNS,
): boolean => getTurnsUsedToday(owner, storage, now) >= limit;

/** Records one completed dialogue turn and returns today's new count. Never throws. */
export const recordTurn = (
  owner?: string | null,
  storage: StorageLike | null = defaultStorage(),
  now: Date = new Date(),
): number => {
  const next = getTurnsUsedToday(owner, storage, now) + 1;
  if (!storage) return next;
  try {
    storage.setItem(keyFor(owner), JSON.stringify({ day: localDayKey(now), count: next }));
  } catch {
    /* storage full or blocked: the cap simply does not persist */
  }
  return next;
};
