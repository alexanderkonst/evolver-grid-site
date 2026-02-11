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

// ─── DATA (identical to equilibrium-telegram-bot) ───

const CORE_READINGS: Record<number, Record<string, string>> = {
  0: {
    Night: "The visionary day is complete — let your dreams do the creative work. Sleep with a question in mind.",
    Morning: "Before you do anything today, ask: what matters most this week? Let the answer find you, don't force it.",
    Afternoon: "Creative fire is high — make something that expresses who you are right now. Don't edit, just create.",
    Evening: "Light a candle, call someone you appreciate, or sit with gratitude — mark the end of the week with presence.",
  },
  1: {
    Night: "Moon-day is complete — trust what surfaced today. Your intuition processed more than your mind knows.",
    Morning: "Don't plan from logic today — plan from what pulls you. Feel first, think second. Your gut is leading.",
    Afternoon: "Emotional intelligence is your sharpest tool right now — have the conversation you've been sensing needs to happen.",
    Evening: "The inner world is loud tonight — journal, sit quietly, or take a bath. Let your feelings finish their sentences.",
  },
  2: {
    Night: "Mars-day is done — your body did the work today. Rest deeply, let muscles and mind both recover.",
    Morning: "Pick the hardest thing on your list and do it first. Your body has courage today — use it before noon.",
    Afternoon: "Physical energy peaks now — build with your hands, walk while you think, or tackle the thing you've been avoiding.",
    Evening: "The body held today's courage — stretch, move, shake off the tension you carried through action today.",
  },
  3: {
    Night: "Mercury-day is complete — your mind processed a lot. Let it file and sort while you sleep.",
    Morning: "Sharp mind, clear signal — write the difficult message you've been composing in your head. Say the precise thing.",
    Afternoon: "Peak mental agility — have the meeting, make the call, write the document. Your words land with precision today.",
    Evening: "Your thinking is at its clearest — name what you know right now. Write it down before the clarity fades.",
  },
  4: {
    Night: "Jupiter-day is complete — you saw further today than usual. Let the expanded view settle into quiet knowing.",
    Morning: "The horizon is wide today — zoom out from tasks. What is the big picture? Think strategy, not to-do lists.",
    Afternoon: "Expansion energy is fully open — teach what you know, or learn what excites you. Go broad, not deep today.",
    Evening: "Capture your biggest insight from today before it shrinks back to normal size. The wide view fades by morning.",
  },
  5: {
    Night: "Venus-day is complete — pleasure and connection did their quiet work. Let beauty continue in your dreams.",
    Morning: "Start today by making one thing around you more beautiful. Small and real — a clean desk, fresh flowers, good light.",
    Afternoon: "Creativity and connection peak now — design, collaborate, or have a conversation that feeds your soul. Not productivity, beauty.",
    Evening: "Close the day beautifully — cook something good, listen to music you love, be with someone who makes you feel alive.",
  },
  6: {
    Night: "Saturn-day is complete — the ground is solid beneath you. Rest on what you've built and organized this week.",
    Morning: "Structure day — look at the week honestly. What worked? What is messy? Organize one thing properly before noon.",
    Afternoon: "Discipline energy peaks now — do the unglamorous thing you've been postponing. Systems, files, finances, cleanup.",
    Evening: "The week's structure is set — review your commitments and prune what doesn't fit. Simplify ruthlessly tonight.",
  },
};

const MOON_MODIFIERS: Record<string, string> = {
  "New Moon": "The cycle is brand new — whatever you name right now becomes a seed.",
  "Waxing Crescent": "Something new is just emerging — take one small step forward, don't force the full picture yet.",
  "First Quarter": "Resistance is natural right now — push through the friction, it's building real strength.",
  "Waxing Gibbous": "You're close to something — refine the details, don't start over. Trust what's already forming.",
  "Full Moon": "Everything is illuminated — see clearly what actually is, not what you wish it were.",
  "Waning Gibbous": "The harvest is in — share what you've learned with someone. Teach, give, pass it forward.",
  "Last Quarter": "Name what's complete and stop carrying it — finished things get heavy when you don't put them down.",
  "Waning Crescent": "The cycle is ending — rest is not laziness right now, it's preparation. Go gentle on yourself.",
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
  "New Moon": "Seeding", "Waxing Crescent": "Emerging", "First Quarter": "Building",
  "Waxing Gibbous": "Refining", "Full Moon": "Harvesting", "Waning Gibbous": "Sharing",
  "Last Quarter": "Releasing", "Waning Crescent": "Resting",
};
const MOON_SYMBOLS: Record<string, string> = {
  "New Moon": "🌑", "Waxing Crescent": "🌒", "First Quarter": "🌓",
  "Waxing Gibbous": "🌔", "Full Moon": "🌕", "Waning Gibbous": "🌖",
  "Last Quarter": "🌗", "Waning Crescent": "🌘",
};

// ─── HELPERS (identical to equilibrium-telegram-bot) ─

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

function getYearProgress(birthday: string, now: Date): { progress: number; age: number } {
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
  const shifted = new Date(Date.now() + tzOffset * 3600000);
  const utcNow = new Date();
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
    `${PLANET_SYMBOLS[dayOfWeek]} ${PLANET_ENERGY[dayOfWeek]} · ${MOON_SYMBOLS[moonPhase]} ${MOON_ENERGY[moonPhase]}${age > 0 ? ` · ☀️ ${getOrdinal(age)} year (${yearPhaseName})` : ""}`,
    "",
    CORE_READINGS[dayOfWeek][quarter],
    "",
    MOON_MODIFIERS[moonPhase],
    "",
    YEAR_MODIFIERS[yearPhaseIdx],
  ];

  return lines.join("\n");
}

async function sendTelegram(chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
  });
}

// ─── MAIN ───────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Fetch all users
    const { data: users, error } = await supabase
      .from("equilibrium_users")
      .select("*");

    if (error) {
      console.error("Failed to fetch users:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!users || users.length === 0) {
      console.log("No users to notify");
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sent = 0;
    let failed = 0;

    for (const user of users) {
      try {
        const reading = buildReading(user.birthday, user.timezone ?? 8);
        await sendTelegram(user.chat_id, reading);
        sent++;
      } catch (err) {
        console.error(`Failed to send to chat_id ${user.chat_id}:`, err);
        failed++;
      }
    }

    console.log(`Cron complete: sent=${sent}, failed=${failed}`);
    return new Response(JSON.stringify({ sent, failed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Cron error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
