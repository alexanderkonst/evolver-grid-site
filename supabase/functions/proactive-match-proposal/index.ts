// proactive-match-proposal
//
// Weekly proactive match-proposal loop. Replaces the send-weekly-matches-digest
// cron. For each eligible user, picks the single best candidate from
// suggest-asset-matches (biased by their prior accept/decline history),
// creates a match_interests row, signs Yes/Not-now consent tokens pointing
// at match-consent, sends a 3-line proposal email in the Aurora register,
// and logs a match_proposals row.
//
// Day 121 (Sasha 2026-07-11): copy overhaul + policy simplification.
//   - Declined pairs get a 3-month cool-off, not a permanent ban. The
//     history window IS the cool-off: we only load 90 days of
//     match_proposals, so declines age out naturally.
//   - No silence-pause. Ignoring proposals has no side effects; the
//     weekly 1-proposal cap is the only frequency guardrail.
//   - Subject + gift line + first step + why-now are LLM-written per
//     pair (concise, concrete, no hedging), with static fallbacks.
//
// Request body (optional): { "userIds": ["..."] } to scope a dry run.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { signConsentToken } from "../_shared/matchConsentToken.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = Deno.env.get("SITE_URL") || "https://findyourtoptalent.com";

// Sender identity. SENDER_NAME is the human-facing brand shown in the
// From line and the email signoff — swap in one place if the brand name
// changes (Day 121: under review — Find Your Top Talent vs an ecosystem
// / matchmaker-persona name).
const SENDER_NAME = "Find Your Top Talent";
const FROM_ADDRESS =
    `${SENDER_NAME} <notifications@notify.findyourtoptalent.com>`;
// Hosted brand mark for the email header (updated with the Jul 10 logo).
const LOGO_URL = `${SITE_URL}/apple-touch-icon.png`;

// Max users processed per invocation. Keeps background wall-clock bounded.
// At current scale (dozens) this never bites; beyond it, add self-chaining.
const MAX_PER_RUN = 120;

// Supabase edge runtime global for post-response background work.
declare const EdgeRuntime:
    | { waitUntil(p: Promise<unknown>): void }
    | undefined;

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

// suggest-asset-matches now returns matchType as a native gift value
// (Migrated 2026-07-13 — see docs/holomaps/collaboration_gift_taxonomy_holomap.md).
// Guard against old/bad rows rather than trusting the string blindly.
const asGift = (v: string | null | undefined): GiftType => {
    const lower = (v || "").toLowerCase();
    return (GIFT_TYPES as string[]).includes(lower)
        ? (lower as GiftType)
        : "co_creation";
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

        // Body options:
        //   { userIds: [...] } — scope the run to specific users (small,
        //                         processed synchronously, returns counts).
        //   { dryRun: true }   — count the eligible pool and return
        //                         immediately WITHOUT calling the LLM or
        //                         sending any email. Safe to run anytime.
        let userIdFilter: string[] | null = null;
        let dryRun = false;
        try {
            const body = await req.json();
            if (Array.isArray(body?.userIds)) {
                userIdFilter = body.userIds.filter(
                    (id: unknown) => typeof id === "string",
                );
            }
            if (body?.dryRun === true) dryRun = true;
        } catch {
            // No body — process all eligible users in the background.
        }

        // ── 1. Find eligible users ──────────────────────────────────
        // Day 121 (Sasha): match regardless of profile completeness. The
        // only hard excludes are an explicit opt-out or a hidden profile.
        // We deliberately DROPPED the `last_zog_snapshot_id IS NOT NULL`
        // requirement that was capping the pool to 1 of ~35 accounts. A
        // too-thin profile self-selects out downstream: suggest-asset-
        // matches returns no candidates → the user is skipped that week,
        // not errored. (opt_in is NOT NULL DEFAULT true, so .eq(true)
        // already includes every existing account; kept for explicit
        // future opt-outs.)
        let query = admin
            .from("game_profiles")
            .select(
                "id, user_id, first_name, last_zog_snapshot_id, visibility, match_digest_opt_in",
            )
            .eq("match_digest_opt_in", true)
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
        for (const p of profiles) {
            if (!p.user_id) continue;
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
            });
        }

        // ── dryRun: report the pool, send nothing ───────────────────
        if (dryRun) {
            return json({
                dryRun: true,
                eligible: eligible.length,
                totalProfiles: profiles.length,
                capPerRun: MAX_PER_RUN,
                wouldCapAt: Math.min(eligible.length, MAX_PER_RUN),
                sampleEmails: eligible.slice(0, 5).map((e) => e.email),
            });
        }

        // Cap a single run so background work stays under the worker's
        // wall-clock limit. Beyond this we'll need self-chaining (future).
        const batch = eligible.slice(0, MAX_PER_RUN);
        const capped = eligible.length > MAX_PER_RUN;

        const deps = {
            admin,
            supabaseUrl,
            serviceKey,
            resendKey: RESEND_API_KEY,
            matchConsentSecret: MATCH_CONSENT_SECRET,
        };

        // ── Targeted run (userIds): synchronous, returns counts ─────
        // Small by construction, safe under the 150s idle limit, and the
        // caller wants to see the result (testing a specific pair).
        if (userIdFilter && userIdFilter.length > 0) {
            const counts = await runProcessing(batch, deps);
            return json({
                ...counts,
                eligible: eligible.length,
                totalProfiles: profiles.length,
                capped,
            });
        }

        // ── Full-cohort run (cron / no body): background ────────────
        // The whole cohort's LLM calls exceed the 150s idle limit, and the
        // cron never reads the body. Return immediately; process after.
        const work = runProcessing(batch, deps).then((c) => {
            console.log("[proactive-match] background run done", {
                ...c,
                capped,
            });
        }).catch((e) => {
            console.error("[proactive-match] background run threw", e);
        });
        if (typeof EdgeRuntime !== "undefined" && EdgeRuntime?.waitUntil) {
            EdgeRuntime.waitUntil(work);
        } else {
            // Local/other runtime without waitUntil: don't block forever,
            // but keep the reference so the promise isn't GC'd.
            void work;
        }
        return json({
            started: true,
            eligible: eligible.length,
            totalProfiles: profiles.length,
            processing: batch.length,
            capped,
        });
    } catch (error) {
        console.error("[proactive-match] unhandled error", error);
        return json(
            { error: error instanceof Error ? error.message : "Unknown error" },
            500,
        );
    }
});

// Run the proposal loop over a batch, returning counts. Shared by the
// synchronous (userIds) and background (full-cohort) paths.
async function runProcessing(
    batch: Profile[],
    deps: {
        admin: SupabaseClient;
        supabaseUrl: string;
        serviceKey: string;
        resendKey: string;
        matchConsentSecret: string;
    },
): Promise<{
    sent: number;
    skipped: number;
    failed: number;
    failures: { userId: string; reason: string }[];
}> {
    let sent = 0;
    let skipped = 0;
    let failed = 0;
    const failures: { userId: string; reason: string }[] = [];

    for (const profile of batch) {
        try {
            const result = await processUser({ ...deps, profile });
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
    return { sent, skipped, failed, failures };
}

async function processUser(args: {
    admin: SupabaseClient;
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

    // ── Load 90-day proposal history ────────────────────────────
    // The 90-day window doubles as the decline cool-off: a declined
    // pair simply ages out of the exclusion set after ~3 months.
    const cutoffIso = new Date(now - NINETY_DAYS_MS).toISOString();
    const { data: historyRows } = await admin
        .from("match_proposals")
        .select("proposed_user_id, gift_type, proposed_at, response, responded_at")
        .eq("user_id", profile.user_id)
        .gte("proposed_at", cutoffIso)
        .order("proposed_at", { ascending: false });
    const history: ProposalRow[] = (historyRows ?? []) as ProposalRow[];

    // ── Load already-seeded match_interests pairs ───────────────
    // match_interests has a permanent unique (from_user_id, to_user_id)
    // constraint. Rows land here from BOTH paths: this proactive loop
    // AND the user clicking "I'd like to meet" on the matches page.
    // Any candidate we already have a row with would collide on insert,
    // so exclude them from the pool up front. (This is broader than the
    // 30-day match_proposals window, which is why the page-seeded and
    // 30-day-old pairs were slipping through and colliding.)
    const alreadySeeded = new Set<string>();
    const { data: existingInterests } = await admin
        .from("match_interests")
        .select("to_user_id")
        .eq("from_user_id", profile.user_id);
    for (const row of (existingInterests ?? []) as Array<{ to_user_id: string }>) {
        if (row.to_user_id) alreadySeeded.add(row.to_user_id);
    }

    // Build exclusion sets. Declined = 3-month cool-off (the history
    // window above), not a permanent ban.
    const declinedCoolOff = new Set<string>();
    const recentlyProposed = new Set<string>();
    const acceptedGifts = new Map<string, number>();
    const declinedGifts = new Map<string, number>();
    for (const row of history) {
        if (row.response === "declined") {
            declinedCoolOff.add(row.proposed_user_id);
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
                m.userId &&
                m.userId !== profile.user_id &&
                !declinedCoolOff.has(m.userId) &&
                !recentlyProposed.has(m.userId) &&
                !alreadySeeded.has(m.userId),
        )
        .map((m) => {
            const gift = asGift(m.matchType);
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
        // A duplicate here means a match_interests row was created for
        // this pair between our exclusion query and this insert (race,
        // or a path we don't model). Skip this user gracefully rather
        // than failing the whole run.
        if (miErr?.code === "23505") {
            console.warn(
                "[proactive-match] pair already seeded, skipping",
                profile.user_id,
                best.match.userId,
            );
            return "skipped";
        }
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

    // ── Compose the proposal copy (LLM with static fallbacks) ───
    const copy = await generateProposalCopy({
        gift: best.gift,
        recipientFirstName: profile.first_name || "",
        otherFirstName: best.match.firstName || "",
        otherArchetype: best.match.archetype || "",
        rawFirstStep: (
            best.match.suggestedAction ||
            best.match.proposals?.[0]?.proposal ||
            best.match.collaborationProposal ||
            ""
        ).trim(),
        rawWhyNow: (
            best.match.evolutionLine ||
            best.match.proposals?.[0]?.evolutionLine ||
            best.match.alignment ||
            ""
        ).trim(),
        rawAlignment: (best.match.alignment || "").trim(),
        rawComplementarity: (best.match.complementarity || "").trim(),
        rawCollaboration: (best.match.collaborationProposal || "").trim(),
    });

    // ── Send email ──────────────────────────────────────────────
    const html = renderProposalHtml({
        recipientFirstName: profile.first_name || "",
        otherFirstName: best.match.firstName || "",
        otherArchetype: best.match.archetype || "",
        giftLine: copy.gift,
        firstStep: copy.firstStep,
        whyNow: copy.whyNow,
        consentUrl,
        declineUrl,
    });
    const text = renderProposalText({
        recipientFirstName: profile.first_name || "",
        otherFirstName: best.match.firstName || "",
        otherArchetype: best.match.archetype || "",
        giftLine: copy.gift,
        firstStep: copy.firstStep,
        whyNow: copy.whyNow,
        consentUrl,
        declineUrl,
    });
    const subject = copy.subject;

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

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const COPY_MODEL_ID = "google/gemini-2.5-flash-lite";

function sanitizeDashes(s: string): string {
    return s.replace(/\s*—\s*/g, ", ").replace(/\s*–\s*/g, ", ");
}

function truncateAtWord(s: string, max: number): string {
    if (s.length <= max) return s;
    const cut = s.slice(0, max);
    const lastSpace = cut.lastIndexOf(" ");
    return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trim();
}

function staticFallback(args: {
    gift: GiftType;
    otherFirstName: string;
    rawFirstStep: string;
    rawWhyNow: string;
}): { subject: string; gift: string; firstStep: string; whyNow: string } {
    const { gift, otherFirstName, rawFirstStep, rawWhyNow } = args;
    const B = otherFirstName || "Someone new";

    const subjects: Record<GiftType, string> = {
        mirror: `${B} sees what you can't from inside`,
        compass: `${B} may know your next direction`,
        door: `${B} can open a door you need`,
        co_creation: `${B} could build with you`,
        motivation: `${B} might be your missing momentum`,
    };

    const giftLines: Record<GiftType, string> = {
        mirror:
            `${B} works close enough to your edge to show you what you can't see from inside.`,
        compass:
            `${B} carries a perspective that could point your next move.`,
        door:
            `${B} has access to rooms and audiences that matter for what you're building.`,
        co_creation:
            `${B}'s gifts compose with yours. Together you could build what neither of you would alone.`,
        motivation:
            `${B} brings the kind of momentum and belief that makes hard weeks move.`,
    };

    const firstStep = rawFirstStep
        ? sanitizeDashes(rawFirstStep)
        : "A 30-minute call. Share your current focus and see what forms.";
    const whyNow = rawWhyNow
        ? sanitizeDashes(rawWhyNow)
        : "You're both in motion right now, and timing matters.";

    return {
        subject: sanitizeDashes(subjects[gift]),
        gift: sanitizeDashes(giftLines[gift]),
        firstStep,
        whyNow,
    };
}

async function generateProposalCopy(args: {
    gift: GiftType;
    recipientFirstName: string;
    otherFirstName: string;
    otherArchetype: string;
    rawFirstStep: string;
    rawWhyNow: string;
    rawAlignment: string;
    rawComplementarity: string;
    rawCollaboration: string;
}): Promise<{ subject: string; gift: string; firstStep: string; whyNow: string }> {
    const {
        gift,
        recipientFirstName,
        otherFirstName,
        otherArchetype,
        rawFirstStep,
        rawWhyNow,
        rawAlignment,
        rawComplementarity,
        rawCollaboration,
    } = args;
    const A = recipientFirstName || "there";
    const B = otherFirstName || "someone new";
    const fallback = staticFallback({ gift, otherFirstName, rawFirstStep, rawWhyNow });

    if (!LOVABLE_API_KEY) return fallback;

    // Signal check: if the matching engine gave us no concrete grounding,
    // the LLM can only invent generic filler ("this person can help you
    // build something new"). Fall back to the gift-specific static copy,
    // which is at least concrete about the KIND of value, instead of
    // letting the model hallucinate empty specifics.
    const grounding = [
        otherArchetype,
        rawAlignment,
        rawComplementarity,
        rawCollaboration,
        rawFirstStep,
        rawWhyNow,
    ].filter((s) => s && s.length > 8).join(" ").trim();
    if (grounding.length < 24) return fallback;

    try {
        const prompt =
            `You are a thoughtful human matchmaker writing a very short introduction proposal email from the platform to ${A} about a DIFFERENT person, ${B}.
GIFT TYPE: ${gift} (mirror = B can reveal A's blind spot or give exact words; compass = B carries orientation or a next direction; door = B has access to rooms, networks, audiences A needs; co_creation = B could build something with A; motivation = B brings momentum and belief).
MATERIAL from the matching engine (use the specifics; do not restate them generically):
- ${B}'s archetype: ${otherArchetype || "(unknown)"}
- Why they align: ${rawAlignment || "(none given)"}
- How they complement each other: ${rawComplementarity || "(none given)"}
- A collaboration the engine sketched: ${rawCollaboration || "(none given)"}
- Suggested first step: ${rawFirstStep || "(none given)"}
- Why now: ${rawWhyNow || "(none given)"}
Return ONLY JSON: {"subject": "...", "gift": "...", "firstStep": "...", "whyNow": "..."}.
Rules: subject = max 55 characters, contains ${B}'s first name, states ONE concrete benefit drawn from the material, no colon-cleverness, no emoji. gift = ONE sentence, max 22 words, second person to ${A}, names a SPECIFIC thing ${B} can do for them drawn from the material (not "build something new together", not "a co-branded program"). firstStep = ONE sentence, a small sized action. whyNow = ONE sentence grounded in the specific material above. Plain human words. Every sentence must reference something concrete from the material. If a field is "(none given)", infer from the archetype, never pad with generic phrases like "this person can help you" or "shared intellectual property". No em-dashes. No exclamation marks. No hype adjectives. No hedging.
HARD BANS (these ruin the email):
- The subject must name a CONCRETE domain or thing, never an abstract noun. Ban the words "potential", "latent", "opportunities", "synergy", "value-add", "growth" in the subject. "Nia can spot overlooked value in your product line" is good; "Nia can help you name latent potential" is bad.
- Do NOT reuse the same key noun in more than one of the four fields. If "framework" appears once, it cannot appear again anywhere.
- Ban the generic container words "framework", "cohort", "workshop", "series", "program", "initiative" UNLESS that exact word appears in the MATERIAL above. Name the real thing instead (a methodology, a course, a joint offer, a shared client, a co-written piece).`;

        const resp = await fetch(
            "https://ai.gateway.lovable.dev/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${LOVABLE_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: COPY_MODEL_ID,
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.6,
                }),
            },
        );
        if (!resp.ok) return fallback;

        const r = await resp.json();
        let content = String(r.choices?.[0]?.message?.content || "").trim();
        content = content.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return fallback;
        const parsed = JSON.parse(jsonMatch[0]);

        let subject = String(parsed.subject || "").trim();
        let giftLine = String(parsed.gift || "").trim();
        let firstStep = String(parsed.firstStep || "").trim();
        let whyNow = String(parsed.whyNow || "").trim();

        if (!subject || !giftLine || !firstStep || !whyNow) return fallback;

        subject = sanitizeDashes(subject);
        giftLine = sanitizeDashes(giftLine);
        firstStep = sanitizeDashes(firstStep);
        whyNow = sanitizeDashes(whyNow);

        subject = truncateAtWord(subject, 70);

        if (!subject || !giftLine || !firstStep || !whyNow) return fallback;

        return { subject, gift: giftLine, firstStep, whyNow };
    } catch (err) {
        console.warn("[proactive-match] generateProposalCopy failed", err);
        return fallback;
    }
}

interface EmailArgs {
    recipientFirstName: string;
    otherFirstName: string;
    otherArchetype?: string;
    giftLine: string;
    firstStep: string;
    whyNow: string;
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
        consentUrl,
        declineUrl,
    } = args;
    const greeting = recipientFirstName ? `Hi ${escapeHtml(recipientFirstName)},` : "Hi,";
    const arch = (otherArchetype || "").replace(/[✦★☆✧⬥◇◆⟐]/g, "").trim();
    const nameB = escapeHtml(otherFirstName || "someone new");
    // Headline is just the person; the gold eyebrow above carries the
    // "your introduction this week" framing, so no repetition here.
    const introLine = arch
        ? `<strong>${nameB}</strong>, ${escapeHtml(arch)}.`
        : `<strong>${nameB}</strong>.`;
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>An introduction</title>
</head>
<body style="margin:0;padding:0;background:#f5f1e8;font-family:'Source Serif 4', Georgia, serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
    <!-- Brand header -->
    <div style="text-align:center;margin:0 0 24px 0;">
      <img src="${LOGO_URL}" width="46" height="46" alt="${escapeHtml(SENDER_NAME)}" style="display:inline-block;border-radius:10px;" />
    </div>
    <div style="background:#fffdf7;border:1px solid rgba(212, 175, 55, 0.45);border-radius:18px;padding:38px 32px;box-shadow:0 14px 40px -20px rgba(10, 22, 40, 0.22);">
      <p style="margin:0 0 18px 0;font-family:'Source Serif 4', Georgia, serif;font-weight:600;font-size:16px;line-height:1.6;color:#0b2a5a;">
        ${greeting}
      </p>
      <p style="margin:0 0 20px 0;font-family:'DM Sans', system-ui, sans-serif;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#b8860b;">
        Your introduction this week
      </p>
      <!-- Hero: the gift line, with a gold accent rule -->
      <div style="border-left:3px solid #d4af37;padding-left:18px;margin:0 0 26px 0;">
        <p style="margin:0 0 6px 0;font-family:'Cormorant Garamond', Georgia, serif;font-weight:700;font-size:22px;line-height:1.25;color:#0b2a5a;">
          ${introLine}
        </p>
        <p style="margin:0;font-family:'Source Serif 4', Georgia, serif;font-weight:600;font-size:16.5px;line-height:1.55;color:#0b2a5a;">
          ${escapeHtml(giftLine)}
        </p>
      </div>
      <p style="margin:0 0 5px 0;font-family:'DM Sans', system-ui, sans-serif;font-size:10.5px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#b8860b;">
        First step
      </p>
      <p style="margin:0 0 20px 0;font-family:'Source Serif 4', Georgia, serif;font-weight:500;font-size:15px;line-height:1.6;color:#243b63;">
        ${escapeHtml(firstStep)}
      </p>
      <p style="margin:0 0 5px 0;font-family:'DM Sans', system-ui, sans-serif;font-size:10.5px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#b8860b;">
        Why now
      </p>
      <p style="margin:0 0 30px 0;font-family:'Source Serif 4', Georgia, serif;font-weight:500;font-size:15px;line-height:1.6;color:#243b63;">
        ${escapeHtml(whyNow)}
      </p>
      <table role="presentation" style="margin:0 auto;border-collapse:separate;border-spacing:10px 0;">
        <tr>
          <td>
            <a href="${escapeHtml(consentUrl)}" style="display:inline-block;background:linear-gradient(135deg, #c79a2e, #7a5108);color:#fffdf6;padding:15px 26px;border-radius:999px;font-family:'DM Sans', system-ui, sans-serif;font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;box-shadow:0 8px 20px -6px rgba(122, 81, 8, 0.55);">
              Yes, introduce us
            </a>
          </td>
          <td>
            <a href="${escapeHtml(declineUrl)}" style="display:inline-block;background:transparent;color:#5a6b8a;padding:15px 22px;border-radius:999px;border:1px solid rgba(36, 59, 99, 0.22);font-family:'DM Sans', system-ui, sans-serif;font-size:13px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;">
              Not this one
            </a>
          </td>
        </tr>
      </table>
    </div>
    <!-- Footer, outside the card -->
    <p style="margin:22px 0 0 0;font-family:'Source Serif 4', Georgia, serif;font-weight:500;font-size:13px;line-height:1.55;color:rgba(11, 42, 90, 0.55);text-align:center;">
      One introduction a week. Yours to take or leave.
    </p>
    <p style="margin:8px 0 0 0;font-family:'DM Sans', system-ui, sans-serif;font-size:12px;font-weight:600;letter-spacing:0.06em;color:rgba(11, 42, 90, 0.7);text-align:center;">
      ${escapeHtml(SENDER_NAME)}
    </p>
  </div>
</body>
</html>`;
}

function renderProposalText(args: EmailArgs): string {
    const {
        recipientFirstName,
        otherFirstName,
        otherArchetype,
        giftLine,
        firstStep,
        whyNow,
        consentUrl,
        declineUrl,
    } = args;
    const greeting = recipientFirstName ? `Hi ${recipientFirstName},` : "Hi,";
    const arch = (otherArchetype || "").replace(/[✦★☆✧⬥◇◆⟐]/g, "").trim();
    const nameB = otherFirstName || "someone new";
    const introLine = arch
        ? `One introduction this week: ${nameB}, ${arch}.`
        : `One introduction this week: ${nameB}.`;
    return `${greeting}

${introLine}

${giftLine}

FIRST STEP
${firstStep}

WHY NOW
${whyNow}

─────────────────────────

YES, INTRODUCE US:
${consentUrl}

NOT THIS ONE:
${declineUrl}

─────────────────────────

One introduction a week. Yours to take or leave.

${SENDER_NAME}
`;
}

function json(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
}
