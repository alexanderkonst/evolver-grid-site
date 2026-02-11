/**
 * Equilibrium - The One Insight
 * 
 * The entire holonic clock synthesizes down to ONE LINE of guidance.
 * Not a mood. Not a fortune cookie. A precise reading of where 
 * you are in the fractal of time - and what that means for your next move.
 * 
 * ARCHITECTURE:
 * Every cycle (day, week, month, moon, year) votes on a holonic phase.
 * The synthesis finds the dominant phase and its coherence level.
 * Then it produces a single sentence that weaves:
 *   1. The PLANETARY energy (what planet rules this moment)
 *   2. The HOLONIC phase (what the dominant action is)
 *   3. The MOON energy (what the emotional field supports)
 *   4. The COHERENCE (how aligned the cycles are)
 * 
 * When cycles agree - the insight is crisp and directional.
 * When cycles disagree - the insight acknowledges the tension.
 * 
 * MODES:
 * - AMBIENT: The user is just looking at the clock. The insight reads
 *   the field and describes the opportunity. Observational, never commanding.
 * - SPRINT: The user opted in. The insight is specific to their current  
 *   sprint pulse/phase and gets more directive.
 */

import type { AllCycles, HolonicPhase } from './cycles';
import { synthesizeCycles } from './cycles';

// --- HELPERS ---

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
    return currentMinutes >= wakeMinutes || currentMinutes < sleepMinutes;
}

// --- INSIGHT TEMPLATES ---

/**
 * The holonic phase describes WHAT to do.
 * Templates are keyed by [holonicPhase][coherenceLevel].
 * Variables: {planet} = today's planet energy, {moon} = moon energy
 */
const AMBIENT_INSIGHTS: Record<HolonicPhase, Record<string, string[]>> = {
    will: {
        strong: [
            'All cycles point to planning. {planet} amplifies your clarity',
            'Strong alignment: gather your intention before acting',
            'The field is unified. Define your target with precision',
        ],
        moderate: [
            '{planet}. A good time to plan, but stay flexible',
            'Most rhythms favour clarity. Set direction loosely',
            'Planning energy is present. {moon}',
        ],
        mixed: [
            '{planet}. Some cycles say plan, others push to build. Trust what feels right',
            'Mixed signals. Do a light planning pass, do not overcommit yet',
            'Energy wants to scatter. Anchor in one intention',
        ],
    },
    emanation: {
        strong: [
            'Every rhythm says: build. {planet} is fuel for creation',
            'Deep alignment for execution. This is rare. Use it.',
            'All systems go. Create without hesitation',
        ],
        moderate: [
            '{planet}. Build energy is available, channel it',
            'Creation window open. Focus on your most important craft',
            'Good conditions for deep work. {moon}',
        ],
        mixed: [
            '{planet}. Some cycles resist building. Work in short focused bursts',
            'Build what you can, but do not force. The field is uneven',
            'Partial build energy. Alternate between creating and reflecting',
        ],
    },
    digestion: {
        strong: [
            'Every cycle says share. {planet} carries your voice further',
            'Strong communication alignment. Ship. Publish. Connect.',
            'The field amplifies anything you put out right now',
        ],
        moderate: [
            '{planet}. Communication energy is present, share what is ready',
            'Good time to polish and ship. {moon}',
            'Moderate sharing energy. Send the message, make the call',
        ],
        mixed: [
            '{planet}. Mixed signals. Communicate selectively, not everything',
            'Some cycles favour sharing, others rest. Lead with the refined',
            'Share only what is truly ready. Let the rest marinate.',
        ],
    },
    enrichment: {
        strong: [
            'All cycles say integrate. {planet} deepens the rest',
            'Rare moment of full integration. Let everything settle.',
            'The field asks for stillness. Trust it.',
        ],
        moderate: [
            '{planet}. Integration energy is here, let things land',
            'Do not push. Review, absorb, let insights arrive. {moon}',
            'Good conditions for reflection and gentle integration',
        ],
        mixed: [
            '{planet}. The field is uneven. Integrate what you can, create when called',
            'Partial rest energy. Do not force productivity, do not force rest',
            'Some cycles pulse, others settle. Ride the wave',
        ],
    },
};

/** Sprint-mode insights: phase x pulse-specific guidance */
const SPRINT_INSIGHTS: Record<string, Record<number, string>> = {
    entry: {
        1: 'Breathe in. Set your intention for this sprint.',
        2: 'New pulse. Arrive. What is the focus?',
        3: 'Third pulse. Momentum is building. Land here.',
        4: 'Final pulse. Make it count. Settle in.',
    },
    focus: {
        1: 'Deep work. Protect this time. Build the thing.',
        2: 'Second pulse focus. You are warmed up. Stay with it.',
        3: 'Third pulse. Peak energy. This is where breakthroughs happen.',
        4: 'Last focus window. Pour what is left into it.',
    },
    exit: {
        1: 'Capture what emerged. Three more pulses ahead.',
        2: 'Good work. Capture, breathe, transition.',
        3: 'Almost there. One more pulse. Rest briefly.',
        4: 'Sprint complete. Walk. Hydrate. Let it integrate.',
    },
};

// --- INSIGHT ENGINE ---

function pickTemplate(templates: string[]): string {
    // Use the current hour to deterministically pick a template
    // Changes every hour, not every frame
    const hour = new Date().getHours();
    return templates[hour % templates.length];
}

function interpolate(template: string, cycles: AllCycles): string {
    const planet = cycles.week.planetaryDay.energy;
    const moon = cycles.moon.energy;
    return template
        .replace(/\{planet\}/g, planet)
        .replace(/\{moon\}/g, moon);
}

// --- PUBLIC API ---

export interface Guidance {
    message: string;
    category: 'do' | 'be' | 'rest';
}

export function getGuidance(
    cycles: AllCycles,
    wakeTime: string = '07:00',
    sleepTime: string = '23:00'
): Guidance {
    // -- REST TIME --
    if (!isInWorkWindow(wakeTime, sleepTime)) {
        const moon = cycles.moon.energy;
        return {
            message: 'Rest time. ' + moon.toLowerCase(),
            category: 'rest',
        };
    }

    // -- SPRINT ACTIVE --
    if (cycles.sprint.active) {
        const { phase, pulseNumber } = cycles.sprint.pulse;
        const phaseInsights = SPRINT_INSIGHTS[phase];
        const message = phaseInsights?.[pulseNumber] || 'Stay present. Breathe.';
        const category: Guidance['category'] = phase === 'focus' ? 'do' : phase === 'entry' ? 'be' : 'rest';
        return { message, category };
    }

    // -- AMBIENT: THE ONE INSIGHT --
    const synthesis = synthesizeCycles(cycles);
    const { dominant, coherenceLevel } = synthesis;

    const templates = AMBIENT_INSIGHTS[dominant.id]?.[coherenceLevel];
    if (!templates) {
        return { message: dominant.action, category: 'be' };
    }

    const template = pickTemplate(templates);
    const message = interpolate(template, cycles);

    // Map holonic phase to guidance category
    const categoryMap: Record<HolonicPhase, Guidance['category']> = {
        will: 'be',
        emanation: 'do',
        digestion: 'do',
        enrichment: 'rest',
    };

    return {
        message,
        category: categoryMap[dominant.id] || 'be',
    };
}
