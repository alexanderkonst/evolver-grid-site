/**
 * Your AI eval — ~20 test players run against the DEPLOYED `library-advisor` function
 * (ai-familiar_tracker.md §20.2 f, §20.4 step 1). It builds each turn prompt with the same
 * code the app uses (src/modules/zone-of-genius/yourAiTurn.ts) and checks the reply.
 *
 *   VITE_SUPABASE_URL=... VITE_SUPABASE_PUBLISHABLE_KEY=... bunx tsx scripts/eval-your-ai.ts
 *   ... --only ru-pain-1        run one player
 *   ... --runs 3                repeat each player (models are noisy; every run must pass)
 *
 * Needs network and the project's public (anon) key. Calls the same guest-open function the
 * game calls; nothing is written anywhere. Exit code 1 if any check fails.
 *
 * Checks per turn: structured JSON came back; at most one question; text is short; buttons
 * are all in the catalog, at most 3; reveal offered only when ready and enough answers;
 * talent/archetype not named; no model mentions; language and register (Russian uses ты).
 */
import { YOUR_AI_CATALOG, findCatalogEntry, ACTION_REVEAL } from "../src/data/yourAiCatalog";
import { buildPlayerCard, type YourAiTrace } from "../src/modules/zone-of-genius/yourAiCard";
import {
  MIN_ANSWERS_TO_REVEAL,
  buildTurnPrompt,
  countAnswers,
  parseTurn,
  type DialogueMessage,
} from "../src/modules/zone-of-genius/yourAiTurn";

type Lang = "en" | "ru" | "es";
type Player = {
  id: string;
  lang: Lang;
  answers: string[];
  notes?: string;
  /** Saved snapshot, for returning players. */
  snapshot?: { archetypeTitle: string; corePattern: string; topThreeTalentsLong: string[] };
  traces?: YourAiTrace[];
};

const QUESTIONS: Record<Lang, string[]> = {
  en: [
    "When does time disappear for you? What are you doing then?",
    "What do people come to you for, or thank you for?",
    "What do you do effortlessly that others find hard?",
    "Tell me about a moment you were proud of.",
    "What drains you, even when you are good at it?",
    "How do you see things differently from the people around you?",
  ],
  ru: [
    "Когда для тебя исчезает время? Что ты тогда делаешь?",
    "С чем к тебе приходят люди или за что благодарят?",
    "Что тебе даётся легко, а другим тяжело?",
    "Расскажи о моменте, которым ты гордишься.",
    "Что выматывает, даже если получается хорошо?",
    "Чем твой взгляд на вещи отличается от взгляда окружающих?",
  ],
  es: [
    "¿Cuándo desaparece el tiempo para ti? ¿Qué haces entonces?",
    "¿Para qué acuden a ti las personas o por qué te dan las gracias?",
    "¿Qué haces sin esfuerzo que a otros les cuesta?",
    "Cuéntame un momento del que te sientas orgulloso.",
    "¿Qué te agota, incluso cuando lo haces bien?",
    "¿En qué se diferencia tu forma de ver las cosas de la de quienes te rodean?",
  ],
};

const p = (id: string, lang: Lang, answers: string[], extra: Partial<Player> = {}): Player => ({ id, lang, answers, ...extra });

const WEAVER = {
  archetypeTitle: "The Weaver of Hidden Order",
  corePattern: "Finds the thread that makes scattered pieces one pattern",
  topThreeTalentsLong: ["Sees the structure under a mess", "Names what is unsaid", "Connects people to the right people"],
};

export const PLAYERS: Player[] = [
  p("en-brief-1", "en", ["Writing. I lose hours when I untangle a messy idea for someone."]),
  p("en-vague-2", "en", ["Writing.", "Not sure, stuff really."]),
  p("en-rich-3", "en", [
    "I lose time when I untangle a messy idea for a friend.",
    "People bring me their half-formed plans and leave clear on the next step.",
    "I see the structure in a mess almost immediately.",
  ]),
  p("en-ready-6", "en", [
    "Untangling messy ideas.",
    "Founders ask me to read their pitch.",
    "Seeing what the story is really about.",
    "I helped a friend find her business model in an afternoon.",
    "Meetings with no point drain me.",
    "I see the shape before the details.",
  ]),
  p("en-stuck-tired", "en", ["Honestly I'm exhausted and scattered, I cannot think about this right now."]),
  p("en-mission-curious", "en", ["I mostly want to know what to do with my life.", "Something that helps people see clearly."]),
  p("en-notes", "en", ["Teaching, I guess."], { notes: "My other AI says: I am a systems thinker who explains complex things simply." }),
  p("en-returning", "en", ["I want to redo this, my life changed."], {
    snapshot: WEAVER,
    traces: [{ at: "2026-10-20T10:00:00.000Z", kind: "route", payload_id: "route:mission", outcome: "tapped" }],
  }),
  p("en-returning-qol", "en", ["Things feel off balance lately.", "Work eats everything."], {
    snapshot: WEAVER,
    traces: [{ at: "2026-10-25T10:00:00.000Z", kind: "route", payload_id: "route:qol", outcome: "tapped" }],
  }),
  p("en-asks-model", "en", ["Are you ChatGPT? Which model are you?"]),
  p("en-asks-reading", "en", ["Just tell me what my talent is.", "Come on, one word."]),
  p("ru-brief-1", "ru", ["Когда распутываю чью-то запутанную идею, пролетают часы."]),
  p("ru-pain-1", "ru", ["Я устал и распылён, не могу сосредоточиться."]),
  p("ru-rich-3", "ru", [
    "Время пропадает, когда объясняю сложное простыми словами.",
    "Ко мне идут с туманными планами и уходят с ясным шагом.",
    "Я быстро вижу структуру в хаосе.",
  ]),
  p("ru-ready-6", "ru", [
    "Объяснять сложное.",
    "Просят прочитать питч.",
    "Вижу, о чём история на самом деле.",
    "Подруге за вечер собрал бизнес-модель.",
    "Выматывают встречи без смысла.",
    "Я вижу форму раньше деталей.",
  ]),
  p("ru-returning", "ru", ["Хочу пройти заново, многое поменялось."], {
    snapshot: WEAVER,
    traces: [{ at: "2026-10-22T10:00:00.000Z", kind: "route", payload_id: "route:assets", outcome: "tapped" }],
  }),
  p("ru-asks-reading", "ru", ["Просто скажи, какой у меня талант."]),
  p("es-brief-1", "es", ["Cuando ayudo a alguien a ordenar una idea confusa, pierdo la noción del tiempo."]),
  p("es-rich-3", "es", [
    "Pierdo el tiempo cuando explico algo complejo con palabras simples.",
    "Me traen planes a medias y se van con un paso claro.",
    "Veo la estructura dentro del caos enseguida.",
  ]),
  p("es-stuck", "es", ["Estoy agotada y dispersa, hoy no puedo pensar en esto."]),
];

const MODEL_WORDS = /chatgpt|claude|gemini|openai|anthropic|language model|языков\w+ модел|модель ии|modelo de lenguaje/i;
const READING_PHRASES = /your (top )?(talent|zone of genius) is|ton talent|твой (топовый )?талант (—|-|это)|tu talento (es|principal)/i;

const messagesFor = (pl: Player): DialogueMessage[] => {
  const qs = QUESTIONS[pl.lang];
  const out: DialogueMessage[] = [];
  pl.answers.forEach((a, i) => {
    out.push({ role: "ai", text: qs[i % qs.length] });
    out.push({ role: "player", text: a });
  });
  return out;
};

const stripToJson = (raw: string): unknown => {
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const c = fence ? fence[1] : raw;
  const a = c.indexOf("{");
  const b = c.lastIndexOf("}");
  if (a === -1 || b <= a) return null;
  try {
    return JSON.parse(c.slice(a, b + 1));
  } catch {
    return null;
  }
};

// Count "?" only: Spanish "¿" opens the same question the "?" closes.
const questionCount = (s: string) => (s.match(/[?？]/g) ?? []).length;

type Check = { name: string; ok: boolean; detail?: string };

const evaluate = (pl: Player, raw: string): Check[] => {
  const messages = messagesFor(pl);
  const answers = countAnswers(messages);
  const parsed = parseTurn(raw);
  const json = stripToJson(raw) as { text?: unknown; reply?: unknown; buttons?: unknown } | null;
  const rawButtons = Array.isArray(json?.buttons) ? (json!.buttons as unknown[]) : [];
  const rawIds = rawButtons.map((b) => (typeof b === "string" ? b : (b as { id?: string } | null)?.id)).filter(Boolean) as string[];
  const unknown = rawIds.filter((id) => !findCatalogEntry(id));
  const text = parsed.reply;
  const cardTexts = [pl.snapshot?.archetypeTitle, pl.snapshot?.corePattern, ...(pl.snapshot?.topThreeTalentsLong ?? [])].filter(Boolean) as string[];
  const checks: Check[] = [];

  checks.push({ name: "structured-json", ok: Boolean(json && (json.text || json.reply)) });
  checks.push({ name: "one-question", ok: questionCount(text) <= 1, detail: `${questionCount(text)} question marks` });
  checks.push({ name: "short", ok: text.length <= 420, detail: `${text.length} chars` });
  checks.push({ name: "buttons-in-catalog", ok: unknown.length === 0, detail: unknown.join(", ") });
  checks.push({ name: "buttons-max-3", ok: rawIds.length <= 3, detail: `${rawIds.length}` });
  checks.push({
    name: "reveal-only-when-ready",
    ok: !rawIds.includes(ACTION_REVEAL) || (parsed.ready && answers >= MIN_ANSWERS_TO_REVEAL),
    detail: `ready=${parsed.ready} answers=${answers}`,
  });
  checks.push({ name: "no-model-mention", ok: !MODEL_WORDS.test(text) });
  checks.push({
    name: "no-talent-named",
    ok: !READING_PHRASES.test(text) && !cardTexts.some((c) => text.toLowerCase().includes(c.toLowerCase())),
  });
  const cyr = /[А-Яа-яЁё]/.test(text);
  if (pl.lang === "ru") {
    checks.push({ name: "language-ru", ok: cyr });
    checks.push({ name: "register-ty", ok: !/\b(вы|вам|вас|ваш\w*|Вы|Вам|Вас|Ваш\w*)\b/.test(text) });
  } else if (pl.lang === "es") {
    checks.push({ name: "language-es", ok: !cyr && /[¿¡áéíóúñ]|\b(qué|cómo|cuando|cuándo|tú|para|que|el|la)\b/i.test(text) });
  } else {
    checks.push({ name: "language-en", ok: !cyr });
  }
  return checks;
};

const callFunction = async (url: string, key: string, prompt: string): Promise<string> => {
  const res = await fetch(`${url.replace(/\/$/, "")}/functions/v1/library-advisor`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}` },
    body: JSON.stringify({ prompt }),
  });
  const body = (await res.json().catch(() => ({}))) as { generatedText?: string; error?: string };
  if (!res.ok || body.error) throw new Error(`HTTP ${res.status}: ${body.error ?? "no body"}`);
  if (!body.generatedText) throw new Error("empty generatedText");
  return body.generatedText;
};

const argValue = (flag: string) => {
  const i = process.argv.indexOf(flag);
  return i !== -1 ? process.argv[i + 1] : undefined;
};

const main = async () => {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    console.error("Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (the public anon key).");
    process.exit(2);
  }
  const only = argValue("--only");
  const runs = Math.max(1, Number(argValue("--runs") ?? 1));
  const players = PLAYERS.filter((x) => !only || x.id === only);
  if (players.length === 0) {
    console.error(`No player "${only}". Known: ${PLAYERS.map((x) => x.id).join(", ")}`);
    process.exit(2);
  }
  console.log(`Catalog: ${YOUR_AI_CATALOG.length} entries · players: ${players.length} · runs each: ${runs}\n`);

  let failures = 0;
  const jobs = players.flatMap((pl) => Array.from({ length: runs }, (_, r) => ({ pl, r })));
  const results: string[] = new Array(jobs.length);
  let next = 0;
  const worker = async () => {
    while (next < jobs.length) {
      const idx = next++;
      const { pl, r } = jobs[idx];
      const label = `${pl.id}${runs > 1 ? `#${r + 1}` : ""}`;
      try {
        const card = buildPlayerCard(pl.snapshot ?? null, pl.traces ?? []);
        const prompt = buildTurnPrompt(messagesFor(pl), pl.notes ?? "", pl.lang, card);
        const raw = await callFunction(url, key, prompt);
        const bad = evaluate(pl, raw).filter((c) => !c.ok);
        if (bad.length) failures++;
        results[idx] = bad.length
          ? `FAIL ${label}: ${bad.map((c) => `${c.name}${c.detail ? ` (${c.detail})` : ""}`).join("; ")}\n     reply: ${parseTurn(raw).reply.replace(/\s+/g, " ").slice(0, 160)}`
          : `ok   ${label}`;
      } catch (err) {
        failures++;
        results[idx] = `FAIL ${label}: request failed (${err instanceof Error ? err.message : String(err)})`;
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(4, jobs.length) }, worker));
  console.log(results.join("\n"));
  console.log(`\n${jobs.length - failures}/${jobs.length} passed`);
  process.exit(failures ? 1 : 0);
};

// Only run when executed directly, so the player list can be imported (and counted) in tests.
if (process.argv[1] && /eval-your-ai\.ts$/.test(process.argv[1])) {
  void main();
}
