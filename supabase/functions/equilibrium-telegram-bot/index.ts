import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ─── DATA ───────────────────────────────────────────

const CORE_READINGS: Record<number, Record<string, string>> = {
  0: { // Sunday
    Night: "The visionary day is complete — let your dreams do the creative work. Sleep with a question in mind.",
    Morning: "Before you do anything today, ask: what matters most this week? Let the answer find you, don't force it.",
    Afternoon: "Creative fire is high — make something that expresses who you are right now. Don't edit, just create.",
    Evening: "Light a candle, call someone you appreciate, or sit with gratitude — mark the end of the week with presence.",
  },
  1: { // Monday
    Night: "Moon-day is complete — trust what surfaced today. Your intuition processed more than your mind knows.",
    Morning: "Don't plan from logic today — plan from what pulls you. Feel first, think second. Your gut is leading.",
    Afternoon: "Emotional intelligence is your sharpest tool right now — have the conversation you've been sensing needs to happen.",
    Evening: "The inner world is loud tonight — journal, sit quietly, or take a bath. Let your feelings finish their sentences.",
  },
  2: { // Tuesday
    Night: "Mars-day is done — your body did the work today. Rest deeply, let muscles and mind both recover.",
    Morning: "Pick the hardest thing on your list and do it first. Your body has courage today — use it before noon.",
    Afternoon: "Physical energy peaks now — build with your hands, walk while you think, or tackle the thing you've been avoiding.",
    Evening: "The body held today's courage — stretch, move, shake off the tension you carried through action today.",
  },
  3: { // Wednesday
    Night: "Mercury-day is complete — your mind processed a lot. Let it file and sort while you sleep.",
    Morning: "Sharp mind, clear signal — write the difficult message you've been composing in your head. Say the precise thing.",
    Afternoon: "Peak mental agility — have the meeting, make the call, write the document. Your words land with precision today.",
    Evening: "Your thinking is at its clearest — name what you know right now. Write it down before the clarity fades.",
  },
  4: { // Thursday
    Night: "Jupiter-day is complete — you saw further today than usual. Let the expanded view settle into quiet knowing.",
    Morning: "The horizon is wide today — zoom out from tasks. What is the big picture? Think strategy, not to-do lists.",
    Afternoon: "Expansion energy is fully open — teach what you know, or learn what excites you. Go broad, not deep today.",
    Evening: "Capture your biggest insight from today before it shrinks back to normal size. The wide view fades by morning.",
  },
  5: { // Friday
    Night: "Venus-day is complete — pleasure and connection did their quiet work. Let beauty continue in your dreams.",
    Morning: "Start today by making one thing around you more beautiful. Small and real — a clean desk, fresh flowers, good light.",
    Afternoon: "Creativity and connection peak now — design, collaborate, or have a conversation that feeds your soul. Not productivity, beauty.",
    Evening: "Close the day beautifully — cook something good, listen to music you love, be with someone who makes you feel alive.",
  },
  6: { // Saturday
    Night: "Saturn-day is complete — the ground is solid beneath you. Rest on what you've built and organized this week.",
    Morning: "Structure day — look at the week honestly. What worked? What is messy? Organize one thing properly before noon.",
    Afternoon: "Discipline energy peaks now — do the unglamorous thing you've been postponing. Systems, files, finances, cleanup.",
    Evening: "The week's structure is set — review your commitments and prune what doesn't fit. Simplify ruthlessly tonight.",
  },
};

const MOON_MODIFIERS: Record<string, string> = {
  "New Moon": "Results are appearing — what was created in the dark is now becoming visible. Assist it to land.",
  "Waxing Crescent": "Growth spurt — the invisible is becoming visible. Polish it, help it materialize.",
  "First Quarter": "The harvest begins — receive what's growing. New clarity is arriving.",
  "Waxing Gibbous": "Abundance is arriving — winds of change bring new potential. Receive.",
  "Full Moon": "Harvest peak — rejoice, revere what came to fruition. A new intention is forming within.",
  "Waning Gibbous": "Inner fire ignites — a new seed is willing itself into existence. Don't push, let it will.",
  "Last Quarter": "Creative flow — let it move freely. The deepest artistry happens when no one is watching.",
  "Waning Crescent": "Deepest creation — no visibility means no interference. Maximum creative freedom.",
};

const YEAR_MODIFIERS = [
  "You are planting seeds for the year ahead — every choice right now shapes what grows.",
  "The year is building momentum — what you invest effort in now compounds from here.",
  "Your year's harvest is approaching — start gathering and sharing what's ripening.",
  "The year is completing — honor what happened, release what's done, make space for what's next.",
];

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PLANET_SYMBOLS = ["☉", "☽", "♂", "☿", "♃", "♀", "♄"];
const PLANET_ENERGY = ["Vision & Purpose", "Intuition & Feeling", "Action & Courage", "Clarity & Communication", "Expansion & Wisdom", "Beauty & Harmony", "Structure & Discipline"];
const MOON_ENERGY: Record<string, string> = {
  "New Moon": "🌍 Materializing", "Waxing Crescent": "🌍 Growing", "First Quarter": "🌬️ Harvesting",
  "Waxing Gibbous": "🌬️ Receiving", "Full Moon": "🔥 Igniting", "Waning Gibbous": "🔥 Willing",
  "Last Quarter": "💧 Flowing", "Waning Crescent": "💧 Creating",
};
const MOON_SYMBOLS: Record<string, string> = {
  "New Moon": "🌑", "Waxing Crescent": "🌒", "First Quarter": "🌓",
  "Waxing Gibbous": "🌔", "Full Moon": "🌕", "Waning Gibbous": "🌖",
  "Last Quarter": "🌗", "Waning Crescent": "🌘",
};

// ─── HELPERS ────────────────────────────────────────

function getMoonPhase(date: Date): string {
  const ref = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));
  const diff = (date.getTime() - ref.getTime()) / 86400000;
  const syn = 29.53058770576;
  const age = ((diff % syn) + syn) % syn;
  const idx = Math.floor((age / syn) * 8);
  const phases = ["New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous",
    "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"];
  return phases[idx % 8];
}

function getQuarter(hour: number): string {
  if (hour < 6) return "Night";
  if (hour < 12) return "Morning";
  if (hour < 18) return "Afternoon";
  return "Evening";
}

function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function parseBirthday(text: string): { month: number; day: number; year?: number } | null {
  const m = text.trim().match(/^(\d{1,2})-(\d{1,2})(?:-(\d{4}))?$/);
  if (!m) return null;
  const day = parseInt(m[1]);
  const month = parseInt(m[2]);
  const year = m[3] ? parseInt(m[3]) : undefined;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { month, day, year };
}

function getYearProgress(birthday: string, now: Date): { progress: number; age: number } {
  // birthday stored as MM-DD or YYYY-MM-DD
  let bMonth: number, bDay: number, bYear: number | undefined;
  if (birthday.length <= 5) {
    const [mm, dd] = birthday.split("-").map(Number);
    bMonth = mm; bDay = dd;
  } else {
    const [y, m, d] = birthday.split("-").map(Number);
    bYear = y; bMonth = m; bDay = d;
  }

  const thisYear = now.getFullYear();
  const bdayThisYear = new Date(thisYear, bMonth - 1, bDay);
  const bdayLastYear = new Date(thisYear - 1, bMonth - 1, bDay);
  const bdayNextYear = new Date(thisYear + 1, bMonth - 1, bDay);

  let start: Date, end: Date;
  if (now >= bdayThisYear) {
    start = bdayThisYear;
    end = bdayNextYear;
  } else {
    start = bdayLastYear;
    end = bdayThisYear;
  }

  const progress = (now.getTime() - start.getTime()) / (end.getTime() - start.getTime());
  const age = bYear ? thisYear - bYear + (now >= bdayThisYear ? 0 : -1) : 0;
  return { progress, age };
}

function buildReading(birthday: string, tzOffset: number): string {
  const now = new Date(Date.now() + tzOffset * 3600000);
  const utcNow = new Date(now.toISOString());
  // Use shifted time for day/hour
  const shifted = new Date(Date.now() + tzOffset * 3600000);
  const dayOfWeek = shifted.getUTCDay();
  const hour = shifted.getUTCHours();
  const quarter = getQuarter(hour);

  const moonPhase = getMoonPhase(utcNow);
  const { progress, age } = getYearProgress(birthday, shifted);

  const yearPhaseIdx = Math.min(3, Math.floor(progress * 4));
  const yearPhaseName = ["planning", "building", "harvesting", "completing"][yearPhaseIdx];

  const hh = String(hour).padStart(2, "0");
  const mm = String(shifted.getUTCMinutes()).padStart(2, "0");

  const lines = [
    `⚡ ${hh}:${mm} · ${DAY_NAMES[dayOfWeek]} ${quarter}`,
    "",
    `☀️ Day  ${buildProgressBar(getDayProgress(hour, shifted.getUTCMinutes()))}  ${HOLONIC_ELEMENTS[getHolonicIdx(getDayProgress(hour, shifted.getUTCMinutes()))]}`,
    `🔵 Week ${buildProgressBar(getWeekProgress(dayOfWeek, hour, shifted.getUTCMinutes()))}  ${getWeekHolonicLabel(dayOfWeek)}`,
    `${MOON_SYMBOLS[moonPhase]} Moon ${buildProgressBar(getMoonProgressValue(utcNow))}  ${HOLONIC_ELEMENTS[getMoonHolonicIdx(utcNow)]}`,
    "",
    `${PLANET_SYMBOLS[dayOfWeek]} ${PLANET_ENERGY[dayOfWeek]} · ${MOON_ENERGY[moonPhase]}${age > 0 ? ` · ☀️ ${getOrdinal(age)} year (${yearPhaseName})` : ""}`,
    "",
    CORE_READINGS[dayOfWeek][quarter],
    "",
    MOON_MODIFIERS[moonPhase],
    "",
    YEAR_MODIFIERS[yearPhaseIdx],
  ];

  return lines.join("\n");
}

// ─── PROGRESS BAR + HOLONIC HELPERS ────────────────

function buildProgressBar(progress: number, segments: number = 12): string {
  const filled = Math.round(progress * segments);
  let bar = '';
  for (let i = 0; i < segments; i++) {
    bar += i < filled ? '▰' : '▱';
  }
  return bar;
}

const HOLONIC_ELEMENTS = ['🔥 Fire', '💧 Water', '🌍 Earth', '🌬️ Air'];
const HOLONIC_LABELS = ['PLANNING', 'BUILDING', 'COMMUNICATING', 'INTEGRATING'];

function getDayProgress(h: number, m: number): number {
  return (h * 60 + m) / 1440;
}

function getWeekProgress(dayOfWeek: number, h: number, m: number): number {
  const mondayBased = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  return (mondayBased * 1440 + h * 60 + m) / (7 * 1440);
}

function getMoonProgressValue(date: Date): number {
  const ref = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));
  const diff = (date.getTime() - ref.getTime()) / 86400000;
  const syn = 29.53058770576;
  return ((diff % syn) + syn) % syn / syn;
}

function getMoonHolonicIdx(date: Date): number {
  const syn = 29.53058770576;
  const progress = getMoonProgressValue(date);
  const fullMoonOffset = 12.91 / syn;
  const lunarHolonProgress = (progress + (1 - fullMoonOffset)) % 1;
  return Math.min(Math.floor(lunarHolonProgress * 4), 3);
}

function getWeekHolonicLabel(dayOfWeek: number): string {
  if (dayOfWeek === 1) return `${HOLONIC_ELEMENTS[0]} · ${HOLONIC_LABELS[0]}`;
  if (dayOfWeek === 2) return `${HOLONIC_ELEMENTS[1]} · ${HOLONIC_LABELS[1]}`;
  if (dayOfWeek === 3) return `${HOLONIC_ELEMENTS[2]} · ${HOLONIC_LABELS[2]}`;
  return `${HOLONIC_ELEMENTS[3]} · ${HOLONIC_LABELS[3]}`;
}

function getHolonicIdx(progress: number): number {
  return Math.min(Math.floor(progress * 4), 3);
}

const ENERGY_KEYBOARD = {
  keyboard: [[{ text: '⚡ SEE CURRENT ENERGY' }]],
  resize_keyboard: true,
  is_persistent: true,
};

async function sendTelegram(chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, reply_markup: ENERGY_KEYBOARD }),
  });
}

// ─── MAIN ───────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const update = await req.json();
    const message = update?.message;
    if (!message?.text) {
      return new Response("ok", { headers: corsHeaders });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();

    // /start
    if (text === "/start") {
      await sendTelegram(chatId,
        "Welcome to Equilibrium ⚡\n\nSend me your date of birth in DD-MM-YYYY format to get started.\n\nExample: `25-12-1985`"
      );
      return new Response("ok", { headers: corsHeaders });
    }

    // /energy or button tap
    if (text === "/energy" || text === "⚡ SEE CURRENT ENERGY") {
      const { data: user } = await supabase
        .from("equilibrium_users")
        .select("*")
        .eq("chat_id", chatId)
        .single();

      if (!user) {
        await sendTelegram(chatId, "I don't have your birthday yet. Send it in DD-MM-YYYY format first.");
        return new Response("ok", { headers: corsHeaders });
      }

      const reading = buildReading(user.birthday, user.timezone ?? 8);
      await sendTelegram(chatId, reading);
      return new Response("ok", { headers: corsHeaders });
    }

    // Date input
    const parsed = parseBirthday(text);
    if (parsed) {
      const storedBirthday = parsed.year
        ? `${parsed.year}-${String(parsed.month).padStart(2, "0")}-${String(parsed.day).padStart(2, "0")}`
        : `${String(parsed.month).padStart(2, "0")}-${String(parsed.day).padStart(2, "0")}`;

      const { data: existing } = await supabase
        .from("equilibrium_users")
        .select("id")
        .eq("chat_id", chatId)
        .single();

      if (existing) {
        await supabase
          .from("equilibrium_users")
          .update({ birthday: storedBirthday })
          .eq("chat_id", chatId);
      } else {
        await supabase
          .from("equilibrium_users")
          .insert({ chat_id: chatId, birthday: storedBirthday, timezone: 8 });
      }

      const reading = buildReading(storedBirthday, 8);
      await sendTelegram(chatId, `✅ Birthday saved!\n\nHere's your first reading:\n\n${reading}`);
      return new Response("ok", { headers: corsHeaders });
    }

    // Unknown
    await sendTelegram(chatId, "Send /energy for your current reading, or your birthday in DD-MM-YYYY format.");
    return new Response("ok", { headers: corsHeaders });

  } catch (err) {
    console.error("Bot error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
