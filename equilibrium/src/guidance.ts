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

// ─── HELPERS ───────────────────────────────────────

/**
 * Check if current time is within the user's work window.
 */
function isInWorkWindow(wakeTime: string, sleepTime: string): boolean {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [wH, wM] = wakeTime.split(':').map(Number);
    const [sH, sM] = sleepTime.split(':').map(Number);
    const wakeMinutes = wH * 60 + wM;
    const sleepMinutes = sH * 60 + sM;

    if (sleepMinutes > wakeMinutes) {
        return currentMinutes >= wakeMinutes && currentMinutes < sleepMinutes;
    }
    // Overnight window (e.g., wake 22:00, sleep 06:00)
    return currentMinutes >= wakeMinutes || currentMinutes < sleepMinutes;
}

// ─── GUIDANCE MAP ──────────────────────────────────

interface GuidanceRule {
    condition: (cycles: AllCycles, wakeTime: string, sleepTime: string) => boolean;
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
        message: 'Breathe in. Set your intention.',
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

    // ── AMBIENT: OUTSIDE WORK WINDOW ───────────────
    {
        condition: (_c, wake, sleep) => !isInWorkWindow(wake, sleep),
        message: (c) => {
            const day = c.week.planetaryDay;
            return `${day.emoji} Rest time · ${day.energy} will be here tomorrow`;
        },
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

export function getGuidance(
    cycles: AllCycles,
    wakeTime: string = '07:00',
    sleepTime: string = '23:00'
): Guidance {
    for (const rule of RULES) {
        if (rule.condition(cycles, wakeTime, sleepTime)) {
            const message = typeof rule.message === 'function' ? rule.message(cycles) : rule.message;
            return { message, category: rule.category };
        }
    }
    return { message: 'Breathe. You are here.', category: 'be' };
}
