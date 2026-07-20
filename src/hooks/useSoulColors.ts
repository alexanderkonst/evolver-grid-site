/**
 * useSoulColors — Day 130 (Sasha 2026-07-20): IDENTITY AS PRESENCE.
 *
 * Derives a personal 3-hue palette for the rail's avatar ring, entirely
 * client-side and deterministically — no AI calls, no new edge function.
 *
 * Priority order:
 *   1. Explicit `soulColors` (from `game_profiles.soul_colors`, generated
 *      by the existing `generate-soul-colors` edge function elsewhere in
 *      the app — see CharacterHub.tsx) — used as-is if present.
 *   2. Otherwise, hash a stable seed string (archetype title, falling
 *      back to user id) into 3 hues, at tasteful saturation/lightness
 *      (S 45–60%, L 55–65%) so the result reads antique, not neon.
 *   3. No seed at all (guest / no snapshot) → `hasSoulColors: false`,
 *      caller keeps the existing gold ring as the default look.
 */

/** Tiny deterministic string hash (djb2 variant) — stable across sessions
 *  for the same seed, no crypto dependency needed. */
function hashString(input: string): number {
    let hash = 5381;
    for (let i = 0; i < input.length; i++) {
        hash = (hash * 33) ^ input.charCodeAt(i);
    }
    return Math.abs(hash);
}

export interface SoulColorsResult {
    /** True when a personal palette (explicit or derived) is available. */
    hasSoulColors: boolean;
    /** 3 CSS color strings (hex or hsl), dominant hue first. */
    colors: [string, string, string] | null;
    /** conic-gradient() value for the ring border, or null (caller falls
     *  back to the default gold ring). */
    ringGradient: string | null;
    /** Dominant hue's color, low-opacity, for the outer glow. */
    glowColor: string | null;
}

const FALLBACK: SoulColorsResult = {
    hasSoulColors: false,
    colors: null,
    ringGradient: null,
    glowColor: null,
};

export function useSoulColors(
    soulColors?: string[] | null,
    seed?: string | null,
): SoulColorsResult {
    // Explicit colors win outright — already art-directed (or at least
    // LLM-picked with the user's archetype in mind).
    if (soulColors && soulColors.length >= 3) {
        const [a, b, c] = soulColors;
        return {
            hasSoulColors: true,
            colors: [a, b, c],
            ringGradient: `conic-gradient(from 0deg, ${a}, ${b}, ${c}, ${a})`,
            glowColor: a,
        };
    }

    if (!seed) return FALLBACK;

    const base = hashString(seed);
    // Three hues spread around the wheel with a little jitter so they
    // don't land perfectly evenly (which reads as generated/mechanical) —
    // ~120° apart ± up to 25°.
    const hue1 = base % 360;
    const hue2 = (hue1 + 120 + (hashString(seed + "b") % 50) - 25 + 360) % 360;
    const hue3 = (hue1 + 240 + (hashString(seed + "c") % 50) - 25 + 360) % 360;
    const sat = 45 + (hashString(seed + "s") % 16); // 45–60%
    const light1 = 55 + (hashString(seed + "l1") % 11); // 55–65%
    const light2 = 55 + (hashString(seed + "l2") % 11);
    const light3 = 55 + (hashString(seed + "l3") % 11);

    const c1 = `hsl(${hue1}, ${sat}%, ${light1}%)`;
    const c2 = `hsl(${hue2}, ${sat}%, ${light2}%)`;
    const c3 = `hsl(${hue3}, ${sat}%, ${light3}%)`;

    return {
        hasSoulColors: true,
        colors: [c1, c2, c3],
        ringGradient: `conic-gradient(from 0deg, ${c1}, ${c2}, ${c3}, ${c1})`,
        glowColor: c1,
    };
}
