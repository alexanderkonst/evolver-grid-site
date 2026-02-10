/**
 * Equilibrium — Clock Renderer
 * 
 * Creates and updates SVG rings + DOM elements for the living clock.
 */

import type { AllCycles, Phase } from './cycles';
import { formatMinutes, getPulseName, getPhaseLabel, getPhaseColor } from './cycles';

// ─── SVG HELPERS ───────────────────────────────────

const SVG_NS = 'http://www.w3.org/2000/svg';
const CENTER = 200;  // viewBox center (400x400)

function createCircle(
    r: number,
    color: string,
    strokeWidth: number,
    className: string,
    opacity?: number
): SVGCircleElement {
    const circle = document.createElementNS(SVG_NS, 'circle');
    circle.setAttribute('cx', String(CENTER));
    circle.setAttribute('cy', String(CENTER));
    circle.setAttribute('r', String(r));
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', color);
    circle.setAttribute('stroke-width', String(strokeWidth));
    circle.setAttribute('class', className);
    if (opacity !== undefined) circle.setAttribute('opacity', String(opacity));
    return circle;
}

function createArc(
    r: number,
    color: string,
    strokeWidth: number,
    progress: number,
    className: string
): SVGCircleElement {
    const circumference = 2 * Math.PI * r;
    const circle = document.createElementNS(SVG_NS, 'circle');
    circle.setAttribute('cx', String(CENTER));
    circle.setAttribute('cy', String(CENTER));
    circle.setAttribute('r', String(r));
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', color);
    circle.setAttribute('stroke-width', String(strokeWidth));
    circle.setAttribute('stroke-dasharray', String(circumference));
    circle.setAttribute('stroke-dashoffset', String(circumference * (1 - progress)));
    circle.setAttribute('stroke-linecap', 'round');
    circle.setAttribute('transform', `rotate(-90 ${CENTER} ${CENTER})`);
    circle.setAttribute('class', className);
    return circle;
}

function updateArc(circle: SVGCircleElement, r: number, progress: number) {
    const circumference = 2 * Math.PI * r;
    circle.setAttribute('stroke-dashoffset', String(circumference * (1 - progress)));
}

function createPositionDot(r: number, progress: number): SVGCircleElement {
    const angle = (progress * 360 - 90) * (Math.PI / 180);
    const x = CENTER + r * Math.cos(angle);
    const y = CENTER + r * Math.sin(angle);

    const dot = document.createElementNS(SVG_NS, 'circle');
    dot.setAttribute('cx', String(x));
    dot.setAttribute('cy', String(y));
    dot.setAttribute('r', '3');
    dot.setAttribute('class', 'position-dot');
    return dot;
}

function updatePositionDot(dot: SVGCircleElement, r: number, progress: number) {
    const angle = (progress * 360 - 90) * (Math.PI / 180);
    dot.setAttribute('cx', String(CENTER + r * Math.cos(angle)));
    dot.setAttribute('cy', String(CENTER + r * Math.sin(angle)));
}

// ─── RING DEFINITIONS ──────────────────────────────

interface RingDef {
    id: string;
    radius: number;
    color: string;
    trackWidth: number;
    progressWidth: number;
    isOuter: boolean;
}

const RINGS: RingDef[] = [
    { id: 'sprint', radius: 88, color: 'var(--ring-sprint)', trackWidth: 2, progressWidth: 2.5, isOuter: false },
    { id: 'day', radius: 112, color: 'var(--ring-day)', trackWidth: 1.5, progressWidth: 2, isOuter: false },
    { id: 'week', radius: 136, color: 'var(--ring-week)', trackWidth: 1, progressWidth: 1.5, isOuter: true },
    { id: 'month', radius: 155, color: 'var(--ring-month)', trackWidth: 1, progressWidth: 1.5, isOuter: true },
    { id: 'quarter', radius: 172, color: 'var(--ring-quarter)', trackWidth: 0.8, progressWidth: 1, isOuter: true },
];

const PULSE_RADIUS = 72;

// ─── CLOCK CLASS ───────────────────────────────────

export class Clock {
    private svg: SVGSVGElement;
    private elements: {
        pulseArcs: SVGCircleElement[];
        pulseGroup: SVGGElement;
        ringProgress: Map<string, SVGCircleElement>;
        ringDots: Map<string, SVGCircleElement>;
        ringGroups: Map<string, SVGGElement>;
    };

    // DOM elements
    private phaseLabel: HTMLElement;
    private timeRemaining: HTMLElement;
    private transitionPrompt: HTMLElement;
    private planetaryDay: HTMLElement;
    private planetaryHour: HTMLElement;
    private moonPhase: HTMLElement;
    private quarterInfo: HTMLElement;

    private lastPromptPhase: string = '';
    private promptTimeout: number | null = null;

    constructor() {
        this.svg = document.getElementById('rings') as unknown as SVGSVGElement;
        this.phaseLabel = document.getElementById('phase-label')!;
        this.timeRemaining = document.getElementById('time-remaining')!;
        this.transitionPrompt = document.getElementById('transition-prompt')!;
        this.planetaryDay = document.getElementById('planetary-day')!;
        this.planetaryHour = document.getElementById('planetary-hour')!;
        this.moonPhase = document.getElementById('moon-phase')!;
        this.quarterInfo = document.getElementById('quarter-info')!;

        this.elements = {
            pulseArcs: [],
            pulseGroup: document.createElementNS(SVG_NS, 'g'),
            ringProgress: new Map(),
            ringDots: new Map(),
            ringGroups: new Map(),
        };

        this.buildRings();
    }

    private buildRings() {
        // Clear SVG
        this.svg.innerHTML = '';

        // 1. Build pulse arcs (4 segments around center)
        this.elements.pulseGroup = document.createElementNS(SVG_NS, 'g');
        const pulseCircumference = 2 * Math.PI * PULSE_RADIUS;
        const gapFraction = 0.03;
        const segmentFraction = (1 - gapFraction * 4) / 4;
        const segmentLength = pulseCircumference * segmentFraction;
        const gapLength = pulseCircumference * gapFraction;

        for (let i = 0; i < 4; i++) {
            const arc = document.createElementNS(SVG_NS, 'circle');
            arc.setAttribute('cx', String(CENTER));
            arc.setAttribute('cy', String(CENTER));
            arc.setAttribute('r', String(PULSE_RADIUS));
            arc.setAttribute('fill', 'none');
            arc.setAttribute('stroke', 'var(--ring-pulse)');
            arc.setAttribute('stroke-width', '3');
            arc.setAttribute('stroke-dasharray', `${segmentLength} ${pulseCircumference - segmentLength}`);
            arc.setAttribute('stroke-dashoffset', String(-i * (segmentLength + gapLength)));
            arc.setAttribute('stroke-linecap', 'round');
            arc.setAttribute('transform', `rotate(-90 ${CENTER} ${CENTER})`);
            arc.setAttribute('class', 'pulse-arc');
            this.elements.pulseArcs.push(arc);
            this.elements.pulseGroup.appendChild(arc);
        }
        this.svg.appendChild(this.elements.pulseGroup);

        // 2. Build concentric rings
        for (const ring of RINGS) {
            const group = document.createElementNS(SVG_NS, 'g');
            group.setAttribute('class', `ring-group ${ring.isOuter ? 'ring-outer' : ''}`);

            // Track
            const track = createCircle(ring.radius, ring.color, ring.trackWidth, 'ring-track', 0.15);
            group.appendChild(track);

            // Progress
            const progress = createArc(ring.radius, ring.color, ring.progressWidth, 0, 'ring-progress');
            group.appendChild(progress);
            this.elements.ringProgress.set(ring.id, progress);

            // Position dot
            const dot = createPositionDot(ring.radius, 0);
            group.appendChild(dot);
            this.elements.ringDots.set(ring.id, dot);

            this.elements.ringGroups.set(ring.id, group);
            this.svg.appendChild(group);
        }
    }

    update(cycles: AllCycles, showOuterRings: boolean, showPrompts: boolean) {
        // --- Pulse arcs ---
        if (cycles.sprint.active) {
            this.elements.pulseArcs.forEach((arc, i) => {
                const pulseNum = i + 1;
                if (pulseNum < cycles.sprint.pulse.pulseNumber) {
                    arc.classList.add('completed');
                    arc.classList.remove('active');
                } else if (pulseNum === cycles.sprint.pulse.pulseNumber) {
                    arc.classList.add('active');
                    arc.classList.remove('completed');
                    arc.setAttribute('stroke', getPhaseColor(cycles.sprint.pulse.phase));
                } else {
                    arc.classList.remove('active', 'completed');
                    arc.setAttribute('stroke', 'var(--ring-pulse)');
                }
            });
        } else {
            this.elements.pulseArcs.forEach(arc => {
                arc.classList.remove('active', 'completed');
                arc.setAttribute('stroke', 'var(--ring-pulse)');
                arc.style.opacity = '0.15';
            });
        }

        // --- Sprint ring ---
        const sprintProgress = this.elements.ringProgress.get('sprint')!;
        const sprintDot = this.elements.ringDots.get('sprint')!;
        const sprintRing = RINGS.find(r => r.id === 'sprint')!;
        updateArc(sprintProgress, sprintRing.radius, cycles.sprint.progress);
        updatePositionDot(sprintDot, sprintRing.radius, cycles.sprint.progress);

        // --- Day ring ---
        const dayProgress = this.elements.ringProgress.get('day')!;
        const dayDot = this.elements.ringDots.get('day')!;
        const dayRing = RINGS.find(r => r.id === 'day')!;
        updateArc(dayProgress, dayRing.radius, cycles.day.progress);
        updatePositionDot(dayDot, dayRing.radius, cycles.day.progress);

        // --- Outer rings ---
        const outerVisible = showOuterRings;

        // Week
        const weekProgress = this.elements.ringProgress.get('week')!;
        const weekDot = this.elements.ringDots.get('week')!;
        const weekRing = RINGS.find(r => r.id === 'week')!;
        updateArc(weekProgress, weekRing.radius, cycles.week.progress);
        updatePositionDot(weekDot, weekRing.radius, cycles.week.progress);

        // Month
        const monthProgress = this.elements.ringProgress.get('month')!;
        const monthDot = this.elements.ringDots.get('month')!;
        const monthRing = RINGS.find(r => r.id === 'month')!;
        updateArc(monthProgress, monthRing.radius, cycles.month.progress);
        updatePositionDot(monthDot, monthRing.radius, cycles.month.progress);

        // Quarter
        const quarterProgress = this.elements.ringProgress.get('quarter')!;
        const quarterDot = this.elements.ringDots.get('quarter')!;
        const quarterRing = RINGS.find(r => r.id === 'quarter')!;
        updateArc(quarterProgress, quarterRing.radius, cycles.quarter.progress);
        updatePositionDot(quarterDot, quarterRing.radius, cycles.quarter.progress);

        // Toggle visibility of outer rings
        this.elements.ringGroups.forEach((group, id) => {
            const ring = RINGS.find(r => r.id === id)!;
            if (ring.isOuter) {
                group.style.opacity = outerVisible ? '1' : '0';
                group.style.transition = 'opacity 0.5s ease';
            }
        });

        // --- Phase Label ---
        if (cycles.sprint.active) {
            const pulseName = getPulseName(cycles.sprint.pulse.pulseNumber);
            const phaseLabel = getPhaseLabel(cycles.sprint.pulse.phase);
            this.phaseLabel.textContent = `${pulseName} · ${phaseLabel}`;
            this.timeRemaining.textContent = formatMinutes(cycles.sprint.pulse.phaseRemaining) + ' remaining';
            this.phaseLabel.style.color = getPhaseColor(cycles.sprint.pulse.phase);
        } else {
            this.phaseLabel.textContent = 'AMBIENT';
            this.timeRemaining.textContent = 'Tap to begin sprint';
            this.phaseLabel.style.color = 'var(--gold-dim)';
        }

        // --- Transition Prompts ---
        if (showPrompts && cycles.sprint.active) {
            const currentPhaseKey = `${cycles.sprint.pulse.pulseNumber}-${cycles.sprint.pulse.phase}`;
            if (currentPhaseKey !== this.lastPromptPhase) {
                this.lastPromptPhase = currentPhaseKey;
                this.showTransitionPrompt(cycles.sprint.pulse.phase, cycles.sprint.pulse.pulseNumber);
            }
        }

        // --- Status Bar (Energy, not labels) ---
        const pd = cycles.week.planetaryDay;
        const ph = cycles.week.planetaryHour;
        this.planetaryDay.textContent = `${pd.emoji} ${pd.planet} Day · ${pd.energy}`;
        this.planetaryHour.textContent = `${ph.emoji} ${ph.energy}`;
        this.moonPhase.textContent = `${cycles.moon.symbol} ${cycles.moon.energy}`;
        this.quarterInfo.textContent = `Q${cycles.quarter.quarter} · ${cycles.quarter.energy}`;
    }

    private showTransitionPrompt(phase: Phase, pulseNumber: number) {
        const prompts: Record<string, string[]> = {
            entry: [
                'What is the one thing?',
                'Settle in. Breathe.',
                'Where does your attention want to go?',
                'Arrive fully.',
            ],
            focus: [
                '',  // No prompt during focus — don't interrupt
            ],
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

        // Auto-dismiss after 15 seconds
        if (this.promptTimeout) clearTimeout(this.promptTimeout);
        this.promptTimeout = window.setTimeout(() => {
            this.transitionPrompt.classList.add('fading');
            this.transitionPrompt.classList.remove('visible');
        }, 15000);
    }
}
