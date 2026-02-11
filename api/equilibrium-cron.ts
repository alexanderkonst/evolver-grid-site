/**
 * Equilibrium Telegram Bot — Cron Handler
 * 
 * Called by Vercel cron at 06:00, 12:00, 18:00, 00:00 SGT.
 * For each registered user, synthesizes current energy via LLM
 * and sends one sentence to Telegram.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// ─── CYCLE ENGINE (same as webhook) ────────────────

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PLANET_NAMES = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
const DAY_ENERGY = [
    'illumination & celebration',
    'intuition & emotional depth',
    'action & courage',
    'clarity & communication',
    'expansion & wisdom',
    'beauty & harmony',
    'structure & grounding',
];

const MOON_PHASES = [
    { start: 0, end: 1.85, name: 'New Moon', energy: 'seed intentions, plant new beginnings' },
    { start: 1.85, end: 5.53, name: 'Waxing Crescent', energy: 'emerge, take first steps' },
    { start: 5.53, end: 9.22, name: 'First Quarter', energy: 'build, overcome resistance' },
    { start: 9.22, end: 12.91, name: 'Waxing Gibbous', energy: 'refine, trust the process' },
    { start: 12.91, end: 16.61, name: 'Full Moon', energy: 'harvest, celebrate completion' },
    { start: 16.61, end: 20.30, name: 'Waning Gibbous', energy: 'share, teach what you learned' },
    { start: 20.30, end: 23.99, name: 'Last Quarter', energy: 'release, let go of what is done' },
    { start: 23.99, end: 29.54, name: 'Waning Crescent', energy: 'rest, surrender, renew' },
];

function getMoonPhase(now: Date) {
    const knownNewMoon = new Date(2000, 0, 6, 18, 14).getTime();
    const daysSince = (now.getTime() - knownNewMoon) / 86400000;
    const cycleDay = (daysSince / 29.53058770576 % 1) * 29.53058770576;
    for (const p of MOON_PHASES) {
        if (cycleDay >= p.start && cycleDay < p.end) return p;
    }
    return MOON_PHASES[0];
}

function getQuarter(hour: number) {
    if (hour < 6) return { name: 'Night', phase: 'deep rest' };
    if (hour < 12) return { name: 'Morning', phase: 'planning & seeding' };
    if (hour < 18) return { name: 'Afternoon', phase: 'building & executing' };
    return { name: 'Evening', phase: 'integration & reflection' };
}

function getYearPhase(now: Date, birthday: string | null): string | null {
    if (!birthday) return null;
    const [m, d] = birthday.split('-').map(Number);
    const year = now.getFullYear();
    let bday = new Date(year, m - 1, d);
    let nextBday = new Date(year + 1, m - 1, d);
    if (now < bday) {
        nextBday = bday;
        bday = new Date(year - 1, m - 1, d);
    }
    const progress = (now.getTime() - bday.getTime()) / (nextBday.getTime() - bday.getTime());
    if (progress < 0.25) return 'early personal year — seeding and planning phase';
    if (progress < 0.5) return 'mid personal year — building and expanding phase';
    if (progress < 0.75) return 'late personal year — harvesting and sharing phase';
    return 'end of personal year — completing and releasing phase';
}

// ─── LLM SYNTHESIS ─────────────────────────────────

async function synthesizeWithAI(cycleData: {
    dayName: string;
    planet: string;
    dayEnergy: string;
    quarterName: string;
    quarterPhase: string;
    moonName: string;
    moonEnergy: string;
    yearPhase: string | null;
}): Promise<string> {
    const prompt = `You are an energy weather reader. Given these current natural cycles, write ONE sentence (max 15 words) that names the combined energy present right now. Be direct, practical, human. No motivation, no poetry, no exclamation marks. Just name what's here and what it's good for.

Current cycles:
- Day: ${cycleData.dayName} (${cycleData.planet}) — ${cycleData.dayEnergy}
- Time of day: ${cycleData.quarterName} — ${cycleData.quarterPhase}
- Moon: ${cycleData.moonName} — ${cycleData.moonEnergy}
${cycleData.yearPhase ? `- Personal year: ${cycleData.yearPhase}` : ''}

Write only the one sentence. Nothing else.`;

    try {
        const resp = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.7, maxOutputTokens: 50 },
                }),
            }
        );

        if (!resp.ok) throw new Error(`Gemini ${resp.status}`);
        const data = await resp.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) return text;
        throw new Error('Empty response');
    } catch (e) {
        // Fallback: simple template
        return `${cycleData.dayEnergy} meets ${cycleData.moonEnergy} — ${cycleData.quarterPhase} time`;
    }
}

// ─── MAIN HANDLER ──────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Verify cron secret (Vercel adds this automatically)
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // Also allow manual trigger for testing
        if (req.query.secret !== process.env.CRON_SECRET && process.env.CRON_SECRET) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    }

    try {
        // Fetch all users
        const usersResp = await fetch(
            `${SUPABASE_URL}/rest/v1/equilibrium_users?select=*`,
            { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
        );
        const users = await usersResp.json();

        if (!Array.isArray(users) || users.length === 0) {
            return res.status(200).json({ ok: true, sent: 0, note: 'No users' });
        }

        let sent = 0;
        for (const user of users) {
            const tz = user.timezone || 8;
            const now = new Date(Date.now() + tz * 3600000);
            const dayOfWeek = now.getUTCDay();

            const moon = getMoonPhase(now);
            const quarter = getQuarter(now.getUTCHours());
            const yearPhase = getYearPhase(now, user.birthday);

            const cycleData = {
                dayName: DAY_NAMES[dayOfWeek],
                planet: PLANET_NAMES[dayOfWeek],
                dayEnergy: DAY_ENERGY[dayOfWeek],
                quarterName: quarter.name,
                quarterPhase: quarter.phase,
                moonName: moon.name,
                moonEnergy: moon.energy,
                yearPhase,
            };

            const insight = await synthesizeWithAI(cycleData);
            const timeStr = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`;
            const message = `🔮 ${timeStr} — ${insight}`;

            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: user.chat_id, text: message }),
            });

            sent++;
        }

        return res.status(200).json({ ok: true, sent });
    } catch (e) {
        console.error('Cron error:', e);
        return res.status(500).json({ error: String(e) });
    }
}
