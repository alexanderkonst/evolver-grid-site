/**
 * /api/founder-state.json — JSON export of `public.founder_state_v1`.
 *
 * Phase 1 of the Autonomous Navigation Loop. Consumed by the holomap briefing
 * packet (Phase 3+) and any offline script that wants a snapshot of founder
 * state.
 *
 * Auth (per brief, hard constraint #1 — do not expose PII without auth):
 *   - Either a bearer token matching FOUNDER_STATE_API_KEY (script access), or
 *   - A Supabase-authenticated session whose email is in ADMIN_EMAILS.
 *
 * Env (Vercel):
 *   - SUPABASE_URL / VITE_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY (required to read the view; the view is
 *     locked to authenticated + service_role)
 *   - FOUNDER_STATE_API_KEY (optional; enables bearer-token script access)
 */

const ADMIN_EMAILS = new Set([
    "alexanderkonst@gmail.com",
]);

type VercelRequest = {
    method?: string;
    headers: Record<string, string | string[] | undefined>;
};

type VercelResponse = {
    status: (code: number) => VercelResponse;
    json: (body: unknown) => VercelResponse;
    setHeader: (name: string, value: string) => VercelResponse;
    end: () => VercelResponse;
};

function getHeader(req: VercelRequest, name: string): string | undefined {
    const h = req.headers[name.toLowerCase()];
    if (Array.isArray(h)) return h[0];
    return h;
}

async function verifyBearerIsAdmin(
    supabaseUrl: string,
    anonKey: string,
    token: string,
): Promise<boolean> {
    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: {
            Authorization: `Bearer ${token}`,
            apikey: anonKey,
        },
    });
    if (!res.ok) return false;
    const body = (await res.json()) as { email?: string | null };
    return !!body.email && ADMIN_EMAILS.has(body.email.toLowerCase());
}

export default async function handler(
    req: VercelRequest,
    res: VercelResponse,
) {
    if (req.method && req.method !== "GET") {
        return res.status(405).json({ error: "method_not_allowed" });
    }

    const supabaseUrl =
        process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";
    const apiKey = process.env.FOUNDER_STATE_API_KEY || "";

    if (!supabaseUrl || !serviceKey) {
        return res.status(500).json({ error: "supabase_env_missing" });
    }

    const auth = getHeader(req, "authorization") || "";
    const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";

    let authorized = false;
    if (apiKey && bearer && bearer === apiKey) {
        authorized = true;
    } else if (bearer && anonKey) {
        authorized = await verifyBearerIsAdmin(supabaseUrl, anonKey, bearer);
    }

    if (!authorized) {
        res.setHeader("WWW-Authenticate", "Bearer");
        return res.status(401).json({ error: "unauthorized" });
    }

    // Service role bypasses RLS; the view GRANTs SELECT to service_role.
    const dbRes = await fetch(
        `${supabaseUrl}/rest/v1/founder_state_v1?select=*&order=last_touch_at.desc`,
        {
            headers: {
                apikey: serviceKey,
                Authorization: `Bearer ${serviceKey}`,
            },
        },
    );

    if (!dbRes.ok) {
        const text = await dbRes.text();
        return res.status(502).json({ error: "upstream_error", detail: text });
    }

    const rows = await dbRes.json();
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({
        generated_at: new Date().toISOString(),
        count: Array.isArray(rows) ? rows.length : 0,
        rows,
    });
}
