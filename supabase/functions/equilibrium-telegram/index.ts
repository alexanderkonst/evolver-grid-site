/**
 * Equilibrium Telegram Bot — Energy Weather Report
 * 
 * Sends 4 messages per day with the current energy synthesis.
 * Combines: day quarter + planetary day + moon phase → one sentence.
 * 
 * Deploy as Supabase Edge Function, triggered by pg_cron at:
 *   6:00, 12:00, 18:00, 00:00 (user's timezone)
 * 
 * Environment variables:
 *   TELEGRAM_BOT_TOKEN — from @BotFather
 *   TELEGRAM_CHAT_ID — your personal chat ID
 */

// ─── CYCLE DATA ────────────────────────────────────

const PLANETARY_DAYS = [
    { name: 'Sunday', planet: 'Sun', emoji: '☀️', energy: 'Illumination & Celebration', description: 'Vision, purpose, creative self-expression. Celebrate what you\'ve built.' },
    { name: 'Monday', planet: 'Moon', emoji: '🌙', energy: 'Intuition & Emotional Depth', description: 'Reflection, inner sensing, emotional recalibration. Plan from feeling, not force.' },
    { name: 'Tuesday', planet: 'Mars', emoji: '🔥', energy: 'Action & Courage', description: 'Decisive action, physical energy, tackling hard things. Move your body.' },
    { name: 'Wednesday', planet: 'Mercury', emoji: '🗣️', energy: 'Clarity & Communication', description: 'Meetings, writing, learning, networking. Mental agility at peak.' },
    { name: 'Thursday', planet: 'Jupiter', emoji: '✨', energy: 'Expansion & Wisdom', description: 'Big-picture thinking, teaching, strategic planning. Expand horizons.' },
    { name: 'Friday', planet: 'Venus', emoji: '🌹', energy: 'Beauty & Harmony', description: 'Creativity, relationships, design, pleasure. Make things beautiful.' },
    { name: 'Saturday', planet: 'Saturn', emoji: '🪐', energy: 'Structure & Grounding', description: 'Discipline, organizing, completing. Review the week, ground the gains.' },
];

// 8 phases — indexed by elongation segment. Sasha 2026-05-24:
// boundaries removed (runtime uses true elongation via Brown's theory,
// see lunarElongationDeg below). Keep symbol + energy for the
// Telegram message; the `name` is the phase identity.
const MOON_PHASES = [
    { name: 'New Moon', symbol: '🌑', energy: 'Set intentions · Plant seeds' },
    { name: 'Waxing Crescent', symbol: '🌒', energy: 'Emerge · Take first steps' },
    { name: 'First Quarter', symbol: '🌓', energy: 'Build · Overcome resistance' },
    { name: 'Waxing Gibbous', symbol: '🌔', energy: 'Refine · Trust the process' },
    { name: 'Full Moon', symbol: '🌕', energy: 'Harvest · Celebrate completion' },
    { name: 'Waning Gibbous', symbol: '🌖', energy: 'Share · Teach what you learned' },
    { name: 'Last Quarter', symbol: '🌗', energy: 'Release · Let go of what\'s done' },
    { name: 'Waning Crescent', symbol: '🌘', energy: 'Rest · Surrender · Renew' },
];

const DAY_QUARTERS = [
    { name: 'Night', hours: [0, 5], phase: 'Rest', description: 'Deep rest and renewal' },
    { name: 'Morning', hours: [6, 11], phase: 'Planning', description: 'Seed and set direction' },
    { name: 'Afternoon', hours: [12, 17], phase: 'Building', description: 'Execute and create' },
    { name: 'Evening', hours: [18, 23], phase: 'Integration', description: 'Reflect and consolidate' },
];

// ─── CYCLE CALCULATIONS ────────────────────────────

// ─── ASTRONOMY — synced with src/lib/equilibrium-cycles/index.ts ────
//
// Sasha 2026-05-24: this function used to do mean-cycle math with
// asymmetric phase windows (New Moon 1.85d, Waning Crescent 5.54d,
// others ~3.69d) AND used `new Date(2000, 0, 6, 18, 14)` which is
// LOCAL time (Deno default UTC, but still — wrong on principle).
// Ported the Brown's-theory implementation from the front-end so this
// Telegram bot sends the SAME phase the watch shows.
//
// Mirrors `lunarElongationDeg` in src/lib/equilibrium-cycles/index.ts.
// Keep in sync — both should be wrapped in a shared package eventually.
// Validation: same checks as src/lib/equilibrium-cycles/__tests__/cycles.test.ts.

const RAD = Math.PI / 180;
const DAY_MS = 86_400_000;
const J2000_JD = 2451545.0;
const UNIX_EPOCH_JD = 2440587.5;

function deltaTSecondsForYear(year: number): number {
    const y = year - 2005;
    return 62.92 + 0.32217 * y + 0.005589 * y * y;
}

function julianCenturiesTT(nowMs: number): number {
    const jdUTC = nowMs / DAY_MS + UNIX_EPOCH_JD;
    const yearApprox = (jdUTC - J2000_JD) / 365.25 + 2000;
    const ttJD = jdUTC + deltaTSecondsForYear(yearApprox) / 86400;
    return (ttJD - J2000_JD) / 36525;
}

function deg360(x: number): number {
    return ((x % 360) + 360) % 360;
}

function lunarElongationDeg(nowMs: number): number {
    const T = julianCenturiesTT(nowMs);
    const D = deg360(
        297.8501921 + 445267.1114034 * T - 0.0018819 * T * T +
        (T * T * T) / 545868 - (T * T * T * T) / 113065000
    );
    const M = deg360(
        357.5291092 + 35999.0502909 * T - 0.0001536 * T * T +
        (T * T * T) / 24490000
    );
    const Mp = deg360(
        134.9633964 + 477198.8675055 * T + 0.0087414 * T * T +
        (T * T * T) / 69699 - (T * T * T * T) / 14712000
    );
    const F = deg360(
        93.272095 + 483202.0175233 * T - 0.0036539 * T * T -
        (T * T * T) / 3526000 + (T * T * T * T) / 863310000
    );
    const E = 1 - 0.002516 * T - 0.0000074 * T * T;
    const D_ = D * RAD, M_ = M * RAD, Mp_ = Mp * RAD, F_ = F * RAD;

    let dL = 0;
    dL += 6.288774 * Math.sin(Mp_);
    dL += 1.274027 * Math.sin(2 * D_ - Mp_);
    dL += 0.658314 * Math.sin(2 * D_);
    dL += 0.213618 * Math.sin(2 * Mp_);
    dL -= 0.185116 * Math.sin(M_) * E;
    dL -= 0.114332 * Math.sin(2 * F_);
    dL += 0.058793 * Math.sin(2 * D_ - 2 * Mp_);
    dL += 0.057066 * Math.sin(2 * D_ - M_ - Mp_) * E;
    dL += 0.053322 * Math.sin(2 * D_ + Mp_);
    dL += 0.045758 * Math.sin(2 * D_ - M_) * E;
    dL -= 0.040923 * Math.sin(M_ - Mp_) * E;
    dL -= 0.034720 * Math.sin(D_);
    dL -= 0.030383 * Math.sin(M_ + Mp_) * E;
    dL += 0.015327 * Math.sin(2 * D_ - 2 * F_);
    dL -= 0.012528 * Math.sin(Mp_ + 2 * F_);

    const sunC =
        (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M_) +
        (0.019993 - 0.000101 * T) * Math.sin(2 * M_) +
        0.000289 * Math.sin(3 * M_);

    return deg360(D + dL - sunC);
}

function getMoonPhase(now: Date) {
    // Phase index from true elongation. Shift by +22.5° so principal
    // phases (New 0°, FQ 90°, Full 180°, LQ 270°) sit at the CENTER
    // of their 45° windows. Floor → index 0-7.
    const elongation = lunarElongationDeg(now.getTime());
    const shifted = (elongation + 22.5) % 360;
    const index = Math.min(7, Math.floor(shifted / 45));
    return MOON_PHASES[index];
}

function getDayQuarter(hour: number) {
    for (const q of DAY_QUARTERS) {
        if (hour >= q.hours[0] && hour <= q.hours[1]) return q;
    }
    return DAY_QUARTERS[0];
}

function getPlanetaryDay(dayOfWeek: number) {
    return PLANETARY_DAYS[dayOfWeek];
}

// ─── SYNTHESIS ─────────────────────────────────────

function synthesize(now: Date): string {
    const planetDay = getPlanetaryDay(now.getDay());
    const quarter = getDayQuarter(now.getHours());
    const moon = getMoonPhase(now);

    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const lines = [
        `⏳ *${quarter.name} · ${timeStr}*`,
        ``,
        `${planetDay.emoji} *${planetDay.name}* — ${planetDay.energy}`,
        `_${planetDay.description}_`,
        ``,
        `${moon.symbol} *${moon.name}* — ${moon.energy}`,
        ``,
        `🔮 *Quarter energy:* ${quarter.phase} — _${quarter.description}_`,
    ];

    return lines.join('\n');
}

// ─── TELEGRAM ──────────────────────────────────────

async function sendTelegram(token: string, chatId: string, message: string) {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown',
        }),
    });

    if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`Telegram API error: ${resp.status} ${err}`);
    }

    return resp.json();
}

// ─── EDGE FUNCTION HANDLER ─────────────────────────

Deno.serve(async (req: Request) => {
    try {
        const token = Deno.env.get('TELEGRAM_BOT_TOKEN');
        const chatId = Deno.env.get('TELEGRAM_CHAT_ID');

        if (!token || !chatId) {
            return new Response(JSON.stringify({ error: 'Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Use timezone offset from query param or default to +8 (Singapore)
        const url = new URL(req.url);
        const tzOffset = parseInt(url.searchParams.get('tz') || '8');

        const now = new Date();
        // Adjust to user's timezone
        const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
        const localNow = new Date(utcMs + tzOffset * 3600000);

        const message = synthesize(localNow);
        await sendTelegram(token, chatId, message);

        return new Response(JSON.stringify({ ok: true, message }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: String(e) }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});
