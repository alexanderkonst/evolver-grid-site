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
 * Codified in:
 *   - docs/03-playbooks/unique_business_playbook.md (Principle 15)
 *   - docs/01-vision/phase_shift_technology_library.md (Domain 81)
 *
 * ─── ARCHITECTURE — master matrix vs per-founder matrix ──────────
 *
 * MASTER_MATRIX (this file) is Sasha's canonical, master-holon
 * Specificity Matrix — the seed example every other founder sees if
 * they have not yet generated their own.
 *
 * Per-founder matrices are generated as the UBB artifact
 * `specificity_matrix` (added to ArtifactKey on Day 51) and stored
 * in `user_business_artifacts`. At runtime, the funnel resolves the
 * active matrix in this priority order:
 *
 *   1. Explicit `override` argument passed to `resonanceMessage()`
 *      (the highest-priority escape hatch, used by tests and previews).
 *   2. The `ResonanceMatrixContext` value, set by `<ResonanceMatrixProvider>`.
 *      Future: a small loader hook reads the founder's locked
 *      `specificity_matrix` artifact from Supabase and provides it.
 *   3. MASTER_MATRIX — Sasha's canonical, used as the universal
 *      fallback for anonymous visitors and founders pre-generation.
 */

import { createContext, createElement, useContext, type ReactNode } from "react";

export type ResonanceStep =
    | "appleseed"
    | "excalibur"
    | "icp"
    | "pain"
    | "tp"
    | "landing";

export type ResonanceTier = "resonant" | "partial" | "off";

export type ResonanceMatrix = Record<ResonanceStep, Record<ResonanceTier, string>>;

export const MASTER_MATRIX: ResonanceMatrix = {
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

/**
 * Pure resolver. Used outside React (telemetry, tests, server contexts)
 * and as the engine inside the hook. Pass a per-founder matrix as the
 * third argument to override the master.
 */
export function resonanceMessage(
    step: ResonanceStep,
    rating: number,
    override?: ResonanceMatrix | null,
): string {
    const matrix = override ?? MASTER_MATRIX;
    const stage = matrix[step] ?? MASTER_MATRIX[step];
    return stage[tierFor(rating)] ?? MASTER_MATRIX[step][tierFor(rating)];
}

/**
 * The single question every resonance moment is asking, beneath the words.
 * Kept here so docs and UI can quote it from one source.
 */
export const SPECIFICITY_PROMPT =
    "How specific to what you know about you is this articulation?";

// ─── React layer — provider + hook ──────────────────────────────

const ResonanceMatrixContext = createContext<ResonanceMatrix | null>(null);

/**
 * Wraps any subtree that should use a per-founder matrix instead of the
 * master. Pass `null` (or omit value) to fall through to the master.
 *
 * Future wiring (post-Lovable migration of `user_business_artifacts`):
 *   - A small `useFounderResonanceMatrix(profileId)` hook reads the
 *     locked `specificity_matrix` artifact from Supabase, parses it
 *     into a `ResonanceMatrix` shape, and feeds it into this provider.
 *   - The provider can sit inside `GameShellV2` so every authenticated
 *     view inside the shell uses the founder's voice automatically.
 *   - Anonymous visitors (no provider above) keep using MASTER_MATRIX.
 */
export function ResonanceMatrixProvider({
    matrix,
    children,
}: {
    matrix: ResonanceMatrix | null;
    children: ReactNode;
}) {
    return createElement(
        ResonanceMatrixContext.Provider,
        { value: matrix },
        children,
    );
}

/**
 * The canonical hook for any in-funnel reveal. Reads the active matrix
 * from context (per-founder) and falls back to MASTER_MATRIX. Returns
 * the message to render plus the resolved tier (useful for telemetry
 * and styling).
 */
export function useResonanceMessage(step: ResonanceStep, rating: number) {
    const founderMatrix = useContext(ResonanceMatrixContext);
    return {
        message: resonanceMessage(step, rating, founderMatrix),
        tier: tierFor(rating),
    };
}
