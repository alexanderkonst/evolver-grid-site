/**
 * Equilibrium Telegram Bot — Cron Handler
 * 
 * Triggered by Vercel Cron at UTC 22:00, 04:00, 10:00, 16:00
 * (= SGT 06:00, 12:00, 18:00, 00:00)
 * 
 * Sends hand-crafted readings to all registered users.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFullReading } from './readings';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Verify cron secret
    const authHeader = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // Fetch all users
        const usersResp = await fetch(
            `${SUPABASE_URL}/rest/v1/equilibrium_users?select=*`,
            { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
        );
        const users = await usersResp.json();

        if (!Array.isArray(users) || users.length === 0) {
            return res.status(200).json({ ok: true, sent: 0 });
        }

        let sent = 0;
        for (const user of users) {
            const tz = user.timezone || 8;
            const now = new Date(Date.now() + tz * 3600000);
            const reading = getFullReading(now, user.birthday || undefined);

            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: user.chat_id, text: reading }),
            });
            sent++;
        }

        return res.status(200).json({ ok: true, sent });
    } catch (e) {
        console.error('Cron error:', e);
        return res.status(500).json({ error: String(e) });
    }
}
