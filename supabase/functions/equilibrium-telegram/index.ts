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

const MOON_PHASES = [
    { name: 'New Moon', symbol: '🌑', start: 0, end: 1.85, energy: 'Set intentions · Plant seeds' },
    { name: 'Waxing Crescent', symbol: '🌒', start: 1.85, end: 5.53, energy: 'Emerge · Take first steps' },
    { name: 'First Quarter', symbol: '🌓', start: 5.53, end: 9.22, energy: 'Build · Overcome resistance' },
    { name: 'Waxing Gibbous', symbol: '🌔', start: 9.22, end: 12.91, energy: 'Refine · Trust the process' },
    { name: 'Full Moon', symbol: '🌕', start: 12.91, end: 16.61, energy: 'Harvest · Celebrate completion' },
    { name: 'Waning Gibbous', symbol: '🌖', start: 16.61, end: 20.30, energy: 'Share · Teach what you learned' },
    { name: 'Last Quarter', symbol: '🌗', start: 20.30, end: 23.99, energy: 'Release · Let go of what\'s done' },
    { name: 'Waning Crescent', symbol: '🌘', start: 23.99, end: 29.53, energy: 'Rest · Surrender · Renew' },
];

const DAY_QUARTERS = [
    { name: 'Night', hours: [0, 5], phase: 'Rest', description: 'Deep rest and renewal' },
    { name: 'Morning', hours: [6, 11], phase: 'Planning', description: 'Seed and set direction' },
    { name: 'Afternoon', hours: [12, 17], phase: 'Building', description: 'Execute and create' },
    { name: 'Evening', hours: [18, 23], phase: 'Integration', description: 'Reflect and consolidate' },
];

// ─── CYCLE CALCULATIONS ────────────────────────────

function getMoonPhase(now: Date) {
    const knownNewMoon = new Date(2000, 0, 6, 18, 14).getTime();
    const synodicMonth = 29.53058770576;
    const daysSince = (now.getTime() - knownNewMoon) / 86400000;
    const cyclesElapsed = daysSince / synodicMonth;
    const currentCycleDay = (cyclesElapsed % 1) * synodicMonth;

    let phase = MOON_PHASES[0];
    for (const p of MOON_PHASES) {
        if (currentCycleDay >= p.start && currentCycleDay < p.end) {
            phase = p;
            break;
        }
    }
    return phase;
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
