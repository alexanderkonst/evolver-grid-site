/**
 * Equilibrium — Cycle Calculations
 * 
 * All time is computed from Date.now(). 
 * No state needed — just math.
 */

// ─── TYPES ─────────────────────────────────────────

export type Phase = 'entry' | 'focus' | 'exit';

export interface BreathState {
    /** 0→1 position in breath cycle (0=exhale empty, 0.5=inhale full, 1=exhale empty) */
    position: number;
    /** true during inhale half */
    inhaling: boolean;
}

export interface PulseState {
    /** 1-4 which pulse in the sprint */
    pulseNumber: number;
    /** entry/focus/exit */
    phase: Phase;
    /** minutes elapsed in current phase */
    phaseElapsed: number;
    /** minutes remaining in current phase */
    phaseRemaining: number;
    /** minutes elapsed in current pulse */
    pulseElapsed: number;
    /** overall progress 0→1 within the pulse */
    pulseProgress: number;
}

export interface SprintState {
    /** Minutes elapsed in sprint */
    elapsed: number;
    /** Minutes remaining */
    remaining: number;
    /** 0→1 overall sprint progress */
    progress: number;
    /** Current pulse info */
    pulse: PulseState;
    /** Is sprint active */
    active: boolean;
}

export interface DayState {
    /** Current hour (0-23) */
    hour: number;
    /** Current minute */
    minute: number;
    /** Progress through the day 0→1 */
    progress: number;
    /** Which "quarter" of day: dawn/morning/afternoon/evening */
    quarter: 'dawn' | 'morning' | 'afternoon' | 'evening';
    /** Which sprint slot we're in (1-based, up to ~5 per day) */
    sprintSlot: number;
}

export interface PlanetaryDay {
    /** Day name */
    name: string;
    /** Planet ruler */
    planet: string;
    /** Traditional astronomical symbol */
    symbol: string;
    /** Human-readable emoji */
    emoji: string;
    /** Short energy essence */
    energy: string;
    /** Ken Wilber intelligence type */
    intelligence: string;
    /** One-sentence founder-relevant description */
    description: string;
}

export interface PlanetaryHour {
    /** Planet ruling this hour */
    planet: string;
    /** Human-readable emoji */
    emoji: string;
    /** Short energy essence */
    energy: string;
    /** Hour index within day (0-23) */
    hourIndex: number;
}

export interface MoonState {
    /** Phase name */
    phase: string;
    /** Symbol */
    symbol: string;
    /** 0→1 through lunar cycle */
    progress: number;
    /** Day of lunar cycle (0-29.5) */
    day: number;
    /** Energy description for this moon phase */
    energy: string;
}

export interface WeekState {
    /** Day of week 0-6 (0=Sunday) */
    dayOfWeek: number;
    /** Progress through week 0→1 */
    progress: number;
    /** Planetary day info */
    planetaryDay: PlanetaryDay;
    /** Current planetary hour */
    planetaryHour: PlanetaryHour;
}

export interface MonthState {
    /** Current month 1-12 */
    month: number;
    /** Day of month */
    day: number;
    /** Progress through month 0→1 */
    progress: number;
}

export interface QuarterState {
    /** Quarter number 1-4 */
    quarter: number;
    /** Season name */
    season: string;
    /** Progress through quarter 0→1 */
    progress: number;
    /** Energy description for this season */
    energy: string;
}

export interface AllCycles {
    breath: BreathState;
    sprint: SprintState;
    day: DayState;
    week: WeekState;
    month: MonthState;
    quarter: QuarterState;
    moon: MoonState;
}

// ─── CONSTANTS ─────────────────────────────────────

const PULSE_ENTRY_MIN = 4;
const PULSE_FOCUS_MIN = 16;
const PULSE_EXIT_MIN = 4;
const PULSE_TOTAL_MIN = PULSE_ENTRY_MIN + PULSE_FOCUS_MIN + PULSE_EXIT_MIN; // 24
const SPRINT_PULSES = 4;
const SPRINT_TOTAL_MIN = PULSE_TOTAL_MIN * SPRINT_PULSES; // 96

// ─── ENERGETIC WEEK BLUEPRINT ──────────────────────
// Synthesized from 11 traditions: Western Astrology, Hermeticism,
// Kabbalah, Christian Mysticism, Shamanic, Ayurveda, Sufism,
// Anthroposophy, Taoism, Buddhism, Vedic Astrology.
// Intelligence types: Ken Wilber's Integral Model.

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

// Chaldean order for planetary hours
const CHALDEAN_ORDER = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];

// Starting planet index in Chaldean order for each day's first hour
// Sunday=Sun(3), Mon=Moon(6), Tue=Mars(2), Wed=Mercury(5), Thu=Jupiter(1), Fri=Venus(4), Sat=Saturn(0)
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
        };
    }

    const elapsedMs = now - sprintStartTime;
    const elapsedMin = elapsedMs / 60000;

    // Sprint ended
    if (elapsedMin >= SPRINT_TOTAL_MIN) {
        return {
            elapsed: SPRINT_TOTAL_MIN,
            remaining: 0,
            progress: 1,
            pulse: { pulseNumber: 4, phase: 'exit', phaseElapsed: PULSE_EXIT_MIN, phaseRemaining: 0, pulseElapsed: PULSE_TOTAL_MIN, pulseProgress: 1 },
            active: false,
        };
    }

    // Current pulse
    const pulseIndex = Math.min(Math.floor(elapsedMin / PULSE_TOTAL_MIN), SPRINT_PULSES - 1);
    const pulseElapsed = elapsedMin - (pulseIndex * PULSE_TOTAL_MIN);

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
        progress: elapsedMin / SPRINT_TOTAL_MIN,
        pulse: {
            pulseNumber: pulseIndex + 1,
            phase,
            phaseElapsed,
            phaseRemaining,
            pulseElapsed,
            pulseProgress: pulseElapsed / PULSE_TOTAL_MIN,
        },
        active: true,
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

    // Sprint slots: assume work starts at ~9am, each sprint 96min + 15min break ≈ 2h slots
    const workMinutes = Math.max(0, totalMinutes - 540); // 9am = 540min
    const sprintSlot = Math.floor(workMinutes / 111) + 1; // 96 + 15 break

    return { hour, minute, progress, quarter, sprintSlot };
}

// ─── WEEK ──────────────────────────────────────────

function getPlanetaryHour(dayOfWeek: number, hour: number): PlanetaryHour {
    const startIdx = DAY_HOUR_START[dayOfWeek];
    const planetIdx = (startIdx + hour) % 7;
    const planet = CHALDEAN_ORDER[planetIdx];
    const info = PLANET_ENERGY[planet];
    return {
        planet,
        emoji: info.emoji,
        energy: info.energy,
        hourIndex: hour,
    };
}

export function getWeekState(now: number): WeekState {
    const d = new Date(now);
    const dayOfWeek = d.getDay();
    const hour = d.getHours();
    const progress = (dayOfWeek * 24 + hour) / 168;

    return {
        dayOfWeek,
        progress,
        planetaryDay: PLANETARY_DAYS[dayOfWeek],
        planetaryHour: getPlanetaryHour(dayOfWeek, hour),
    };
}

// ─── MONTH ─────────────────────────────────────────

export function getMonthState(now: number): MonthState {
    const d = new Date(now);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    const progress = (day - 1) / daysInMonth;

    return { month, day, progress };
}

// ─── QUARTER ───────────────────────────────────────

export function getQuarterState(now: number): QuarterState {
    const d = new Date(now);
    const month = d.getMonth(); // 0-11
    const quarter = Math.floor(month / 3) + 1;
    const seasons = ['Winter', 'Spring', 'Summer', 'Autumn'];
    const season = seasons[quarter - 1];

    const quarterStartMonth = (quarter - 1) * 3;
    const quarterStart = new Date(d.getFullYear(), quarterStartMonth, 1).getTime();
    const quarterEnd = new Date(d.getFullYear(), quarterStartMonth + 3, 1).getTime();
    const progress = (now - quarterStart) / (quarterEnd - quarterStart);

    return { quarter, season, progress, energy: SEASON_ENERGY[season] };
}

// ─── MOON ──────────────────────────────────────────

export function getMoonState(now: number): MoonState {
    // Simple lunar phase calculation
    // Known new moon: Jan 6, 2000 18:14 UTC
    const knownNewMoon = new Date(2000, 0, 6, 18, 14).getTime();
    const synodicMonth = 29.53058770576; // days

    const daysSince = (now - knownNewMoon) / 86400000;
    const cyclesElapsed = daysSince / synodicMonth;
    const currentCycleDay = (cyclesElapsed % 1) * synodicMonth;

    let phase = MOON_PHASES[0];
    for (const p of MOON_PHASES) {
        if (currentCycleDay >= p.start && currentCycleDay < p.end) {
            phase = p;
            break;
        }
    }

    return {
        phase: phase.name,
        symbol: phase.symbol,
        progress: currentCycleDay / synodicMonth,
        day: currentCycleDay,
        energy: phase.energy,
    };
}

// ─── ALL CYCLES ────────────────────────────────────

export function getAllCycles(now: number, sprintStartTime: number | null, breathDuration: number = 11): AllCycles {
    return {
        breath: getBreathState(now, breathDuration),
        sprint: getSprintState(sprintStartTime, now),
        day: getDayState(now),
        week: getWeekState(now),
        month: getMonthState(now),
        quarter: getQuarterState(now),
        moon: getMoonState(now),
    };
}

// ─── HELPERS ───────────────────────────────────────

export function formatMinutes(min: number): string {
    const m = Math.floor(min);
    const s = Math.floor((min - m) * 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Phase display names */
const PULSE_NAMES = ['INCEPTION', 'EMANATION', 'RETURN', 'INTEGRATION'];

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
