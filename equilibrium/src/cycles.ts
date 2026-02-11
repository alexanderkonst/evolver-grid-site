/**
 * Equilibrium — Cycle Calculations
 * 
 * All time is computed from Date.now(). 
 * No state needed — just math.
 * 
 * CORE PRINCIPLE: Every cycle carries the same 4-phase holonic pattern:
 *   WILL → EMANATION → DIGESTION → ENRICHMENT
 * The clock shows WHERE YOU ARE in each cycle, right now.
 */

// ─── TYPES ─────────────────────────────────────────

export type Phase = 'entry' | 'focus' | 'exit';

/** The universal 4-phase holonic pattern present in every cycle */
export type HolonicPhase = 'will' | 'emanation' | 'digestion' | 'enrichment';

export const HOLONIC_PHASES: { id: HolonicPhase; label: string; emoji: string; color: string; action: string }[] = [
    { id: 'will', label: 'PLANNING', emoji: '🎯', color: '#e07040', action: 'Set intention · Define the target' },
    { id: 'emanation', label: 'BUILDING', emoji: '🔨', color: '#5090c0', action: 'Build · Create · Execute' },
    { id: 'digestion', label: 'COMMUNICATING', emoji: '📡', color: '#60a060', action: 'Share · Polish · Ship' },
    { id: 'enrichment', label: 'INTEGRATING', emoji: '🌀', color: '#a080c0', action: 'Integrate · Reflect · Rest' },
];

export function getHolonicPhase(progress: number): typeof HOLONIC_PHASES[number] {
    const idx = Math.min(Math.floor(progress * 4), 3);
    return HOLONIC_PHASES[idx];
}

export interface BreathState {
    position: number;
    inhaling: boolean;
}

export interface PulseState {
    pulseNumber: number;
    phase: Phase;
    phaseElapsed: number;
    phaseRemaining: number;
    pulseElapsed: number;
    pulseProgress: number;
}

export interface SprintState {
    elapsed: number;
    remaining: number;
    progress: number;
    pulse: PulseState;
    active: boolean;
    holonicPhase: typeof HOLONIC_PHASES[number];
}

export interface DayState {
    hour: number;
    minute: number;
    progress: number;
    quarter: 'dawn' | 'morning' | 'afternoon' | 'evening';
    sprintSlot: number;
    holonicPhase: typeof HOLONIC_PHASES[number];
}

export interface PlanetaryDay {
    name: string;
    planet: string;
    symbol: string;
    emoji: string;
    energy: string;
    intelligence: string;
    description: string;
}

export interface PlanetaryHour {
    planet: string;
    emoji: string;
    energy: string;
    hourIndex: number;
}

export interface MoonState {
    phase: string;
    symbol: string;
    progress: number;
    day: number;
    energy: string;
    holonicPhase: typeof HOLONIC_PHASES[number];
}

export interface WeekState {
    dayOfWeek: number;
    progress: number;
    planetaryDay: PlanetaryDay;
    planetaryHour: PlanetaryHour;
    holonicPhase: typeof HOLONIC_PHASES[number];
}

export interface MonthState {
    month: number;
    day: number;
    progress: number;
    holonicPhase: typeof HOLONIC_PHASES[number];
}

export interface QuarterState {
    quarter: number;
    season: string;
    progress: number;
    energy: string;
    holonicPhase: typeof HOLONIC_PHASES[number];
}

export interface YearState {
    progress: number;
    holonicPhase: typeof HOLONIC_PHASES[number];
    /** Personal year progress (birthday-based) */
    personalProgress: number;
    personalHolonicPhase: typeof HOLONIC_PHASES[number];
}

export interface AllCycles {
    breath: BreathState;
    sprint: SprintState;
    day: DayState;
    week: WeekState;
    month: MonthState;
    moon: MoonState;
    year: YearState;
}

// ─── CONSTANTS ─────────────────────────────────────

const PULSE_ENTRY_MIN = 4;
const PULSE_FOCUS_MIN = 16;
const PULSE_EXIT_MIN = 4;
const PULSE_TOTAL_MIN = PULSE_ENTRY_MIN + PULSE_FOCUS_MIN + PULSE_EXIT_MIN; // 24
const SPRINT_PULSES = 4;
const SPRINT_TOTAL_MIN = PULSE_TOTAL_MIN * SPRINT_PULSES; // 96

// ─── ENERGETIC WEEK BLUEPRINT ──────────────────────

const PLANETARY_DAYS: PlanetaryDay[] = [
    {
        name: 'Sunday', planet: 'Sun', symbol: '☉', emoji: '☀️',
        energy: 'Illumination & Celebration',
        intelligence: 'Spiritual (SQ)',
        description: 'Vision, purpose, creative self-expression. Celebrate what you\'ve built.',
    },
    {
        name: 'Monday', planet: 'Moon', symbol: '☽', emoji: '🌙',
        energy: 'Intuition & Emotional Depth',
        intelligence: 'Emotional (EQ)',
        description: 'Reflection, inner sensing, emotional recalibration. Plan from feeling, not force.',
    },
    {
        name: 'Tuesday', planet: 'Mars', symbol: '♂', emoji: '🔥',
        energy: 'Action & Courage',
        intelligence: 'Kinesthetic (Body)',
        description: 'Decisive action, physical energy, tackling hard things. Move your body.',
    },
    {
        name: 'Wednesday', planet: 'Mercury', symbol: '☿', emoji: '🗣️',
        energy: 'Clarity & Communication',
        intelligence: 'Verbal-Linguistic',
        description: 'Meetings, writing, learning, networking. Mental agility at peak.',
    },
    {
        name: 'Thursday', planet: 'Jupiter', symbol: '♃', emoji: '✨',
        energy: 'Expansion & Wisdom',
        intelligence: 'Vision-Logic',
        description: 'Big-picture thinking, teaching, strategic planning. Expand horizons.',
    },
    {
        name: 'Friday', planet: 'Venus', symbol: '♀', emoji: '🌹',
        energy: 'Beauty & Harmony',
        intelligence: 'Aesthetic & Interpersonal',
        description: 'Creativity, relationships, design, pleasure. Make things beautiful.',
    },
    {
        name: 'Saturday', planet: 'Saturn', symbol: '♄', emoji: '🪐',
        energy: 'Structure & Grounding',
        intelligence: 'Moral & Logical',
        description: 'Discipline, organizing, completing. Review the week, ground the gains.',
    },
];

const CHALDEAN_ORDER = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];
const DAY_HOUR_START = [3, 6, 2, 5, 1, 4, 0];

const PLANET_ENERGY: Record<string, { emoji: string; energy: string }> = {
    Sun: { emoji: '☀️', energy: 'Vitality & Purpose' },
    Moon: { emoji: '🌙', energy: 'Intuition & Feeling' },
    Mars: { emoji: '🔥', energy: 'Drive & Action' },
    Mercury: { emoji: '🗣️', energy: 'Thought & Communication' },
    Jupiter: { emoji: '✨', energy: 'Expansion & Vision' },
    Venus: { emoji: '🌹', energy: 'Beauty & Connection' },
    Saturn: { emoji: '🪐', energy: 'Structure & Discipline' },
};

const MOON_PHASES = [
    { name: 'New Moon', symbol: '🌑', start: 0, end: 1.85, energy: 'Set intentions · Plant seeds' },
    { name: 'Waxing Crescent', symbol: '🌒', start: 1.85, end: 5.53, energy: 'Emerge · Take first steps' },
    { name: 'First Quarter', symbol: '🌓', start: 5.53, end: 9.22, energy: 'Build · Overcome resistance' },
    { name: 'Waxing Gibbous', symbol: '🌔', start: 9.22, end: 12.91, energy: 'Refine · Trust the process' },
    { name: 'Full Moon', symbol: '🌕', start: 12.91, end: 16.61, energy: 'Harvest · Celebrate completion' },
    { name: 'Waning Gibbous', symbol: '🌖', start: 16.61, end: 20.30, energy: 'Share · Teach what you learned' },
    { name: 'Last Quarter', symbol: '🌗', start: 20.30, end: 23.99, energy: 'Release · Let go of what\'s done' },
    { name: 'Waning Crescent', symbol: '🌘', start: 23.99, end: 29.53, energy: 'Rest · Surrender · Renew' },
];

const SEASON_ENERGY: Record<string, string> = {
    Winter: 'Seed & Incubate',
    Spring: 'Sprout & Build',
    Summer: 'Bloom & Harvest',
    Autumn: 'Gather & Release',
};

// Week holonic mapping (Alexander's model):
// Mon → WILL (Planning), Tue → EMANATION (Building),
// Wed → DIGESTION (Communicating), Thu-Sun → ENRICHMENT (Integrating)
function getWeekHolonicPhase(dayOfWeek: number): typeof HOLONIC_PHASES[number] {
    // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    if (dayOfWeek === 1) return HOLONIC_PHASES[0]; // Mon → Planning
    if (dayOfWeek === 2) return HOLONIC_PHASES[1]; // Tue → Building
    if (dayOfWeek === 3) return HOLONIC_PHASES[2]; // Wed → Communicating
    return HOLONIC_PHASES[3]; // Thu-Sun → Integrating
}

// ─── BREATH ────────────────────────────────────────

export function getBreathState(now: number, cycleDuration: number = 11): BreathState {
    const posInCycle = ((now / 1000) % cycleDuration) / cycleDuration;
    return {
        position: posInCycle,
        inhaling: posInCycle < 0.5,
    };
}

// ─── SPRINT & PULSE ────────────────────────────────

export function getSprintState(sprintStartTime: number | null, now: number): SprintState {
    if (!sprintStartTime) {
        return {
            elapsed: 0,
            remaining: SPRINT_TOTAL_MIN,
            progress: 0,
            pulse: { pulseNumber: 1, phase: 'entry', phaseElapsed: 0, phaseRemaining: PULSE_ENTRY_MIN, pulseElapsed: 0, pulseProgress: 0 },
            active: false,
            holonicPhase: HOLONIC_PHASES[0],
        };
    }

    const elapsedMs = now - sprintStartTime;
    const elapsedMin = elapsedMs / 60000;

    if (elapsedMin >= SPRINT_TOTAL_MIN) {
        return {
            elapsed: SPRINT_TOTAL_MIN,
            remaining: 0,
            progress: 1,
            pulse: { pulseNumber: 4, phase: 'exit', phaseElapsed: PULSE_EXIT_MIN, phaseRemaining: 0, pulseElapsed: PULSE_TOTAL_MIN, pulseProgress: 1 },
            active: false,
            holonicPhase: HOLONIC_PHASES[3],
        };
    }

    const pulseIndex = Math.min(Math.floor(elapsedMin / PULSE_TOTAL_MIN), SPRINT_PULSES - 1);
    const pulseElapsed = elapsedMin - (pulseIndex * PULSE_TOTAL_MIN);
    const progress = elapsedMin / SPRINT_TOTAL_MIN;

    let phase: Phase;
    let phaseElapsed: number;
    let phaseRemaining: number;

    if (pulseElapsed < PULSE_ENTRY_MIN) {
        phase = 'entry';
        phaseElapsed = pulseElapsed;
        phaseRemaining = PULSE_ENTRY_MIN - pulseElapsed;
    } else if (pulseElapsed < PULSE_ENTRY_MIN + PULSE_FOCUS_MIN) {
        phase = 'focus';
        phaseElapsed = pulseElapsed - PULSE_ENTRY_MIN;
        phaseRemaining = PULSE_FOCUS_MIN - phaseElapsed;
    } else {
        phase = 'exit';
        phaseElapsed = pulseElapsed - PULSE_ENTRY_MIN - PULSE_FOCUS_MIN;
        phaseRemaining = PULSE_EXIT_MIN - phaseElapsed;
    }

    return {
        elapsed: elapsedMin,
        remaining: SPRINT_TOTAL_MIN - elapsedMin,
        progress,
        pulse: {
            pulseNumber: pulseIndex + 1,
            phase,
            phaseElapsed,
            phaseRemaining,
            pulseElapsed,
            pulseProgress: pulseElapsed / PULSE_TOTAL_MIN,
        },
        active: true,
        holonicPhase: HOLONIC_PHASES[pulseIndex],
    };
}

// ─── DAY ───────────────────────────────────────────

export function getDayState(now: number): DayState {
    const d = new Date(now);
    const hour = d.getHours();
    const minute = d.getMinutes();
    const totalMinutes = hour * 60 + minute;
    const progress = totalMinutes / 1440;

    let quarter: DayState['quarter'];
    if (hour < 6) quarter = 'dawn';
    else if (hour < 12) quarter = 'morning';
    else if (hour < 18) quarter = 'afternoon';
    else quarter = 'evening';

    const workMinutes = Math.max(0, totalMinutes - 540);
    const sprintSlot = Math.floor(workMinutes / 111) + 1;

    return { hour, minute, progress, quarter, sprintSlot, holonicPhase: getHolonicPhase(progress) };
}

// ─── WEEK ──────────────────────────────────────────

function getPlanetaryHour(dayOfWeek: number, hour: number): PlanetaryHour {
    const startIdx = DAY_HOUR_START[dayOfWeek];
    const planetIdx = (startIdx + hour) % 7;
    const planet = CHALDEAN_ORDER[planetIdx];
    const info = PLANET_ENERGY[planet];
    return { planet, emoji: info.emoji, energy: info.energy, hourIndex: hour };
}

export function getWeekState(now: number): WeekState {
    const d = new Date(now);
    const dayOfWeek = d.getDay();
    const hour = d.getHours();
    const minute = d.getMinutes();
    // Week starts Monday: Mon=0, ..., Sun=6
    const mondayBased = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const progress = (mondayBased * 1440 + hour * 60 + minute) / (7 * 1440);

    return {
        dayOfWeek,
        progress,
        planetaryDay: PLANETARY_DAYS[dayOfWeek],
        planetaryHour: getPlanetaryHour(dayOfWeek, hour),
        holonicPhase: getWeekHolonicPhase(dayOfWeek),
    };
}

// ─── MONTH ─────────────────────────────────────────

export function getMonthState(now: number): MonthState {
    const d = new Date(now);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    const progress = (day - 1 + (d.getHours() * 60 + d.getMinutes()) / 1440) / daysInMonth;

    return { month, day, progress, holonicPhase: getHolonicPhase(progress) };
}

// ─── QUARTER ───────────────────────────────────────

export function getQuarterState(now: number): QuarterState {
    const d = new Date(now);
    const month = d.getMonth();
    const quarter = Math.floor(month / 3) + 1;
    const seasons = ['Winter', 'Spring', 'Summer', 'Autumn'];
    const season = seasons[quarter - 1];

    const quarterStartMonth = (quarter - 1) * 3;
    const quarterStart = new Date(d.getFullYear(), quarterStartMonth, 1).getTime();
    const quarterEnd = new Date(d.getFullYear(), quarterStartMonth + 3, 1).getTime();
    const progress = (now - quarterStart) / (quarterEnd - quarterStart);

    return { quarter, season, progress, energy: SEASON_ENERGY[season], holonicPhase: getHolonicPhase(progress) };
}

// ─── MOON ──────────────────────────────────────────

export function getMoonState(now: number): MoonState {
    const knownNewMoon = new Date(2000, 0, 6, 18, 14).getTime();
    const synodicMonth = 29.53058770576;

    const daysSince = (now - knownNewMoon) / 86400000;
    const cyclesElapsed = daysSince / synodicMonth;
    const currentCycleDay = (cyclesElapsed % 1) * synodicMonth;
    const progress = currentCycleDay / synodicMonth;

    let moonPhase = MOON_PHASES[0];
    for (const p of MOON_PHASES) {
        if (currentCycleDay >= p.start && currentCycleDay < p.end) {
            moonPhase = p;
            break;
        }
    }

    // Moon holonic: New Moon (0-25%) = WILL, Waxing (25-50%) = EMANATION,
    // Full Moon (50-75%) = DIGESTION, Waning (75-100%) = ENRICHMENT
    return {
        phase: moonPhase.name,
        symbol: moonPhase.symbol,
        progress,
        day: currentCycleDay,
        energy: moonPhase.energy,
        holonicPhase: getHolonicPhase(progress),
    };
}

// ─── YEAR ──────────────────────────────────────────

export function getYearState(now: number, birthday?: string): YearState {
    const d = new Date(now);
    const yearStart = new Date(d.getFullYear(), 0, 1).getTime();
    const yearEnd = new Date(d.getFullYear() + 1, 0, 1).getTime();
    const progress = (now - yearStart) / (yearEnd - yearStart);

    // Personal year: birthday-to-birthday
    let personalProgress = progress;
    if (birthday) {
        const [bMonth, bDay] = birthday.split('-').map(Number);
        const thisYearBday = new Date(d.getFullYear(), bMonth - 1, bDay).getTime();

        if (now >= thisYearBday) {
            const nextYearBday = new Date(d.getFullYear() + 1, bMonth - 1, bDay).getTime();
            personalProgress = (now - thisYearBday) / (nextYearBday - thisYearBday);
        } else {
            const lastYearBday = new Date(d.getFullYear() - 1, bMonth - 1, bDay).getTime();
            personalProgress = (now - lastYearBday) / (thisYearBday - lastYearBday);
        }
    }

    return {
        progress,
        holonicPhase: getHolonicPhase(progress),
        personalProgress,
        personalHolonicPhase: getHolonicPhase(personalProgress),
    };
}

// ─── SYNTHESIS: THE ONE INSIGHT ────────────────────

export interface CycleSynthesis {
    /** The dominant holonic phase */
    dominant: typeof HOLONIC_PHASES[number];
    /** 0-100: how many cycles agree on the dominant phase */
    coherence: number;
    /** 'strong' (>66%) | 'moderate' (>40%) | 'mixed' */
    coherenceLevel: 'strong' | 'moderate' | 'mixed';
    /** The holonic phase of each cycle, for the status bar phase map */
    phaseMap: {
        day: typeof HOLONIC_PHASES[number];
        week: typeof HOLONIC_PHASES[number];
        month: typeof HOLONIC_PHASES[number];
        moon: typeof HOLONIC_PHASES[number];
        year: typeof HOLONIC_PHASES[number];
        sprint?: typeof HOLONIC_PHASES[number];
    };
}

export function synthesizeCycles(cycles: AllCycles): CycleSynthesis {
    // Count how many cycles are in each holonic phase
    const counts: Record<HolonicPhase, number> = { will: 0, emanation: 0, digestion: 0, enrichment: 0 };
    const activeCycles = [
        cycles.day.holonicPhase,
        cycles.week.holonicPhase,
        cycles.month.holonicPhase,
        cycles.moon.holonicPhase,
        cycles.year.holonicPhase,
    ];

    if (cycles.sprint.active) {
        activeCycles.push(cycles.sprint.holonicPhase);
    }

    for (const phase of activeCycles) {
        counts[phase.id]++;
    }

    // Find dominant
    let maxCount = 0;
    let dominantId: HolonicPhase = 'will';
    for (const [id, count] of Object.entries(counts) as [HolonicPhase, number][]) {
        if (count > maxCount) {
            maxCount = count;
            dominantId = id;
        }
    }

    const dominant = HOLONIC_PHASES.find(p => p.id === dominantId)!;
    const coherence = Math.round((maxCount / activeCycles.length) * 100);
    const coherenceLevel = coherence > 66 ? 'strong' : coherence > 40 ? 'moderate' : 'mixed';

    return {
        dominant,
        coherence,
        coherenceLevel,
        phaseMap: {
            day: cycles.day.holonicPhase,
            week: cycles.week.holonicPhase,
            month: cycles.month.holonicPhase,
            moon: cycles.moon.holonicPhase,
            year: cycles.year.holonicPhase,
            sprint: cycles.sprint.active ? cycles.sprint.holonicPhase : undefined,
        },
    };
}

// ─── ALL CYCLES ────────────────────────────────────

export function getAllCycles(
    now: number,
    sprintStartTime: number | null,
    breathDuration: number = 11,
    birthday?: string
): AllCycles {
    return {
        breath: getBreathState(now, breathDuration),
        sprint: getSprintState(sprintStartTime, now),
        day: getDayState(now),
        week: getWeekState(now),
        month: getMonthState(now),
        moon: getMoonState(now),
        year: getYearState(now, birthday),
    };
}

// ─── HELPERS ───────────────────────────────────────

export function formatMinutes(min: number): string {
    const m = Math.floor(min);
    const s = Math.floor((min - m) * 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

const PULSE_NAMES = ['PLANNING', 'BUILDING', 'COMMUNICATING', 'INTEGRATING'];

export function getPulseName(pulseNumber: number): string {
    return PULSE_NAMES[Math.min(pulseNumber - 1, 3)] || 'INCEPTION';
}

export function getPhaseColor(phase: Phase): string {
    switch (phase) {
        case 'entry': return 'var(--phase-entry)';
        case 'focus': return 'var(--phase-focus)';
        case 'exit': return 'var(--phase-exit)';
    }
}

export function getPhaseLabel(phase: Phase): string {
    switch (phase) {
        case 'entry': return 'Entry';
        case 'focus': return 'Focus';
        case 'exit': return 'Exit';
    }
}
