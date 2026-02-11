/**
 * Equilibrium — Clock Renderer v4
 * 
 * Apple-style rings: each ring = ONE arc, ONE color, ONE fill.
 * Thick enough to carry the cycle name inside the arc.
 * Color = holonic phase you're currently in for that cycle.
 * Fill = how far through the cycle you are.
 * 
 * Six rings. Six colors. Six fills. That IS the harmonic.
 */

import type { AllCycles, Phase } from './cycles';
import { HOLONIC_PHASES, formatMinutes, getPulseName, getPhaseColor, synthesizeCycles } from './cycles';

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

// ─── RING DEFINITIONS ──────────────────────────────

interface RingConfig {
    id: string;
    radius: number;
    strokeWidth: number;
    label: string;
    gap: number; // gap between rings
}

// Rings go from inner (Sprint) to outer (Year)
// Stroke widths are thick enough to carry text labels
const RING_GAP = 4;
const RING_CONFIGS: RingConfig[] = [
    { id: 'sprint', radius: 80, strokeWidth: 16, label: 'Sprint', gap: RING_GAP },
    { id: 'day', radius: 100, strokeWidth: 16, label: 'Day', gap: RING_GAP },
    { id: 'week', radius: 120, strokeWidth: 14, label: 'Week', gap: RING_GAP },
    { id: 'moon', radius: 138, strokeWidth: 12, label: 'Moon', gap: RING_GAP },
    { id: 'quarter', radius: 154, strokeWidth: 12, label: 'Quarter', gap: RING_GAP },
    { id: 'year', radius: 170, strokeWidth: 10, label: 'Year', gap: RING_GAP },
];

interface RingElements {
    group: SVGGElement;
    track: SVGCircleElement;
    fill: SVGCircleElement;
    label: SVGTextElement;
    config: RingConfig;
}

// ─── CLOCK CLASS ───────────────────────────────────

export class Clock {
    private svg: SVGSVGElement;
    private rings: Map<string, RingElements>;

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
        this.buildClock();
    }

    private buildClock() {
        this.svg.innerHTML = '';

        // Glow filter for ring fills
        const defs = createSvgElement('defs', {});
        defs.innerHTML = `
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feComposite in="SourceGraphic" in2="blur" operator="over"/>
            </filter>
        `;
        this.svg.appendChild(defs);

        // Build each ring: track + fill + label
        for (const config of RING_CONFIGS) {
            const group = createSvgElement('g', { class: `ring-group ring-${config.id}` });
            const circumference = 2 * Math.PI * config.radius;

            // Background track (full circle, very dim, shows the unfilled portion)
            const track = createSvgElement('circle', {
                cx: String(CENTER),
                cy: String(CENTER),
                r: String(config.radius),
                fill: 'none',
                stroke: '#ffffff',
                'stroke-width': String(config.strokeWidth),
                'stroke-linecap': 'round',
                opacity: '0.06',
                transform: `rotate(-90 ${CENTER} ${CENTER})`,
                class: 'ring-track',
            });

            // Fill arc (partial circle, colored by current phase)
            const fill = createSvgElement('circle', {
                cx: String(CENTER),
                cy: String(CENTER),
                r: String(config.radius),
                fill: 'none',
                stroke: '#c9a84c',
                'stroke-width': String(config.strokeWidth),
                'stroke-dasharray': `0 ${circumference}`,
                'stroke-dashoffset': '0',
                'stroke-linecap': 'butt',
                transform: `rotate(-90 ${CENTER} ${CENTER})`,
                class: 'ring-fill',
            });

            // Label text — positioned at ~11 o'clock (330°) to avoid fill overlay
            // Fill starts at 12 o'clock (0°/360°) going clockwise, so this position
            // sits on the unfilled track for most progress values
            const labelAngle = -60 * Math.PI / 180; // -60° from top = 11 o'clock
            const labelX = CENTER + config.radius * Math.sin(labelAngle);
            const labelY = CENTER - config.radius * Math.cos(labelAngle);
            const label = createSvgElement('text', {
                x: String(labelX),
                y: String(labelY),
                fill: '#ffffff',
                'font-size': String(Math.max(config.strokeWidth * 0.55, 6)),
                'font-family': "'DM Sans', sans-serif",
                'font-weight': '500',
                'letter-spacing': '0.08em',
                'text-anchor': 'middle',
                'dominant-baseline': 'central',
                opacity: '0.5',
                class: 'ring-label',
            });
            label.textContent = config.label.toUpperCase();

            group.appendChild(track);
            group.appendChild(fill);
            group.appendChild(label);

            this.rings.set(config.id, { group, track, fill, label, config });
            this.svg.appendChild(group);
        }
    }

    update(cycles: AllCycles, showOuterRings: boolean, showPrompts: boolean) {
        const synthesis = synthesizeCycles(cycles);

        // --- Harmonic center: dominant phase color on breathing circle ---
        const dominantColor = synthesis.dominant.color;
        document.documentElement.style.setProperty('--harmonic-color', dominantColor);
        const glowStrength = synthesis.coherenceLevel === 'strong' ? 1.0
            : synthesis.coherenceLevel === 'moderate' ? 0.6 : 0.35;
        document.documentElement.style.setProperty('--harmonic-glow', String(glowStrength));

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
            this.phaseLabel.textContent = `${pulseName} · ${formatMinutes(cycles.sprint.pulse.phaseRemaining)}`;
            this.timeRemaining.textContent = '';
            this.phaseLabel.style.color = getPhaseColor(cycles.sprint.pulse.phase);
            const todaySprints = 3;
            const currentSprint = Math.min(cycles.day.sprintSlot, todaySprints);
            this.dayPosition.textContent = `Sprint ${currentSprint} of ${todaySprints}`;
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
     * Update a single ring: one arc fill + one color + label.
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

        // Label color matches the phase (subtle)
        ring.label.setAttribute('fill', color);
        ring.label.setAttribute('opacity', '0.5');
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
