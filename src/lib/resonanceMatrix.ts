/**
 * Resonance Matrix v2 — the "Specificity Loop" protocol.
 *
 * At every reveal in the funnel, the user rates 1-10 how specific to
 * themselves the AI articulation lands. The response we show back is
 * NOT a thank-you. It is an identity-revelation question in the
 * frequency of the macro-bridge ("What if your shining this top
 * talent bright IS your business?").
 *
 * Three rating tiers per step:
 *   - resonant (8-10): the mirror lands → name it as already true
 *   - partial  (5-7):  the precision gap is the work → invite refinement
 *   - off      (1-4):  this isn't them → invite the truer signal
 *
 * Codified in docs/03-playbooks/unique_business_playbook.md
 * (Principle 15 — The Specificity Loop).
 */

export type ResonanceStep =
    | "appleseed"
    | "excalibur"
    | "icp"
    | "pain"
    | "tp"
    | "landing";

export type ResonanceTier = "resonant" | "partial" | "off";

const MATRIX: Record<ResonanceStep, Record<ResonanceTier, string>> = {
    appleseed: {
        resonant:
            "What if this voice has been yours all along?",
        partial:
            "What if the missing word is the one you've been quietly afraid to claim?",
        off:
            "What if the mirror went too quiet — and the truer name is sharper than this?",
    },
    excalibur: {
        resonant:
            "What if this offer IS the way your gift wants to be paid?",
        partial:
            "What if the form is right but the price is still hiding?",
        off:
            "What if your gift is asking for a different shape than this one?",
    },
    icp: {
        resonant:
            "What if these ARE the people you've been quietly built for?",
        partial:
            "What if the felt gap IS the precision your real client needs?",
        off:
            "What if the friction IS the signal — this isn't them, and you already know it?",
    },
    pain: {
        resonant:
            "What if naming this pain IS half the medicine?",
        partial:
            "What if the layer underneath this IS the one they actually feel?",
        off:
            "What if pain that doesn't ring isn't theirs — and the real one is closer than this?",
    },
    tp: {
        resonant:
            "What if this promise IS the door they've been walking past?",
        partial:
            "What if a sharper verb IS the one thing between them and yes?",
        off:
            "What if the promise that doesn't pull you IS the one that won't pull them either?",
    },
    landing: {
        resonant:
            "What if these words ARE the front door of your venture?",
        partial:
            "What if the missing edge IS your last bit of held-back honesty?",
        off:
            "What if landings don't fail — promises do — and we just heard the signal?",
    },
};

export function tierFor(rating: number): ResonanceTier {
    if (rating >= 8) return "resonant";
    if (rating >= 5) return "partial";
    return "off";
}

export function resonanceMessage(step: ResonanceStep, rating: number): string {
    return MATRIX[step][tierFor(rating)];
}

/**
 * The single question every resonance moment is asking, beneath the words.
 * Kept here so docs and UI can quote it from one source.
 */
export const SPECIFICITY_PROMPT =
    "How specific to what you know about you is this articulation?";
