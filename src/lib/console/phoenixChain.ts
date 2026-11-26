/**
 * Your AI Console v1, the Phoenix chain: buttons, chain state, request building, card parsing.
 * Spec: docs/specs/your-ai-console/console-v1.md
 *
 * Pure and free of the network. Five buttons form one loop. Each label IS the result the button
 * gives (button law, 2026-11-19). Button N is live when card N-1 exists. Button 5 hands its
 * survivor to button 1, which starts the next lap. The prompts themselves live in
 * `src/prompts/user/consolePhoenixPrompts.ts` and are assembled on the server
 * (`supabase/functions/your-ai-console`); this file only says which prompt a button uses.
 *
 * Chain state is kept per player in this browser's storage (the instrument's other per-player
 * state does the same: traces, daily count). Known limit, named in the spec: results do not follow
 * the player to another device. A server table is a later step with its own yes.
 */
import type { PlayerCard } from "@/modules/zone-of-genius/yourAiCard";
import { cardToPrompt } from "@/modules/zone-of-genius/yourAiCard";
import { buildRawSignal } from "@/modules/zone-of-genius/yourAiDialogue";
import type { DialogueMessage } from "@/modules/zone-of-genius/yourAiTurn";
import type { ConsolePromptKey } from "@/prompts/user/consolePhoenixPrompts";

export type ConsoleLocale = "en" | "es" | "ru";
export type ButtonId = 1 | 2 | 3 | 4 | 5;
export const BUTTON_IDS: readonly ButtonId[] = [1, 2, 3, 4, 5];
export type CardKind = "goal" | "case" | "goalV2" | "weak" | "survivor";

/** The one question button 1 asks when there is no goal to ground in (spec, guards). */
export const GOAL_QUESTION: Record<ConsoleLocale, string> = {
  en: "What do you want to make real in the next 90 days?",
  es: "¿Qué quieres hacer realidad en los próximos 90 días?",
  ru: "Что ты хочешь сделать реальным в ближайшие 90 дней?",
};

/**
 * A button is a record, not hard-coded UI, so the app store (Your AI tracker §22, part 10) and
 * buttons by other authors need no rewrite. v1: all five are free, by evolver, standard v0.
 */
export type ConsoleButton = {
  id: ButtonId;
  label: Record<ConsoleLocale, string>;
  /** The result in one English line (the label says it to the player; this is for the record). */
  result: string;
  prompt: ConsolePromptKey;
  card: CardKind;
  tier: "free" | "paid";
  author: string;
  standard: "v0";
};

export const CONSOLE_BUTTONS: readonly ConsoleButton[] = [
  {
    id: 1,
    label: {
      en: "Your goal, clear and grounded",
      es: "Tu meta, clara y fundamentada",
      ru: "Твоя цель, ясная и обоснованная",
    },
    result: "Your one current goal, with three reasons from your own profile",
    prompt: "GOAL_SYNTHESIS",
    card: "goal",
    tier: "free",
    author: "evolver",
    standard: "v0",
  },
  {
    id: 2,
    label: {
      en: "The case for your goal, with its risks",
      es: "El caso a favor de tu meta, con sus riesgos",
      ru: "Кейс за твою цель и её риски",
    },
    result: "The strongest honest case, the top risks, and the mistakes you would likely make",
    prompt: "CASE_AND_RISKS",
    card: "case",
    tier: "free",
    author: "evolver",
    standard: "v0",
  },
  {
    id: 3,
    label: {
      en: "Your goal, version 2",
      es: "Tu meta, versión 2",
      ru: "Твоя цель, версия 2",
    },
    result: "Your goal rewritten to answer every risk and mistake, with three moves",
    prompt: "NEXT_VERSION",
    card: "goalV2",
    tier: "free",
    author: "evolver",
    standard: "v0",
  },
  {
    id: 4,
    label: {
      en: "What is weak in your goal, and how to fix it",
      es: "Qué es débil en tu meta y cómo arreglarlo",
      ru: "Что слабо в твоей цели и как это исправить",
    },
    result: "What is weak in version 2, the fix for each, and the one-line centre",
    prompt: "ROAST_AND_ANOTHER_ROUND",
    card: "weak",
    tier: "free",
    author: "evolver",
    standard: "v0",
  },
  {
    id: 5,
    label: {
      en: "What remains after the Phoenix burns",
      es: "Lo que queda después de que el Fénix arde",
      ru: "Что остаётся после сгорания Феникса",
    },
    result: "What survived, what burned, and your next move in one sentence",
    prompt: "CRUCIBLE_POST_MORTEM",
    card: "survivor",
    tier: "free",
    author: "evolver",
    standard: "v0",
  },
];

export const buttonOf = (id: ButtonId): ConsoleButton => CONSOLE_BUTTONS[id - 1];

export const normalizeLocale = (lang: string | undefined | null): ConsoleLocale => {
  const l = (lang ?? "en").slice(0, 2).toLowerCase();
  return l === "es" || l === "ru" ? l : "en";
};

// ---------------------------------------------------------------- cards

export type GoalCard = { goal: string; why: string[]; notThis: string };
export type CaseCard = { case: string; risks: string[]; mistakes: { mistake: string; sign: string }[] };
export type GoalV2Card = { goalV2: string; moves: string[]; whatChanged: string };
export type WeakCard = { weak: string[]; fixes: string[]; thirteenth: string };
export type SurvivorCard = { survived: string; burned: string; nextMove: string };
export type CardData = GoalCard | CaseCard | GoalV2Card | WeakCard | SurvivorCard;

/** A card plus the model's full text, shown under «Read all», so no depth is lost to the card. */
export type CardRecord = { data: CardData; full: string; at: string };

export type LapRecord = { lap: number; cards: Partial<Record<ButtonId, CardRecord>>; at: string };

export type ChainState = {
  lap: number;
  cards: Partial<Record<ButtonId, CardRecord>>;
  /** The last 3 finished laps, in full. */
  laps: LapRecord[];
  /** Older laps, folded to one line each. */
  folded: string[];
  updatedAt: string;
};

export const MAX_FULL_LAPS = 3;

export const emptyChain = (now: Date = new Date()): ChainState => ({
  lap: 1,
  cards: {},
  laps: [],
  folded: [],
  updatedAt: now.toISOString(),
});

/** Button 1 is always live; button N is live when card N-1 exists. */
export const isUnlocked = (chain: ChainState, id: ButtonId): boolean => id === 1 || !!chain.cards[(id - 1) as ButtonId];

export const setCard = (chain: ChainState, id: ButtonId, record: CardRecord, now: Date = new Date()): ChainState => ({
  ...chain,
  cards: { ...chain.cards, [id]: record },
  updatedAt: now.toISOString(),
});

/** Re-running N clears the cards after N (they were built on the old N). */
export const clearAfter = (chain: ChainState, id: ButtonId, now: Date = new Date()): ChainState => {
  const cards: ChainState["cards"] = {};
  for (const b of BUTTON_IDS) if (b <= id && chain.cards[b]) cards[b] = chain.cards[b];
  return { ...chain, cards, updatedAt: now.toISOString() };
};

const clip = (s: string, n: number): string => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

const foldLine = (lap: LapRecord): string => {
  const goal = (lap.cards[3]?.data as GoalV2Card | undefined)?.goalV2 ?? (lap.cards[1]?.data as GoalCard | undefined)?.goal ?? "";
  const s = lap.cards[5]?.data as SurvivorCard | undefined;
  const parts = [`Lap ${lap.lap}`, goal && `goal: ${goal}`, s?.survived && `survived: ${s.survived}`, s?.nextMove && `next: ${s.nextMove}`];
  return clip(parts.filter(Boolean).join(" · ").replace(/\s+/g, " "), 280);
};

/**
 * Button 5 hands to button 1: the finished lap is kept, the cards clear, the lap number goes up.
 * Only the last 3 laps stay in full; the oldest folds into one line.
 */
export const startNextLap = (chain: ChainState, now: Date = new Date()): ChainState => {
  if (!chain.cards[5]) return chain;
  let laps = [...chain.laps, { lap: chain.lap, cards: chain.cards, at: now.toISOString() }];
  const folded = [...chain.folded];
  while (laps.length > MAX_FULL_LAPS) {
    folded.push(foldLine(laps[0]));
    laps = laps.slice(1);
  }
  return { lap: chain.lap + 1, cards: {}, laps, folded, updatedAt: now.toISOString() };
};

/** What the last finished lap left behind: button 5's survivor and next move. */
export const survivorOf = (chain: ChainState): { lap: number; card: SurvivorCard } | null => {
  const last = chain.laps[chain.laps.length - 1];
  const s = last?.cards[5]?.data as SurvivorCard | undefined;
  return last && s ? { lap: last.lap, card: { survived: s.survived, burned: s.burned, nextMove: s.nextMove } } : null;
};

// ---------------------------------------------------------------- request

/** Which earlier cards each button reads (the «In» column of the spec). */
export const INPUT_CARDS: Record<ButtonId, ButtonId[]> = { 1: [], 2: [1], 3: [1, 2], 4: [3], 5: [3, 4] };

export type PreviousCard = { button: ButtonId; lap: number; card: CardData | SurvivorCard };

/** The body of the edge function call: `{ button, context, previousCards, locale }`. */
export type ConsoleRequest = { button: ButtonId; context: string; previousCards: PreviousCard[]; locale: ConsoleLocale };

export const MAX_CONTEXT_CHARS = 12000;

export const readStatedGoal = (messages: DialogueMessage[]): string => {
  const latest = messages.filter((message) => message.role === "player" && message.text.trim()).pop();
  return latest?.text.trim().slice(0, MAX_CONTEXT_CHARS) ?? "";
};

/** The context the Your AI conversation already builds (card + conversation); no new reads. */
export const buildConsoleContext = (card: PlayerCard | null | undefined, messages: DialogueMessage[]): string => {
  const parts: string[] = [];
  const cardText = cardToPrompt(card);
  if (cardText) parts.push(cardText);
  if (messages.some((m) => m.text.trim())) parts.push(buildRawSignal("", messages, ""));
  const text = parts.join("\n\n");
  // Keep the most recent part when the conversation is long.
  return text.length > MAX_CONTEXT_CHARS ? text.slice(text.length - MAX_CONTEXT_CHARS) : text;
};

export const requestFor = (chain: ChainState, id: ButtonId, context: string, locale: ConsoleLocale): ConsoleRequest => {
  const previousCards: PreviousCard[] = [];
  for (const from of INPUT_CARDS[id]) {
    const rec = chain.cards[from];
    if (rec) previousCards.push({ button: from, lap: chain.lap, card: rec.data });
  }
  let ctx = context;
  if (id === 1) {
    const survivor = survivorOf(chain);
    if (survivor) previousCards.push({ button: 5, lap: survivor.lap, card: survivor.card });
    if (chain.folded.length) ctx = `${ctx}\n\nEARLIER LAPS (one line each):\n${chain.folded.map((l) => `- ${l}`).join("\n")}`.trim();
  }
  return { button: id, context: ctx, previousCards, locale };
};

// ---------------------------------------------------------------- parsing

export type ParsedOutput =
  | { ok: true; kind: "card"; data: CardData; full: string }
  | { ok: true; kind: "needsGoal"; full: string }
  | { ok: false };

const str = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim() : null);

const strList = (v: unknown, min: number, max: number): string[] | null => {
  if (!Array.isArray(v)) return null;
  const out = v.map(str);
  if (out.some((x) => x === null)) return null;
  return out.length >= min && out.length <= max ? (out as string[]) : null;
};

const shapeCard = (id: ButtonId, o: Record<string, unknown>): CardData | null => {
  switch (id) {
    case 1: {
      const goal = str(o.goal), why = strList(o.why, 3, 3), notThis = str(o.notThis);
      return goal && why && notThis ? { goal, why, notThis } : null;
    }
    case 2: {
      const text = str(o.case), risks = strList(o.risks, 3, 3);
      if (!text || !risks || !Array.isArray(o.mistakes) || o.mistakes.length !== 3) return null;
      const mistakes = o.mistakes.map((m) => {
        const r = (m ?? {}) as Record<string, unknown>;
        const mistake = str(r.mistake), sign = str(r.sign);
        return mistake && sign ? { mistake, sign } : null;
      });
      return mistakes.every(Boolean) ? { case: text, risks, mistakes: mistakes as CaseCard["mistakes"] } : null;
    }
    case 3: {
      const goalV2 = str(o.goalV2), moves = strList(o.moves, 3, 3), whatChanged = str(o.whatChanged);
      return goalV2 && moves && whatChanged ? { goalV2, moves, whatChanged } : null;
    }
    case 4: {
      const weak = strList(o.weak, 1, 12), fixes = strList(o.fixes, 1, 12), thirteenth = str(o.thirteenth);
      return weak && fixes && thirteenth ? { weak, fixes, thirteenth } : null;
    }
    case 5: {
      const survived = str(o.survived), burned = str(o.burned), nextMove = str(o.nextMove);
      return survived && burned && nextMove ? { survived, burned, nextMove } : null;
    }
  }
};

/** The last fenced block, or failing that the trailing `{...}`; plus the text before it. */
const splitJson = (text: string): { json: string; full: string } | null => {
  const fences = [...text.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)];
  const last = fences[fences.length - 1];
  if (last && last.index !== undefined) return { json: last[1], full: text.slice(0, last.index).trim() };
  const end = text.lastIndexOf("}");
  if (end === -1) return null;
  for (let start = text.lastIndexOf("{", end); start !== -1; start = text.lastIndexOf("{", start - 1)) {
    try {
      JSON.parse(text.slice(start, end + 1));
      return { json: text.slice(start, end + 1), full: text.slice(0, start).trim() };
    } catch {
      /* keep walking left */
    }
  }
  return null;
};

/** Model output to its card shape. Anything malformed is `{ ok: false }`; the UI never shows raw JSON. */
export const parseCardOutput = (id: ButtonId, text: string): ParsedOutput => {
  const parts = splitJson(text ?? "");
  if (!parts) return { ok: false };
  let obj: unknown;
  try {
    obj = JSON.parse(parts.json);
  } catch {
    return { ok: false };
  }
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return { ok: false };
  const o = obj as Record<string, unknown>;
  if (id === 1 && o.needsGoal === true) return { ok: true, kind: "needsGoal", full: parts.full };
  const data = shapeCard(id, o);
  return data ? { ok: true, kind: "card", data, full: parts.full } : { ok: false };
};

/** Plain text of a card, for the copy action. */
export const cardPlainText = (id: ButtonId, data: CardData): string => {
  const list = (xs: string[]) => xs.map((x, i) => `${i + 1}. ${x}`).join("\n");
  switch (id) {
    case 1: {
      const c = data as GoalCard;
      return [c.goal, list(c.why), c.notThis].join("\n\n");
    }
    case 2: {
      const c = data as CaseCard;
      return [c.case, list(c.risks), list(c.mistakes.map((m) => `${m.mistake} (${m.sign})`))].join("\n\n");
    }
    case 3: {
      const c = data as GoalV2Card;
      return [c.goalV2, list(c.moves), c.whatChanged].join("\n\n");
    }
    case 4: {
      const c = data as WeakCard;
      return [list(c.weak), list(c.fixes), c.thirteenth].join("\n\n");
    }
    case 5: {
      const c = data as SurvivorCard;
      return [c.survived, c.burned, c.nextMove].join("\n\n");
    }
  }
};

// ---------------------------------------------------------------- storage

const CHAIN_KEY = "fytt:console-phoenix-chain:v1";

type StorageLike = Pick<Storage, "getItem" | "setItem">;

const defaultStorage = (): StorageLike | null => {
  try {
    return typeof window !== "undefined" ? window.sessionStorage : null;
  } catch {
    return null;
  }
};

/** Per player in this browser session, so a shared browser never mixes two players. */
const keyFor = (owner: string | null | undefined) => `${CHAIN_KEY}:${owner || "guest"}`;

const isRecord = (x: unknown): x is Record<string, unknown> => !!x && typeof x === "object" && !Array.isArray(x);

const cleanCards = (raw: unknown): ChainState["cards"] => {
  const out: ChainState["cards"] = {};
  if (!isRecord(raw)) return out;
  for (const id of BUTTON_IDS) {
    const rec = raw[id];
    if (isRecord(rec) && isRecord(rec.data) && typeof rec.full === "string" && shapeCard(id, rec.data)) {
      out[id] = { data: rec.data as CardData, full: rec.full, at: typeof rec.at === "string" ? rec.at : "" };
    }
  }
  return out;
};

/** The saved chain. Missing, corrupted or foreign data reads as a fresh chain; never throws. */
export const readChain = (owner?: string | null, storage: StorageLike | null = defaultStorage()): ChainState => {
  if (!storage) return emptyChain();
  try {
    const key = keyFor(owner);
    let raw = storage.getItem(key);
    // Import an existing device-scoped lap on first use of the session storage.
    if (!raw && typeof window !== "undefined" && storage === defaultStorage()) {
      try {
        raw = window.localStorage.getItem(key);
        if (raw) {
          storage.setItem(key, raw);
          window.localStorage.removeItem(key);
        }
      } catch {
        // A storage restriction must not break the Console.
      }
    }
    if (!raw) return emptyChain();
    const p = JSON.parse(raw) as unknown;
    if (!isRecord(p) || typeof p.lap !== "number" || !Number.isFinite(p.lap) || p.lap < 1) return emptyChain();
    const laps: LapRecord[] = (Array.isArray(p.laps) ? p.laps : [])
      .filter((l): l is Record<string, unknown> => isRecord(l) && typeof l.lap === "number")
      .map((l) => ({ lap: l.lap as number, cards: cleanCards(l.cards), at: typeof l.at === "string" ? l.at : "" }))
      .slice(-MAX_FULL_LAPS);
    const folded = (Array.isArray(p.folded) ? p.folded : []).filter((x): x is string => typeof x === "string");
    return {
      lap: Math.floor(p.lap),
      cards: cleanCards(p.cards),
      laps,
      folded,
      updatedAt: typeof p.updatedAt === "string" ? p.updatedAt : new Date().toISOString(),
    };
  } catch {
    return emptyChain();
  }
};

export const writeChain = (owner: string | null | undefined, chain: ChainState, storage: StorageLike | null = defaultStorage()): void => {
  if (!storage) return;
  try {
    storage.setItem(keyFor(owner), JSON.stringify(chain));
  } catch {
    /* storage full or blocked: the chain still works for this page */
  }
};
