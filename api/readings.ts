/**
 * Equilibrium — Hand-crafted Energy Readings
 * 
 * 28 core readings (7 days × 4 quarters)
 * 8 moon modifiers (appended as context)
 * 4 solar return modifiers (personal year)
 * 
 * Total: 40 hand-written pieces → 896 unique combinations
 */

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PLANET_NAMES = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
const PLANET_EMOJIS = ['☀️', '🌙', '🔥', '🗣️', '✨', '🌹', '🪐'];
const QUARTER_NAMES = ['Night', 'Morning', 'Afternoon', 'Evening'];
const MOON_NAMES = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
const MOON_SYMBOLS = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
const YEAR_PHASE_NAMES = ['seeding', 'building', 'harvesting', 'completing'];

function ordinal(n: number): string {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ─── CORE READINGS: [dayIndex][quarterIndex] ──────
// dayIndex: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
// quarterIndex: 0=Night(00-06), 1=Morning(06-12), 2=Afternoon(12-18), 3=Evening(18-00)

export const CORE_READINGS: string[][] = [
    // SUNDAY (Sun) — vision, purpose, creative self-expression, celebration
    [
        "The visionary day is complete — let your dreams do the creative work. Sleep with a question in mind.",
        "Before you do anything today, ask: what matters most this week? Let the answer find you, don't force it.",
        "Creative fire is high — make something that expresses who you are right now. Don't edit, just create.",
        "Light a candle, call someone you appreciate, or sit with gratitude — mark the end of the week with presence.",
    ],
    // MONDAY (Moon) — intuition, emotional depth, reflection, inner sensing
    [
        "Moon-day is complete — trust what surfaced today. Your intuition processed more than your mind knows.",
        "Don't plan from logic today — plan from what pulls you. Feel first, think second. Your gut is leading.",
        "Emotional intelligence is your sharpest tool right now — have the conversation you've been sensing needs to happen.",
        "The inner world is loud tonight — journal, sit quietly, or take a bath. Let your feelings finish their sentences.",
    ],
    // TUESDAY (Mars) — action, courage, physical energy, tackling hard things
    [
        "Mars-day is done — your body did the work today. Rest deeply, let muscles and mind both recover.",
        "Pick the hardest thing on your list and do it first. Your body has courage today — use it before noon.",
        "Physical energy peaks now — build with your hands, walk while you think, or tackle the thing you've been avoiding.",
        "The body held today's courage — stretch, move, shake off the tension you carried through action today.",
    ],
    // WEDNESDAY (Mercury) — clarity, communication, writing, learning, mental agility
    [
        "Mercury-day is complete — your mind processed a lot. Let it file and sort while you sleep.",
        "Sharp mind, clear signal — write the difficult message you've been composing in your head. Say the precise thing.",
        "Peak mental agility — have the meeting, make the call, write the document. Your words land with precision today.",
        "Your thinking is at its clearest — name what you know right now. Write it down before the clarity fades.",
    ],
    // THURSDAY (Jupiter) — expansion, wisdom, big-picture thinking, teaching, strategy
    [
        "Jupiter-day is complete — you saw further today than usual. Let the expanded view settle into quiet knowing.",
        "The horizon is wide today — zoom out from tasks. What is the big picture? Think strategy, not to-do lists.",
        "Expansion energy is fully open — teach what you know, or learn what excites you. Go broad, not deep today.",
        "Capture your biggest insight from today before it shrinks back to normal size. The wide view fades by morning.",
    ],
    // FRIDAY (Venus) — beauty, harmony, creativity, relationships, pleasure
    [
        "Venus-day is complete — pleasure and connection did their quiet work. Let beauty continue in your dreams.",
        "Start today by making one thing around you more beautiful. Small and real — a clean desk, fresh flowers, good light.",
        "Creativity and connection peak now — design, collaborate, or have a conversation that feeds your soul. Not productivity, beauty.",
        "Close the day beautifully — cook something good, listen to music you love, be with someone who makes you feel alive.",
    ],
    // SATURDAY (Saturn) — structure, grounding, discipline, organizing, completing
    [
        "Saturn-day is complete — the ground is solid beneath you. Rest on what you've built and organized this week.",
        "Structure day — look at the week honestly. What worked? What is messy? Organize one thing properly before noon.",
        "Discipline energy peaks now — do the unglamorous thing you've been postponing. Systems, files, finances, cleanup.",
        "The week's structure is set — review your commitments and prune what doesn't fit. Simplify ruthlessly tonight.",
    ],
];

// ─── MOON MODIFIERS ───────────────────────────────
// Appended to the core reading as a second sentence.
// moonIndex from getMoonPhaseIndex()

export const MOON_MODIFIERS: string[] = [
    // New Moon
    "The cycle is brand new — whatever you name right now becomes a seed.",
    // Waxing Crescent
    "Something new is just emerging — take one small step forward, don't force the full picture yet.",
    // First Quarter
    "Resistance is natural right now — push through the friction, it's building real strength.",
    // Waxing Gibbous
    "You're close to something — refine the details, don't start over. Trust what's already forming.",
    // Full Moon
    "Everything is illuminated — see clearly what actually is, not what you wish it were.",
    // Waning Gibbous
    "The harvest is in — share what you've learned with someone. Teach, give, pass it forward.",
    // Last Quarter
    "Name what's complete and stop carrying it — finished things get heavy when you don't put them down.",
    // Waning Crescent
    "The cycle is ending — rest is not laziness right now, it's preparation. Go gentle on yourself.",
];

// ─── LOOKUP FUNCTIONS ─────────────────────────────

export function getQuarterIndex(hour: number): number {
    if (hour < 6) return 0;  // Night
    if (hour < 12) return 1; // Morning
    if (hour < 18) return 2; // Afternoon
    return 3;                // Evening
}

export function getMoonPhaseIndex(now: Date): number {
    const knownNewMoon = new Date(2000, 0, 6, 18, 14).getTime();
    const daysSince = (now.getTime() - knownNewMoon) / 86400000;
    const cycleDay = (daysSince / 29.53058770576 % 1) * 29.53058770576;

    const boundaries = [1.85, 5.53, 9.22, 12.91, 16.61, 20.30, 23.99, 29.54];
    for (let i = 0; i < boundaries.length; i++) {
        if (cycleDay < boundaries[i]) return i;
    }
    return 0;
}

export function getReading(now: Date, birthday?: string): string {
    const dayOfWeek = now.getDay(); // 0=Sun
    const quarterIdx = getQuarterIndex(now.getHours());
    const moonIdx = getMoonPhaseIndex(now);

    const core = CORE_READINGS[dayOfWeek][quarterIdx];
    const moon = MOON_MODIFIERS[moonIdx];

    let result = `${core}\n\n${moon}`;

    if (birthday) {
        const yearIdx = getYearPhaseIndex(now, birthday);
        result += `\n\n${YEAR_MODIFIERS[yearIdx]}`;
    }

    return result;
}

// ─── SOLAR RETURN (PERSONAL YEAR) MODIFIERS ───────

export const YEAR_MODIFIERS: string[] = [
    // Q1: 0-25% — Seeding
    "You are planting seeds for the year ahead — every choice right now shapes what grows.",
    // Q2: 25-50% — Building
    "The year is building momentum — what you invest effort in now compounds from here.",
    // Q3: 50-75% — Harvesting
    "Your year's harvest is approaching — start gathering and sharing what's ripening.",
    // Q4: 75-100% — Completing
    "The year is completing — honor what happened, release what's done, make space for what's next.",
];

export function getYearPhaseIndex(now: Date, birthday: string): number {
    // birthday format: "DD-MM-YYYY" or "MM-DD"
    const parts = birthday.split('-');
    let month: number, day: number;
    if (parts.length === 3) {
        // DD-MM-YYYY
        day = parseInt(parts[0]);
        month = parseInt(parts[1]) - 1;
    } else {
        // MM-DD
        month = parseInt(parts[0]) - 1;
        day = parseInt(parts[1]);
    }

    const year = now.getFullYear();
    let bday = new Date(year, month, day);
    let nextBday = new Date(year + 1, month, day);
    if (now < bday) {
        nextBday = bday;
        bday = new Date(year - 1, month, day);
    }
    const progress = (now.getTime() - bday.getTime()) / (nextBday.getTime() - bday.getTime());
    if (progress < 0.25) return 0;
    if (progress < 0.5) return 1;
    if (progress < 0.75) return 2;
    return 3;
}

function parseBirthday(birthday: string): { month: number; day: number; year?: number } {
    const parts = birthday.split('-');
    if (parts.length === 3) {
        // DD-MM-YYYY
        return { day: parseInt(parts[0]), month: parseInt(parts[1]) - 1, year: parseInt(parts[2]) };
    }
    // MM-DD
    return { month: parseInt(parts[0]) - 1, day: parseInt(parts[1]) };
}

/**
 * Full reading with context header.
 * Shows raw cycle info first, then the hand-crafted reading.
 */
export function getFullReading(now: Date, birthday?: string): string {
    const dayOfWeek = now.getDay();
    const quarterIdx = getQuarterIndex(now.getHours());
    const moonIdx = getMoonPhaseIndex(now);
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Context header
    let header = `⚡ ${timeStr} · ${DAY_NAMES[dayOfWeek]} ${QUARTER_NAMES[quarterIdx]}`;
    header += `\n${PLANET_EMOJIS[dayOfWeek]} ${PLANET_NAMES[dayOfWeek]} · ${MOON_SYMBOLS[moonIdx]} ${MOON_NAMES[moonIdx]}`;

    if (birthday) {
        const parsed = parseBirthday(birthday);
        const yearIdx = getYearPhaseIndex(now, birthday);
        if (parsed.year) {
            const age = now.getFullYear() - parsed.year;
            // If birthday hasn't happened yet this year, subtract 1
            const bdayThisYear = new Date(now.getFullYear(), parsed.month, parsed.day);
            const currentAge = now < bdayThisYear ? age - 1 : age;
            const currentYear = currentAge + 1; // "1st year" = age 0, etc.
            header += ` · ${ordinal(currentYear)} year (${YEAR_PHASE_NAMES[yearIdx]})`;
        } else {
            header += ` · Year ${YEAR_PHASE_NAMES[yearIdx]}`;
        }
    }

    // Reading body
    const core = CORE_READINGS[dayOfWeek][quarterIdx];
    const moon = MOON_MODIFIERS[moonIdx];
    let body = `${core}\n\n${moon}`;

    if (birthday) {
        const yearIdx = getYearPhaseIndex(now, birthday);
        body += `\n\n${YEAR_MODIFIERS[yearIdx]}`;
    }

    return `${header}\n\n${body}`;
}
