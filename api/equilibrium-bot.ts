/**
 * Equilibrium Telegram Bot — Webhook Handler
 * 
 * Self-service: /start → asks DOB → stores in Supabase → sends first reading
 * /energy → on-demand reading anytime
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFullReading } from './readings';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

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
    return Array.isArray(rows) ? rows[0] || null : null;
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
        return res.status(200).json({ ok: true, note: 'Equilibrium bot webhook' });
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
                '⚡ Equilibrium — your energy weather report.\n\n' +
                'Four times a day, I\'ll tell you what energy is present based on planetary days, ' +
                'moon phases, and your personal year cycle.\n\n' +
                'Send me your date of birth in DD-MM-YYYY format to get started.\n' +
                '(e.g. 04-01-1985 for January 4th, 1985)'
            );
            return res.status(200).json({ ok: true });
        }

        // /energy command — on-demand reading
        if (text === '/energy') {
            const user = await getUser(chatId);
            const tz = user?.timezone || 8;
            const now = new Date(Date.now() + tz * 3600000);
            const reading = getFullReading(now, user?.birthday || undefined);
            await sendMessage(chatId, reading);
            return res.status(200).json({ ok: true });
        }

        // Birthday input (DD-MM-YYYY)
        const dateMatch = text.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
        if (dateMatch) {
            const birthday = text; // Store as DD-MM-YYYY
            await upsertUser(chatId, birthday);

            const now = new Date(Date.now() + 8 * 3600000);
            const reading = getFullReading(now, birthday);

            await sendMessage(chatId,
                '✅ You\'re all set!\n\n' +
                'You\'ll receive readings at 06:00, 12:00, 18:00, and 00:00.\n' +
                'Type /energy anytime for a reading now.\n\n' +
                '— Your first reading —\n\n' +
                reading
            );
            return res.status(200).json({ ok: true });
        }

        // Unknown input
        await sendMessage(chatId,
            'Send your date of birth as DD-MM-YYYY (e.g. 04-01-1985) or type /energy for a reading.'
        );
        return res.status(200).json({ ok: true });

    } catch (e) {
        console.error('Webhook error:', e);
        return res.status(200).json({ ok: true });
    }
}
