/**
 * Equilibrium — Clock Renderer v2
 * 
 * Each ring is segmented into 4 holonic phases (WILL → EMANATION → DIGESTION → ENRICHMENT)
 * with distinct colors, a position dot showing WHERE YOU ARE NOW, and a label.
 * 
 * Like a Swiss watch: immediately graspable, however sophisticated.
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
 * Create a segmented ring with 4 holonic phase arcs.
 * Each segment is 25% of the circle, colored by phase.
 */
function createSegmentedRing(
    radius: number,
    strokeWidth: number,
    opacity: number,
    labelAngleDeg: number = -45
): { group: SVGGElement; segments: SVGCircleElement[]; dot: SVGCircleElement; label: SVGTextElement } {
    const group = createSvgElement('g', { class: 'ring-group' });
    const circumference = 2 * Math.PI * radius;
    const segmentLength = circumference / 4;
    const segments: SVGCircleElement[] = [];

    for (let i = 0; i < 4; i++) {
        const phase = HOLONIC_PHASES[i];
        const arc = createSvgElement('circle', {
            cx: String(CENTER),
            cy: String(CENTER),
            r: String(radius),
            fill: 'none',
            stroke: phase.color,
            'stroke-width': String(strokeWidth),
            'stroke-dasharray': `${segmentLength} ${circumference - segmentLength}`,
            'stroke-dashoffset': String(-(i * segmentLength) + circumference / 4),
            'stroke-linecap': 'butt',
            transform: `rotate(-90 ${CENTER} ${CENTER})`,
            opacity: String(opacity),
            class: `ring-segment ring-segment-${phase.id}`,
        });
        segments.push(arc);
        group.appendChild(arc);
    }

    // Position dot
    const dot = createSvgElement('circle', {
        cx: String(CENTER),
        cy: String(CENTER - radius),
        r: '4',
        fill: '#ffffff',
        class: 'position-dot',
        filter: 'url(#glow)',
    });
    group.appendChild(dot);

    // Ring label — positioned along the ring at a given angle
    const labelAngleRad = labelAngleDeg * (Math.PI / 180);
    const lx = CENTER + (radius + 10) * Math.cos(labelAngleRad);
    const ly = CENTER + (radius + 10) * Math.sin(labelAngleRad);
    const label = createSvgElement('text', {
        x: String(lx),
        y: String(ly),
        'text-anchor': labelAngleDeg > 0 && labelAngleDeg < 180 ? 'start' : 'end',
        fill: '#e8dcc8',
        'font-size': '7',
        'font-family': "'DM Sans', sans-serif",
        opacity: '0.4',
        class: 'ring-label',
    });
    group.appendChild(label);

    return { group, segments, dot, label };
}

function updateDotPosition(dot: SVGCircleElement, radius: number, progress: number) {
    const angle = (progress * 360 - 90) * (Math.PI / 180);
    dot.setAttribute('cx', String(CENTER + radius * Math.cos(angle)));
    dot.setAttribute('cy', String(CENTER + radius * Math.sin(angle)));
}



// ─── RING DEFINITIONS ──────────────────────────────

interface RingConfig {
    id: string;
    radius: number;
    strokeWidth: number;
    baseOpacity: number;
    labelPrefix: string;
}

const RING_CONFIGS: RingConfig[] = [
    { id: 'sprint', radius: 85, strokeWidth: 5, baseOpacity: 0.3, labelPrefix: 'Sprint' },
    { id: 'day', radius: 105, strokeWidth: 4, baseOpacity: 0.35, labelPrefix: 'Day' },
    { id: 'week', radius: 123, strokeWidth: 3.5, baseOpacity: 0.25, labelPrefix: 'Week' },
    { id: 'moon', radius: 139, strokeWidth: 3, baseOpacity: 0.25, labelPrefix: 'Moon' },
    { id: 'quarter', radius: 154, strokeWidth: 2.5, baseOpacity: 0.2, labelPrefix: 'Quarter' },
    { id: 'year', radius: 167, strokeWidth: 2, baseOpacity: 0.15, labelPrefix: 'Year' },
];

// ─── CLOCK CLASS ───────────────────────────────────

export class Clock {
    private svg: SVGSVGElement;
    private rings: Map<string, { group: SVGGElement; segments: SVGCircleElement[]; dot: SVGCircleElement; label: SVGTextElement; config: RingConfig }>;

    // Pulse arcs (inner breathing ring)
    private pulseArcs: SVGCircleElement[];
    private pulseGroup: SVGGElement;

    // DOM elements
    private phaseLabel: HTMLElement;
    private timeRemaining: HTMLElement;
    private transitionPrompt: HTMLElement;
    private synthesisLine: HTMLElement;
    private moonInfo: HTMLElement;
    private statusBar: HTMLElement;

    private lastPromptPhase: string = '';
    private promptTimeout: number | null = null;

    constructor() {
        this.svg = document.getElementById('rings') as unknown as SVGSVGElement;
        this.phaseLabel = document.getElementById('phase-label')!;
        this.timeRemaining = document.getElementById('time-remaining')!;
        this.transitionPrompt = document.getElementById('transition-prompt')!;
        this.synthesisLine = document.getElementById('synthesis')!;
        this.moonInfo = document.getElementById('moon-info')!;
        this.statusBar = document.getElementById('status-bar')!;

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
                <feGaussianBlur stdDeviation="2" result="blur"/>
                <feComposite in="SourceGraphic" in2="blur" operator="over"/>
            </filter>
        `;
        this.svg.appendChild(defs);

        // 1. Pulse arcs (innermost — breathing rhythm)
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

        // 2. Concentric holonic rings
        for (const config of RING_CONFIGS) {
            const ring = createSegmentedRing(config.radius, config.strokeWidth, config.baseOpacity);
            this.rings.set(config.id, { ...ring, config });
            this.svg.appendChild(ring.group);
        }

        // 3. Phase legend — centered at bottom of SVG, compact row
        const legendGroup = createSvgElement('g', { class: 'phase-legend' });
        const legendY = 392;
        const legendStartX = 100;
        const legendSpacing = 58;
        HOLONIC_PHASES.forEach((phase, i) => {
            const x = legendStartX + i * legendSpacing;
            const dot = createSvgElement('circle', {
                cx: String(x),
                cy: String(legendY - 3),
                r: '3',
                fill: phase.color,
            });
            const text = createSvgElement('text', {
                x: String(x + 6),
                y: String(legendY),
                fill: phase.color,
                'font-size': '6.5',
                'font-family': "'DM Sans', sans-serif",
                opacity: '0.5',
            });
            // Use abbreviations to fit
            const abbr = ['WILL', 'EMAN.', 'DIG.', 'ENRICH.'];
            text.textContent = abbr[i];
            legendGroup.appendChild(dot);
            legendGroup.appendChild(text);
        });
        this.svg.appendChild(legendGroup);
    }

    update(cycles: AllCycles, showOuterRings: boolean, showPrompts: boolean) {
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

        // --- Update each ring ---
        this.updateRing('sprint', cycles.sprint.progress, cycles.sprint.active);
        this.updateRing('day', cycles.day.progress, true);
        this.updateRing('week', cycles.week.progress, showOuterRings);
        this.updateRing('moon', cycles.moon.progress, showOuterRings);
        this.updateRing('quarter', cycles.quarter.progress, showOuterRings);
        this.updateRing('year', cycles.year.personalProgress, showOuterRings);

        // --- Ring labels ---
        this.setRingLabel('sprint', cycles.sprint.active ? cycles.sprint.holonicPhase.label : '');
        this.setRingLabel('day', cycles.day.holonicPhase.label);
        this.setRingLabel('week', cycles.week.holonicPhase.label);
        this.setRingLabel('moon', cycles.moon.holonicPhase.label);
        this.setRingLabel('quarter', cycles.quarter.holonicPhase.label);
        this.setRingLabel('year', cycles.year.personalHolonicPhase.label);

        // --- Phase Label ---
        if (cycles.sprint.active) {
            const pulseName = getPulseName(cycles.sprint.pulse.pulseNumber);
            const phaseLabel = getPhaseLabel(cycles.sprint.pulse.phase);
            this.phaseLabel.textContent = `${pulseName} · ${phaseLabel}`;
            this.timeRemaining.textContent = formatMinutes(cycles.sprint.pulse.phaseRemaining) + ' remaining';
            this.phaseLabel.style.color = getPhaseColor(cycles.sprint.pulse.phase);
        } else {
            this.phaseLabel.textContent = '';
            this.timeRemaining.textContent = '';
        }

        // --- Transition Prompts ---
        if (showPrompts && cycles.sprint.active) {
            const currentPhaseKey = `${cycles.sprint.pulse.pulseNumber}-${cycles.sprint.pulse.phase}`;
            if (currentPhaseKey !== this.lastPromptPhase) {
                this.lastPromptPhase = currentPhaseKey;
                this.showTransitionPrompt(cycles.sprint.pulse.phase, cycles.sprint.pulse.pulseNumber);
            }
        }

        // --- Synthesis: THE ONE INSIGHT ---
        const synthesis = synthesizeCycles(cycles);
        this.synthesisLine.textContent = synthesis.insight;
        this.synthesisLine.style.color = synthesis.dominant.color;

        // --- Moon + Status ---
        this.moonInfo.textContent = `${cycles.moon.symbol} ${cycles.moon.phase} · ${cycles.moon.energy}`;

        const pd = cycles.week.planetaryDay;
        const ph = cycles.week.planetaryHour;
        this.statusBar.innerHTML = `
            <span>${pd.emoji} ${pd.planet} Day</span>
            <span>${ph.emoji} ${ph.energy}</span>
            <span>Q${cycles.quarter.quarter} ${cycles.quarter.season}</span>
        `;
    }

    private updateRing(id: string, progress: number, visible: boolean) {
        const ring = this.rings.get(id);
        if (!ring) return;

        ring.group.style.opacity = visible ? '1' : '0';
        ring.group.style.transition = 'opacity 0.5s ease';

        if (!visible) return;

        updateDotPosition(ring.dot, ring.config.radius, progress);

        // Highlight the active segment
        const activeIdx = Math.min(Math.floor(progress * 4), 3);
        ring.segments.forEach((seg, i) => {
            const baseWidth = ring.config.strokeWidth;
            if (i === activeIdx) {
                seg.setAttribute('opacity', String(Math.min(ring.config.baseOpacity + 0.45, 1)));
                seg.setAttribute('stroke-width', String(baseWidth + 1.5));
            } else {
                seg.setAttribute('opacity', String(ring.config.baseOpacity));
                seg.setAttribute('stroke-width', String(baseWidth));
            }
        });

        // Update dot color to match active phase
        ring.dot.setAttribute('fill', HOLONIC_PHASES[activeIdx].color);
    }

    private setRingLabel(id: string, text: string) {
        const ring = this.rings.get(id);
        if (!ring) return;
        ring.label.textContent = text ? `${ring.config.labelPrefix}: ${text}` : '';
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
