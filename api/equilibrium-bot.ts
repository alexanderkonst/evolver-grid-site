/**
 * Equilibrium Telegram Bot — Webhook Handler
 * 
 * Handles incoming messages:
 *   /start → asks for birthday
 *   date input → stores DOB, confirms
 *   /energy → sends current energy reading on demand
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

// ─── CYCLE ENGINE ──────────────────────────────────

const DAY_ENERGY = [
    'illumination & celebration',    // Sun
    'intuition & emotional depth',   // Mon
    'action & courage',              // Tue
    'clarity & communication',       // Wed
    'expansion & wisdom',            // Thu
    'beauty & harmony',              // Fri
    'structure & grounding',         // Sat
];

const MOON_PHASES = [
    { start: 0, end: 1.85, text: 'new moon — seed intentions' },
    { start: 1.85, end: 5.53, text: 'waxing crescent — first steps' },
    { start: 5.53, end: 9.22, text: 'first quarter — build' },
    { start: 9.22, end: 12.91, text: 'waxing gibbous — refine' },
    { start: 12.91, end: 16.61, text: 'full moon — harvest' },
    { start: 16.61, end: 20.30, text: 'waning gibbous — share & teach' },
    { start: 20.30, end: 23.99, text: 'last quarter — release' },
    { start: 23.99, end: 29.54, text: 'waning crescent — rest & surrender' },
];

function getMoonText(now: Date): string {
    const knownNewMoon = new Date(2000, 0, 6, 18, 14).getTime();
    const daysSince = (now.getTime() - knownNewMoon) / 86400000;
    const cycleDay = (daysSince / 29.53058770576 % 1) * 29.53058770576;
    for (const p of MOON_PHASES) {
        if (cycleDay >= p.start && cycleDay < p.end) return p.text;
    }
    return MOON_PHASES[0].text;
}

function getQuarter(hour: number): string {
    if (hour < 6) return 'rest';
    if (hour < 12) return 'planning';
    if (hour < 18) return 'building';
    return 'integration';
}

function getYearPhase(now: Date, birthday: string | null): string {
    if (!birthday) return '';
    const [m, d] = birthday.split('-').map(Number); // MM-DD
    const year = now.getFullYear();
    let bday = new Date(year, m - 1, d);
    let nextBday = new Date(year + 1, m - 1, d);
    if (now < bday) {
        nextBday = bday;
        bday = new Date(year - 1, m - 1, d);
    }
    const progress = (now.getTime() - bday.getTime()) / (nextBday.getTime() - bday.getTime());
    if (progress < 0.25) return 'seeding your year';
    if (progress < 0.5) return 'building your year';
    if (progress < 0.75) return 'harvesting your year';
    return 'completing your year';
}

function synthesize(now: Date, birthday: string | null): string {
    const dayOfWeek = now.getDay(); // 0=Sun
    const energy = DAY_ENERGY[dayOfWeek];
    const quarter = getQuarter(now.getHours());
    const moon = getMoonText(now);
    const yearPhase = getYearPhase(now, birthday);
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    let msg = `🔮 ${timeStr} — ${energy} · ${quarter} · ${moon}`;
    if (yearPhase) msg += ` · ${yearPhase}`;
    return msg;
}

// ─── TELEGRAM HELPERS ──────────────────────────────

async function sendMessage(chatId: number, text: string) {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text }),
    });
}

// ─── SUPABASE HELPERS ──────────────────────────────

async function getUser(chatId: number) {
    const resp = await fetch(
        `${SUPABASE_URL}/rest/v1/equilibrium_users?chat_id=eq.${chatId}&select=*`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const rows = await resp.json();
    return rows[0] || null;
}

async function upsertUser(chatId: number, birthday: string, timezone: number = 8) {
    await fetch(`${SUPABASE_URL}/rest/v1/equilibrium_users`, {
        method: 'POST',
        headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify({ chat_id: chatId, birthday, timezone }),
    });
}

// ─── WEBHOOK HANDLER ───────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(200).json({ ok: true, note: 'Webhook endpoint' });
    }

    try {
        const update = req.body;
        const message = update?.message;
        if (!message) return res.status(200).json({ ok: true });

        const chatId = message.chat.id;
        const text = (message.text || '').trim();

        // /start command
        if (text === '/start') {
            await sendMessage(chatId,
                '🔮 Welcome to Equilibrium — your energy weather report.\n\n' +
                'I\'ll send you the present energy 4 times a day based on planetary days, moon phases, and your personal year.\n\n' +
                'To get started, send me your birthday in DD-MM format (e.g. 11-01 for January 11th).'
            );
            return res.status(200).json({ ok: true });
        }

        // /energy command — on-demand reading
        if (text === '/energy') {
            const user = await getUser(chatId);
            const tz = user?.timezone || 8;
            const now = new Date(Date.now() + tz * 3600000);
            const birthday = user?.birthday || null;
            const msg = synthesize(now, birthday);
            await sendMessage(chatId, msg);
            return res.status(200).json({ ok: true });
        }

        // Birthday input (DD-MM or DD-MM-YYYY)
        const dateMatch = text.match(/^(\d{1,2})-(\d{1,2})(?:-(\d{4}))?$/);
        if (dateMatch) {
            const day = dateMatch[1].padStart(2, '0');
            const month = dateMatch[2].padStart(2, '0');
            const birthday = `${month}-${day}`; // Store as MM-DD

            await upsertUser(chatId, birthday);

            const tz = 8;
            const now = new Date(Date.now() + tz * 3600000);
            const yearPhase = getYearPhase(now, birthday);

            await sendMessage(chatId,
                `✅ Birthday set! You're currently ${yearPhase}.\n\n` +
                `You'll receive energy readings at 06:00, 12:00, 18:00, and 00:00.\n\n` +
                `Type /energy anytime for a reading now.`
            );
            return res.status(200).json({ ok: true });
        }

        // Unknown input
        await sendMessage(chatId,
            'Send your birthday as DD-MM (e.g. 11-01) or type /energy for a reading now.'
        );
        return res.status(200).json({ ok: true });

    } catch (e) {
        console.error('Webhook error:', e);
        return res.status(200).json({ ok: true }); // Always 200 to Telegram
    }
}
