/**
 * Equilibrium — Clock Renderer v3
 * 
 * Apple-style rings: each ring = ONE arc, ONE color, ONE fill.
 * Color = holonic phase you're currently in for that cycle.
 * Fill = how far through the cycle you are.
 * 
 * Five rings. Five colors. Five fills. That IS the harmonic.
 */

import type { AllCycles, Phase } from './cycles';
import { HOLONIC_PHASES, formatMinutes, getPulseName, getPhaseLabel, getPhaseColor, synthesizeCycles } from './cycles';

// ─── SVG HELPERS ───────────────────────────────────

const SVG_NS = 'http://www.w3.org/2000/svg';
const CENTER = 200;

function createSvgElement<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string>): SVGElementTagNameMap[K] {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) {
        el.setAttribute(k, v);
    }
    return el;
}

/**
 * Create a single-arc ring (Apple Activity Ring style).
 * One background track + one fill arc + no dots, no segments.
 */
function createSingleArcRing(
    radius: number,
    strokeWidth: number,
): { group: SVGGElement; track: SVGCircleElement; fill: SVGCircleElement } {
    const group = createSvgElement('g', { class: 'ring-group' });
    const circumference = 2 * Math.PI * radius;

    // Background track (full circle, very dim)
    const track = createSvgElement('circle', {
        cx: String(CENTER),
        cy: String(CENTER),
        r: String(radius),
        fill: 'none',
        stroke: '#ffffff',
        'stroke-width': String(strokeWidth),
        'stroke-linecap': 'round',
        opacity: '0.06',
        transform: `rotate(-90 ${CENTER} ${CENTER})`,
        class: 'ring-track',
    });

    // Fill arc (partial circle, colored by current phase)
    const fill = createSvgElement('circle', {
        cx: String(CENTER),
        cy: String(CENTER),
        r: String(radius),
        fill: 'none',
        stroke: '#c9a84c', // default, overridden per update
        'stroke-width': String(strokeWidth),
        'stroke-dasharray': `0 ${circumference}`,
        'stroke-dashoffset': '0',
        'stroke-linecap': 'round',
        transform: `rotate(-90 ${CENTER} ${CENTER})`,
        class: 'ring-fill',
    });

    group.appendChild(track);
    group.appendChild(fill);

    return { group, track, fill };
}


// ─── RING DEFINITIONS ──────────────────────────────

interface RingConfig {
    id: string;
    radius: number;
    strokeWidth: number;
    label: string;
}

const RING_CONFIGS: RingConfig[] = [
    { id: 'sprint', radius: 85, strokeWidth: 8, label: 'Sprint' },
    { id: 'day', radius: 105, strokeWidth: 6, label: 'Day' },
    { id: 'week', radius: 123, strokeWidth: 5, label: 'Week' },
    { id: 'moon', radius: 139, strokeWidth: 4.5, label: 'Moon' },
    { id: 'quarter', radius: 154, strokeWidth: 4, label: 'Quarter' },
    { id: 'year', radius: 167, strokeWidth: 3.5, label: 'Year' },
];

// ─── CLOCK CLASS ───────────────────────────────────

export class Clock {
    private svg: SVGSVGElement;
    private rings: Map<string, { group: SVGGElement; track: SVGCircleElement; fill: SVGCircleElement; config: RingConfig }>;

    // Pulse arcs (inner breathing ring)
    private pulseArcs: SVGCircleElement[];
    private pulseGroup: SVGGElement;

    // DOM elements
    private phaseLabel: HTMLElement;
    private timeRemaining: HTMLElement;
    private transitionPrompt: HTMLElement;
    private dayPosition: HTMLElement;
    private statusBar: HTMLElement;
    private guidanceEl: HTMLElement;

    private lastPromptPhase: string = '';
    private promptTimeout: number | null = null;

    constructor() {
        this.svg = document.getElementById('rings') as unknown as SVGSVGElement;
        this.phaseLabel = document.getElementById('phase-label')!;
        this.timeRemaining = document.getElementById('time-remaining')!;
        this.transitionPrompt = document.getElementById('transition-prompt')!;
        this.dayPosition = document.getElementById('day-position')!;
        this.statusBar = document.getElementById('status-bar')!;
        this.guidanceEl = document.getElementById('guidance')!;

        this.rings = new Map();
        this.pulseArcs = [];
        this.pulseGroup = document.createElementNS(SVG_NS, 'g');

        this.buildClock();
    }

    private buildClock() {
        this.svg.innerHTML = '';

        // Add glow filter
        const defs = createSvgElement('defs', {});
        defs.innerHTML = `
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feComposite in="SourceGraphic" in2="blur" operator="over"/>
            </filter>
        `;
        this.svg.appendChild(defs);

        // 1. Pulse arcs (innermost — breathing rhythm, only during sprint)
        this.pulseGroup = createSvgElement('g', { class: 'pulse-group' });
        const pulseRadius = 68;
        const circumference = 2 * Math.PI * pulseRadius;
        const gapFraction = 0.03;
        const segmentFraction = (1 - gapFraction * 4) / 4;
        const segmentLength = circumference * segmentFraction;
        const gapLength = circumference * gapFraction;

        for (let i = 0; i < 4; i++) {
            const arc = createSvgElement('circle', {
                cx: String(CENTER),
                cy: String(CENTER),
                r: String(pulseRadius),
                fill: 'none',
                stroke: 'var(--ring-pulse)',
                'stroke-width': '3',
                'stroke-dasharray': `${segmentLength} ${circumference - segmentLength}`,
                'stroke-dashoffset': String(-i * (segmentLength + gapLength)),
                'stroke-linecap': 'round',
                transform: `rotate(-90 ${CENTER} ${CENTER})`,
                class: 'pulse-arc',
            });
            this.pulseArcs.push(arc);
            this.pulseGroup.appendChild(arc);
        }
        this.svg.appendChild(this.pulseGroup);

        // 2. Concentric Apple-style rings (single arc each)
        for (const config of RING_CONFIGS) {
            const ring = createSingleArcRing(config.radius, config.strokeWidth);
            this.rings.set(config.id, { ...ring, config });
            this.svg.appendChild(ring.group);
        }

        // NO phase legend — the colors speak for themselves
    }

    update(cycles: AllCycles, showOuterRings: boolean, showPrompts: boolean) {
        const synthesis = synthesizeCycles(cycles);

        // --- Harmonic center: dominant phase color on breathing circle ---
        const dominantColor = synthesis.dominant.color;
        document.documentElement.style.setProperty('--harmonic-color', dominantColor);
        const glowStrength = synthesis.coherenceLevel === 'strong' ? 1.0
            : synthesis.coherenceLevel === 'moderate' ? 0.6 : 0.35;
        document.documentElement.style.setProperty('--harmonic-glow', String(glowStrength));

        // --- Pulse arcs (sprint-level) ---
        if (cycles.sprint.active) {
            this.pulseArcs.forEach((arc, i) => {
                const pulseNum = i + 1;
                const phase = HOLONIC_PHASES[i];
                if (pulseNum < cycles.sprint.pulse.pulseNumber) {
                    arc.setAttribute('stroke', phase.color);
                    arc.setAttribute('opacity', '0.8');
                } else if (pulseNum === cycles.sprint.pulse.pulseNumber) {
                    arc.setAttribute('stroke', getPhaseColor(cycles.sprint.pulse.phase));
                    arc.setAttribute('opacity', '1');
                } else {
                    arc.setAttribute('stroke', phase.color);
                    arc.setAttribute('opacity', '0.15');
                }
            });
        } else {
            this.pulseArcs.forEach((arc, i) => {
                arc.setAttribute('stroke', HOLONIC_PHASES[i].color);
                arc.setAttribute('opacity', '0.15');
            });
        }

        // --- Sprint dims outer rings ---
        const isInSprint = cycles.sprint.active;
        const outerDimFactor = isInSprint ? 0.3 : 1;

        // --- Update each ring: single arc, one color, one fill ---
        this.updateRing('sprint', cycles.sprint.progress, cycles.sprint.holonicPhase, isInSprint);
        this.updateRing('day', cycles.day.progress, cycles.day.holonicPhase, true, isInSprint ? outerDimFactor : 1);
        this.updateRing('week', cycles.week.progress, cycles.week.holonicPhase, showOuterRings, isInSprint ? outerDimFactor : 1);
        this.updateRing('moon', cycles.moon.progress, cycles.moon.holonicPhase, showOuterRings, isInSprint ? outerDimFactor : 1);
        this.updateRing('quarter', cycles.quarter.progress, cycles.quarter.holonicPhase, showOuterRings, isInSprint ? outerDimFactor : 1);
        this.updateRing('year', cycles.year.personalProgress, cycles.year.personalHolonicPhase, showOuterRings, isInSprint ? outerDimFactor : 1);

        // --- Phase Label + Time (Sprint mode only) ---
        if (isInSprint) {
            const pulseName = getPulseName(cycles.sprint.pulse.pulseNumber);
            const phaseLabel = getPhaseLabel(cycles.sprint.pulse.phase);
            this.phaseLabel.textContent = `${pulseName} · ${phaseLabel}`;
            this.timeRemaining.textContent = formatMinutes(cycles.sprint.pulse.phaseRemaining) + ' remaining';
            this.phaseLabel.style.color = getPhaseColor(cycles.sprint.pulse.phase);
            const todaySprints = 3;
            const currentSprint = Math.min(cycles.day.sprintSlot, todaySprints);
            this.dayPosition.textContent = `Sprint ${currentSprint} of ${todaySprints} today`;
            this.dayPosition.style.display = '';
            this.guidanceEl.style.display = 'none';
        } else {
            this.phaseLabel.textContent = '';
            this.timeRemaining.textContent = '';
            this.dayPosition.style.display = 'none';
            this.guidanceEl.style.display = '';
        }

        // --- Transition Prompts ---
        if (showPrompts && isInSprint) {
            const currentPhaseKey = `${cycles.sprint.pulse.pulseNumber}-${cycles.sprint.pulse.phase}`;
            if (currentPhaseKey !== this.lastPromptPhase) {
                this.lastPromptPhase = currentPhaseKey;
                this.showTransitionPrompt(cycles.sprint.pulse.phase, cycles.sprint.pulse.pulseNumber);
            }
        }

        // --- Status Bar: clean, minimal ---
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const pd = cycles.week.planetaryDay;
        this.statusBar.innerHTML = `
            <span class="status-time">${timeStr}</span>
            <span>${pd.emoji} ${pd.planet} Day</span>
            <span>${cycles.moon.symbol} ${cycles.moon.phase}</span>
            <span>Q${cycles.quarter.quarter} ${cycles.quarter.season}</span>
        `;
    }

    /**
     * Update a single ring: one arc fill + one color.
     * Color = holonic phase for this cycle. Fill = progress through cycle.
     */
    private updateRing(
        id: string,
        progress: number,
        holonicPhase: typeof HOLONIC_PHASES[number],
        visible: boolean,
        dimFactor: number = 1
    ) {
        const ring = this.rings.get(id);
        if (!ring) return;

        const effectiveOpacity = visible ? dimFactor : 0;
        ring.group.style.opacity = String(effectiveOpacity);
        ring.group.style.transition = 'opacity 0.8s ease';

        if (!visible) return;

        // Color = current holonic phase for this cycle
        const color = holonicPhase.color;
        ring.fill.setAttribute('stroke', color);
        ring.fill.style.filter = 'url(#glow)';

        // Fill = progress through the cycle (0..1 → 0..circumference)
        const circumference = 2 * Math.PI * ring.config.radius;
        const fillLength = progress * circumference;
        ring.fill.setAttribute('stroke-dasharray', `${fillLength} ${circumference - fillLength}`);

        // Track gets a subtle tint of the phase color
        ring.track.setAttribute('stroke', color);
        ring.track.setAttribute('opacity', '0.08');
    }

    private showTransitionPrompt(phase: Phase, pulseNumber: number) {
        const prompts: Record<string, string[]> = {
            entry: [
                'What is the one thing?',
                'Settle in. Breathe.',
                'Where does your attention want to go?',
                'Arrive fully.',
            ],
            focus: [''],
            exit: [
                'What emerged?',
                'Breathe. Let it settle.',
                'What wants to be carried forward?',
                'Release. Integrate.',
            ],
        };

        const options = prompts[phase];
        const text = options[Math.min(pulseNumber - 1, options.length - 1)];

        if (!text) {
            this.transitionPrompt.classList.remove('visible');
            return;
        }

        this.transitionPrompt.textContent = text;
        this.transitionPrompt.classList.remove('fading');
        this.transitionPrompt.classList.add('visible');

        if (this.promptTimeout) clearTimeout(this.promptTimeout);
        this.promptTimeout = window.setTimeout(() => {
            this.transitionPrompt.classList.add('fading');
            this.transitionPrompt.classList.remove('visible');
        }, 15000);
    }
}
