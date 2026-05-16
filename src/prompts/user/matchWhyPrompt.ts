/**
 * MATCH_WHY_PROMPT — documents the prompt used to generate the
 * "why you should meet B" text shown on each match card and embedded
 * in the mutual-intro email.
 *
 * Day 66 (Sasha 2026-05-16): in the current implementation the
 * why-text is produced by `supabase/functions/suggest-asset-matches/`
 * (Gemini 2.5 Flash). That function returns
 *   { collaboration_proposal, alignment, complementarity, friction,
 *     suggested_action }
 * which collectively ARE the why-text — composed into one paragraph
 * on the card. This file centralizes the prompt design so when we
 * iterate (A/B test why-text variants per matchmaking_strategy §8
 * "Engine learning"), there's one canonical source to edit.
 *
 * For v1 we are NOT spinning up a separate edge function for why-text
 * generation — we use the existing `suggest-asset-matches` output.
 * When the engine starts tuning AI-why per intro-success rate, we'll
 * either (a) parameterize this prompt and re-deploy `suggest-asset-
 * matches`, or (b) split out a dedicated `generate-match-why` function
 * driven by this prompt template.
 *
 * The "why" describes the MATCH (what could come of A+B together),
 * not the people in profile-reveal terms. Privacy boundary: the AI
 * gets read access to both profiles but is instructed to describe
 * connection-shape, not biography.
 */
export const MATCH_WHY_PROMPT = `You are looking at two user profiles. Your job is to describe why these two should meet — what could come of their collaboration together — in one tight paragraph (2-4 sentences).

You will receive:
- USER_A profile (Top Talent applications, mission, assets, business artifacts)
- USER_B profile (same shape)
- COMPOUND_TYPE — which primitive compound matched them
  - "co-founder" — mission similarity + role complementarity
  - "guild" — mission + role similarity (peer learning)
  - "asset-LEGO" — asset complementarity (one's community + another's product, etc.)
  - "peer-enrichment" — role similarity (gift exchange)
- INTENT — what USER_A asked the engine to find: "collaboration" | "peer-learning" | "gift-exchange"

Output structure (one paragraph, no headers, no bullets):
1. The shape of the connection — what kind of joint thing could exist between them.
2. The specific assets/talents that compose: what A brings, what B brings, what they make together.
3. (Optional, one line) the friction or thing-to-watch — if any. Don't invent friction; only name it if it's structurally real (e.g., their missions point in directions that don't naturally combine).

Tone: Direct + Sacred (per the brandbook voice matrix). No platitudes ("you'd be a great match" — instead, NAME the match-shape). No flattery toward either user. Speak about the CONNECTION as a thing that could exist, not about either user as a thing.

Length: 2-4 sentences. Tight. Do not pad.

End your response with EXACTLY one line in this format, on its own line:

connection_hook: <one phrase, ≤8 words, suitable for a compact card surface>

Example output:

> Together you could build a sovereignty container for solo creators — Karime's community of 400 working artists meets your finished methodology for productizing craft. She brings the audience that already trusts her on questions of practice and pricing; you bring the operating system that turns each artist's gift into a sellable container. The friction-to-watch: she defaults to one-on-one delivery and you default to high-leverage tooling; you'd need to align on which mode each cohort runs in.
>
> connection_hook: methodology meets a tribe already asking

Now write the why-text + connection_hook for the profiles below.`;

/**
 * Connection-hook extractor — finds the `connection_hook:` line in
 * the AI's output (tolerant of markdown emphasis and case
 * variations). Returns the hook string, or null if not found.
 *
 * Mirrors the pattern in MissionDiscoveryLanding's synthesis
 * extractor. When the prompt is followed strictly, the hook is
 * always on its own line and easy to capture.
 */
export const extractConnectionHook = (raw: string): string | null => {
    if (!raw) return null;
    const trimmed = raw.trim();
    const re = /(?:\*{0,2})\s*connection[\s_-]*hook\s*[:\-—]\s*(?:\*{0,2})\s*(.+?)\s*(?:\*{0,2})\s*$/gim;
    re.lastIndex = 0;
    const matches: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(trimmed)) !== null) {
        if (m[1]) matches.push(m[1]);
    }
    if (matches.length > 0) {
        return matches[matches.length - 1].trim().replace(/^[\s>*]+|[\s>*]+$/g, "");
    }
    return null;
};

/**
 * Strip the `connection_hook:` line from the AI's response, leaving
 * just the why-text paragraph. Used when the card surface wants only
 * the paragraph (the hook renders separately).
 */
export const stripConnectionHook = (raw: string): string => {
    if (!raw) return "";
    return raw
        .trim()
        .replace(
            /\n?\s*(?:\*{0,2})\s*connection[\s_-]*hook\s*[:\-—].+?$/gim,
            "",
        )
        .trim();
};
