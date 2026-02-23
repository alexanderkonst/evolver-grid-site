/**
 * Equilibrium - Clock Renderer v7
 * 
 * Five rings. Five identity colors. 
 * Sprint . Day . Week . Month . Year
 * 
 * VISUAL MODEL:
 * Each ring shows its cycle's progress through 4 holonic quarters.
 * Each quarter has a distinct brightness:
 *   Q1 (Will/Planning)       = faintest  (0.25)
 *   Q2 (Emanation/Building)  = medium    (0.50)
 *   Q3 (Digestion/Sharing)   = bright    (0.75)
 *   Q4 (Enrichment/Integration) = brightest (1.00)
 * 
 * Completed quarters show their full brightness.
 * The active quarter fills proportionally.
 * Transitions between quarters are softened by gradient stops.
 */

import type { AllCycles, Phase } from './cycles';
import { formatMinutes, getPulseName, synthesizeCycles } from './cycles';

// --- SVG HELPERS ---

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
 * Generate an SVG arc path for a circle segment.
 * startAngle and endAngle in degrees (0 = top, clockwise).
 */
function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
    // Clamp to avoid rendering issues with full circles
    const span = endDeg - startDeg;
    if (span <= 0) return '';
    const large = span > 180 ? 1 : 0;

    const startRad = (startDeg - 90) * Math.PI / 180;
    const endRad = (endDeg - 90) * Math.PI / 180;

    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);

    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

// --- RING DEFINITIONS ---

interface RingConfig {
    id: string;
    radius: number;
    strokeWidth: number;
    label: string;
    color: string;
    gap: number;
}

// Quarter brightness levels: Q1 = seed, Q4 = harvest
const QUARTER_BRIGHTNESS = [0.25, 0.50, 0.75, 1.0];


const RING_GAP = 4;
const RING_CONFIGS: RingConfig[] = [
    { id: 'sprint', radius: 80, strokeWidth: 16, label: '96-Min', color: '#e07040', gap: RING_GAP },
    { id: 'day', radius: 100, strokeWidth: 16, label: 'Day', color: '#c9a84c', gap: RING_GAP },
    { id: 'week', radius: 120, strokeWidth: 14, label: 'Week', color: '#4080c0', gap: RING_GAP },
    { id: 'month', radius: 138, strokeWidth: 12, label: 'Moon', color: '#a080c0', gap: RING_GAP },
    { id: 'year', radius: 156, strokeWidth: 12, label: 'Year', color: '#c06080', gap: RING_GAP },
];

interface QuarterArc {
    path: SVGPathElement;
}

interface RingElements {
    group: SVGGElement;
    track: SVGCircleElement;
    quarters: QuarterArc[];
    label: SVGTextElement;
    timeMarkers: SVGTextElement[];
    config: RingConfig;
}

// --- CLOCK CLASS ---

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
                <feGaussianBlur stdDeviation="2.5" result="blur"/>
                <feComposite in="SourceGraphic" in2="blur" operator="over"/>
            </filter>
        `;
        this.svg.appendChild(defs);

        // Time marker definitions for specific rings
        const TIME_MARKERS: Record<string, string[]> = {
            sprint: ['24m', '48m', '72m'], // 3 markers at quarter boundaries (not at 0/96)
            day: ['Dawn', 'Morning', 'Afternoon', 'Evening'], // 4 markers at quarter starts
        };

        // Build each ring
        for (const config of RING_CONFIGS) {
            const group = createSvgElement('g', { class: `ring-group ring-${config.id}` });

            // Background track
            const track = createSvgElement('circle', {
                cx: String(CENTER),
                cy: String(CENTER),
                r: String(config.radius),
                fill: 'none',
                stroke: config.color,
                'stroke-width': String(config.strokeWidth),
                opacity: '0.06',
                class: 'ring-track',
            });

            // 4 quarter arc paths (filled progressively)
            const quarters: QuarterArc[] = [];
            for (let q = 0; q < 4; q++) {
                const path = createSvgElement('path', {
                    fill: 'none',
                    stroke: config.color,
                    'stroke-width': String(config.strokeWidth),
                    'stroke-linecap': 'butt',
                    opacity: '0',
                    d: '',
                    class: `ring-quarter ring-quarter-${q}`,
                });
                path.style.filter = 'url(#glow)';
                quarters.push({ path });
                group.appendChild(path);
            }

            // Label
            const labelAngle = -60 * Math.PI / 180;
            const labelX = CENTER + config.radius * Math.sin(labelAngle);
            const labelY = CENTER - config.radius * Math.cos(labelAngle);
            const label = createSvgElement('text', {
                x: String(labelX),
                y: String(labelY),
                fill: config.color,
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

            // Time markers (only for sprint and day rings)
            const timeMarkers: SVGTextElement[] = [];
            const markerLabels = TIME_MARKERS[config.id];
            if (markerLabels) {
                const isDay = config.id === 'day';
                const markerCount = markerLabels.length;
                for (let i = 0; i < markerCount; i++) {
                    // Sprint: markers at 90°, 180°, 270° (quarter boundaries)
                    // Day: markers at 0°, 90°, 180°, 270° (quarter starts)
                    let angleDeg: number;
                    if (isDay) {
                        angleDeg = i * 90; // 0, 90, 180, 270
                    } else {
                        angleDeg = (i + 1) * 90; // 90, 180, 270
                    }
                    const angleRad = (angleDeg - 90) * Math.PI / 180;
                    // Position just outside the ring
                    const markerR = config.radius + config.strokeWidth / 2 + 8;
                    const mx = CENTER + markerR * Math.cos(angleRad);
                    const my = CENTER + markerR * Math.sin(angleRad);

                    const marker = createSvgElement('text', {
                        x: String(mx),
                        y: String(my),
                        fill: config.color,
                        'font-size': '5.5',
                        'font-family': "'DM Sans', sans-serif",
                        'font-weight': '400',
                        'text-anchor': 'middle',
                        'dominant-baseline': 'central',
                        opacity: '0.3',
                        class: 'ring-time-marker',
                    });
                    marker.textContent = markerLabels[i];
                    timeMarkers.push(marker);
                    group.appendChild(marker);
                }
            }

            group.appendChild(track);
            group.appendChild(label);

            this.rings.set(config.id, { group, track, quarters, label, timeMarkers, config });
            this.svg.appendChild(group);
        }
    }

    update(cycles: AllCycles, showOuterRings: boolean, showPrompts: boolean, todaySprintCount: number = 0) {
        const synthesis = synthesizeCycles(cycles);

        // --- Harmonic center: dominant phase color on breathing circle ---
        const dominantColor = synthesis.dominant.color;
        document.documentElement.style.setProperty('--harmonic-color', dominantColor);
        const glowStrength = synthesis.coherenceLevel === 'strong' ? 1.0
            : synthesis.coherenceLevel === 'moderate' ? 0.6 : 0.35;
        document.documentElement.style.setProperty('--harmonic-glow', String(glowStrength));

        // --- Sprint dims outer rings ---
        const isInSprint = cycles.sprint.active;
        const outerDimFactor = isInSprint ? 0.5 : 1;

        // --- Update each ring with 4-brightness quarters ---
        this.updateRing('sprint', cycles.sprint.progress, isInSprint);
        this.updateRing('day', cycles.day.progress, true, isInSprint ? outerDimFactor : 1);
        this.updateRing('week', cycles.week.progress, showOuterRings, isInSprint ? outerDimFactor : 1);
        this.updateRing('month', cycles.moon.progress, showOuterRings, isInSprint ? outerDimFactor : 1);
        this.updateRing('year', cycles.year.personalProgress, showOuterRings, isInSprint ? outerDimFactor : 1);

        // --- Sprint Ring Dominance ---
        const sprintRing = this.rings.get('sprint');
        if (sprintRing) {
            const targetWidth = isInSprint ? 24 : sprintRing.config.strokeWidth;
            sprintRing.track.setAttribute('stroke-width', String(targetWidth));
            for (const q of sprintRing.quarters) {
                q.path.setAttribute('stroke-width', String(targetWidth));
            }
        }

        // --- Phase Label + Time (Sprint mode only) ---
        if (isInSprint) {
            const pulseName = getPulseName(cycles.sprint.pulse.pulseNumber);
            this.phaseLabel.textContent = `${pulseName} \u00B7 ${formatMinutes(cycles.sprint.pulse.phaseRemaining)}`;
            this.timeRemaining.textContent = '';
            this.phaseLabel.style.color = '#e07040';
            this.dayPosition.textContent = `96-min sprint ${todaySprintCount + 1}`;
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

        // --- Status Bar: time + planetary energy + moon ---
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const dayEnergy = cycles.week.planetaryDay.energy;
        const moonSymbol = cycles.moon.symbol;
        this.statusBar.innerHTML = `
            <span class="status-time">${timeStr}</span>
            <span>${cycles.week.planetaryDay.emoji} ${dayEnergy}</span>
            <span>${moonSymbol} ${cycles.moon.phase}</span>
        `;

        // --- Summary Quick Look Panel: progress bars for Day, Week, Moon ---
        this.updateSummaryPanel(cycles);
    }

    private buildProgressBar(progress: number, totalSegments: number = 12): string {
        const filled = Math.round(progress * totalSegments);
        let bar = '';
        for (let i = 0; i < totalSegments; i++) {
            bar += i < filled ? '▰' : '▱';
        }
        return bar;
    }

    private getElementEmoji(holonicPhaseId: string): string {
        switch (holonicPhaseId) {
            case 'will': return '🔥';
            case 'emanation': return '💧';
            case 'digestion': return '🌍';
            case 'enrichment': return '🌬️';
            default: return '';
        }
    }

    private getElementLabel(holonicPhaseId: string): string {
        switch (holonicPhaseId) {
            case 'will': return 'Fire';
            case 'emanation': return 'Water';
            case 'digestion': return 'Earth';
            case 'enrichment': return 'Air';
            default: return '';
        }
    }

    private updateSummaryPanel(cycles: AllCycles) {
        // Day
        const dayRow = document.getElementById('cycle-day');
        if (dayRow) {
            const dayBar = dayRow.querySelector('.cycle-bar')!;
            const dayPhase = dayRow.querySelector('.cycle-phase')!;
            dayBar.textContent = this.buildProgressBar(cycles.day.progress);
            const dayElement = this.getElementEmoji(cycles.day.holonicPhase.id);
            const dayLabel = this.getElementLabel(cycles.day.holonicPhase.id);
            dayPhase.textContent = `${dayElement} ${cycles.day.holonicPhase.label} · ${dayLabel}`;
        }

        // Week
        const weekRow = document.getElementById('cycle-week');
        if (weekRow) {
            const weekBar = weekRow.querySelector('.cycle-bar')!;
            const weekPhase = weekRow.querySelector('.cycle-phase')!;
            weekBar.textContent = this.buildProgressBar(cycles.week.progress);
            const weekElement = this.getElementEmoji(cycles.week.holonicPhase.id);
            const weekLabel = this.getElementLabel(cycles.week.holonicPhase.id);
            weekPhase.textContent = `${weekElement} ${cycles.week.holonicPhase.label} · ${weekLabel}`;
        }

        // Moon
        const moonRow = document.getElementById('cycle-moon');
        if (moonRow) {
            const moonBar = moonRow.querySelector('.cycle-bar')!;
            const moonPhase = moonRow.querySelector('.cycle-phase')!;
            moonBar.textContent = this.buildProgressBar(cycles.moon.progress);
            const moonElement = this.getElementEmoji(cycles.moon.holonicPhase.id);
            const moonLabel = this.getElementLabel(cycles.moon.holonicPhase.id);
            moonPhase.textContent = `${moonElement} ${cycles.moon.holonicPhase.label} · ${moonLabel}`;
        }
    }

    /**
     * Update a ring with 4-brightness quarter arcs.
     * Each completed quarter shows at its full brightness.
     * The active quarter fills proportionally.
     */
    private updateRing(
        id: string,
        progress: number,
        visible: boolean,
        dimFactor: number = 1
    ) {
        const ring = this.rings.get(id);
        if (!ring) return;

        const effectiveOpacity = visible ? dimFactor : 0;
        ring.group.style.opacity = String(effectiveOpacity);
        ring.group.style.transition = 'opacity 0.8s ease';

        if (!visible) return;

        const r = ring.config.radius;
        const totalDeg = 360;
        const quarterDeg = totalDeg / 4; // 90 degrees per quarter
        // Small gap between quarters (in degrees)
        const gapDeg = 1.5;

        for (let q = 0; q < 4; q++) {
            const qStart = q * quarterDeg;
            const brightness = QUARTER_BRIGHTNESS[q];
            const quarterArc = ring.quarters[q];

            // How much of this quarter is filled (0..1)
            const quarterStartProgress = q / 4;
            const quarterEndProgress = (q + 1) / 4;

            let fillFraction: number;
            if (progress >= quarterEndProgress) {
                // Quarter fully completed
                fillFraction = 1;
            } else if (progress <= quarterStartProgress) {
                // Quarter not reached yet
                fillFraction = 0;
            } else {
                // Partially filled
                fillFraction = (progress - quarterStartProgress) / (quarterEndProgress - quarterStartProgress);
            }

            if (fillFraction <= 0) {
                quarterArc.path.setAttribute('d', '');
                quarterArc.path.setAttribute('opacity', '0');
                continue;
            }

            // Arc degrees for this quarter
            const arcStart = qStart + (q > 0 ? gapDeg / 2 : 0);
            const arcEnd = qStart + fillFraction * quarterDeg - (q < 3 && fillFraction >= 1 ? gapDeg / 2 : 0);

            if (arcEnd <= arcStart) {
                quarterArc.path.setAttribute('d', '');
                quarterArc.path.setAttribute('opacity', '0');
                continue;
            }

            const d = arcPath(CENTER, CENTER, r, arcStart, arcEnd);
            quarterArc.path.setAttribute('d', d);
            quarterArc.path.setAttribute('opacity', String(brightness));
            quarterArc.path.setAttribute('stroke', ring.config.color);
        }

        // Track and label
        ring.track.setAttribute('stroke', ring.config.color);
        ring.track.setAttribute('opacity', '0.06');
        ring.label.setAttribute('fill', ring.config.color);
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
