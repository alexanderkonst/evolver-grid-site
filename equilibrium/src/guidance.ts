/**
 * Equilibrium — Actionable Guidance
 * 
 * The clock is its own manual.
 * 
 * DESIGN PRINCIPLE:
 * - Ambient mode = OBSERVE. Describe energy, never command.
 * - Sprint mode  = GUIDE. User opted in, so specific advice is welcome.
 * 
 * Maps planetary day + planetary hour + sprint state → one sentence.
 */

import type { AllCycles } from './cycles';

// ─── GUIDANCE MAP ──────────────────────────────────

interface GuidanceRule {
    condition: (cycles: AllCycles) => boolean;
    message: string | ((cycles: AllCycles) => string);
    category: 'do' | 'be' | 'rest';
}

/**
 * Rules are evaluated top-to-bottom. First match wins.
 * Sprint-active rules take priority over ambient energy rules.
 */
const RULES: GuidanceRule[] = [
    // ── SPRINT ACTIVE: PHASE-SPECIFIC ──────────────
    // User opted in — imperative voice is OK.
    {
        condition: (c) => c.sprint.active && c.sprint.pulse.phase === 'entry' && c.sprint.pulse.pulseNumber === 1,
        message: 'Set your intention. What is the ONE thing this sprint?',
        category: 'be',
    },
    {
        condition: (c) => c.sprint.active && c.sprint.pulse.phase === 'entry',
        message: 'Breathe. Arrive. Settle into this pulse.',
        category: 'be',
    },
    {
        condition: (c) => c.sprint.active && c.sprint.pulse.phase === 'focus' && c.sprint.pulse.phaseElapsed < 2,
        message: 'Focus phase begun. Protect this time.',
        category: 'do',
    },
    {
        condition: (c) => c.sprint.active && c.sprint.pulse.phase === 'focus',
        message: 'Deep work. Stay with it.',
        category: 'do',
    },
    {
        condition: (c) => c.sprint.active && c.sprint.pulse.phase === 'exit' && c.sprint.pulse.pulseNumber < 4,
        message: 'Capture what emerged. Brief pause, then next pulse.',
        category: 'rest',
    },
    {
        condition: (c) => c.sprint.active && c.sprint.pulse.phase === 'exit' && c.sprint.pulse.pulseNumber === 4,
        message: '96 minutes complete. Walk. Hydrate. Let it integrate.',
        category: 'rest',
    },

    // ── AMBIENT: ENERGY OBSERVATION ────────────────
    // No imperatives. Describe what's available, let the user decide.
    {
        condition: () => true,
        message: (c) => {
            const day = c.week.planetaryDay;
            const hour = c.week.planetaryHour;
            // Combine day energy with hour energy into one observational sentence
            if (day.planet === hour.planet) {
                // Same planet rules both — amplified energy
                return `${day.emoji} ${day.planet} day & hour — ${day.energy.toLowerCase()} amplified`;
            }
            return `${hour.emoji} ${hour.energy} flowing through ${day.emoji} ${day.energy}`;
        },
        category: 'be',
    },
];

// ─── PUBLIC API ────────────────────────────────────

export interface Guidance {
    message: string;
    category: 'do' | 'be' | 'rest';
}

export function getGuidance(cycles: AllCycles): Guidance {
    for (const rule of RULES) {
        if (rule.condition(cycles)) {
            const message = typeof rule.message === 'function' ? rule.message(cycles) : rule.message;
            return { message, category: rule.category };
        }
    }
    return { message: 'Breathe. You are here.', category: 'be' };
}
