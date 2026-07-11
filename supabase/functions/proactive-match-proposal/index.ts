// proactive-match-proposal
//
// Weekly proactive match-proposal loop. Replaces the send-weekly-matches-digest
// cron. For each eligible user, picks the single best candidate from
// suggest-asset-matches (biased by their prior accept/decline history),
// creates a match_interests row, signs Yes/Not-now consent tokens pointing
// at match-consent, sends a 3-line proposal email in the Aurora register,
// and logs a match_proposals row.
//
// Silence-respect: if the user's last two proposals were both ignored
// (7+ days since proposed_at with response='pending'), pause them for
// 30 days from the second ignored proposal. When resumed, prepend a
// gentle acknowledgement.
//
// Request body (optional): { "userIds": ["..."] } to scope a dry run.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { signConsentToken } from "../_shared/matchConsentToken.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

const FROM_ADDRESS =
    "Find Your Top Talent <notifications@notify.findyourtoptalent.com>";
const SITE_URL = Deno.env.get("SITE_URL") || "https://findyourtoptalent.com";

type GiftType =
    | "mirror"
    | "compass"
    | "door"
    | "co_creation"
    | "motivation";

const GIFT_TYPES: GiftType[] = [
    "mirror",
    "compass",
    "door",
    "co_creation",
    "motivation",
];

// Map suggest-asset-matches matchType → our stored gift_type taxonomy.
const matchTypeToGift = (matchType: string | null | undefined): GiftType => {
    switch ((matchType || "").toLowerCase()) {
        case "co-build":
            return "co_creation";
        case "co-learn":
            return "mirror";
        case "co-distribute":
            return "door";
        case "co-resource":
            return "compass";
        case "co-steward":
            return "motivation";
        default:
            return "co_creation";
    }
};

const escapeHtml = (s: string): string =>
    s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

interface Profile {
    user_id: string;
    profile_id: string;
    first_name: string | null;
    email: string;
    last_zog_snapshot_id: string | null;
    match_digest_paused_until: string | null;
}

interface ProposalRow {
    proposed_user_id: string;
    gift_type: GiftType;
    proposed_at: string;
    response: string;
    responded_at: string | null;
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
        const MATCH_CONSENT_SECRET = Deno.env.get("MATCH_CONSENT_SECRET");

        if (!RESEND_API_KEY) return json({ error: "RESEND_API_KEY not configured" }, 500);
        if (!MATCH_CONSENT_SECRET) {
            return json({ error: "MATCH_CONSENT_SECRET not configured" }, 500);
        }

        const admin = createClient(supabaseUrl, serviceKey);

        // Optional dry-run scoping
        let userIdFilter: string[] | null = null;
        try {
            const body = await req.json();
            if (Array.isArray(body?.userIds)) {
                userIdFilter = body.userIds.filter(
                    (id: unknown) => typeof id === "string",
                );
            }
        } catch {
            // No body — process all eligible users.
        }

        // ── 1. Find eligible users ──────────────────────────────────
        let query = admin
            .from("game_profiles")
            .select(
                "id, user_id, first_name, last_zog_snapshot_id, visibility, match_digest_opt_in, match_digest_paused_until",
            )
            .eq("match_digest_opt_in", true)
            .not("last_zog_snapshot_id", "is", null)
            .neq("visibility", "hidden");
        if (userIdFilter && userIdFilter.length > 0) {
            query = query.in("user_id", userIdFilter);
        }
        const { data: profiles, error: profileErr } = await query;
        if (profileErr) {
            console.error("[proactive-match] profile query failed", profileErr);
            return json({ error: "Profile query failed" }, 500);
        }
        if (!profiles || profiles.length === 0) {
            return json({ sent: 0, message: "No eligible profiles." });
        }

        // Resolve email addresses
        const eligible: Profile[] = [];
        const nowIso = new Date().toISOString();
        for (const p of profiles) {
            if (!p.user_id) continue;
            const pausedUntil = (p as { match_digest_paused_until?: string | null })
                .match_digest_paused_until ?? null;
            if (pausedUntil && pausedUntil > nowIso) {
                // Currently paused — skip
                continue;
            }
            const { data: authUser } = await admin.auth.admin.getUserById(
                p.user_id,
            );
            const email = authUser?.user?.email;
            if (!email) continue;
            eligible.push({
                user_id: p.user_id,
                profile_id: p.id,
                first_name: p.first_name ?? null,
                email,
                last_zog_snapshot_id: p.last_zog_snapshot_id ?? null,
                match_digest_paused_until: pausedUntil,
            });
        }

        let sent = 0;
        let skipped = 0;
        let failed = 0;
        const failures: { userId: string; reason: string }[] = [];

        for (const profile of eligible) {
            try {
                const result = await processUser({
                    admin,
                    supabaseUrl,
                    serviceKey,
                    resendKey: RESEND_API_KEY,
                    matchConsentSecret: MATCH_CONSENT_SECRET,
                    profile,
                });
                if (result === "sent") sent += 1;
                else skipped += 1;
            } catch (err) {
                failed += 1;
                const reason = err instanceof Error ? err.message : String(err);
                failures.push({ userId: profile.user_id, reason });
                console.warn(
                    "[proactive-match] failed for",
                    profile.user_id,
                    reason,
                );
            }
        }

        return json({
            sent,
            skipped,
            failed,
            failures,
            eligible: eligible.length,
            totalProfiles: profiles.length,
        });
    } catch (error) {
        console.error("[proactive-match] unhandled error", error);
        return json(
            { error: error instanceof Error ? error.message : "Unknown error" },
            500,
        );
    }
});

async function processUser(args: {
    admin: ReturnType<typeof createClient>;
    supabaseUrl: string;
    serviceKey: string;
    resendKey: string;
    matchConsentSecret: string;
    profile: Profile;
}): Promise<"sent" | "skipped"> {
    const {
        admin,
        supabaseUrl,
        serviceKey,
        resendKey,
        matchConsentSecret,
        profile,
    } = args;

    const now = Date.now();
    const nowIso = new Date(now).toISOString();
    const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

    // ── Load 90-day proposal history ────────────────────────────
    const cutoffIso = new Date(now - NINETY_DAYS_MS).toISOString();
    const { data: historyRows } = await admin
        .from("match_proposals")
        .select("proposed_user_id, gift_type, proposed_at, response, responded_at")
        .eq("user_id", profile.user_id)
        .gte("proposed_at", cutoffIso)
        .order("proposed_at", { ascending: false });
    const history: ProposalRow[] = (historyRows ?? []) as ProposalRow[];

    // Silence-respect: mark old pending → ignored (7d+ no response)
    for (const row of history) {
        if (
            row.response === "pending" &&
            now - Date.parse(row.proposed_at) >= SEVEN_DAYS_MS
        ) {
            row.response = "ignored";
        }
    }

    // Check for two consecutive ignored (most recent two)
    const wasPaused = !!profile.match_digest_paused_until;
    if (history.length >= 2) {
        const [latest, prev] = history;
        if (
            latest.response === "ignored" &&
            prev.response === "ignored"
        ) {
            const pauseUntilMs =
                Date.parse(latest.proposed_at) + THIRTY_DAYS_MS;
            if (pauseUntilMs > now) {
                // Set pause and skip this cycle
                await admin
                    .from("game_profiles")
                    .update({
                        match_digest_paused_until: new Date(pauseUntilMs)
                            .toISOString(),
                    } as never)
                    .eq("user_id", profile.user_id);
                return "skipped";
            }
        }
    }

    // Build exclusion sets
    const declinedForever = new Set<string>();
    const recentlyProposed = new Set<string>();
    const acceptedGifts = new Map<string, number>();
    const declinedGifts = new Map<string, number>();
    for (const row of history) {
        if (row.response === "declined") {
            declinedForever.add(row.proposed_user_id);
        }
        if (now - Date.parse(row.proposed_at) < THIRTY_DAYS_MS) {
            recentlyProposed.add(row.proposed_user_id);
        }
        if (row.response === "accepted") {
            acceptedGifts.set(
                row.gift_type,
                (acceptedGifts.get(row.gift_type) ?? 0) + 1,
            );
        } else if (row.response === "declined") {
            declinedGifts.set(
                row.gift_type,
                (declinedGifts.get(row.gift_type) ?? 0) + 1,
            );
        }
    }

    // ── Call suggest-asset-matches ──────────────────────────────
    const suggestRes = await fetch(
        `${supabaseUrl}/functions/v1/suggest-asset-matches`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${serviceKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId: profile.user_id, limit: 25 }),
        },
    );
    if (!suggestRes.ok) {
        const err = await suggestRes.text();
        throw new Error(
            `suggest-asset-matches ${suggestRes.status}: ${err.slice(0, 200)}`,
        );
    }
    const suggestData = (await suggestRes.json()) as {
        matches?: Array<{
            userId: string;
            firstName?: string;
            archetype?: string | null;
            resonanceScore?: number;
            matchType?: string | null;
            collaborationProposal?: string;
            evolutionLine?: string;
            suggestedAction?: string;
            alignment?: string;
            complementarity?: string;
            proposals?: Array<{ proposal?: string; evolutionLine?: string }>;
        }>;
    };
    const matches = suggestData.matches ?? [];
    if (matches.length === 0) return "skipped";

    // Filter + apply weight
    const candidates = matches
        .filter(
            (m) =>
                !declinedForever.has(m.userId) &&
                !recentlyProposed.has(m.userId),
        )
        .map((m) => {
            const gift = matchTypeToGift(m.matchType);
            const base = m.resonanceScore ?? 0;
            const boost = (acceptedGifts.get(gift) ?? 0) * 5;
            const penalty = (declinedGifts.get(gift) ?? 0) * 5;
            return { match: m, gift, weighted: base + boost - penalty };
        })
        .sort((a, b) => b.weighted - a.weighted);

    if (candidates.length === 0) return "skipped";
    const best = candidates[0];

    // ── Insert match_interests row (seed) ───────────────────────
    const whyText = [
        best.match.complementarity,
        best.match.alignment,
        best.match.collaborationProposal,
    ]
        .filter(Boolean)
        .join(" ")
        .trim() ||
        "The engine paired you based on a resonance signal in your profiles.";

    const { data: miRow, error: miErr } = await admin
        .from("match_interests")
        .insert({
            from_user_id: profile.user_id,
            to_user_id: best.match.userId,
            match_score: best.match.resonanceScore ?? null,
            compound_type: best.match.matchType ?? null,
            ai_why_text: whyText,
            consent_response: "pending",
        } as never)
        .select("id")
        .single();
    if (miErr || !miRow) {
        throw new Error(`match_interests insert failed: ${miErr?.message}`);
    }
    const matchInterestId = (miRow as { id: string }).id;

    // ── Sign tokens ─────────────────────────────────────────────
    const consentToken = await signConsentToken(
        matchInterestId,
        "consent",
        matchConsentSecret,
    );
    const declineToken = await signConsentToken(
        matchInterestId,
        "decline",
        matchConsentSecret,
    );
    const consentUrl = `${supabaseUrl}/functions/v1/match-consent?token=${
        encodeURIComponent(consentToken)
    }`;
    const declineUrl = `${supabaseUrl}/functions/v1/match-consent?token=${
        encodeURIComponent(declineToken)
    }`;

    // ── Compose 3-line proposal ─────────────────────────────────
    const giftLine = buildGiftLine(best.gift, best.match.firstName);
    const firstStep = (
        best.match.suggestedAction ||
        best.match.proposals?.[0]?.proposal ||
        best.match.collaborationProposal ||
        "Share your current focus and see if a first 30-minute call reveals a natural collaboration."
    ).trim();
    const whyNow = (
        best.match.evolutionLine ||
        best.match.proposals?.[0]?.evolutionLine ||
        best.match.alignment ||
        "You're both at a moment where an outside mirror could unlock the next move."
    ).trim();

    // Gentle acknowledgement if returning from pause
    const gentleNote = wasPaused
        ? "It's been a little while since we sent you a match — we've kept things quiet on purpose. Here's a fresh one worth a look."
        : "";

    // ── Send email ──────────────────────────────────────────────
    const subject = `A match worth a look: ${
        best.match.firstName || "a new member"
    }`;
    const html = renderProposalHtml({
        recipientFirstName: profile.first_name || "",
        otherFirstName: best.match.firstName || "",
        otherArchetype: best.match.archetype || "",
        giftLine,
        firstStep,
        whyNow,
        gentleNote,
        consentUrl,
        declineUrl,
    });
    const text = renderProposalText({
        recipientFirstName: profile.first_name || "",
        otherFirstName: best.match.firstName || "",
        giftLine,
        firstStep,
        whyNow,
        gentleNote,
        consentUrl,
        declineUrl,
    });

    const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from: FROM_ADDRESS,
            to: [profile.email],
            subject,
            html,
            text,
        }),
    });
    if (!resendRes.ok) {
        const errText = await resendRes.text();
        // Roll back the match_interests row to avoid orphan seed rows
        await admin
            .from("match_interests")
            .delete()
            .eq("id", matchInterestId);
        throw new Error(`Resend ${resendRes.status}: ${errText.slice(0, 200)}`);
    }

    // ── Log match_proposals row ─────────────────────────────────
    await admin.from("match_proposals").insert({
        user_id: profile.user_id,
        proposed_user_id: best.match.userId,
        gift_type: best.gift,
        proposed_at: nowIso,
        response: "pending",
        match_interest_id: matchInterestId,
    } as never);

    // Clear pause flag on resume
    if (wasPaused) {
        await admin
            .from("game_profiles")
            .update({ match_digest_paused_until: null } as never)
            .eq("user_id", profile.user_id);
    }

    // Best-effort log
    await admin.from("email_send_log").insert({
        template_name: "proactive_match_proposal",
        recipient_email: profile.email,
        status: "sent",
        metadata: {
            user_id: profile.user_id,
            proposed_user_id: best.match.userId,
            match_interest_id: matchInterestId,
            gift_type: best.gift,
        },
    }).then(() => {}).catch(() => {});

    return "sent";
}

function buildGiftLine(gift: GiftType, otherFirstName?: string): string {
    const name = otherFirstName || "They";
    switch (gift) {
        case "mirror":
            return `${name} may be a mirror for your current edge — someone whose reflection can sharpen the work you're already doing.`;
        case "compass":
            return `${name} may be a compass — with a resource or perspective that points toward a direction you haven't yet named.`;
        case "door":
            return `${name} may be a door — an access point into a network, audience, or channel that matters for your next move.`;
        case "co_creation":
            return `${name} may be a co-creation partner — someone whose gifts compose with yours into something neither of you would build alone.`;
        case "motivation":
            return `${name} may be a motivation — someone whose momentum, care, or stewardship can hold your work steady.`;
    }
    return `${name} may be a match worth a conversation.`;
}

interface EmailArgs {
    recipientFirstName: string;
    otherFirstName: string;
    otherArchetype?: string;
    giftLine: string;
    firstStep: string;
    whyNow: string;
    gentleNote: string;
    consentUrl: string;
    declineUrl: string;
}

function renderProposalHtml(args: EmailArgs): string {
    const {
        recipientFirstName,
        otherFirstName,
        otherArchetype,
        giftLine,
        firstStep,
        whyNow,
        gentleNote,
        consentUrl,
        declineUrl,
    } = args;
    const greeting = recipientFirstName ? `Hi ${escapeHtml(recipientFirstName)},` : "Hi,";
    const arch = (otherArchetype || "").replace(/[✦★☆✧⬥◇◆⟐]/g, "").trim();
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>A match worth a look</title>
</head>
<body style="margin:0;padding:0;background:#f5f1e8;font-family:'Source Serif 4', Georgia, serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="background:rgba(255, 252, 245, 0.95);border:0.5px solid rgba(212, 175, 55, 0.55);border-radius:16px;padding:36px 28px;box-shadow:0 12px 32px -16px rgba(10, 22, 40, 0.18), 0 0 22px -8px rgba(212, 175, 55, 0.30);">
      <p style="margin:0 0 14px 0;font-family:'DM Sans', system-ui, sans-serif;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#5d4307;">
        ✦ A proactive match
      </p>
      <h1 style="margin:0 0 18px 0;font-family:'Cormorant Garamond', Georgia, serif;font-weight:700;font-size:28px;line-height:1.2;color:#0b2a5a;letter-spacing:-0.005em;">
        A match worth a look
      </h1>
      <p style="margin:0 0 16px 0;font-family:'Source Serif 4', Georgia, serif;font-weight:600;font-size:15.5px;line-height:1.6;color:#0b2a5a;">
        ${greeting}
      </p>
      ${
        gentleNote
            ? `<p style="margin:0 0 22px 0;font-family:'Source Serif 4', Georgia, serif;font-style:italic;font-weight:500;font-size:14.5px;line-height:1.65;color:rgba(11, 42, 90, 0.72);background:rgba(212, 175, 55, 0.06);border-left:2px solid rgba(212, 175, 55, 0.40);padding:12px 16px;border-radius:6px;">
          ${escapeHtml(gentleNote)}
        </p>`
            : ""
    }
      ${
        arch
            ? `<div style="background:rgba(212, 175, 55, 0.06);border:0.5px solid rgba(212, 175, 55, 0.30);border-radius:12px;padding:16px 18px;margin:0 0 22px 0;">
          <p style="margin:0 0 4px 0;font-family:'Cormorant Garamond', Georgia, serif;font-weight:700;font-size:17px;color:#0b2a5a;">
            ${escapeHtml(otherFirstName || "A new member")}
          </p>
          <p style="margin:0;font-family:'Source Serif 4', Georgia, serif;font-style:italic;font-weight:600;font-size:13.5px;color:#5d4307;">
            ${escapeHtml(arch)}
          </p>
        </div>`
            : ""
    }
      <p style="margin:0 0 8px 0;font-family:'DM Sans', system-ui, sans-serif;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#5d4307;">
        The gift
      </p>
      <p style="margin:0 0 22px 0;font-family:'Source Serif 4', Georgia, serif;font-weight:500;font-size:15px;line-height:1.65;color:#0b2a5a;">
        ${escapeHtml(giftLine)}
      </p>
      <p style="margin:0 0 8px 0;font-family:'DM Sans', system-ui, sans-serif;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#5d4307;">
        A concrete first step
      </p>
      <p style="margin:0 0 22px 0;font-family:'Source Serif 4', Georgia, serif;font-weight:500;font-size:15px;line-height:1.65;color:#0b2a5a;">
        ${escapeHtml(firstStep)}
      </p>
      <p style="margin:0 0 8px 0;font-family:'DM Sans', system-ui, sans-serif;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#5d4307;">
        Why now
      </p>
      <p style="margin:0 0 28px 0;font-family:'Source Serif 4', Georgia, serif;font-weight:500;font-size:15px;line-height:1.65;color:#0b2a5a;">
        ${escapeHtml(whyNow)}
      </p>
      <table role="presentation" style="margin:0 auto;border-collapse:separate;border-spacing:12px 0;">
        <tr>
          <td>
            <a href="${escapeHtml(consentUrl)}" style="display:inline-block;background:linear-gradient(135deg, #b8860b, #7a5108);color:#fffdf6;padding:14px 22px;border-radius:999px;font-family:'DM Sans', system-ui, sans-serif;font-size:13px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;box-shadow:0 6px 18px -6px rgba(122, 81, 8, 0.5);">
              Yes, introduce us
            </a>
          </td>
          <td>
            <a href="${escapeHtml(declineUrl)}" style="display:inline-block;background:transparent;color:#0b2a5a;padding:14px 22px;border-radius:999px;border:1px solid rgba(11, 42, 90, 0.30);font-family:'DM Sans', system-ui, sans-serif;font-size:13px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;">
              Not now
            </a>
          </td>
        </tr>
      </table>
      <p style="margin:32px 0 0 0;font-family:'Source Serif 4', Georgia, serif;font-weight:500;font-style:italic;font-size:13.5px;line-height:1.55;color:rgba(11, 42, 90, 0.62);text-align:center;">
        No response, no pressure. If two proposals go quiet, we'll pause and give you space.
      </p>
      <hr style="margin:28px 0;border:0;border-top:0.5px solid rgba(212, 175, 55, 0.30);" />
      <p style="margin:0;font-family:'Source Serif 4', Georgia, serif;font-weight:500;font-style:italic;font-size:13px;line-height:1.55;color:rgba(11, 42, 90, 0.70);">
        — Find Your Top Talent
      </p>
    </div>
  </div>
</body>
</html>`;
}

function renderProposalText(args: EmailArgs): string {
    const {
        recipientFirstName,
        otherFirstName,
        giftLine,
        firstStep,
        whyNow,
        gentleNote,
        consentUrl,
        declineUrl,
    } = args;
    const greeting = recipientFirstName ? `Hi ${recipientFirstName},` : "Hi,";
    return `A match worth a look

${greeting}

${gentleNote ? gentleNote + "\n\n" : ""}${otherFirstName ? otherFirstName + " —" : ""}

THE GIFT
${giftLine}

A CONCRETE FIRST STEP
${firstStep}

WHY NOW
${whyNow}

─────────────────────────

YES, INTRODUCE US:
${consentUrl}

NOT NOW:
${declineUrl}

─────────────────────────

No response, no pressure. If two proposals go quiet, we'll pause and give you space.

— Find Your Top Talent
`;
}

function json(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
}
